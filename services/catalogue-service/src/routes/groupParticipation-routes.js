import express from "express";
import { createGroupParticipation, deleteGroupParticipation, getGroupParticipations } from "../controller/groupParticipation-controller.js";

const router = express.Router();

router.get("/", getGroupParticipations);

router.post("/:groupId", createGroupParticipation);

router.delete("/:groupParticipationId", deleteGroupParticipation);

export default router;
