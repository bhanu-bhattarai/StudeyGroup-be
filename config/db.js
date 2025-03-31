const mysql = require('mysql2'); // Use mysql2 instead of mysql
const dotenv = require('dotenv');

dotenv.config();

const connection = mysql.createConnection({
    host: 'sql.freedb.tech',
    user: 'freedb_studygroup',
    password: '?kgygurU&w6SZFw',
    database: 'freedb_studygroup'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the database as id', connection.threadId);
});

module.exports = connection;
