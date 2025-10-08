import { Request, Response } from "express";
import multer from "multer";

import { TrainingOutput, TrainingOutputAttrs } from "../models/TrainingOutput";
import { cuid } from "../lib/ids";
import { sha256 } from "../lib/hash";

// Memory upload (files are stored in DB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 }, // TODO: Set maximum file size
});

export const trainingOutputUploadMulter = upload.single("file");

/**
 * Upload a training output file
 * POST /api/v1/tasks/:taskId/training-output
 * multipart/form-data: file=<file>
 */
export async function uploadTrainingOutput(req: Request, res: Response) {
  const { taskId } = req.params;
  const file = (req as any).file as Express.Multer.File | undefined;

  if (!taskId || !file) {
    return res.status(400).json({ error: "Missing taskId/file" });
  }

  const id = cuid();
  const checksumSha256 = await sha256(file.buffer);

  const trainingOutput: TrainingOutputAttrs = {
    id,
    taskId,
    filename: file.originalname,
    mimetype: file.mimetype,
    sizeBytes: file.size,
    content: file.buffer,
    checksumSha256,
  };

  await TrainingOutput.create(trainingOutput);

  res.status(201).json({ id });
}

/**
 * Download a training output file
 * GET /api/v1/tasks/:taskId/training-output/:id
 */
export async function downloadTrainingOutput(req: Request, res: Response) {
  const { id } = req.params;
  const trainingOutput = await TrainingOutput.findByPk(id);

  if (!trainingOutput) {
    return res.status(404).json({ error: "Not found" });
  }

  res.setHeader("Content-Type", trainingOutput.mimetype);
  res.setHeader("Content-Disposition", `attachment; filename="${trainingOutput.filename}"`);
  res.setHeader("Content-Length", trainingOutput.sizeBytes.toString());
  
  return res.send(Buffer.from(trainingOutput.content));
}