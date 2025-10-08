import { Request, Response } from 'express';
import { TrainingResult } from '../models/TrainingResult';

/**
 * Create or update a training result.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The created or updated training result.
 */
export async function createOrUpdateTrainingResult(req: Request, res: Response) {
  const {
    trainingJobId,
    status,
    details = null,
    error = null,
    outputUri = null,
  } = req.body;

  try {
    const [row, created] = await TrainingResult.findOrCreate({
      where: { trainingJobId },
      defaults: {
        trainingJobId,
        status,
        details,
        error,
        outputUri,
      },
    });

    if (!created) {
      // If the record was found, update it
      await row.update({
        status,
        details,
        error,
        outputUri,
      });
    }

    return res.status(200).json(row);
  } catch (e) {
    console.error("Error creating or updating training result:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Get a training result by trainingJobId.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The training result if found, otherwise a 404 error.
 */
export async function getTrainingResult(req: Request, res: Response) {
  const { trainingJobId } = req.params;

  try {
    const result = await TrainingResult.findOne({ where: { trainingJobId } });

    if (!result) {
      return res.status(404).json({ error: "Training result not found" });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching training result:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getAllTrainingResults(req: Request, res: Response) {
  try {
    const results = await TrainingResult.findAll();
    return res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching training results:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

