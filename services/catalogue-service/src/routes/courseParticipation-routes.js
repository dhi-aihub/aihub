import express from "express";

import {
    createCourseParticipation,
    deleteCourseParticipation,
} from "../controller/courseParticipation-controller.js";

const router = express.Router();

router.post("/:courseId", createCourseParticipation);

router.delete("/:userId/:courseId", deleteCourseParticipation);

export default router;