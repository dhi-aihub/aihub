import express from "express";
import {
  getSubmissionsByTask,
  getSubmissionByGroup,
  getResultsByTask,
  getResultsByGroup,
  getStudentSelectionByTask,
  getStudentSelectionByGroup,
} from "../controller/submission-controller.js";

const router = express.Router();

router.get("/tasks/:taskId/", getSubmissionsByTask);

router.get("/tasks/:taskId/groups/:groupId/", getSubmissionByGroup);

router.get("/results/tasks/:taskId/", getResultsByTask);

router.get("/results/tasks/:taskId/groups/:groupId/", getResultsByGroup);

router.get("/selections/tasks/:taskId/", getStudentSelectionByTask);

router.get("/selections/tasks/:taskId/groups/:groupId/", getStudentSelectionByGroup);

export default router;
