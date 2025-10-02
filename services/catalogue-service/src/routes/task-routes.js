import express from "express";
import {
  createTask,
  deleteTask,
  updateTask,
  getAllTasks,
  getTaskById,
  taskFilesUploadMulter,
  submissionUploadMulter,
  submitTask,
  trainingSubmissionUploadMulter,
  submitTrainingAgent,
  downloadTemplateFile,
  downloadTrainerTemplateFile,
} from "../controller/task-controller.js";
import { verifyAccessToken, verifyIsCourseAdmin } from "../middleware/basic-access-control.js";

const router = express.Router();

router.get("/", getAllTasks); // unused

router.get("/:id", getTaskById);

router.post(
  "/:courseId",
  verifyAccessToken,
  verifyIsCourseAdmin,
  taskFilesUploadMulter,
  createTask,
);

router.put(
  "/:courseId/:taskId",
  verifyAccessToken,
  verifyIsCourseAdmin,
  taskFilesUploadMulter,
  updateTask,
);

router.delete("/:courseId/:taskId", verifyAccessToken, verifyIsCourseAdmin, deleteTask);

router.post("/:taskId/submit", verifyAccessToken, submissionUploadMulter, submitTask);

router.post(
  "/:taskId/submit-training",
  verifyAccessToken,
  trainingSubmissionUploadMulter,
  submitTrainingAgent,
);

router.get("/:taskId/download-template", verifyAccessToken, downloadTemplateFile);

router.get("/:taskId/download-training-template", verifyAccessToken, downloadTrainerTemplateFile);

export default router;
