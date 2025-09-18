import GroupParticipation from "../models/groupParticipation-model.js";

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
