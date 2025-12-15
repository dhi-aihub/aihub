import express from "express";
import {
  getSubmissionsByTask,
  getSubmissionByGroup,
  getResultsByTask,
  getResultsByGroup,
  getStudentSelectionByTask,
  getStudentSelectionByGroup,
  updateStudentSelection,
  downloadSubmissionsBatch,
} from "../controller/submission-controller.js";
import { verifyAccessToken } from "../middleware/basic-access-control.js";
import { verifyTaskAccess, verifyTaskAdmin } from "../middleware/task-access-control.js";
import { verifyGroupAdminOrParticipant } from "../middleware/group-access-control.js";

const router = express.Router();

router.get("/tasks/:taskId/", verifyAccessToken, verifyTaskAccess, getSubmissionsByTask);

router.get("/tasks/:taskId/groups/:groupId/", verifyAccessToken, verifyGroupAdminOrParticipant, getSubmissionByGroup);

router.get("/results/tasks/:taskId/", verifyAccessToken, verifyTaskAccess, getResultsByTask);

router.get("/results/tasks/:taskId/groups/:groupId/", verifyAccessToken, verifyGroupAdminOrParticipant, getResultsByGroup);

router.get("/selections/tasks/:taskId/", verifyAccessToken, verifyTaskAccess, getStudentSelectionByTask);

router.get("/selections/tasks/:taskId/groups/:groupId/", verifyAccessToken, verifyGroupAdminOrParticipant, getStudentSelectionByGroup);

router.patch("/selections/tasks/:taskId/groups/:groupId/", verifyAccessToken, verifyGroupAdminOrParticipant, updateStudentSelection);

router.post("/submissions/download-batch", downloadSubmissionsBatch); // todo: add access control

export default router;
