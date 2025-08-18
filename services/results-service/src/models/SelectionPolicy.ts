import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export type SelectionStrategy = "BEST_BY_SCORE" | "LATEST" | "CUSTOM";

export interface SelectionPolicyAttrs {
  id: string;
  assignmentId: string;
  strategy: SelectionStrategy;
  params?: Record<string, any> | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SelectionPolicyCreation = Optional<
  SelectionPolicyAttrs,
  "id" | "params" | "createdAt" | "updatedAt"
>;

export class SelectionPolicy
  extends Model<SelectionPolicyAttrs, SelectionPolicyCreation>
  implements SelectionPolicyAttrs
{
  declare id: string;
  declare assignmentId: string;
  declare strategy: SelectionStrategy;
  declare params: Record<string, any> | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize) {
    SelectionPolicy.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        assignmentId: {
          type: DataTypes.STRING(128),
          allowNull: false,
          unique: true,
        },
        strategy: {
          type: DataTypes.ENUM("BEST_BY_SCORE", "LATEST", "CUSTOM"),
          allowNull: false,
          defaultValue: "BEST_BY_SCORE",
        },
        params: { type: DataTypes.JSONB, allowNull: true },
      },
      { sequelize, tableName: "selection_policies" }
    );
    return SelectionPolicy;
  }
}
