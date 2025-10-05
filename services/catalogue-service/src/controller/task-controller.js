import FormData from "form-data";
import Task from "../models/task-model.js";
import Group from "../models/group-model.js";
import GroupParticipation from "../models/groupParticipation-model.js";
import { fileService, schedulerService } from "../lib/api.js";
import upload from "../middleware/file-upload.js";

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

export const taskFilesUploadMulter = upload.fields([
  { name: "graderFile", maxCount: 1 },
  { name: "templateFile", maxCount: 1 },
  { name: "trainerFile", maxCount: 1 },
  { name: "trainingTemplateFile", maxCount: 1 },
]);

export async function createTask(req, res) {
  try {
    const taskData = JSON.parse(req.body.taskData);
    const graderFile = req.files["graderFile"]?.[0];
    const templateFile = req.files["templateFile"]?.[0];
    const trainerFile = req.files["trainerFile"]?.[0];
    const trainingTemplateFile = req.files["trainingTemplateFile"]?.[0];

    if (!taskData || !graderFile || !templateFile || !trainerFile || !trainingTemplateFile) {
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

    // upload trainer file to file service
    const trainerFormData = new FormData();
    trainerFormData.append("file", trainerFile.buffer, {
      filename: trainerFile.originalname,
      contentType: trainerFile.mimetype,
    });
    await fileService.post(`/taskAsset/${task.id}/trainer/`, trainerFormData);

    // upload training template file to file service
    const trainingTemplateFormData = new FormData();
    trainingTemplateFormData.append("file", trainingTemplateFile.buffer, {
      filename: trainingTemplateFile.originalname,
      contentType: trainingTemplateFile.mimetype,
    });
    await fileService.post(`/taskAsset/${task.id}/training-template/`, trainingTemplateFormData);

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
    const trainerFile = req.files["trainerFile"]?.[0];
    const trainingTemplateFile = req.files["trainingTemplateFile"]?.[0];

    if (!taskData) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    // Don't allow changing groupSetId
    if (taskData.groupSetId && taskData.groupSetId !== task.groupSetId) {
      return res.status(400).json({ message: "Cannot change groupSetId of a task" });
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

    if (trainerFile) {
      const trainerFormData = new FormData();
      trainerFormData.append("file", trainerFile.buffer, {
        filename: trainerFile.originalname,
        contentType: trainerFile.mimetype,
      });
      await fileService.post(`/taskAsset/${task.id}/trainer/`, trainerFormData);
    }

    if (trainingTemplateFile) {
      const trainingTemplateFormData = new FormData();
      trainingTemplateFormData.append("file", trainingTemplateFile.buffer, {
        filename: trainingTemplateFile.originalname,
        contentType: trainingTemplateFile.mimetype,
      });
      await fileService.post(`/taskAsset/${task.id}/training-template/`, trainingTemplateFormData);
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
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
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

    if (!groupId) {
      return res.status(403).json({ message: "User is not part of any group for this task" });
    }

    const formData = new FormData();
    formData.append("taskId", req.params.taskId);
    formData.append("groupId", groupId);
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    formData.append("description", req.body.description);

    const fileResponse = await fileService.post("/submission/", formData);
    if (fileResponse.status !== 201) {
      throw new Error("Failed to submit file");
    }

    // create job in scheduler
    const jobData = {
      task_id: req.params.taskId,
      submission_id: fileResponse.data.id,
      group_id: groupId,
      run_time_limit: task.runtimeLimit,
      ram_limit: task.ramLimit,
      vram_limit: task.vramLimit,
    };

    const jobResponse = await schedulerService.post("/api/jobs/", jobData);
    if (jobResponse.status !== 201) {
      throw new Error("Failed to create job in scheduler");
    }

    res.status(201).json({ message: "Submission successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const trainingSubmissionUploadMulter = upload.single("file");

export async function submitTrainingAgent(req, res) {
  try {
    const task = await Task.findByPk(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
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

    if (!groupId) {
      return res.status(403).json({ message: "User is not part of any group for this task" });
    }

    const formData = new FormData();
    formData.append("taskId", req.params.taskId);
    formData.append("groupId", groupId);
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    // formData.append("description", req.body.description);

    const fileResponse = await fileService.post("/submission/training/", formData);
    if (fileResponse.status !== 201) {
      throw new Error("Failed to submit training agent");
    }

    // create job in scheduler
    const jobData = {
      task_id: req.params.taskId,
      agent_id: fileResponse.data.id,
      group_id: groupId,
    };

    const jobResponse = await schedulerService.post("/api/training_jobs/", jobData);
    if (jobResponse.status !== 201) {
      throw new Error("Failed to create job in scheduler");
    }

    res.status(201).json({ message: "Submission successful" });
  } catch (error) {
    console.error("Error in submitTask:", error);
    res.status(500).json({ message: error.message });
  }
}

export async function downloadTemplateFile(req, res) {
  try {
    const taskId = req.params.taskId;
    const task = await Task.findByPk(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const fileResponse = await fileService.get(`/taskAsset/${taskId}/template/download`, {
      responseType: "stream",
    });

    if (fileResponse.status !== 200) {
      return res.status(404).json({ message: "Template file not found" });
    }

    // Set appropriate headers
    res.setHeader(
      "Content-Type",
      fileResponse.headers["content-type"] || "application/octet-stream",
    );
    res.setHeader(
      "Content-Disposition",
      fileResponse.headers["content-disposition"] || "attachment",
    );

    // Pipe file stream to response
    fileResponse.data.pipe(res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function downloadTrainerTemplateFile(req, res) {
  try {
    const taskId = req.params.taskId;
    const task = await Task.findByPk(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const fileResponse = await fileService.get(`/taskAsset/${taskId}/training-template/download`, {
      responseType: "stream",
    });

    if (fileResponse.status !== 200) {
      return res.status(404).json({ message: "Training template file not found" });
    }

    // Set appropriate headers
    res.setHeader(
      "Content-Type",
      fileResponse.headers["content-type"] || "application/octet-stream",
    );
    res.setHeader(
      "Content-Disposition",
      fileResponse.headers["content-disposition"] || "attachment",
    );

    // Pipe file stream to response
    fileResponse.data.pipe(res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function downloadTrainingOutputFile(req, res) {
  try {
    const fileId = req.params.fileId;
    const fileResponse = await fileService.get(`/trainingOutput/${fileId}/`, {
      responseType: "stream",
    });

    if (fileResponse.status !== 200) {
      return res.status(404).json({ message: "Training output file not found" });
    }

    // Set appropriate headers
    res.setHeader(
      "Content-Type",
      fileResponse.headers["content-type"] || "application/octet-stream",
    );
    res.setHeader(
      "Content-Disposition",
      fileResponse.headers["content-disposition"] || "attachment",
    );

    // Pipe file stream to response
    fileResponse.data.pipe(res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
