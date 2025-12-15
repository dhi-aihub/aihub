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
  downloadTrainingOutputFile,
  getTaskGroups,
} from "../controller/task-controller.js";
import { verifyAccessToken, verifyIsAdmin, verifyIsCourseAdmin } from "../middleware/basic-access-control.js";
import { verifyTaskAccess, verifyTaskAdmin } from "../middleware/task-access-control.js";

const router = express.Router();

router.get("/", verifyAccessToken, verifyIsAdmin, getAllTasks);

router.get("/:taskId", verifyAccessToken, verifyTaskAccess, getTaskById);

router.post(
  "/:courseId",
  verifyAccessToken,
  verifyIsCourseAdmin,
  taskFilesUploadMulter,
  createTask,
);

router.put(
  "/:taskId",
  verifyAccessToken,
  verifyTaskAdmin,
  taskFilesUploadMulter,
  updateTask,
);

router.delete("/:taskId", verifyAccessToken, verifyTaskAdmin, deleteTask);

router.post("/:taskId/submit", verifyAccessToken, verifyTaskAccess, submissionUploadMulter, submitTask);

router.post(
  "/:taskId/submit-training",
  verifyAccessToken,
  verifyTaskAccess,
  trainingSubmissionUploadMulter,
  submitTrainingAgent,
);

router.get("/:taskId/download-template", verifyAccessToken, verifyTaskAccess, downloadTemplateFile);

router.get("/:taskId/download-training-template", verifyAccessToken, verifyTaskAccess, downloadTrainerTemplateFile);

router.get("/:fileId/download-training-output", verifyAccessToken, downloadTrainingOutputFile); // todo: add access control

router.get("/:taskId/groups", verifyAccessToken, verifyTaskAccess, getTaskGroups);

export default router;
