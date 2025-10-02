import GroupParticipation from "../models/groupParticipation-model.js";
import Group from "../models/group-model.js";

export async function getGroupParticipations(req, res) {
  try {
    const groupParticipations = await GroupParticipation.findAll();
    res.status(200).json({ message: "GroupParticipations retrieved", data: groupParticipations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function createGroupParticipation(req, res) {
  const { groupId } = req.params;
  const { userId } = req.body;

  try {
    // Find the group to get its groupSetId
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Find if user is already in any group in the same group set
    const existingParticipation = await GroupParticipation.findOne({
      where: { userId },
      include: [{
        model: Group,
        where: { groupSetId: group.groupSetId },
      }],
    });

    if (existingParticipation) {
      return res.status(400).json({ message: "User is already in a group in this group set" });
    }

    const newParticipation = await GroupParticipation.create({ groupId, userId });
    res.status(201).json({ message: "GroupParticipation created", data: newParticipation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Remove user from group Participation
export async function deleteGroupParticipation(req, res) {
  const { groupParticipationId } = req.params;

  try {
    await GroupParticipation.destroy({ where: { id: groupParticipationId } });
    res.status(200).json({ message: "GroupParticipation deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
