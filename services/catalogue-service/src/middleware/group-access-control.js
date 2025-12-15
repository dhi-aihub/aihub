import Group from "../models/group-model.js";
import GroupSet from "../models/groupSet-model.js";
import CourseParticipation from "../models/courseParticipation-model.js";
import GroupParticipation from "../models/groupParticipation-model.js";

export async function verifyGroupAccess(req, res, next) {
  if (req.user.isAdmin) {
    return next();
  }
  const groupId = req.params.groupId;
  const userId = req.user.id;
  const groupSetId = await Group.getGroupSetIdByGroupId(groupId);
  if (!groupSetId) {
    return res.status(404).json({ message: "Group not found" });
  }
  const courseId = await GroupSet.getCourseIdByGroupSetId(groupSetId);
  if (!courseId) {
    return res.status(404).json({ message: "GroupSet not found" });
  }
  const isParticipant = await CourseParticipation.isCourseParticipant(
    userId,
    courseId,
  );
  if (!isParticipant) {
    return res.status(403).json({ message: "Access denied: User is not a participant in the course." });
  }
  next();
}

export async function verifyGroupAdmin(req, res, next) {
  if (req.user.isAdmin) {
    return next();
  }

  const groupId = req.params.groupId;
  const userId = req.user.id;
  const groupSetId = await Group.getGroupSetIdByGroupId(groupId);
  if (!groupSetId) {
    return res.status(404).json({ message: "Group not found" });
  }
  const courseId = await GroupSet.getCourseIdByGroupSetId(groupSetId);
  if (!courseId) {
    return res.status(404).json({ message: "GroupSet not found" });
  }
  const isAdmin = await CourseParticipation.isCourseAdmin(
    userId,
    courseId,
  );
  if (!isAdmin) {
    return res.status(403).json({ message: "Access denied: User is not an admin in the course." });
  }
  next();
}

export async function verifyGroupParticipant(req, res, next) {
  if (req.user.isAdmin) {
    return next();
  }

  const groupId = req.params.groupId;
  const userId = req.user.id;
  const isParticipant = await GroupParticipation.isGroupParticipant(
    userId,
    groupId,
  );
  if (!isParticipant) {
    return res.status(403).json({ message: "Access denied: User is not a participant in the group." });
  }
  next();
}

export async function verifyGroupAdminOrParticipant(req, res, next) {
  if (req.user.isAdmin) {
    return next();
  }
  const groupId = req.params.groupId;
  const userId = req.user.id;
  const groupSetId = await Group.getGroupSetIdByGroupId(groupId);
  if (!groupSetId) {
    return res.status(404).json({ message: "Group not found" });
  }
  const courseId = await GroupSet.getCourseIdByGroupSetId(groupSetId);
  if (!courseId) {
    return res.status(404).json({ message: "GroupSet not found" });
  }
  const isAdmin = await CourseParticipation.isCourseAdmin(
    userId,
    courseId,
  );
  if (isAdmin) {
    return next();
  }
  const isParticipant = await GroupParticipation.isGroupParticipant(
    userId,
    groupId,
  );
  if (!isParticipant) {
    return res.status(403).json({ message: "Access denied: User is neither an admin in the course nor a participant in the group." });
  }
  next();
}