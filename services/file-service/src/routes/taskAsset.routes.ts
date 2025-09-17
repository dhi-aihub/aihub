import { Router } from "express";
import {
  graderUploadMulter,
  templateUploadMulter,
  trainerUploadMulter,
  trainingTemplateUploadMulter,
  uploadGrader,
  uploadTemplate,
  uploadTrainer,
  uploadTrainingTemplate,
  downloadGrader,
  downloadTemplate,
  downloadTrainer,
  downloadTrainingTemplate,
} from "../controllers/taskAsset.controller";

const router = Router();

// Uploads
router.post("/:taskId/grader", graderUploadMulter, uploadGrader);
router.post("/:taskId/template", templateUploadMulter, uploadTemplate);
router.post("/:taskId/trainer", trainerUploadMulter, uploadTrainer);
router.post("/:taskId/training-template", trainingTemplateUploadMulter, uploadTrainingTemplate);

// Downloads
router.get("/:taskId/grader/download", downloadGrader);
router.get("/:taskId/template/download", downloadTemplate);
router.get("/:taskId/trainer/download", downloadTrainer);
router.get("/:taskId/training-template/download", downloadTrainingTemplate);

export default router;
