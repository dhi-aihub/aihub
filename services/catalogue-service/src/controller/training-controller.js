import { schedulerService, resultService } from "../lib/api.js";

export async function getTrainingJobByGroup(req, res) {
    try {
        const { taskId, groupId } = req.params;

        if (!taskId || !groupId) {
            return res.status(400).json({ message: "Task ID and Group ID are required" });
        }

        const response = await schedulerService.get(`/api/training_jobs/?task_id=${taskId}&group_id=${groupId}`);
        res.status(200).json({
            message: "Training jobs retrieved successfully",
            data: response.data,
        });
    } catch (error) {
        console.error("Error fetching training jobs by group:", error);
        res.status(error.response?.status || 500).json({
            message: error.response?.data?.message || error.message || "Failed to retrieve training jobs",
        });
    }
}

export async function getTrainingResult(req, res) {
    try {
        const { jobId } = req.params;

        if (!jobId) {
            return res.status(400).json({ message: "Job ID is required" });
        }

        const response = await resultService.get(`/training-results/${jobId}/`);
        res.status(200).json({
            message: "Training results retrieved successfully",
            data: response.data,
        });
    } catch (error) {
        console.error("Error fetching training results:", error);
        res.status(error.response?.status || 500).json({
            message: error.response?.data?.message || error.message || "Failed to retrieve training results",
        });
    }
}

