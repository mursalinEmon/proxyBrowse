const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/models');
const profileRoutes = require('./src/routes/profiles');
const jobRoutes = require('./src/routes/jobs');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/profiles', profileRoutes);
app.use('/jobs', jobRoutes);

// health check
app.get('/', (req, res) => {
    res.json({ msg: 'Backend working' });
});

// sync DB (for dev only)
sequelize.sync().then(() => {
    console.log('Database synced');
}).catch(err => {
    console.error('DB sync error:', err);
});

module.exports = app;
