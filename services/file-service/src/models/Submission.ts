import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db";

export type SubmissionType = "EVALUATION" | "TRAINING";

export interface SubmissionAttrs {
  id: string;
  taskId: string;
  groupId: string;
  type: SubmissionType;
  description?: string | null;

  // stored file
  filename: string;
  mimetype: string;
  sizeBytes: number;
  content: Buffer;
  checksumSha256: string;

  metadata?: string | null; // JSON string
  createdAt?: Date;
}

type SubmissionCreation = Optional<
  SubmissionAttrs,
  "id" | "description" | "metadata" | "createdAt"
>;

export class Submission
  extends Model<SubmissionAttrs, SubmissionCreation>
  implements SubmissionAttrs
{
  declare id: string;
  declare taskId: string;
  declare groupId: string
  declare type: SubmissionType;
  declare description: string | null;
  declare filename: string;
  declare mimetype: string;
  declare sizeBytes: number;
  declare content: Buffer;
  declare checksumSha256: string;
  declare metadata: string | null;
  declare createdAt: Date;
}

Submission.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    taskId: { type: DataTypes.STRING, allowNull: false },
    groupId: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.ENUM("EVALUATION", "TRAINING"), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    filename: { type: DataTypes.STRING, allowNull: false },
    mimetype: { type: DataTypes.STRING, allowNull: false },
    sizeBytes: { type: DataTypes.INTEGER, allowNull: false },
    content: { type: DataTypes.BLOB("long"), allowNull: false }, // BYTEA
    checksumSha256: { type: DataTypes.STRING(64), allowNull: false },

    metadata: { type: DataTypes.TEXT, allowNull: true },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "submissions",
    timestamps: false,
    indexes: [{ fields: ["createdAt"] }],
  }
);
