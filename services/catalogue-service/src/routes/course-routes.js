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

const router = express.Router();

router.get("/", getAllCourses);

router.get("/:id", getCourseById);

router.post("/", createCourse);

router.put("/:id", updateCourse);

router.delete("/:id", deleteCourse);

router.get("/:id/tasks", getCourseTasks);

router.get("/:id/groups", getCourseGroups);

export default router;