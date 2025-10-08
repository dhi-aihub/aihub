import express from "express";
import {
  createGroupParticipation,
  deleteGroupParticipation,
  getGroupParticipations,
  downloadGroupEnrollmentTemplate,
  downloadIndividualGroupEnrollmentTemplate,
} from "../controller/groupParticipation-controller.js";
import { verifyAccessToken } from "../middleware/basic-access-control.js";

const router = express.Router();

router.get("/", getGroupParticipations);

router.get("/template", verifyAccessToken, downloadGroupEnrollmentTemplate);

router.get("/individual-template", verifyAccessToken, downloadIndividualGroupEnrollmentTemplate);

router.post("/:groupId", verifyAccessToken, createGroupParticipation);

router.delete("/:groupParticipationId", verifyAccessToken, deleteGroupParticipation);

export default router;
