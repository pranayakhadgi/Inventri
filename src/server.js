require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

// === CORS MUST BE FIRST — before any routes or body parsing ===
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://club-equipment-tracker.vercel.app',
    'https://inventri.vercel.app'
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// === Handle preflight OPTIONS requests explicitly ===
app.options('*', cors());

// === Body parsing AFTER CORS ===
app.use(express.json());

// === ROUTES ===
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

app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'inventri-api',
        cors: 'enabled',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Inventri API running on port ${PORT}`);
    console.log('CORS origins:', allowedOrigins);
});

module.exports = app;// CORS fix deployed Sat May 30 13:25:31 CDT 2026
