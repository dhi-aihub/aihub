import { Request, Response } from "express";
import { Result } from "../models/Result";
import { StudentSelection } from "../models/StudentSelection";

/**
 * Create or update a result.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The created or updated result.
 */
export async function createOrUpdateResult(req: Request, res: Response) {
  const {
    submissionId,
    evalRunId,
    groupId,
    taskId,
    status,
    score = null,
    metrics = null,
    error = null,
    artifactsUri = null,
  } = req.body;

  try {
    const [row, created] = await Result.findOrCreate({
      where: { submissionId },
      defaults: {
        submissionId,
        evalRunId,
        groupId,
        taskId,
        status,
        score,
        metrics,
        error,
        artifactsUri,
      },
    });

    if (!created) {
      await row.update({
        evalRunId,
        status,
        score,
        metrics,
        error,
        artifactsUri,
      });
    }

    console.log("Result processed:", row.id);

    if (taskId && groupId) {
      console.log("Handling student selection for result:", row.id);
      await handleStudentSelectionForResult(
        String(taskId),
        String(groupId),
        row.id
      );
      console.log("Student selection handled for result:", row.id);
    }

    return res.status(created ? 201 : 200).json({
      data: row,
      meta: { created, idempotentKey: { submissionId } },
    });
  } catch (e: any) {
    return res
      .status(500)
      .json({ error: { code: "RESULT_INGEST_FAILED", message: e.message } });
  }
}

/**
 * Get a result by ID.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The result data.
 */
export async function getResultById(req: Request, res: Response) {
  try {
    const row = await Result.findByPk(req.params.id);
    if (!row)
      return res
        .status(404)
        .json({ error: { code: "NOT_FOUND", message: "Result not found" } });
    return res.json({ data: row });
  } catch (e: any) {
    return res
      .status(500)
      .json({ error: { code: "RESULT_FETCH_FAILED", message: e.message } });
  }
}

/**
 * List results.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The list of results.
 */
export async function listResults(req: Request, res: Response) {
  const {
    submissionId,
    evalRunId,
    groupId,
    taskId,
    limit = 50,
    offset = 0,
  } = req.query as unknown as {
    submissionId: string;
    evalRunId: string;
    groupId: string;
    taskId: string;
    limit: number;
    offset: number;
  };

  const where: any = {};
  if (submissionId) where.submissionId = submissionId;
  if (evalRunId) where.evalRunId = evalRunId;
  if (groupId) where.groupId = groupId;
  if (taskId && groupId) {
    where.taskId = taskId;
    where.groupId = groupId;
  }

  try {
    const { rows, count } = await Result.findAndCountAll({
      where,
      order: [
        ["createdAt", "DESC"],
        ["id", "DESC"],
      ],
      limit,
      offset,
    });

    return res.json({
      data: rows,
      meta: {
        total: count,
        limit,
        offset,
        hasMore: offset + rows.length < count,
      },
    });
  } catch (e: any) {
    return res
      .status(500)
      .json({ error: { code: "RESULT_LIST_FAILED", message: e.message } });
  }
}

/**
 * Handle student selection logic for a result
 * @param taskId - The task ID
 * @param groupId - The group ID
 * @param resultId - The result ID
 */
async function handleStudentSelectionForResult(
  taskId: string,
  groupId: string,
  resultId: string
): Promise<void> {
  try {
    const existingSelection = await StudentSelection.findOne({
      where: {
        taskId,
        groupId,
      },
    });

    if (!existingSelection) {
      await StudentSelection.create({
        taskId,
        groupId,
        resultId,
      });
      return;
    }

    const shouldUpdate = await shouldUpdateWithNewResult(
      existingSelection.resultId,
      resultId
    );

    if (shouldUpdate) {
      await existingSelection.update({ resultId });
    }
  } catch (error) {
    console.error("Error handling student selection:", error);
  }
}

/**
 * Compare scores between existing and new result
 * @param existingResultId - The existing result ID in student selection
 * @param newResultId - The new result ID to compare
 * @returns True if new result has higher score, false otherwise
 */
async function shouldUpdateWithNewResult(
  existingResultId: string,
  newResultId: string
): Promise<boolean> {
  try {
    const [existingResult, newResult] = await Promise.all([
      Result.findByPk(existingResultId),
      Result.findByPk(newResultId),
    ]);

    if (!existingResult) {
      return true;
    }

    if (!newResult) {
      return false;
    }

    const existingScore = existingResult.score || 0;
    const newScore = newResult.score || 0;

    return newScore >= existingScore;
  } catch (error) {
    console.error("Error comparing result scores:", error);
    return false;
  }
}

/**
 * Export results for a list of submissionIds (body: [{ submissionId, groupId }, ...])
 * Builds a CSV with one row per input entry (preserving order). If a result is not found
 * for a submissionId an empty row with the submissionId is still emitted.
 */
export async function exportResultsCsv(req: Request, res: Response) {
  try {
    const entries = Array.isArray(req.body) ? req.body : [];
    const submissionIds = Array.from(
      new Set(entries.map((e: any) => e?.submissionId).filter(Boolean))
    );

    // Fetch all matching results
    const results = submissionIds.length
      ? await Result.findAll({ where: { submissionId: submissionIds } })
      : [];

    const resultBySubmission = new Map<string, Result>();
    for (const r of results) resultBySubmission.set(r.submissionId, r);

    // CSV helpers
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return "";
      const s = typeof val === "object" ? JSON.stringify(val) : String(val);
      if (
        s.includes('"') ||
        s.includes(",") ||
        s.includes("\n") ||
        s.includes("\r")
      ) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const headers = [
      "groupId",
      "score",
      "metrics",
      "error",
      "artifactsUri",
      "createdAt",
      "updatedAt",
    ];

    const rows: string[] = [];
    rows.push(headers.join(","));

    // Preserve order of input entries; one row per input entry
    for (const entry of entries) {
      const sid = entry?.submissionId;
      const found = sid ? resultBySubmission.get(sid) : undefined;

      const rowValues = [
        found?.groupId || entry?.groupId || "",
        // score stored as string | null in model
        found?.score ?? "",
        found?.metrics ? JSON.stringify(found.metrics) : "",
        found?.error ?? "",
        found?.artifactsUri ?? "",
        found?.createdAt ? found.createdAt.toISOString() : "",
        found?.updatedAt ? found.updatedAt.toISOString() : "",
      ].map(escapeCsv);

      rows.push(rowValues.join(","));
    }

    const csv = rows.join("\r\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="results.csv"');
    return res.status(200).send(csv);
  } catch (e: any) {
    return res.status(500).json({
      error: { code: "RESULT_CSV_EXPORT_FAILED", message: e?.message },
    });
  }
}
