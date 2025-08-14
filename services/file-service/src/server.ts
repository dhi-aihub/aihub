import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { sequelize } from "./db";

const PORT = process.env.PORT || 3002;

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected successfully.");

    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`🚀 File-service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Unable to connect to the database:", err);
    process.exit(1);
  });
