import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import CourseParticipation from "./courseParticipation-model.js";
import Task from "./task-model.js";
import Group from "./group-model.js";

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

Course.hasMany(CourseParticipation, {
    foreignKey: {
        name: "courseId",
        allowNull: false,
    },
    onDelete: "CASCADE",
});
CourseParticipation.belongsTo(Course);

Course.hasMany(Task, {
    foreignKey: {
        name: "courseId",
        allowNull: false,
    },
    onDelete: "CASCADE",
});
Task.belongsTo(Course);

Course.hasMany(Group, {
    foreignKey: {
        name: "courseId",
        allowNull: false,
    },
    onDelete: "CASCADE",
});
Group.belongsTo(Course);


export default Course;