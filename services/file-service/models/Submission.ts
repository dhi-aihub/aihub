import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../src/db";

export interface SubmissionAttrs {
  id: string;
  description?: string | null;

  // stored file
  filename: string;
  mimetype: string;
  sizeBytes: number;
  content: Buffer; // BYTEA (BLOB)
  checksumSha256: string;

  metadata?: string | null; // JSON string

  userId: string;
  taskId: string;

  point?: number | null;
  notes?: string | null;

  createdAt?: Date;
  markedForGrading: boolean;
}

type SubmissionCreation = Optional<
  SubmissionAttrs,
  | "id"
  | "description"
  | "metadata"
  | "point"
  | "notes"
  | "createdAt"
  | "markedForGrading"
>;

export class Submission
  extends Model<SubmissionAttrs, SubmissionCreation>
  implements SubmissionAttrs
{
  declare id: string;
  declare description: string | null;
  declare filename: string;
  declare mimetype: string;
  declare sizeBytes: number;
  declare content: Buffer;
  declare checksumSha256: string;
  declare metadata: string | null;
  declare userId: string;
  declare taskId: string;
  declare point: number | null;
  declare notes: string | null;
  declare createdAt: Date;
  declare markedForGrading: boolean;
}

Submission.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    filename: { type: DataTypes.STRING, allowNull: false },
    mimetype: { type: DataTypes.STRING, allowNull: false },
    sizeBytes: { type: DataTypes.INTEGER, allowNull: false },
    content: { type: DataTypes.BLOB("long"), allowNull: false }, // BYTEA
    checksumSha256: { type: DataTypes.STRING(64), allowNull: false },

    metadata: { type: DataTypes.TEXT, allowNull: true },

    userId: { type: DataTypes.STRING, allowNull: false },
    taskId: { type: DataTypes.STRING, allowNull: false },

    point: { type: DataTypes.DECIMAL(9, 3), allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    markedForGrading: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "submissions",
    timestamps: false,
    indexes: [
      { fields: ["userId"] },
      { fields: ["taskId"] },
      { fields: ["createdAt"] },
      { fields: ["markedForGrading"] },
    ],
  }
);
