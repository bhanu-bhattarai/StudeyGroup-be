const db = require('../config/db');

exports.getNotifications = (req, res) => {
    const userId = req.params.userId;
    const query = 'SELECT text, timeStamp FROM notifications WHERE user_id = ? ORDER BY timeStamp DESC';
    db.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const notifications = results.map(notification => ({
            text: notification.text,
            timeStamp: notification.timeStamp,
        }));

        res.json(notifications);
    });
};
