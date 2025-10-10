import { Result } from "./Result";
import { StudentSelection } from "./StudentSelection";

// Wire associations. Call this once after all models are imported/initialized.
export function setupAssociations() {
  // A Result has at most one StudentSelection
  Result.hasOne(StudentSelection, { foreignKey: "resultId", as: "studentSelection" });

  // A StudentSelection belongs to a single Result
  StudentSelection.belongsTo(Result, { foreignKey: "resultId", as: "result" });
}

export { Result, StudentSelection };
