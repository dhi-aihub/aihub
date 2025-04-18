import "dotenv/config";
import { Sequelize } from "sequelize";

let postgresUri = process.env.DATABASE_URL;
const sequelize = new Sequelize(postgresUri);

sequelize.sync({ force: false })
.then(() => {
    console.log("Database synchronized");
})
.catch((error) => {
    console.error("Failed to synchronize database:", error);
});


export default sequelize;