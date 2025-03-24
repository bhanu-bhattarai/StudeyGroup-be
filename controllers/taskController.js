const db = require('../config/db');
const multer = require('multer');


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

exports.updateTaskStatus = (req, res) => {
    const { task_id, status } = req.body;
    if (!task_id || status === undefined) {
        return res.status(400).json({ error: 'Task ID and status are required' });
    }

    const query = 'UPDATE tasks SET status = ? WHERE id = ?';
    db.query(query, [status, task_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(200).json({ message: 'Task status updated successfully' });
    });
};

exports.getCommentsByTaskId = (req, res) => {
    const taskId = req.query.taskId; // Get the taskId from query parameters
    if (!taskId) {
        return res.status(400).json({ error: 'Task ID is required' });
    }

    const query = 'SELECT * FROM task_comments WHERE task_id = ?';
    db.query(query, [taskId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
};

// API to create a comment for a specific task
exports.addComment = (req, res) => {
    const { task_id, user_id, comment_text } = req.body;
    if (!task_id || !user_id || !comment_text) {
        return res.status(400).json({ error: 'Task ID, user ID, and comment text are required' });
    }

    const query = 'INSERT INTO task_comments (task_id, user_id, comment_text) VALUES (?, ?, ?)';
    db.query(query, [task_id, user_id, comment_text], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const query = 'SELECT * FROM task_comments WHERE task_id = ?';
        db.query(query, [task_id], (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(results);
        });
    });
};

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.fileupload = (req, res) => {
    const { task_id } = req.body;
    const file_name = req.file.originalname; // Use originalname for the filename
    const file_data = req.file.buffer;

    if (!task_id || !file_name || !file_data) {
        return res.status(400).json({ error: 'Task ID, file name, and file data are required' });
    }

    const query = 'INSERT INTO task_files (task_id, file_name, file_data) VALUES (?, ?, ?)';
    db.query(query, [task_id, file_name, file_data], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'File uploaded successfully', fileId: result.insertId });
    });
};


exports.getUploadedFileByTaskId = (req, res) => {
    const taskId = req.query.taskId; // Get the taskId from query parameters
    if (!taskId) {
        return res.status(400).json({ error: 'Task ID is required' });
    }

    const query = 'SELECT file_id, file_name, uploaded_at FROM task_files WHERE task_id = ?';
    db.query(query, [taskId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
};