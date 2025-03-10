import Participation from "../models/participation-model.js";

export async function createParticipation(req, res) {
    try {
        const participation = await Participation.create(req.body);
        res.status(201).json({ message: 'Participation created', data: participation });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function deleteParticipation(req, res) {
    try {
        const { userId, courseId } = req.params;
        const participation = await Participation.findOne({ where: { userId, courseId } });
        if (!participation) {
            res.status(404).json({ message: 'Participation not found' });
            return;
        }
        participation.destroy();
        res.status(200).json({ message: 'Participation deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
