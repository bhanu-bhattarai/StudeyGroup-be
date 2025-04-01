const { Client } = require('pg'); // Use pg instead of mysql2
const dotenv = require('dotenv');

dotenv.config();

const client = new Client({
    host: 'dpg-cvlkvrre5dus73ajhfq0-a.oregon-postgres.render.com', // PostgreSQL host
    user: 'root', // PostgreSQL username
    port: 5432, // Default PostgreSQL port
    password: 'EV1K2UJ3FHYqUPT9cQWzte4PHKeGhlIv', // PostgreSQL password
    database: 'studygroup', // Database name
    ssl: {
        rejectUnauthorized: false // Disable strict SSL validation (adjust as needed)
    }
});

client.connect()
    .then(() => console.log('Connected to PostgreSQL database successfully'))
    .catch(err => console.error('Error connecting to the database:', err.stack));

module.exports = client;
