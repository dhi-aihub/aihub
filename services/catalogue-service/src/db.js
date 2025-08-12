import "dotenv/config";
import { Sequelize } from "sequelize";

let postgresUri = process.env.DATABASE_URL;
const sequelize = new Sequelize(postgresUri);

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database synchronized");
  })
  .catch((error) => {
    console.error("Failed to synchronize database:", error);
  });

export default sequelize;
