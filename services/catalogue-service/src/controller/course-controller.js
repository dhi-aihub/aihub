import Course from "../models/course-model.js";

export async function getAllCourses(req, res) {
    try {
        const courses = await Course.findAll();
        const data = courses.map(course => {
            return {
                id: course.id,
                code: course.code,
                semester: course.semester,
                participation: "STU" // TODO: get participation from user
            };
        });
        res.status(200).json({ message: "All courses", data });
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
        const course = await Course.create(req.body);
        res.status(201).json({ message: "Course created", data: course });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function updateCourse(req, res) {
    try {
        const course = await Course.findByPk(req.params.id);
        course.update(req.body);
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

// get all tasks associated with a course
export async function getCourseTasks(req, res) {
    try {
        const course = await Course.findByPk(req.params.id, { include: "tasks" });
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        res.status(200).json({ message: "Course tasks", data: course.tasks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// get all groups associated with a course
export async function getCourseGroups(req, res) {
    try {
        const course = await Course.findByPk(req.params.id, { include: "groups" });
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        res.status(200).json({ message: "Course groups", data: course.groups });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
