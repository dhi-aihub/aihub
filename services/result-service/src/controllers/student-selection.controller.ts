import { Request, Response } from "express";
import { StudentSelection } from "../models/StudentSelection";

export async function createOrUpdateStudentSelection(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { taskId, groupId, resultId } = req.body;

    if (!taskId || !groupId) {
      res.status(400).json({ error: "taskId and groupId are required" });
      return;
    }

    const [studentSelection, created] = await StudentSelection.upsert(
      {
        taskId,
        groupId,
        resultId,
      },
      {
        returning: true,
      }
    );

    res.status(200).json(studentSelection);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create or update student selection" });
  }
}

export async function getStudentSelection(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { taskId, groupId } = req.params;

    const studentSelection = await StudentSelection.findOne({
      where: {
        taskId,
        groupId,
      },
    });

    if (!studentSelection) {
      res.status(404).json({ error: "Student selection not found" });
      return;
    }

    res.status(200).json(studentSelection);
  } catch (error) {
    res.status(500).json({ error: "Failed to get student selection" });
  }
}

export async function getStudentSelectionsByTaskId(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { taskId } = req.params;

    const studentSelections = await StudentSelection.findAll({
      where: {
        taskId,
      },
    });

    res.status(200).json(studentSelections);
  } catch (error) {
    res.status(500).json({ error: "Failed to get student selections" });
  }
}
