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

router.get("/submissions", listSubmissions);
router.post("/submissions", submissionUploadMulter, createSubmission);
router.get("/submissions/:id/download", downloadSubmission);
router.get("/submissions/:id/mark_for_grading", markForGrading);
router.get("/submissions/:id/rerun", rerunSubmission);

export default router;
