import { Request, Response } from "express";
import multer from "multer";

import { TaskAsset, TaskAssetAttrs } from "../models/TaskAsset";
import { cuid } from "../lib/ids";
import { sha256 } from "../lib/hash";

// Memory upload (files are stored in DB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 }, // TODO: Set maximum file size
});

export const graderUploadMulter = upload.single("file");
export const templateUploadMulter = upload.single("file");

/**
 * Internal helper to upsert a TaskAsset (one per taskId+type).
 */
async function upsertTaskAsset(
  data: Omit<TaskAssetAttrs, "id" | "uploadedAt">
) {
  const [row, created] = await TaskAsset.findOrCreate({
    where: { taskId: data.taskId, type: data.type },
    defaults: { id: cuid(), ...data },
  });

  if (!created) {
    row.filename = data.filename;
    row.mimetype = data.mimetype;
    row.sizeBytes = data.sizeBytes;
    row.content = data.content;
    row.checksumSha256 = data.checksumSha256;
    row.uploadedAt = new Date();
    await row.save();
  }

  return row;
}

/**
 * Upload a grader asset
 * POST /api/v1/tasks/:taskId/grader
 * multipart/form-data: file=<file>
 */
export async function uploadGrader(req: Request, res: Response) {
  const { taskId } = req.params;
  const file = (req as any).file as Express.Multer.File | undefined;

  if (!taskId || !file) {
    return res.status(400).json({ error: "Missing taskId/file" });
  }

  // delete the previous file if it exists
  const existing = await TaskAsset.findOne({ where: { taskId, type: "GRADER" } });
  if (existing) {
    await existing.destroy();
  }

  const checksum = sha256(file.buffer);
  const saved = await upsertTaskAsset({
    taskId,
    type: "GRADER",
    filename: file.originalname,
    mimetype: file.mimetype || "application/zip",
    sizeBytes: file.size,
    content: file.buffer,
    checksumSha256: checksum,
  });

  return res.status(201).json({
    id: saved.id,
    taskId: saved.taskId,
    type: saved.type,
    filename: saved.filename,
    checksum: saved.checksumSha256,
    uploadedAt: saved.uploadedAt,
  });
}

/**
 * Upload a template asset
 * POST /api/v1/tasks/:taskId/template
 * multipart/form-data: file=<file>
 */
export async function uploadTemplate(req: Request, res: Response) {
  const { taskId } = req.params;
  const file = (req as any).file as Express.Multer.File | undefined;

  if (!taskId || !file) {
    return res.status(400).json({ error: "Missing taskId/file" });
  }

  // delete the previous file if it exists
  const existing = await TaskAsset.findOne({ where: { taskId, type: "TEMPLATE" } });
  if (existing) {
    await existing.destroy();
  }

  const checksum = sha256(file.buffer);
  const saved = await upsertTaskAsset({
    taskId,
    type: "TEMPLATE",
    filename: file.originalname,
    mimetype: file.mimetype || "application/octet-stream",
    sizeBytes: file.size,
    content: file.buffer,
    checksumSha256: checksum,
  });

  return res.status(201).json({
    id: saved.id,
    taskId: saved.taskId,
    type: saved.type,
    filename: saved.filename,
    checksum: saved.checksumSha256,
    uploadedAt: saved.uploadedAt,
  });
}

/**
 * Download the grader asset
 * GET /api/v1/tasks/:taskId/grader/download
 */
export async function downloadGrader(req: Request, res: Response) {
  const { taskId } = req.params;
  const asset = await TaskAsset.findOne({ where: { taskId, type: "GRADER" } });

  if (!asset) {
    return res.status(404).json({ error: "Grader not found" });
  }

  res.setHeader("Content-Type", asset.mimetype);
  res.setHeader("Content-Length", asset.sizeBytes.toString());
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${asset.filename}"`
  );

  return res.send(Buffer.from(asset.content));
}

/**
 * Download the template asset
 * GET /api/v1/tasks/:taskId/template/download
 */
export async function downloadTemplate(req: Request, res: Response) {
  const { taskId } = req.params;
  const asset = await TaskAsset.findOne({
    where: { taskId, type: "TEMPLATE" },
  });

  if (!asset) {
    return res.status(404).json({ error: "Template not found" });
  }

  res.setHeader("Content-Type", asset.mimetype);
  res.setHeader("Content-Length", asset.sizeBytes.toString());
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${asset.filename}"`
  );

  return res.send(Buffer.from(asset.content));
}
