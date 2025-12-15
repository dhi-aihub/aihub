import express from "express";
import {
  getTrainingJobByGroup,
  getTrainingResult,
} from "../controller/training-controller.js";
import { verifyAccessToken } from "../middleware/basic-access-control.js";
import { verifyGroupAdminOrParticipant } from "../middleware/group-access-control.js";

const router = express.Router();

router.get("/tasks/:taskId/groups/:groupId/", verifyAccessToken, verifyGroupAdminOrParticipant, getTrainingJobByGroup);

router.get("/results/:jobId/", getTrainingResult); // todo: add access control

export default router;
