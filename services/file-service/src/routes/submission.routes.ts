import { Router } from "express";
import {
  submissionUploadMulter,
  trainingSubmissionUploadMulter,
  createSubmission,
  listSubmissions,
  createTrainingSubmission,
  downloadSubmission,
} from "../controllers/submission.controller";

const router = Router();

router.get("/", listSubmissions);
router.post("/", submissionUploadMulter, createSubmission);
router.post(
  "/training",
  trainingSubmissionUploadMulter,
  createTrainingSubmission
);
router.get("/:id/download", downloadSubmission);
// router.get("/:id/rerun", rerunSubmission);

export default router;
