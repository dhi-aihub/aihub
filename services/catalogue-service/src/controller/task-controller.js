import multer from "multer";
import Task from "../models/task-model.js";

// In-memory upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
});

export const taskFilesUploadMulter = upload.fields([
  { name: "graderFile", maxCount: 1 },
  { name: "templateFile", maxCount: 1 },
]);

// unused
export async function getAllTasks(req, res) {
  try {
    const tasks = await Task.findAll();
    res.status(200).json({ message: "All tasks", data: tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getTaskById(req, res) {
  try {
    const task = await Task.findByPk(req.params.id);
    res.status(200).json({ message: "Task found", data: task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function createTask(req, res) {
  try {
    // get task data
    const taskData = JSON.parse(req.body.taskData);

    // get files
    const graderFile = req.files["graderFile"]?.[0];
    const templateFile = req.files["templateFile"]?.[0];

    // create task
    const task = await Task.create(taskData);

    // upload files to file service

    res.status(201).json({ message: "Task created", data: task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateTask(req, res) {
  try {
    const task = await Task.findByPk(req.params.taskId);
    task.update(req.body);
    res.status(200).json({ message: "Task updated", data: task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function deleteTask(req, res) {
  try {
    const task = await Task.findByPk(req.params.taskId);
    task.destroy();
    res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
