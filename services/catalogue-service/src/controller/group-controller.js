import axios from "axios";
import Group from "../models/group-model.js";
import GroupParticipation from "../models/groupParticipation-model.js";

// for testing purposes
export async function getAllGroups(req, res) {
    try {
        const groups = await Group.findAll();
        res.status(200).json({ message: "All groups", data: groups });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

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
        const response = await axios.post('http://user-service:8000/users/ids-from-emails/', { emails });
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

export async function deleteGroup(req, res) {
    try {
        const group = await Group.findByPk(req.params.id);
        group.destroy();
        res.status(200).json({ message: "Group deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
