import GroupSet from '../models/groupSet-model.js';

export async function getAllGroupSets(req, res) {
    try {
        const groupSets = await GroupSet.findAll();
        res.status(200).json({ message: 'All group sets', data: groupSets });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function getGroupSetById(req, res) {
    try {
        const groupSet = await GroupSet.findByPk(req.params.id);
        if (!groupSet) {
            return res.status(404).json({ message: 'Group set not found' });
        }
        res.status(200).json({ message: 'Group set found', data: groupSet });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function createGroupSet(req, res) {
    try {
        const groupSet = await GroupSet.create(req.body);
        res.status(201).json({ message: 'Group set created', data: groupSet });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function updateGroupSet(req, res) {
    try {
        const groupSet = await GroupSet.findByPk(req.params.id);
        if (!groupSet) {
            return res.status(404).json({ message: 'Group set not found' });
        }
        await groupSet.update(req.body);
        res.status(200).json({ message: 'Group set updated', data: groupSet });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function deleteGroupSet(req, res) {
    try {
        const groupSet = await GroupSet.findByPk(req.params.id);
        if (!groupSet) {
            return res.status(404).json({ message: 'Group set not found' });
        }

        // Check if the group set has any associated tasks
        const associatedTasks = await groupSet.getTasks();
        if (associatedTasks.length > 0) {
            return res.status(400).json({ message: 'Cannot delete group set with associated tasks' });
        }

        await groupSet.destroy();
        res.status(200).json({ message: 'Group set deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function getGroupSetGroups(req, res) {
    try {
        const groupSet = await GroupSet.findByPk(req.params.id, { include: 'groups' });
        if (!groupSet) {
            return res.status(404).json({ message: 'Group set not found' });
        }
        res.status(200).json({ message: 'Groups in group set', data: groupSet.groups });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}