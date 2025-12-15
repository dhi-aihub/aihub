import express from "express";

import {
  createGroup,
  createGroupsBulk,
  deleteGroup,
  updateGroup,
  updateGroupsBulk,
  getAllGroups,
  getGroupById,
  getGroupsByGroupSetId,
  getUserGroupInCourse,
  getUserGroupForTask,
} from "../controller/group-controller.js";
import { verifyAccessToken, verifyIsAdmin } from "../middleware/basic-access-control.js";
import { verifyGroupAccess, verifyGroupAdmin } from "../middleware/group-access-control.js";
import { verifyGroupSetAccess, verifyGroupSetAdmin } from "../middleware/groupSet-access-control.js";

const router = express.Router();

router.get("/", verifyAccessToken, verifyIsAdmin, getAllGroups);

router.get("/groupSet/:groupSetId", verifyAccessToken, verifyGroupSetAccess, getGroupsByGroupSetId);

router.get("/:groupId", verifyAccessToken, verifyGroupAccess, getGroupById);

router.get("/user/:userId/course/:courseId", verifyAccessToken, getUserGroupInCourse);

router.get("/user/:userId/task/:taskId", verifyAccessToken, getUserGroupForTask);

router.post("/", verifyAccessToken, verifyGroupSetAdmin, createGroup);

router.post("/bulk/:groupSetId", verifyAccessToken, verifyGroupSetAdmin, createGroupsBulk);

router.put("/:groupId", verifyAccessToken, verifyGroupAdmin, updateGroup);

router.put("/bulk/:groupSetId", verifyAccessToken, verifyGroupSetAdmin, updateGroupsBulk);

router.delete("/:groupId", verifyAccessToken, verifyGroupAdmin, deleteGroup);

export default router;
