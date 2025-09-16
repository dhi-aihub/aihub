import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db";

export type TaskAssetType = "GRADER" | "TEMPLATE" | "TRAINER";

export interface TaskAssetAttrs {
  id: string;
  taskId: string;
  type: TaskAssetType;
  filename: string;
  mimetype: string;
  sizeBytes: number;
  content: Buffer;
  checksumSha256: string;
  uploadedAt?: Date;
}

type TaskAssetCreation = Optional<TaskAssetAttrs, "id" | "uploadedAt">;

export class TaskAsset
  extends Model<TaskAssetAttrs, TaskAssetCreation>
  implements TaskAssetAttrs
{
  declare id: string;
  declare taskId: string;
  declare type: TaskAssetType;
  declare filename: string;
  declare mimetype: string;
  declare sizeBytes: number;
  declare content: Buffer;
  declare checksumSha256: string;
  declare uploadedAt: Date;
}

TaskAsset.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    taskId: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.ENUM("GRADER", "TEMPLATE", "TRAINER"), allowNull: false },
    filename: { type: DataTypes.STRING, allowNull: false },
    mimetype: { type: DataTypes.STRING, allowNull: false },
    sizeBytes: { type: DataTypes.INTEGER, allowNull: false },
    content: { type: DataTypes.BLOB("long"), allowNull: false },
    checksumSha256: { type: DataTypes.STRING(64), allowNull: false },
    uploadedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "task_assets",
    timestamps: false,
    indexes: [
      { unique: true, fields: ["taskId", "type"] },
      { fields: ["taskId"] },
      { fields: ["type"] },
    ],
  }
);
