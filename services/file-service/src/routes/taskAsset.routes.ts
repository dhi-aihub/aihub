import { Router } from "express";
import {
  graderUploadMulter,
  templateUploadMulter,
  uploadGrader,
  uploadTemplate,
  downloadGrader,
  downloadTemplate,
} from "../controllers/taskAsset.controller";

const router = Router();

// Uploads
router.post("/:taskId/grader", graderUploadMulter, uploadGrader);
router.post("/:taskId/template", templateUploadMulter, uploadTemplate);

// Downloads
router.get("/:taskId/grader/download", downloadGrader);
router.get("/:taskId/template/download", downloadTemplate);

export default router;
