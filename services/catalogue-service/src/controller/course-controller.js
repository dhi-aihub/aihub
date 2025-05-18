import Course from "../models/course-model.js";
import CourseParticipation from "../models/courseParticipation-model.js";

export async function getAllCourses(req, res) {
    try {
        const userId = req.user.id;
        const userIsAdmin = req.user.isAdmin;

        let data = [];
        if (userIsAdmin) {
            // if user is admin, get all courses
            const courses = await Course.findAll();
            data = courses.map(course => {
                return {
                    id: course.id,
                    code: course.code,
                    semester: course.semester,
                    participation: "ADM",
                };
            });
        } else {
            // if user is not admin, get only courses the user participates in
            const courses = await Course.findAll({
            include: {
                model: CourseParticipation,
                as: "courseParticipations",
                where: {
                    userId: userId,
                },
            }
            });

            data = courses.map(course => {
            return {
                id: course.id,
                code: course.code,
                semester: course.semester,
                participation: course.courseParticipations[0].role,  // should only be one
            };
            });
        }
        res.status(200).json({ message: "All courses", data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function getCourseById(req, res) {
    try {
        let data = {};
        if (req.user.isAdmin) {
            const course = await Course.findByPk(req.params.courseId);
            if (!course) {
                return res.status(404).json({ message: "Course not found" });
            }
            data = {
                id: course.id,
                code: course.code,
                semester: course.semester,
                participation: "ADM",
            };
        } else {
            const course = await Course.findByPk(req.params.courseId, {
                include: [
                    {
                        model: CourseParticipation,
                        as: "courseParticipations",
                        where: {
                            userId: req.user.id,
                        },
                    },
                ],
            });
            if (!course) {
                return res.status(404).json({ message: "Course not found" });
            }
            data = {
                id: course.id,
                code: course.code,
                semester: course.semester,
                participation: course.courseParticipations[0].role,  // should only be one
            };
        }
        
        res.status(200).json({ message: "Course found", data });
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
        const course = await Course.findByPk(req.params.courseId, { include: "tasks" });
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
        const course = await Course.findByPk(req.params.courseId, { include: "groups" });
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        res.status(200).json({ message: "Course groups", data: course.groups });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
