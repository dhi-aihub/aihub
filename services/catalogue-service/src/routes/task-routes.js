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
} from "../controller/task-controller.js";
import { verifyAccessToken, verifyIsCourseAdmin } from "../middleware/basic-access-control.js";

const router = express.Router();

router.get("/", getAllTasks); // unused

router.get("/:id", getTaskById);

router.post(
  "/:taskId/submit",
  verifyAccessToken,
  submissionUploadMulter,
  submitTask,
);

router.post(
  "/:courseId",
  verifyAccessToken,
  verifyIsCourseAdmin,
  taskFilesUploadMulter,
  createTask,
);

router.put("/:courseId/:taskId",
  verifyAccessToken,
  verifyIsCourseAdmin,
  taskFilesUploadMulter,
  updateTask,
);

router.delete("/:courseId/:taskId", verifyAccessToken, verifyIsCourseAdmin, deleteTask);

export default router;
