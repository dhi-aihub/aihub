import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const CourseParticipation = sequelize.define("courseParticipation", {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    indexes: [
        {
            unique: true,
            fields: ['userId', 'courseId']
        }
    ]
});


export default CourseParticipation;


/*
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

export async function createParticipation(userId, courseId, role) {
    return Participation.create({ user: userId, course: courseId, role });
}

export async function deleteParticipation(userId, courseId) {
    return Participation.deleteOne({ user: userId, course: courseId });
}

export default Participation;
*/