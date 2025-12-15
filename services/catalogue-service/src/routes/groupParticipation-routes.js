import express from "express";
import {
  createGroupParticipation,
  deleteGroupParticipation,
  getGroupParticipations,
  downloadGroupEnrollmentTemplate,
  downloadIndividualGroupEnrollmentTemplate,
} from "../controller/groupParticipation-controller.js";
import { verifyAccessToken, verifyIsAdmin } from "../middleware/basic-access-control.js";
import { verifyGroupAdmin } from "../middleware/group-access-control.js";
import { verifyGroupParticipationAdmin } from "../middleware/groupParticipation-access-control.js";

const router = express.Router();

router.get("/", verifyAccessToken, verifyIsAdmin, getGroupParticipations);

router.get("/template", verifyAccessToken, downloadGroupEnrollmentTemplate);

router.get("/individual-template", verifyAccessToken, downloadIndividualGroupEnrollmentTemplate);

router.post("/:groupId", verifyAccessToken, verifyGroupAdmin, createGroupParticipation);

router.delete("/:groupParticipationId", verifyAccessToken, verifyGroupParticipationAdmin, deleteGroupParticipation);

export default router;
