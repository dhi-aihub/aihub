import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db";

export interface TrainingOutputAttrs {
  id: string;
  taskId: string;
  filename: string;
  mimetype: string;
  sizeBytes: number;
  content: Buffer;
  checksumSha256: string;
  createdAt?: Date;
}

type TrainingOutputCreation = Optional<TrainingOutputAttrs, "id" | "createdAt">;

export class TrainingOutput
  extends Model<TrainingOutputAttrs, TrainingOutputCreation>
  implements TrainingOutputAttrs
{
  declare id: string;
  declare taskId: string;
  declare filename: string;
  declare mimetype: string;
  declare sizeBytes: number;
  declare content: Buffer;
  declare checksumSha256: string;
  declare createdAt: Date;
}

TrainingOutput.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    taskId: { type: DataTypes.STRING, allowNull: false },
    filename: { type: DataTypes.STRING, allowNull: false },
    mimetype: { type: DataTypes.STRING, allowNull: false },
    sizeBytes: { type: DataTypes.INTEGER, allowNull: false },
    content: { type: DataTypes.BLOB, allowNull: false },
    checksumSha256: { type: DataTypes.STRING, allowNull: false },
    createdAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: "training_outputs",
  }
);
