const db = require('../config/db');
const multer = require('multer');

exports.addTask = async (req, res) => {
    const { project_id, name, description, status, time_to_completed, due_date, assignee_id } = req.body;
    const query = 'INSERT INTO tasks (project_id, name, description, status, time_to_completed, due_date, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id';

    try {
        const { rows } = await db.query(query, [project_id, name, description, status, time_to_completed, due_date, assignee_id]);
        res.status(201).json({ message: 'Task added successfully', taskId: rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTasksByProjectId = async (req, res) => {
    const projectId = req.query.projectId;
    if (!projectId) return res.status(400).json({ error: 'Project ID is required' });

    const query = `
        SELECT tasks.*, users.firstname, users.lastname 
        FROM tasks 
        LEFT JOIN users ON tasks.user_id = users.id 
        WHERE tasks.project_id = $1
    `;
    try {
        const { rows } = await db.query(query, [projectId]);
        const mappedResults = rows.map((task) => ({
            ...task,
            statusText: task.status === 0 ? 'To-Do' : task.status === 1 ? 'In Progress' : task.status === 2 ? 'Completed' : 'Unknown',
            assigneeName: task.firstname + " " + task.lastname || 'Unassigned', // Handle case where there's no assignee
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
    const statusTexts = ['To-Do', 'In Progress', 'Completed'];

    try {
        const { rowCount } = await db.query(query, [status, task_id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Task not found' });

        // Add comment for status update
        await db.query(
            'INSERT INTO task_comments (task_id, user_id, comment_text) VALUES ($1, $2, $3)',
            [task_id, null, `Status updated to ${statusTexts[status]}`]
        );

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

        // Add comment for file upload
        await db.query(
            'INSERT INTO task_comments (task_id, user_id, comment_text) VALUES ($1, $2, $3)',
            [task_id, null, `File uploaded: ${file_name}`]
        );

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

exports.downloadFile = async (req, res) => {
    const fileId = req.query.fileId;
    if (!fileId) return res.status(400).json({ error: 'File ID is required' });

    try {
        // Retrieve file data from database
        const query = 'SELECT file_name, file_data FROM task_files WHERE file_id = $1';
        const { rows } = await db.query(query, [fileId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }

        const { file_name, file_data } = rows[0];

        // Determine file type based on extension
        const fileExtension = file_name.split('.').pop().toLowerCase();
        const mimeTypes = {
            pdf: 'application/pdf',
            doc: 'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            xls: 'application/vnd.ms-excel',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        };

        const contentType = mimeTypes[fileExtension] || 'application/octet-stream';

        // Set response headers
        res.setHeader('Content-Disposition', `attachment; filename="${file_name}"`);
        res.setHeader('Content-Type', contentType);
        res.send(file_data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
