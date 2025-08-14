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
router.post("/tasks/:taskId/grader", graderUploadMulter, uploadGrader);
router.post("/tasks/:taskId/template", templateUploadMulter, uploadTemplate);

// Downloads
router.get("/tasks/:taskId/grader/download", downloadGrader);
router.get("/tasks/:taskId/template/download", downloadTemplate);

export default router;
