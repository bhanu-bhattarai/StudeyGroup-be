const db = require('../config/db');

exports.addProject = async (req, res) => {
    const { name, description } = req.body;
    const query = 'INSERT INTO projects (name, description, status) VALUES ($1, $2, 0) RETURNING id';

    try {
        const { rows } = await db.query(query, [name, description]); // Using async/await for PostgreSQL queries
        res.status(201).json({ message: 'Project added successfully', projectId: rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getProjects = async (req, res) => {
    const query = 'SELECT * FROM projects';

    try {
        const { rows } = await db.query(query);
        const mappedResults = rows.map((project) => {
            let statusText;
            switch (project.status) {
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
                ...project,
                statusText,
            };
        });

        res.json(mappedResults);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.getProjectReport = async (req, res) => {
    const projectId = req.query.projectId;
    if (!projectId) return res.status(400).json({ error: 'Project ID is required' });

    const query = `
        SELECT status, description
        FROM tasks
        WHERE project_id = $1
        ORDER BY id DESC;
    `;

    try {
        const { rows } = await db.query(query, [projectId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'No tasks found for this project' });
        }

        // Calculate percentage distribution
        const totalTasks = rows.length;
        const statusCount = { todo: 0, inProgress: 0, completed: 0 };

        rows.forEach((task) => {
            if (task.status === 0) statusCount.todo++;
            else if (task.status === 1) statusCount.inProgress++;
            else if (task.status === 2) statusCount.completed++;
        });

        const reportData = {
            todo: ((statusCount.todo / totalTasks) * 100).toFixed(2),
            inProgress: ((statusCount.inProgress / totalTasks) * 100).toFixed(2),
            completed: ((statusCount.completed / totalTasks) * 100).toFixed(2),
            comment: rows[0].description, // Last task's description as the comment
        };

        res.json({ data: reportData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getProjectReportWeekly = async (req, res) => {
    const projectId = req.query.projectId;
    if (!projectId) return res.status(400).json({ error: 'Project ID is required' });

    try {
        // Fetch tasks for the project
        const taskQuery = `
            SELECT id, status, description
            FROM tasks
            WHERE project_id = $1
            ORDER BY id DESC;
        `;
        const taskResult = await db.query(taskQuery, [projectId]);
        const tasks = taskResult.rows;

        if (tasks.length === 0) {
            return res.status(404).json({ error: 'No tasks found for this project' });
        }

        // Calculate percentage distribution
        const totalTasks = tasks.length;
        const statusCount = { todo: 0, inProgress: 0, completed: 0 };

        tasks.forEach((task) => {
            if (task.status === 0) statusCount.todo++;
            else if (task.status === 1) statusCount.inProgress++;
            else if (task.status === 2) statusCount.completed++;
        });

        // Fetch comments added in the past week
        const commentQuery = `
            SELECT comment_text, updated_on 
            FROM task_comments 
            WHERE task_id IN (SELECT id FROM tasks WHERE project_id = $1)
            AND updated_on >= NOW() - INTERVAL '7 days'
            ORDER BY updated_on DESC;
        `;
        const commentResult = await db.query(commentQuery, [projectId]);
        const weeklyComments = commentResult.rows;

        // Build response data
        const reportData = {
            todo: ((statusCount.todo / totalTasks) * 100).toFixed(2),
            inProgress: ((statusCount.inProgress / totalTasks) * 100).toFixed(2),
            completed: ((statusCount.completed / totalTasks) * 100).toFixed(2),
            comment: weeklyComments,
        };

        res.json({ data: reportData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
