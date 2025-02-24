import mongoose from "mongoose";

const Schema = mongoose.Schema;

const participationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: "CourseModel",
        required: true
    },
    role: {
        type: String,
        required: true
    }
});

participationSchema.index({ user: 1, course: 1 }, { unique: true });

const Participation = mongoose.model("ParticipationModel", participationSchema);

export default Participation;