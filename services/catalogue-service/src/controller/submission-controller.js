import { fileService, resultService, schedulerService } from "../lib/api.js";

export async function getSubmissionsByTask(req, res) {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({ message: "Task ID is required" });
    }

    const response = await schedulerService.get(`/api/jobs/?task_id=${taskId}`);
    res.status(200).json({
      message: "Submissions retrieved successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("Error fetching submissions by task:", error);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || error.message || "Failed to retrieve submissions",
    });
  }
}

export async function getSubmissionByGroup(req, res) {
  try {
    const { taskId, groupId } = req.params;

    if (!taskId || !groupId) {
      return res.status(400).json({ message: "Task ID and Group ID are required" });
    }

    const response = await schedulerService.get(`/api/jobs/?task_id=${taskId}&group_id=${groupId}`);
    res.status(200).json({
      message: "Submissions retrieved successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("Error fetching submissions by group:", error);

    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || error.message || "Failed to retrieve submissions",
    });
  }
}

export async function getResultsByTask(req, res) {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({ message: "Task ID is required" });
    }

    const response = await resultService.get(`/results/results?taskId=${taskId}`);
    res.status(200).json({
      message: "Results retrieved successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("Error fetching results by task:", error);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || error.message || "Failed to retrieve results",
    });
  }
}

export async function getResultsByGroup(req, res) {
  try {
    const { taskId, groupId } = req.params;
    if (!taskId || !groupId) {
      return res.status(400).json({ message: "Task ID and Group ID are required" });
    }

    const response = await resultService.get(
      `/results/results?taskId=${taskId}&groupId=${groupId}`,
    );
    res.status(200).json({
      message: "Results retrieved successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("Error fetching results by group:", error);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || error.message || "Failed to retrieve results",
    });
  }
}

export async function getStudentSelectionByTask(req, res) {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({ message: "Task ID is required" });
    }

    const response = await resultService.get(`/selections/task/${taskId}`);

    res.status(200).json({
      message: "Student selection retrieved successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("Error fetching student selection by task:", error);

    res.status(error.response?.status || 500).json({
      message:
        error.response?.data?.message || error.message || "Failed to retrieve student selection",
    });
  }
}

export async function getStudentSelectionByGroup(req, res) {
  try {
    const { taskId, groupId } = req.params;

    if (!taskId || !groupId) {
      return res.status(400).json({ message: "Task ID and Group ID are required" });
    }

    const response = await resultService.get(`/selections/task/${taskId}/group/${groupId}`);

    res.status(200).json({
      message: "Student selection retrieved successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("Error fetching student selection by group:", error);

    res.status(error.response?.status || 500).json({
      message:
        error.response?.data?.message || error.message || "Failed to retrieve student selection",
    });
  }
}

export async function updateStudentSelection(req, res) {
  try {
    const { taskId, groupId } = req.params;
    const { resultId } = req.body;

    if (!taskId || !groupId || !resultId) {
      return res.status(400).json({ message: "Task ID, Group ID, and Result ID are required" });
    }

    const response = await resultService.patch(`/selections/task/${taskId}/group/${groupId}`, {
      resultId,
    });

    res.status(200).json({
      message: "Student selection updated successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("Error updating student selection:", error);

    res.status(error.response?.status || 500).json({
      message:
        error.response?.data?.message || error.message || "Failed to update student selection",
    });
  }
}

export async function downloadSubmissionsBatch(req, res) {
  try {
    const submissionRequests = req.body;

    if (!Array.isArray(submissionRequests) || submissionRequests.length === 0) {
      return res.status(400).json({
        message: "Missing or invalid submission requests array",
      });
    }

    const response = await fileService.post("/submission/download-batch", submissionRequests, {
      responseType: "stream",
      headers: {
        "Content-Type": "application/json",
      },
    });

    res.setHeader("Content-Type", response.headers["content-type"] || "application/zip");
    res.setHeader(
      "Content-Disposition",
      response.headers["content-disposition"] || 'attachment; filename="submissions.zip"',
    );

    // Pipe the stream directly to the response
    response.data.pipe(res);
  } catch (error) {
    console.error("Error downloading submissions batch:", error);

    if (error.response?.status === 404) {
      return res.status(404).json({
        message: "No submissions found for the provided IDs",
      });
    }

    res.status(error.response?.status || 500).json({
      message:
        error.response?.data?.message || error.message || "Failed to download submissions batch",
    });
  }
}
