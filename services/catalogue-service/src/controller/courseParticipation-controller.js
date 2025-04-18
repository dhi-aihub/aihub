import CourseParticipation from "../models/courseParticipation-model.js";

export async function createCourseParticipation(req, res) {
    try {
        const participation = await CourseParticipation.create(req.body);
        res.status(201).json({ message: 'CourseParticipation created', data: participation });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function deleteCourseParticipation(req, res) {
    try {
        const { userId, courseId } = req.params;
        const participation = await CourseParticipation.findOne({ where: { userId, courseId } });
        if (!participation) {
            res.status(404).json({ message: 'CourseParticipation not found' });
            return;
        }
        participation.destroy();
        res.status(200).json({ message: 'CourseParticipation deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
