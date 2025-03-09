import { 
    createParticipation as _createParticipation, 
    deleteParticipation as _deleteParticipation 
} from '../models/participation-model.js';

export async function createParticipation(req, res) {
    try {
        const { userId, courseId, role } = req.body;
        const participation = await _createParticipation(userId, courseId, role);
        res.status(201).json({ message: 'Participation created', data: participation });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function deleteParticipation(req, res) {
    try {
        const { userId, courseId } = req.params;
        await _deleteParticipation(userId, courseId);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
