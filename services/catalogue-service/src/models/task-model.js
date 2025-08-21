import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Task = sequelize.define("task", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    notEmpty: true,
  },
  description: {
    type: DataTypes.TEXT,
  },
  deadlineAt: {
    type: DataTypes.DATE,
  },
  openedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  dailySubmissionLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
  },
  maxUploadSize: {
    type: DataTypes.INTEGER,
    defaultValue: 10000000, // 10MB
  },
  runtimeLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 60, // 1 minute
  },
  ramLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 256, // 256MB
  },
  vramLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 256, // 256MB
  },
});

export default Task;
