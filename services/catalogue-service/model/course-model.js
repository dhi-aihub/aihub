import mongoose from "mongoose";
import Participation from "./participation-model.js";
import Task from "./task-model.js";

const Schema = mongoose.Schema;

const courseSchema = new Schema({
    code: {
        type: String,
        required: true,
    },
    academicYear: {
        type: String,
        required: true,
    },
    semester: {
        type: String,
        required: true,
    },
});

courseSchema.index({ code: 1, academicYear: 1, semester: 1 }, { unique: true });

// Delete all participations and tasks related to the course when the course is removed
courseSchema.pre("findOneAndDelete", async function (next) {
    console.log("cascade deleting");
    try {
        const courseId = this.getQuery()._id;
        await Participation.deleteMany({ course: courseId });
        await Task.deleteMany({ course: courseId });
        next();
    } catch (error) {
        next(error);
    }
});

const Course = mongoose.model("CourseModel", courseSchema);

export default Course;