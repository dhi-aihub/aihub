import GroupSet from "../models/groupSet-model.js";
import CourseParticipation from "../models/courseParticipation-model.js";

export async function verifyGroupSetAccess(req, res, next) {
  if (req.user.isAdmin) {
    return next();
  }

  // check if user is a participant in the group set's course
  const groupSetId = req.params.groupSetId || req.body.groupSetId;
  const userId = req.user.id;
  const courseId = await GroupSet.getCourseIdByGroupSetId(groupSetId);

  if (!courseId) {
    return res.status(404).json({ message: "Group set not found." });
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

export async function verifyGroupSetAdmin(req, res, next) {
  if (req.user.isAdmin) {
    return next();
  }

  // check if user is an admin in the group set's course
  const groupSetId = req.params.groupSetId || req.body.groupSetId;
  const userId = req.user.id;
  const courseId = await GroupSet.getCourseIdByGroupSetId(groupSetId);

  if (!courseId) {
    return res.status(404).json({ message: "Group set not found." });
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
