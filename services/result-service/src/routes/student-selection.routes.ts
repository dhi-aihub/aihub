import { Router } from "express";
import {
  createOrUpdateStudentSelection,
  getStudentSelection,
  getStudentSelectionsByTaskId,
} from "../controllers/student-selection.controller";

const router = Router();

router.post("/", createOrUpdateStudentSelection);
router.get("/task/:taskId", getStudentSelectionsByTaskId);
router.get("/task/:taskId/group/:groupId", getStudentSelection);

export default router;
