const db = require('../config/db');
const multer = require('multer');

exports.addTask = async (req, res) => {
    const { project_id, name, description, status, time_to_completed, started_date, completed_date, due_date } = req.body;
    const query = 'INSERT INTO tasks (project_id, name, description, status, time_to_completed, started_date, completed_date, due_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id';

    try {
        const { rows } = await db.query(query, [project_id, name, description, status, time_to_completed, started_date, completed_date, due_date]);
        res.status(201).json({ message: 'Task added successfully', taskId: rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTasksByProjectId = async (req, res) => {
    const projectId = req.query.projectId;
    if (!projectId) return res.status(400).json({ error: 'Project ID is required' });

    const query = 'SELECT * FROM tasks WHERE project_id = $1';

    try {
        const { rows } = await db.query(query, [projectId]);
        const mappedResults = rows.map((task) => ({
            ...task,
            statusText: task.status === 0 ? 'To-Do' : task.status === 1 ? 'In Progress' : task.status === 2 ? 'Completed' : 'Unknown',
        }));
        res.json(mappedResults);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateTaskStatus = async (req, res) => {
    const { task_id, status } = req.body;
    if (!task_id || status === undefined) return res.status(400).json({ error: 'Task ID and status are required' });

    const query = 'UPDATE tasks SET status = $1 WHERE id = $2';

    try {
        const { rowCount } = await db.query(query, [status, task_id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Task not found' });

        res.status(200).json({ message: 'Task status updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getCommentsByTaskId = async (req, res) => {
    const taskId = req.query.taskId;
    if (!taskId) return res.status(400).json({ error: 'Task ID is required' });

    const query = 'SELECT * FROM task_comments WHERE task_id = $1';

    try {
        const { rows } = await db.query(query, [taskId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addComment = async (req, res) => {
    const { task_id, user_id, comment_text } = req.body;
    if (!task_id || !user_id || !comment_text) return res.status(400).json({ error: 'Task ID, user ID, and comment text are required' });

    try {
        await db.query('INSERT INTO task_comments (task_id, user_id, comment_text) VALUES ($1, $2, $3)', [task_id, user_id, comment_text]);
        const { rows } = await db.query('SELECT * FROM task_comments WHERE task_id = $1', [task_id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.fileupload = async (req, res) => {
    const { task_id } = req.body;
    const file_name = req.file.originalname;
    const file_data = req.file.buffer;

    if (!task_id || !file_name || !file_data) return res.status(400).json({ error: 'Task ID, file name, and file data are required' });

    try {
        await db.query('INSERT INTO task_files (task_id, file_name, file_data) VALUES ($1, $2, $3)', [task_id, file_name, file_data]);
        res.status(201).json({ message: 'File uploaded successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUploadedFileByTaskId = async (req, res) => {
    const taskId = req.query.taskId;
    if (!taskId) return res.status(400).json({ error: 'Task ID is required' });

    try {
        const { rows } = await db.query('SELECT file_id, file_name, uploaded_at FROM task_files WHERE task_id = $1', [taskId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
