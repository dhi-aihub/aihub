import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db";

export type TrainingResultStatus = "COMPLETED" | "ERROR";

export interface TrainingResultAttrs {
  id: string;
  trainingJobId: string;
  status: TrainingResultStatus;
  details?: Record<string, any> | null;
  error?: string | null;
  outputUri?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TrainingResultCreation = Optional<
  TrainingResultAttrs,
  | "id"
  | "details"
  | "error"
  | "outputUri"
  | "createdAt"
  | "updatedAt"
>;

export class TrainingResult
  extends Model<TrainingResultAttrs, TrainingResultCreation>
  implements TrainingResultAttrs
{
  declare id: string;
  declare trainingJobId: string;
  declare status: TrainingResultStatus;
  declare details: Record<string, any> | null;
  declare error: string | null;
  declare outputUri: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

TrainingResult.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    trainingJobId: { type: DataTypes.STRING(128), allowNull: false },
    status: { type: DataTypes.ENUM("COMPLETED", "ERROR"), allowNull: false },
    details: { type: DataTypes.JSONB, allowNull: true },
    error: { type: DataTypes.TEXT, allowNull: true },
    outputUri: { type: DataTypes.STRING(256), allowNull: true },
  },
  {
    sequelize,
    tableName: "training_results",
    indexes: [
      {
        unique: true,
        fields: ["trainingJobId"],
        name: "unique_training_job_id",
      }
    ],
  }
);