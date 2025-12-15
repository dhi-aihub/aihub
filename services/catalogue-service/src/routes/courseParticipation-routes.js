import express from "express";

import {
  getCourseParticipations,
  getCourseParticipationsByCourse,
  createCourseParticipation,
  deleteCourseParticipation,
  createCourseParticipationBulk,
  downloadEnrollmentTemplate,
} from "../controller/courseParticipation-controller.js";
import { verifyAccessToken, verifyIsAdmin, verifyIsCourseAdmin } from "../middleware/basic-access-control.js";

const router = express.Router();

router.get("/", verifyAccessToken, verifyIsAdmin, getCourseParticipations);

router.get("/template", verifyAccessToken, downloadEnrollmentTemplate);

router.get("/:courseId", verifyAccessToken, verifyIsCourseAdmin, getCourseParticipationsByCourse);

router.post("/:courseId", verifyAccessToken, verifyIsCourseAdmin, createCourseParticipation);

router.post("/:courseId/bulk", verifyAccessToken, verifyIsCourseAdmin, createCourseParticipationBulk);

router.delete("/:userId/:courseId", verifyAccessToken, verifyIsCourseAdmin, deleteCourseParticipation);

export default router;