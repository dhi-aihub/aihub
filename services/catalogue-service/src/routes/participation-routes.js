import express from "express";

import {
    createParticipation,
    deleteParticipation,
} from "../controller/participation-controller.js";

const router = express.Router();

router.post("/", createParticipation);

router.delete("/:userId/:courseId", deleteParticipation);

export default router;