const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.post('/add', taskController.addTask);
router.get('/list', taskController.getTasksByProjectId);

module.exports = router;
