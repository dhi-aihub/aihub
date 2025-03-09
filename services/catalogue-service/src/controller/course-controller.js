import Course from "../models/course-model.js";

export async function getAllCourses(req, res) {
    try {
        const courses = await Course.findAll();
        res.status(200).json({ message: "All courses", data: courses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function getCourseById(req, res) {
    try {
        const course = await Course.findByPk(req.params.id);
        res.status(200).json({ message: "Course found", data: course });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function createCourse(req, res) {
    try {
        const { code, academicYear, semester } = req.body;
        const course = await Course.create({ code, academicYear, semester });
        res.status(201).json({ message: "Course created", data: course });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function updateCourse(req, res) {
    try {
        const { code, academicYear, semester } = req.body;
        const course = await Course.findByPk(req.params.id);
        course.update({ code, academicYear, semester });
        res.status(200).json({ message: "Course updated", data: course });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function deleteCourse(req, res) {
    try {
        const course = await Course.findByPk(req.params.id);
        course.destroy();
        res.status(200).json({ message: "Course deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}