const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.post('/add', projectController.addProject);
router.get('/list', projectController.getProjects);

module.exports = router;
