import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface AssignmentStudentIndexAttrs {
  id: string;
  assignmentId: string;
  studentId: string;
  latestResultId?: string | null;
  bestResultId?: string | null;
  selectedForGradingResultId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AssignmentStudentIndexCreation = Optional<
  AssignmentStudentIndexAttrs,
  | "id"
  | "latestResultId"
  | "bestResultId"
  | "selectedForGradingResultId"
  | "createdAt"
  | "updatedAt"
>;

export class AssignmentStudentIndex
  extends Model<AssignmentStudentIndexAttrs, AssignmentStudentIndexCreation>
  implements AssignmentStudentIndexAttrs
{
  declare id: string;
  declare assignmentId: string;
  declare studentId: string;
  declare latestResultId: string | null;
  declare bestResultId: string | null;
  declare selectedForGradingResultId: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize) {
    AssignmentStudentIndex.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        assignmentId: { type: DataTypes.STRING(128), allowNull: false },
        studentId: { type: DataTypes.STRING(128), allowNull: false },
        latestResultId: { type: DataTypes.UUID, allowNull: true },
        bestResultId: { type: DataTypes.UUID, allowNull: true },
        selectedForGradingResultId: { type: DataTypes.UUID, allowNull: true },
      },
      {
        sequelize,
        tableName: "assignment_student_index",
        indexes: [
          {
            unique: true,
            fields: ["assignmentId", "studentId"],
            name: "as_index_asg_student_unique",
          },
          {
            fields: ["assignmentId", "studentId"],
            name: "as_index_asg_student_idx",
          },
        ],
      }
    );
    return AssignmentStudentIndex;
  }
}
