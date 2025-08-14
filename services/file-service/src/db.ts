import "dotenv/config";
import { Sequelize } from "sequelize";

const postgresUri = process.env.DATABASE_URL as string;
if (!postgresUri) {
  throw new Error("DATABASE_URL not set");
}

export const sequelize = new Sequelize(postgresUri, {
  dialect: "postgres",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: { max: 10, min: 0, idle: 10_000 },
});

export async function initDb() {
  try {
    await sequelize.authenticate();
    console.log("[db] connected");

    await sequelize.sync({ alter: true });

    console.log("[db] synchronised");
  } catch (err) {
    console.error("[db] failed to initialise", err);
    process.exit(1);
  }
}
