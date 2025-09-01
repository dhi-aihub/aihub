import { Router } from "express";
import {
  createOrUpdateResult,
  getResultById,
  listResults,
} from "../controllers/result.controller";

const router = Router();

router.post("/results", createOrUpdateResult);
router.get("/results/:id", getResultById);
router.get("/results", listResults);

export default router;
