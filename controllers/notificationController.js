const db = require('../config/db');

exports.getNotifications = async (req, res) => {
    const userId = req.params.userId;
    const query = 'SELECT text, timeStamp FROM notifications WHERE user_id = $1 ORDER BY timeStamp DESC';

    try {
        const { rows } = await db.query(query, [userId]); // Use async/await for PostgreSQL queries
        const notifications = rows.map(notification => ({
            text: notification.text,
            timeStamp: notification.timestamp, // PostgreSQL uses lowercase column names by default
        }));

        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
