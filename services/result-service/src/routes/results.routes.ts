import { Router } from "express";
import {
  createOrUpdateResult,
  getResultById,
  listResults,
  exportResultsCsv,
} from "../controllers/result.controller";

const router = Router();

router.post("/results", createOrUpdateResult);
router.get("/results/:id", getResultById);
router.get("/results", listResults);
router.post("/export-csv", exportResultsCsv);

export default router;
