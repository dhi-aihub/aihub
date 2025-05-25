import express from "express";

import {
    createCourseParticipation,
    deleteCourseParticipation,
    createCourseParticipationBulk
} from "../controller/courseParticipation-controller.js";

const router = express.Router();

router.post("/:courseId", createCourseParticipation);

router.post("/:courseId/bulk", createCourseParticipationBulk);

router.delete("/:userId/:courseId", deleteCourseParticipation);

export default router;