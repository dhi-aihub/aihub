import Group from "../models/group-model";

// for testing purposes
export async function getAllGroups(req, res) {
    try {
        const groups = await Group.findAll();
        res.status(200).json({ message: "All groups", data: groups });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function getGroupById(req, res) {
    try {
        const group = await Group.findByPk(req.params.id);
        res.status(200).json({ message: "Group found", data: group });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function createGroup(req, res) {
    try {
        const group = await Group.create(req.body);
        res.status(201).json({ message: "Group created", data: group });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function updateGroup(req, res) {
    try {
        const group = await Group.findByPk(req.params.id);
        group.update(req.body);
        res.status(200).json({ message: "Group updated", data: group });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function deleteGroup(req, res) {
    try {
        const group = await Group.findByPk(req.params.id);
        group.destroy();
        res.status(200).json({ message: "Group deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
