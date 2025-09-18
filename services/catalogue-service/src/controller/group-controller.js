import axios from "axios";
import { Op } from "sequelize";
import Group from "../models/group-model.js";
import GroupParticipation from "../models/groupParticipation-model.js";
import GroupSet from "../models/groupSet-model.js";

// for testing purposes
export async function getAllGroups(req, res) {
  try {
    const groups = await Group.findAll();
    res.status(200).json({ message: "All groups", data: groups });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getGroupsByGroupSetId(req, res) {
  try {
    const groupSetId = req.params.groupSetId;
    let groups = await Group.findAll({ where: { groupSetId }, include: GroupParticipation });
    groups = groups.map(group => group.toJSON());
    // get users using group participations
    const userIds = groups.flatMap(group =>
      group.groupParticipations.map(participation => participation.userId),
    );
    // fetch user details from user service
    const response = await axios.post("http://user-service:8000/users/details-from-ids/", {
      userIds,
    });
    const userDetails = response.data.users;
    // map user details to group participations
    groups.forEach(group => {
      group.groupParticipations.forEach(participation => {
        const userDetail = userDetails.find(user => user.id === participation.userId);
        participation.userDetail = userDetail;
      });
    });

    res.status(200).json({ message: "Groups found", data: groups });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const getUserGroupInCourse = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    const userGroup = await GroupParticipation.findOne({
      where: { userId },
      include: [
        {
          model: Group,
          required: true,
          include: [
            {
              model: GroupSet,
              required: true,
              where: { courseId },
            },
          ],
        },
      ],
    });

    if (!userGroup) {
      return res.status(404).json({
        message: "User is not assigned to any group in this course",
      });
    }

    return res.status(200).json({
      groupId: userGroup.group.id,
      groupName: userGroup.group.name,
      groupSetId: userGroup.group.groupSet.id,
      groupSetName: userGroup.group.groupSet.name,
    });
  } catch (error) {
    console.error("Error fetching user group:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export async function getGroupById(req, res) {
  try {
    const group = await Group.findByPk(req.params.id);
    res.status(200).json({ message: "Group found", data: group });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function createGroup(req, res) {
  try {
    const group = await Group.create(req.body);
    res.status(201).json({ message: "Group created", data: group });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function createGroupsBulk(req, res) {
  try {
    // data format: [["email1", "group name"], ["email2", "group name"]...]
    const groupSetId = req.params.groupSetId;
    const emails = req.body.data.map(item => item[0]);
    const groupNames = [...new Set(req.body.data.map(item => item[1]))];

    // create groups
    const groupsData = groupNames.map(name => ({
      name,
      groupSetId,
    }));
    const groups = await Group.bulkCreate(groupsData);

    // map group names to group IDs
    const groupMap = {};
    groups.forEach(group => {
      groupMap[group.name] = group.id;
    });

    // create group memberships
    // convert emails to user IDs
    const response = await axios.post("http://user-service:8000/users/ids-from-emails/", {
      emails,
    });
    const userIds = response.data.userIds;
    const groupParticipationsData = userIds.map((userId, index) => ({
      userId,
      groupId: groupMap[req.body.data[index][1]],
    }));
    await GroupParticipation.bulkCreate(groupParticipationsData);

    res.status(201).json({ message: "Groups created" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateGroup(req, res) {
  try {
    const group = await Group.findByPk(req.params.id);
    group.update(req.body);
    res.status(200).json({ message: "Group updated", data: group });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateGroupsBulk(req, res) {
  try {
    // data format: [["email1", "group name"], ["email2", "group name"]...]
    const groupSetId = req.params.groupSetId;
    const emails = req.body.data.map(item => item[0]);
    const groupNames = [...new Set(req.body.data.map(item => item[1]))];

    // delete old groups not in the new groupNames
    await Group.destroy({
      where: {
        groupSetId,
        name: {
          [Op.notIn]: groupNames,
        },
      },
    });

    // create groups, ignore duplicates
    await Group.bulkCreate(
      groupNames.map(name => ({ name, groupSetId })),
      { ignoreDuplicates: true },
    );

    // map group names to group IDs
    const groupMap = {};
    const groups = await Group.findAll({ where: { groupSetId } });
    groups.forEach(group => {
      groupMap[group.name] = group.id;
    });

    // delete old group participations
    await GroupParticipation.destroy({
      where: {
        groupId: {
          [Op.in]: Object.values(groupMap),
        },
      },
    });

    // create or update group memberships
    const response = await axios.post("http://user-service:8000/users/ids-from-emails/", {
      emails,
    });
    const userIds = response.data.userIds;
    const groupParticipationsData = userIds.map((userId, index) => ({
      userId,
      groupId: groupMap[req.body.data[index][1]],
    }));
    await GroupParticipation.bulkCreate(groupParticipationsData);

    res.status(200).json({ message: "Groups updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function deleteGroup(req, res) {
  try {
    const group = await Group.findByPk(req.params.id);
    group.destroy();
    res.status(200).json({ message: "Group deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
