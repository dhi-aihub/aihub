import { Request, Response } from "express";
import { Op } from "sequelize";
import { Result } from "../models/Result";

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
    limit = 50,
    offset = 0,
  } = req.query as unknown as {
    submissionId: string;
    evalRunId: string;
    limit: number;
    offset: number;
  };

  const where: any = {};
  if (submissionId) where.submissionId = submissionId;
  if (evalRunId) where.evalRunId = evalRunId;

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
