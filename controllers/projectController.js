const db = require('../config/db');

exports.addProject = (req, res) => {
    const { name, description } = req.body;
    const query = 'INSERT INTO projects (name, description, status) VALUES (?, ?, 0)';
    db.query(query, [name, description], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Project added successfully', projectId: result.insertId });
    });
};

exports.getProjects = (req, res) => {
    const query = 'SELECT * FROM projects';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const mappedResults = results.map((project) => {
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
    });
};
