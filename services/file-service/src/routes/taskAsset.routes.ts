import { Router } from "express";
import {
  graderUploadMulter,
  templateUploadMulter,
  trainerUploadMulter,
  uploadGrader,
  uploadTemplate,
  uploadTrainer,
  downloadGrader,
  downloadTemplate,
  downloadTrainer,
} from "../controllers/taskAsset.controller";

const router = Router();

// Uploads
router.post("/:taskId/grader", graderUploadMulter, uploadGrader);
router.post("/:taskId/template", templateUploadMulter, uploadTemplate);
router.post("/:taskId/trainer", trainerUploadMulter, uploadTrainer);

// Downloads
router.get("/:taskId/grader/download", downloadGrader);
router.get("/:taskId/template/download", downloadTemplate);
router.get("/:taskId/trainer/download", downloadTrainer);

export default router;
