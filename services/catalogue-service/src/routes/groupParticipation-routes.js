import express from "express";
import { getGroupParticipations } from "../controller/groupParticipation-controller.js";

const router = express.Router();

router.get("/", getGroupParticipations);

export default router;
