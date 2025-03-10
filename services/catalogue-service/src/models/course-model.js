import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import Participation from "./participation-model.js";
import Task from "./task-model.js";

const Course = sequelize.define("course", {
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        notEmpty: true,
    },
    academicYear: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    semester: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    indexes: [
        {
            unique: true,
            fields: ['code', 'academicYear', 'semester']
        }
    ]
});

Course.hasMany(Participation, {
    foreignKey: {
        name: "courseId",
        allowNull: false,
    },
    onDelete: "CASCADE",
});
Participation.belongsTo(Course);

Course.hasMany(Task, {
    foreignKey: {
        name: "courseId",
        allowNull: false,
    },
    onDelete: "CASCADE",
});
Task.belongsTo(Course);

export default Course;


/*
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
*/