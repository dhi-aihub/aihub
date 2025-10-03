import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { sequelize } from "../db";

export interface StudentSelectionAttrs {
  id: string;
  taskId: string;
  groupId: string;
  resultId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type StudentSelectionCreation = Optional<
  StudentSelectionAttrs,
  "id" | "createdAt" | "updatedAt"
>;

export class StudentSelection
  extends Model<StudentSelectionAttrs, StudentSelectionCreation>
  implements StudentSelectionAttrs
{
  declare id: string;
  declare taskId: string;
  declare groupId: string;
  declare resultId: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

StudentSelection.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    taskId: { type: DataTypes.STRING(128), allowNull: false },
    groupId: { type: DataTypes.STRING(128), allowNull: false },
    resultId: { type: DataTypes.UUID, allowNull: true },
  },
  {
    sequelize,
    tableName: "student_selections",
    indexes: [
      {
        unique: true,
        fields: ["taskId", "groupId"],
        name: "student_selections_asg_student_unique",
      },
    ],
  }
);
