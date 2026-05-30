require('dotenv').config();

const express = require('express');
const cors = require('cors');


//THE HOLY BACKENDDD
const app = express();
app.use(express.json()); // Restored missing JSON middleware

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://club-equipment-tracker.vercel.app/'
]

//CORS ROUTE
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// ROUTES
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
        timestamp: new Date().toISOString(),
        service: 'inventri-api'
    })
});

//optional: db health check - can't hurt anybody!
app.get('/api/health/db', async (req, res) => {
    try {
        const db = require('./config/database');
        const dbResult = await db.query('SELECT NOW() as time');
        res.json({
            status: 'healthy',
            database: { connected: true, serverTime: dbResult.rows[0].time }
        });
    } catch (err) {
        res.status(503).json({
            status: 'unhealthy',
            database: { connected: false, error: err.message }
        });
    }
});

// Swagger 
try {
    const swagger = require('./config/swagger');
    app.get('/swagger-spec', (req, res) => {
        res.json(require('./config/swagger-docs'));
    });
    app.use('/api-docs', swagger.serve, swagger.setup);
} catch (e) {
    console.log('Swagger not configured:', e.message);
}


//required by render 
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Inventri API running on port ${PORT}`);
});

module.exports = app;