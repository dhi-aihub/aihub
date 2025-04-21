import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const ROLES = ["Admin", "Lecturer", "Teaching Assistant", "Student"];

const CourseParticipation = sequelize.define("courseParticipation", {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM(ROLES),
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
