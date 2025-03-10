import Task from '../models/task-model.js';

export async function getAllTasks(req, res) {
    try {
        const tasks = await Task.findAll();
        res.status(200).json({ message: 'All tasks', data: tasks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function getTaskById(req, res) {
    try {
        const task = await Task.findByPk(req.params.id);
        res.status(200).json({ message: 'Task found', data: task });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function createTask(req, res) {
    try {
        const task = await Task.create(req.body);
        res.status(201).json({ message: 'Task created', data: task });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function updateTask(req, res) {
    try {
        const task = await Task.findByPk(req.params.id);
        task.update(req.body);
        res.status(200).json({ message: 'Task updated', data: task });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function deleteTask(req, res) {
    try {
        const task = await Task.findByPk(req.params.id);
        task.destroy();
        res.status(200).json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}