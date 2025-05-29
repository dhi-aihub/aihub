import express from "express";

import {
    createGroup,
    createGroupsBulk,
    deleteGroup,
    updateGroup,
    getAllGroups,
    getGroupById,
    getGroupsByGroupSetId
} from "../controller/group-controller.js";

const router = express.Router();

router.get("/", getAllGroups);

router.get("/groupSet/:groupSetId", getGroupsByGroupSetId);

router.get("/:id", getGroupById);

router.post("/", createGroup);

router.post("/bulk/:groupSetId", createGroupsBulk);

router.put("/:id", updateGroup);

router.delete("/:id", deleteGroup);

export default router;