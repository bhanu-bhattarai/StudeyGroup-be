const db = require('../config/db');

exports.addTask = (req, res) => {
    const { project_id, name, description, status, time_to_completed, started_date, completed_date, due_date } = req.body;
    const query = 'INSERT INTO tasks (project_id, name, description, status, time_to_completed, started_date, completed_date, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [project_id, name, description, status, time_to_completed, started_date, completed_date, due_date], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Task added successfully', taskId: result.insertId });
    });
};

exports.getTasksByProjectId = (req, res) => {
    const projectId = req.query.projectId; // Get the projectId from query parameters
    if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
    }

    const query = 'SELECT * FROM tasks WHERE project_id = ?';
    db.query(query, [projectId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const mappedResults = results.map((task) => {
            let statusText;
            switch (task.status) {
                case 0:
                    statusText = 'To-Do';
                    break;
                case 1:
                    statusText = 'In Progress';
                    break;
                case 2:
                    statusText = 'Completed';
                    break;
                default:
                    statusText = 'Unknown';
            }
            return {
                ...task,
                statusText,
            };
        });

        res.json(mappedResults);
    });
};
