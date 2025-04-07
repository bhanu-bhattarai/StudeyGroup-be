const express = require('express');
const dotenv = require('dotenv');
const db = require('./config/db');
const indexRoutes = require('./routes/index');
const projectRoutes = require('./routes/projectRoutes')
const taskRoutes = require('./routes/taskRoute')
const noticationRoutes = require('./routes/notificationRoutes')
const userRoutes = require('./routes/userRoutes');

const cors = require('cors');



dotenv.config();

const app = express();
const port = process.env.PORT || 8080;
app.use(cors({
    origin: '*', // Replace with the origin you want to allow
}));

app.use(express.json());
app.use('/', indexRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', noticationRoutes);
app.use('/api/users', userRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
