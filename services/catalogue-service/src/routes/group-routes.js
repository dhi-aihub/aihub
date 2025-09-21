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
} from "../controller/group-controller.js";

const router = express.Router();

router.get("/", getAllGroups);

router.get("/groupSet/:groupSetId", getGroupsByGroupSetId);

router.get("/:id", getGroupById);

router.post("/", createGroup);

router.post("/bulk/:groupSetId", createGroupsBulk);

router.put("/:id", updateGroup);

router.put("/bulk/:groupSetId", updateGroupsBulk);

router.delete("/:id", deleteGroup);

router.get("/user/:userId/course/:courseId", getUserGroupInCourse);

export default router;
