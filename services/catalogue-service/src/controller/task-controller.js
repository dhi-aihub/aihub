import FormData from "form-data";
import Task from "../models/task-model.js";
import Group from "../models/group-model.js";
import GroupParticipation from "../models/groupParticipation-model.js";
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
    const taskData = JSON.parse(req.body.taskData);
    const graderFile = req.files["graderFile"]?.[0];
    const templateFile = req.files["templateFile"]?.[0];

    if (!taskData) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    task.update(taskData);

    if (graderFile) {
      const graderFormData = new FormData();
      graderFormData.append("file", graderFile.buffer, {
        filename: graderFile.originalname,
        contentType: graderFile.mimetype,
      });
      await fileService.post(`/taskAsset/${task.id}/grader/`, graderFormData);
    }

    if (templateFile) {
      const templateFormData = new FormData();
      templateFormData.append("file", templateFile.buffer, {
        filename: templateFile.originalname,
        contentType: templateFile.mimetype,
      });
      await fileService.post(`/taskAsset/${task.id}/template/`, templateFormData);
    }

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
    const task = await Task.findByPk(req.params.taskId);
    if (!task) throw new Error("Task not found");

    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    formData.append("description", req.body.description);

    console.log("Form data prepared, sending to file service");

    const response = await fileService.post("/submission/", formData);

    console.log("File uploaded, response:", response.data);

    if (response.status !== 201) {
      throw new Error("Failed to submit task");
    }

    // Find the groupId for the user in the groupSet associated with the task
    const userId = req.user.id;
    const groupSetId = task.groupSetId;
    const groupId = await Group.findOne({
      where: { groupSetId },
      include: [
        {
          model: GroupParticipation,
          where: { userId },
        },
      ],
    }).then(group => group?.id);

    console.log("User", userId, "is in group", groupId, "for group set", groupSetId);

    // create job in scheduler
    const jobData = {
      task_id: req.params.taskId,
      submission_id: response.data.id,
      group_id: groupId,
      run_time_limit: task.runtimeLimit,
      ram_limit: task.ramLimit,
      vram_limit: task.vramLimit,
    };

    console.log("Creating job with data:", jobData);
    await schedulerService.post("/api/jobs/", jobData);

    res.status(201).json({ message: "Submission successful" });
  } catch (error) {
    console.error("Error in submitTask:", error);
    res.status(500).json({ message: error.message });
  }
}
