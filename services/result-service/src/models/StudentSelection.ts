import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface StudentSelectionAttrs {
  id: string;
  assignmentId: string;
  studentId: string;
  resultId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type StudentSelectionCreation = Optional<
  StudentSelectionAttrs,
  "id" | "resultId" | "createdAt" | "updatedAt"
>;

export class StudentSelection
  extends Model<StudentSelectionAttrs, StudentSelectionCreation>
  implements StudentSelectionAttrs
{
  declare id: string;
  declare assignmentId: string;
  declare studentId: string;
  declare resultId: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize) {
    StudentSelection.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        assignmentId: { type: DataTypes.STRING(128), allowNull: false },
        studentId: { type: DataTypes.STRING(128), allowNull: false },
        resultId: { type: DataTypes.UUID, allowNull: true },
      },
      {
        sequelize,
        tableName: "student_selections",
        indexes: [
          {
            unique: true,
            fields: ["assignmentId", "studentId"],
            name: "student_selections_asg_student_unique",
          },
        ],
      }
    );
    return StudentSelection;
  }
}
