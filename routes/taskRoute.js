const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const multer = require('multer');

router.post('/add', taskController.addTask);
router.get('/list', taskController.getTasksByProjectId);
router.put('/updateTaskStatus', taskController.updateTaskStatus);

router.post('/add/comment', taskController.addComment);
router.get('/list/comments', taskController.getCommentsByTaskId);
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.post('/upload', upload.single('file'), taskController.fileupload);
router.get('/view/uploads', taskController.getUploadedFileByTaskId);

module.exports = router;
