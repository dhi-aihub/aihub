import GroupParticipation from "../models/groupParticipation-model.js";

export async function getGroupParticipations(req, res) {
  try {
    const groupParticipations = await GroupParticipation.findAll();
    res.status(200).json({ message: "GroupParticipations retrieved", data: groupParticipations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
