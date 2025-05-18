import express from "express";

import {
    createCourse,
    deleteCourse,
    updateCourse,
    getAllCourses,
    getCourseById,
    getCourseTasks,
    getCourseGroups
} from "../controller/course-controller.js";
import { 
    verifyAccessToken,
    verifyIsAdmin,
    verifyIsCourseParticipant,
    verifyIsCourseAdmin
} from "../middleware/basic-access-control.js";

const router = express.Router();

router.get("/", verifyAccessToken, getAllCourses);

router.get("/:courseId", verifyAccessToken, verifyIsCourseParticipant, getCourseById);

router.post("/", verifyAccessToken, verifyIsAdmin, createCourse);

router.put("/:courseId", verifyAccessToken, verifyIsCourseAdmin, updateCourse);

router.delete("/:id", verifyAccessToken, verifyIsAdmin, deleteCourse);

router.get("/:courseId/tasks", verifyAccessToken, verifyIsCourseParticipant, getCourseTasks);

router.get("/:courseId/groups", verifyAccessToken, getCourseGroups);

export default router;