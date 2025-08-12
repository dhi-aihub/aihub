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
      //   notEmpty: true,
      //   unique: true,
    },
    groupSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      //   notEmpty: true,
    },
  },
  {
    // indexes: [
    //   {
    //     unique: true,
    //     fields: ["name", "courseId"],
    //   },
    // ],
  }
);

GroupSet.hasMany(Group, {
  foreignKey: {
    name: "groupSetId",
    allowNull: false,
  },
  onDelete: "CASCADE",
});
Group.belongsTo(GroupSet, {
  foreignKey: { name: "groupSetId", allowNull: false },
});

GroupSet.hasMany(Task, {
  foreignKey: {
    name: "groupSetId",
    allowNull: true,
  },
  onDelete: "SET NULL",
});
Task.belongsTo(GroupSet, {
  foreignKey: { name: "groupSetId", allowNull: true },
});

export default GroupSet;
