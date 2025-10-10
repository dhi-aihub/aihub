import "dotenv/config";

import app from "./app";
import { initDb } from "./db";

import { setupAssociations } from "./models";

const PORT = Number(process.env.PORT || 3002);

(async () => {
  try {
  // wire associations before synchronising the database
  setupAssociations();

  await initDb();
    app.listen(PORT, () => {
      console.log(`🚀 Result-service running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start:", err);
    process.exit(1);
  }
})();
