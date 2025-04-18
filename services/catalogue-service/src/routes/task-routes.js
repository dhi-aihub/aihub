import express from "express";

import {
    createTask,
    deleteTask,
    updateTask,
    getAllTasks,
    getTaskById
} from "../controller/task-controller.js";

const router = express.Router();

router.get("/", getAllTasks);

router.get("/:id", getTaskById);

router.post("/", createTask);

router.put("/:id", updateTask);

router.delete("/:id", deleteTask);

export default router;