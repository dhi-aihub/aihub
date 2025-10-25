import { Request, Response } from "express";
import multer from "multer";
import archiver from "archiver";

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
 * Optional filters: ?groupId=<id>&taskId=<id>&marked_for_grading=<true|false>&order=created_at:asc|desc
 */
export async function listSubmissions(req: Request, res: Response) {
  const { groupId, taskId, marked_for_grading, order } = req.query as Record<
    string,
    string | undefined
  >;

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

/**
 * Download multiple submissions as a ZIP file
 * Request body: [{ groupId: string, resultId: string }]
 */
export async function downloadSubmissionsBatch(req: Request, res: Response) {
  const submissionRequests = req.body;

  if (!Array.isArray(submissionRequests) || submissionRequests.length === 0) {
    return res
      .status(400)
      .json({ error: "Missing or invalid submission requests array" });
  }

  for (const request of submissionRequests) {
    if (!request.submissionId) {
      return res.status(400).json({ error: "Each request must have resultId" });
    }
  }

  try {
    // Extract all resultIds for the database query
    const submissionIds = submissionRequests.map((req) => req.submissionId);

    // Obtain all the submissions
    const submissions = await Submission.findAll({
      where: {
        id: submissionIds,
      },
    });

    if (submissions.length === 0) {
      return res.status(404).json({ error: "No submissions found" });
    }

    // Create a map for quick lookup of groupId by submissionId
    const groupIdMap = new Map();
    submissionRequests.forEach((req) => {
      groupIdMap.set(req.submissionId, req.groupId);
    });

    // Set response headers for ZIP download
    const zipFilename = `submissions_${
      new Date().toISOString().split("T")[0]
    }_${Date.now()}.zip`;
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${zipFilename}"`
    );

    // Create ZIP archive
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    // Handle archive errors
    archive.on("error", (err) => {
      console.error("Archive error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to create ZIP archive" });
      }
    });

    // Pipe archive to response
    archive.pipe(res);

    // Add each submission to the archive
    for (const submission of submissions) {
      const groupId = groupIdMap.get(submission.id) || submission.id;

      const fileExtension = submission.filename.split(".").pop();
      const safeFilename = fileExtension
        ? `${groupId}.${fileExtension}`
        : `${groupId}_${submission.filename}`;

      archive.append(Buffer.from(submission.content), {
        name: safeFilename,
        date: submission.createdAt,
      });
    }

    // Add a manifest file with submission details
    const manifest = {
      downloadedAt: new Date().toISOString(),
      totalSubmissions: submissions.length,
      submissions: submissions.map((s) => {
        const groupId = groupIdMap.get(s.id);
        return {
          groupId: groupId || null,
          resultId: s.id,
          filename: s.filename,
          taskId: s.taskId,
          type: s.type,
          sizeBytes: s.sizeBytes,
          createdAt: s.createdAt,
          checksumSha256: s.checksumSha256,
          usedFallbackName: !groupId,
        };
      }),
    };

    archive.append(JSON.stringify(manifest, null, 2), {
      name: "manifest.json",
    });

    await archive.finalize();
  } catch (error) {
    console.error("Error creating batch download:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
