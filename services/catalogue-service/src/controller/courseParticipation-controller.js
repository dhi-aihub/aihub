import axios from "axios";
import CourseParticipation from "../models/courseParticipation-model.js";

export async function getCourseParticipations(req, res) {
    try {
        const courseParticipations = await CourseParticipation.findAll();
        res.status(200).json({ message: 'CourseParticipations retrieved', data: courseParticipations });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

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
        const emails = req.body.data.map(item => item[0]);

        console.log("Emails to process:", emails);

        // get userId from user service
        // docker network create aihub-network
        const response = await axios.post('http://user-service:8000/users/ids-from-emails/', { emails });
        const userIds = response.data.userIds;

        // Prepare data for bulk create
        const data = userIds.map((userId, index) => ({
            userId,
            courseId,
            role: req.body.data[index][1]
        }));

        await CourseParticipation.bulkCreate(data);
        res.status(201).json({ message: 'CourseParticipations created' });
    } catch (error) {
        console.error("Error creating course participations:", error);
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
