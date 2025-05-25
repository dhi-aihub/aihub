import axios from "axios";
import CourseParticipation from "../models/courseParticipation-model.js";

export async function createCourseParticipation(req, res) {
    try {
        const participation = await CourseParticipation.create(req.body);
        res.status(201).json({ message: 'CourseParticipation created', data: participation });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function createCourseParticipationBulk(req, res) {
    try {
        const { courseId } = req.params;

        // body format: [[email1, role1], [email2, role2], ...]
        const emails = req.body.map(item => item[0]);

        // get userId from user service
        const response = await axios.post('http://user-service:PORT/api/users/ids', emails);
        const userIds = response.data.userIds;

        // Prepare data for bulk create
        const data = userIds.map((userId, index) => ({
            userId,
            courseId,
            role: req.body[index][1]
        }));

        await CourseParticipation.bulkCreate(data);
        res.status(201).json({ message: 'CourseParticipations created' });
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
