const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Function for signup
exports.signup = async (req, res) => {
    const { firstname, lastname, email, password } = req.body;
    const query = 'INSERT INTO users (firstname, lastname, email, password) VALUES ($1, $2, $3, $4) RETURNING id';

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const { rows } = await db.query(query, [firstname, lastname, email, hashedPassword]);

        res.status(201).json({ message: 'User signed up successfully!', userId: rows[0].id });
    } catch (err) {
        res.status(500).json({ message: 'Error during signup', error: err.message });
    }
};

// Function for signin
exports.signin = async (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = $1';

    try {
        const { rows } = await db.query(query, [email]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'User not found!' });
        }

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password!' });
        }

        const token = jwt.sign({ userId: user.id }, 'secret_key', { expiresIn: '1h' });
        res.json({ message: 'Signed in successfully!', token, userId: user.id });
    } catch (err) {
        res.status(500).json({ message: 'Error during signin', error: err.message });
    }
};

// Function to get user list
exports.getUserList = async (req, res) => {
    const query = 'SELECT id, firstname, lastname, email FROM users';

    try {
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching user list', error: err.message });
    }
};

// Function to fetch specific user fields
exports.getUserFields = async (req, res) => {
    const query = 'SELECT id AS user_id, firstname, lastname, email AS user_name FROM users';

    try {
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
