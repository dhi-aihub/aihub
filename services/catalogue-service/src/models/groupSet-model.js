import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import Group from "./group-model.js";
import Task from "./task-model.js";

const GroupSet = sequelize.define(
  "groupSet",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      notEmpty: true,
    },
    groupSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      notEmpty: true,
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["name", "courseId"],
      },
    ],
  },
);

GroupSet.getCourseIdByGroupSetId = async function (groupSetId) {
  const groupSet = await this.findByPk(groupSetId);
  if (!groupSet) {
    return null;
  }
  return groupSet.courseId;
};

GroupSet.hasMany(Group, {
  foreignKey: {
    name: "groupSetId",
    allowNull: false,
  },
  onDelete: "CASCADE",
});
Group.belongsTo(GroupSet);

GroupSet.hasMany(Task, {
  foreignKey: {
    name: "groupSetId",
    allowNull: false,
  },
  onDelete: "SET NULL",
});
Task.belongsTo(GroupSet);

export default GroupSet;
