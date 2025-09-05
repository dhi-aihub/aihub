import express from "express";

import {
  getCourseParticipations,
  getCourseParticipationsByCourse,
  createCourseParticipation,
  deleteCourseParticipation,
  createCourseParticipationBulk,
} from "../controller/courseParticipation-controller.js";

const router = express.Router();

router.get("/", getCourseParticipations);

router.get("/:courseId", getCourseParticipationsByCourse);

router.post("/:courseId", createCourseParticipation);

router.post("/:courseId/bulk", createCourseParticipationBulk);

router.delete("/:userId/:courseId", deleteCourseParticipation);

export default router;
