import express from "express";

import {
  getCourseParticipations,
  getCourseParticipationsByCourse,
  createCourseParticipation,
  deleteCourseParticipation,
  createCourseParticipationBulk,
  downloadEnrollmentTemplate,
} from "../controller/courseParticipation-controller.js";
import { verifyAccessToken } from "../middleware/basic-access-control.js";

const router = express.Router();

router.get("/", getCourseParticipations);

router.get("/template", verifyAccessToken, downloadEnrollmentTemplate);

router.get("/:courseId", getCourseParticipationsByCourse);

router.post("/:courseId", verifyAccessToken, createCourseParticipation);

router.post("/:courseId/bulk", verifyAccessToken, createCourseParticipationBulk);

router.delete("/:userId/:courseId", verifyAccessToken, deleteCourseParticipation);

export default router;
