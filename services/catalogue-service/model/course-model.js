import mongoose from "mongoose";

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

const Course = mongoose.model("CourseModel", courseSchema);

export default Course;