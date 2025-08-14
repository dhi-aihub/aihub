import { Router } from "express";
import {
  submissionUploadMulter,
  createSubmission,
  listSubmissions,
  downloadSubmission,
  markForGrading,
  rerunSubmission,
} from "../controllers/submission.controller";

const router = Router();

router.get("/", listSubmissions);
router.post("/", submissionUploadMulter, createSubmission);
router.get("/:id/download", downloadSubmission);
router.get("/:id/mark_for_grading", markForGrading);
router.get("/:id/rerun", rerunSubmission);

export default router;
