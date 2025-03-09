import "dotenv/config";
import { Sequelize } from "sequelize";

let postgresUri =
        process.env.ENV === "PROD"
            ? process.env.DB_CLOUD_URI
            : process.env.DB_LOCAL_URI;
const sequelize = new Sequelize(postgresUri);

sequelize.sync({ force: false })
.then(() => {
    console.log("Database synchronized");
})
.catch((error) => {
    console.error("Failed to synchronize database:", error);
});


export default sequelize;