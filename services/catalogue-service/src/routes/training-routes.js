import express from "express";
import {
  getTrainingJobByGroup,
  getTrainingResult,
} from "../controller/training-controller.js";

const router = express.Router();

router.get("/tasks/:taskId/groups/:groupId/", getTrainingJobByGroup);

router.get("/results/:jobId/", getTrainingResult);

export default router;
