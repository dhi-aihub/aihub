import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const ROLES = ["ADM", "LEC", "TA", "STU", "GUE"];

const CourseParticipation = sequelize.define("courseParticipation", {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM,
        values: ROLES,
        allowNull: false,
    },
}, {
    indexes: [
        {
            unique: true,
            fields: ["userId", "courseId"]
        }
    ]
});


export default CourseParticipation;
