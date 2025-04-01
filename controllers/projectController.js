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
