const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller');
router.post('/signup', userController.signup); // Sign up a new user
router.post('/login', userController.signin); // Sign in an existing user
router.get('/users', userController.getUserList); // Fetch the list of users
router.get('/find', userController.getUserFields); // Fetch specific fields for users

module.exports = router;
