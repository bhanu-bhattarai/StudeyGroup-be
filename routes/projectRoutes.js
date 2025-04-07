const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.post('/add', projectController.addProject);
router.get('/list', projectController.getProjects);
router.get('/report', projectController.getProjectReport);
router.get('/weekly/report', projectController.getProjectReportWeekly);


module.exports = router;
