import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const ROLES = ["ADM", "LEC", "TA", "STU", "GUE"];

const CourseParticipation = sequelize.define(
  "courseParticipation",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM,
      values: ROLES,
      allowNull: false,
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["userId", "courseId"],
      },
    ],
  },
);

CourseParticipation.isCourseParticipant = async function (userId, courseId) {
  const participation = await this.findOne({
    where: {
      userId: userId,
      courseId: courseId,
    },
  });
  return participation !== null;
};

CourseParticipation.isCourseAdmin = async function (userId, courseId) {
  const participation = await this.findOne({
    where: {
      userId: userId,
      courseId: courseId,
      role: "ADM",
    },
  });
  return participation !== null;
}

export default CourseParticipation;
