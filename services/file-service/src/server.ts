import "dotenv/config";

import app from "./app";
import { initDb } from "./db";

import "./models/Submission";
import "./models/TaskAsset";

const PORT = Number(process.env.PORT || 3002);

(async () => {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`🚀 File-service running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start:", err);
    process.exit(1);
  }
})();
