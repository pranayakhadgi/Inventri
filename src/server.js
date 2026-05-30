require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://club-equipment-tracker.vercel.app',
        'https://inventri.vercel.app'
    ],
    credentials: true
}));

app.use(express.json());

const organizationsRouter = require('./routes/organizations');
const itemsRouter = require('./routes/items');
const reservationsRouter = require('./routes/reservations');
const discrepanciesRouter = require('./routes/discrepancies');
const reportsRouter = require('./routes/reports');
const locationsRouter = require('./routes/locations');

app.use('/api/organizations', organizationsRouter);
app.use('/api/items', itemsRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/discrepancies', discrepanciesRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/locations', locationsRouter);

app.get('/api/health', async (req, res) => {
    try {
        const db = require('./config/database');
        await db.query('SELECT NOW() as time');
        res.json({ status: 'healthy', database: 'connected' });
    } catch (err) {
        res.status(503).json({ status: 'unhealthy', error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Inventri API running on port ${PORT}`);
});

module.exports = app;