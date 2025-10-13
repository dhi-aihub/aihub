import { Router } from "express";
import {
  createStudentSelection,
  getStudentSelection,
  getStudentSelectionsByTaskId,
  updateStudentSelection,
} from "../controllers/student-selection.controller";

const router = Router();

router.post("/", createStudentSelection);
router.get("/task/:taskId", getStudentSelectionsByTaskId);
router.get("/task/:taskId/group/:groupId", getStudentSelection);
router.patch("/task/:taskId/group/:groupId", updateStudentSelection);

export default router;
