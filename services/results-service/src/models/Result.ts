import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export type ResultStatus = "PASSED" | "FAILED" | "PARTIAL" | "ERROR";

export interface ResultAttrs {
  id: string;
  submissionId: string;
  assignmentId: string;
  studentId: string;
  status: ResultStatus;
  score?: string | null;
  metrics?: Record<string, any> | null;
  error?: string | null;
  artifactsUri?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ResultCreation = Optional<
  ResultAttrs,
  | "id"
  | "score"
  | "metrics"
  | "error"
  | "artifactsUri"
  | "createdAt"
  | "updatedAt"
>;

export class Result
  extends Model<ResultAttrs, ResultCreation>
  implements ResultAttrs
{
  declare id: string;
  declare submissionId: string;
  declare evalRunId: string;
  declare assignmentId: string;
  declare studentId: string;
  declare status: ResultStatus;
  declare score: string | null;
  declare metrics: Record<string, any> | null;
  declare error: string | null;
  declare artifactsUri: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize) {
    Result.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        submissionId: { type: DataTypes.STRING(128), allowNull: false },
        assignmentId: { type: DataTypes.STRING(128), allowNull: false },
        studentId: { type: DataTypes.STRING(128), allowNull: false },
        status: {
          type: DataTypes.ENUM("PASSED", "FAILED", "PARTIAL", "ERROR"),
          allowNull: false,
        },
        score: { type: DataTypes.DECIMAL(10, 4), allowNull: true },
        metrics: { type: DataTypes.JSONB, allowNull: true },
        error: { type: DataTypes.TEXT, allowNull: true },
        artifactsUri: { type: DataTypes.TEXT, allowNull: true },
      },
      {
        sequelize,
        tableName: "results",
        indexes: [
          {
            unique: true,
            fields: ["submissionId", "evalRunId"],
            name: "results_submission_evalrun_unique",
          },
          {
            fields: ["assignmentId", "createdAt"],
            name: "results_asg_createdat_idx",
          },
          {
            fields: ["assignmentId", "studentId", "createdAt"],
            name: "results_asg_student_createdat_idx",
          },
          {
            fields: ["assignmentId", "score"],
            name: "results_asg_score_desc_idx",
          },
        ],
      }
    );
    return Result;
  }
}
