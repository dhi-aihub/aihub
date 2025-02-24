import mongoose from "mongoose";

const Schema = mongoose.Schema;

const taskSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: "CourseModel",
        required: true
    },
    description: {
        type: String
    },
    deadlineAt: {
        type: Date
    },
    openedAt: {
        type: Date,
        default: Date.now
    }
});

taskSchema.index({ name: 1, course: 1 }, { unique: true });

const Task = mongoose.model("TaskModel", taskSchema);

export default Task;