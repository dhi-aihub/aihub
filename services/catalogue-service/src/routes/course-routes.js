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
import { verifyAccessToken, verifyIsAdmin } from "../middleware/basic-access-control.js";

const router = express.Router();

router.get("/", verifyAccessToken, getAllCourses);

router.get("/:id", verifyAccessToken, getCourseById);

router.post("/", verifyAccessToken, verifyIsAdmin, createCourse);

router.put("/:id", verifyAccessToken, updateCourse);

router.delete("/:id", verifyAccessToken, verifyIsAdmin, deleteCourse);

router.get("/:id/tasks", verifyAccessToken, getCourseTasks);

router.get("/:id/groups", verifyAccessToken, getCourseGroups);

export default router;