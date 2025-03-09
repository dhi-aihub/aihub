import express from "express";

import {
    createCourse,
    deleteCourse,
    updateCourse,
    getAllCourses,
    getCourseById
} from "../controller/course-controller.js";

const router = express.Router();

router.get("/", getAllCourses);

router.get("/:id", getCourseById);

router.post("/", createCourse);

router.put("/:id", updateCourse);

router.delete("/:id", deleteCourse);

export default router;