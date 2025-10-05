import { Router } from "express";
import {
  trainingOutputUploadMulter,
  uploadTrainingOutput,
  downloadTrainingOutput,
} from "../controllers/trainingOutput.controller";

const router = Router();

// Upload
router.post("/:taskId", trainingOutputUploadMulter, uploadTrainingOutput);

// Download
router.get("/:id", downloadTrainingOutput);

export default router;