import Task from "../models/task-model.js";
import CourseParticipation from "../models/courseParticipation-model.js";

export async function verifyTaskAccess(req, res, next) {
  if (req.user.isAdmin) {
    return next();
  }
  const userId = req.user.id;
  const taskId = req.params.taskId || req.body.taskId;
  const courseId = await Task.getCourseIdByTaskId(taskId);
  if (!courseId) {
    return res.status(404).json({ message: "Task not found" });
  }
  const isParticipant = await CourseParticipation.findOne({
    where: {
      userId,
      courseId,
    },
  });
  if (!isParticipant) {
    return res.status(403).json({ message: "Access denied to this task" });
  }
  next();
}

export async function verifyTaskAdmin(req, res, next) {
  if (req.user.isAdmin) {
    return next();
  }
  const userId = req.user.id;
  const taskId = req.params.taskId || req.body.taskId;
  const courseId = await Task.getCourseIdByTaskId(taskId);
  if (!courseId) {
    return res.status(404).json({ message: "Task not found" });
  }
  const isAdmin = await CourseParticipation.isCourseAdmin(userId, courseId);
  if (!isAdmin) {
    return res.status(403).json({ message: "Not authorized to access this resource" });
  }
  next();
}