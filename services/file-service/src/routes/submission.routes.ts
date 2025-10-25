import { Router } from "express";
import {
  submissionUploadMulter,
  trainingSubmissionUploadMulter,
  createSubmission,
  listSubmissions,
  createTrainingSubmission,
  downloadSubmission,
  downloadSubmissionsBatch,
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
router.post("/download-batch", downloadSubmissionsBatch);

export default router;
