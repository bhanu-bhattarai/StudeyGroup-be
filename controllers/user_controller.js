const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Function for signup
exports.signup = (req, res) => {
    const { firstname, lastname, email, password } = req.body;
    const query = 'INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)';

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: 'Error hashing password', error: err.message });
        }

        db.query(query, [firstname, lastname, email, hashedPassword], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Error during signup', error: err.message });
            }
            res.status(201).json({ message: 'User signed up successfully!', userId: result.insertId });
        });
    });
};

// Function for signin
exports.signin = (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ?';

    db.query(query, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error during signin', error: err.message });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'User not found!' });
        }

        const user = results[0];
        bcrypt.compare(password, user.password, (err, isPasswordValid) => {
            if (err || !isPasswordValid) {
                return res.status(401).json({ message: 'Invalid email or password!' });
            }

            const token = jwt.sign({ userId: user.id }, 'secret_key', { expiresIn: '1h' });
            res.json({ message: 'Signed in successfully!', token, userId: user.id });
        });
    });
};

// Function to get user list
exports.getUserList = (req, res) => {
    const query = 'SELECT id, firstname, lastname, email FROM users';

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching user list', error: err.message });
        }
        res.json(results);
    });
};

// Function to fetch specific user fields
exports.getUserFields = (req, res) => {
    const query = 'SELECT id AS user_id, firstname, lastname, email AS user_name FROM users';

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
};
