import express from "express";

import {
    createGroup,
    deleteGroup,
    updateGroup,
    getAllGroups,
    getGroupById,
} from "../controller/group-controller.js";

const router = express.Router();

router.get("/", getAllGroups);

router.get("/:id", getGroupById);

router.post("/", createGroup);

router.put("/:id", updateGroup);

router.delete("/:id", deleteGroup);

export default router;