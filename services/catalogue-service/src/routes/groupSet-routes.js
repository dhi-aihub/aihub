import express from "express";
import {
  createGroupSet,
  deleteGroupSet,
  updateGroupSet,
  getAllGroupSets,
  getGroupSetById,
  getGroupSetGroups,
} from "../controller/groupSet-controller.js";

const router = express.Router();

router.get("/", getAllGroupSets);

router.get("/:id", getGroupSetById);

router.post("/", createGroupSet);

router.put("/:id", updateGroupSet);

router.delete("/:id", deleteGroupSet);

router.get("/:id/groups", getGroupSetGroups);

export default router;
