import FormData from "form-data";
import Task from "../models/task-model.js";
import { fileService, schedulerService } from "../lib/api.js";
import upload from "../middleware/file-upload.js";

export const taskFilesUploadMulter = upload.fields([
  { name: "graderFile", maxCount: 1 },
  { name: "templateFile", maxCount: 1 },
]);

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
    const taskData = JSON.parse(req.body.taskData);
    const graderFile = req.files["graderFile"]?.[0];
    const templateFile = req.files["templateFile"]?.[0];

    if (!taskData || !graderFile || !templateFile) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const task = await Task.create(taskData);

    // upload grader file to file service
    const graderFormData = new FormData();
    graderFormData.append("file", graderFile.buffer, {
      filename: graderFile.originalname,
      contentType: graderFile.mimetype,
    });
    await fileService.post(`/taskAsset/${task.id}/grader/`, graderFormData);

    // upload template file to file service
    const templateFormData = new FormData();
    templateFormData.append("file", templateFile.buffer, {
      filename: templateFile.originalname,
      contentType: templateFile.mimetype,
    });
    await fileService.post(`/taskAsset/${task.id}/template/`, templateFormData);

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

export const submissionUploadMulter = upload.single("file");

export async function submitTask(req, res) {
  try {
    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await fileService.post("/submissions", formData);

    if (response.status !== 201) {
      throw new Error("Failed to submit task");
    }

    // create job in scheduler
    const jobData = {
      task_id: req.params.taskId,
      submission_id: response.data.id,
      group_id: req.groupId,
    };

    await schedulerService.post("/jobs", jobData);

    res.status(201).json({ message: "Submission successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
