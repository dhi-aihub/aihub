import express from "express";
import {
  createGroupSet,
  deleteGroupSet,
  updateGroupSet,
  getAllGroupSets,
  getGroupSetById,
  getGroupSetGroups,
} from "../controller/groupSet-controller.js";
import { verifyAccessToken, verifyIsAdmin, verifyIsCourseAdmin } from "../middleware/basic-access-control.js";
import { verifyGroupSetAdmin, verifyGroupSetAccess } from "../middleware/groupSet-access-control.js";

const router = express.Router();

router.get("/", verifyAccessToken, verifyIsAdmin, getAllGroupSets);

router.get("/:groupSetId", verifyAccessToken, verifyGroupSetAccess, getGroupSetById);

router.post("/", verifyAccessToken, verifyIsCourseAdmin, createGroupSet);

router.put("/:groupSetId", verifyAccessToken, verifyGroupSetAdmin, updateGroupSet);

router.delete("/:groupSetId", verifyAccessToken, verifyGroupSetAdmin, deleteGroupSet);

router.get("/:groupSetId/groups", verifyAccessToken, verifyGroupSetAccess, getGroupSetGroups);

export default router;
