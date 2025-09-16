import { Request, Response } from "express";
import multer from "multer";
import axios from "axios";
import { Submission } from "../models/Submission";
import { cuid } from "../lib/ids";
import { sha256 } from "../lib/hash";

// In-memory upload (DB-backed storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 }, // TODO: To set a maximum file size
});

export const submissionUploadMulter = upload.single("file");
export const trainingSubmissionUploadMulter = upload.single("file");

/**
 * Create a new evaluation submission
 * POST /api/v1/submissions
 * multipart/form-data: file=<file>, userId=<string>, taskId=<string>
 * optional: description, metadata
 */
export async function createSubmission(req: Request, res: Response) {
  const file = (req as any).file as Express.Multer.File | undefined;
  const { description, metadata } = req.body;

  if (!file) {
    return res.status(400).json({ error: "Missing file" });
  }

  const id = cuid();
  const checksum = sha256(file.buffer);

  const created = await Submission.create({
    id,
    taskId: req.body.taskId,
    groupId: req.body.groupId,
    type: "EVALUATION",
    description: description ?? null,
    filename: file.originalname,
    mimetype: file.mimetype,
    sizeBytes: file.size,
    content: file.buffer,
    checksumSha256: checksum,
    metadata: metadata ?? null,
  });

  return res.status(201).json({
    id: created.id,
  });
}

/**
 * List evaluation submissions
 * GET /api/v1/submissions
 * Optional filters: ?groupId=<id>&taskId=<id>&marked_for_grading=<true|false>&order=created_at:asc|desc
 */
export async function listSubmissions(req: Request, res: Response) {
  const {
    groupId,
    taskId,
    marked_for_grading,
    order,
  } = req.query as Record<string, string | undefined>;

  const where: any = {};

  where.type = "EVALUATION";

  if (groupId) {
    where.groupId = groupId;
  }

  if (taskId) {
    where.taskId = taskId;
  }

  if (typeof marked_for_grading === "string") {
    where.markedForGrading = marked_for_grading === "true";
  }

  const orderBy: [string, "ASC" | "DESC"][] =
    order && order.startsWith("created_at")
      ? [["createdAt", order.endsWith("desc") ? "DESC" : "ASC"]]
      : [["createdAt", "DESC"]];

  const rows = await Submission.findAll({
    where,
    order: orderBy,
    attributes: { exclude: ["content"] }, // list without blob
  });
  return res.json(rows);
}

/**
 * Create a new training submission
 * POST /api/v1/submissions/training
 * multipart/form-data: file=<file>, userId=<string>, taskId=<string>
 */
export async function createTrainingSubmission(req: Request, res: Response) {
  const file = (req as any).file as Express.Multer.File | undefined;
  
  if (!file) {
    return res.status(400).json({ error: "Missing file" });
  }

  const id = cuid();
  const checksum = sha256(file.buffer);

  const created = await Submission.create({
    id,
    taskId: req.body.taskId,
    groupId: req.body.groupId,
    type: "TRAINING",
    filename: file.originalname,
    mimetype: file.mimetype,
    sizeBytes: file.size,
    content: file.buffer,
    checksumSha256: checksum,
  });

  return res.status(201).json({
    id: created.id,
  });
}

/**
 * Download a submission
 * GET /api/v1/submissions/:id/download
 */
export async function downloadSubmission(req: Request, res: Response) {
  const { id } = req.params;
  const submission = await Submission.findByPk(id);

  if (!submission) {
    return res.status(404).json({ error: "Not found" });
  }

  res.setHeader("Content-Type", submission.mimetype);
  res.setHeader("Content-Length", submission.sizeBytes.toString());
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${submission.filename}"`
  );

  return res.send(Buffer.from(submission.content));
}

// TODO: Rerun function
/**
 * GET /api/v1/submissions/:id/rerun
 */
// export async function rerunSubmission(req: Request, res: Response) {
//   const { id } = req.params;
//   const submission = await Submission.findByPk(id);
//   if (!submission) return res.status(404).json({ error: "Not found" });

//   const evalURL = process.env.EVALUATION_BASE_URL;

//   await axios.post(`${evalURL}/api/v1/evaluations/start`, {
//     submissionId: submission.id,
//     rerun: true,
//   });

//   return res.status(200).json({ ok: true });
// }
