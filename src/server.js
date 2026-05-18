require('dotenv').config();

const express = require('express');
const path = require('path');
const db = require('./config/database');
const swagger = require('./config/swagger');


//THE HOLY BACKENDDD
const app = express();
app.use(express.json()); // Restored missing JSON middleware

// goal to load the index at root before the api call. 

//transition to the serverless-ready routing
//app.use(express.static('public')); <-- old
const staticPath = process.env.VERCEL ? path.join(__dirname, '../public') : path.join(__dirname, '../public');
app.use(express.static(staticPath));


// ROUTES
const organizationsRouter = require('./routes/organizations');
app.use('/organizations', organizationsRouter);
const itemsRouter = require('./routes/items');
app.use('/items', itemsRouter);
const PORT = process.env.PORT || 3000;
const reservationsRouter = require('./routes/reservations');
app.use('/reservations', reservationsRouter);
const discrepanciesRouter = require('./routes/discrepancies');
app.use('/discrepancies', discrepanciesRouter)
const reportsRouter = require('./routes/reports');
app.use('/reports', reportsRouter)
const locationsRouter = require('./routes/locations');
app.use('/locations', locationsRouter)

app.get('/health', async (req, res) => {
    try {
        const dbResult = await
            db.query('SELECT NOW() as time');
        //--------------------------------------
        res.json({
            status: 'healthy',
            timestamp: new
                Date().toISOString(),
            database: {
                connected: true,
                serverTime: dbResult.rows[0].time
            }
        });
    } catch (err) {
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new
                Date().toISOString(),
            database: {
                connected: false,
                error: err.message
            }
        });
    }
});

// Swagger Documentation
app.get('/swagger-spec', (req, res) => {
    res.json(require('./config/swagger-docs'));
});
app.use('/api-docs', swagger.serve, swagger.setup);


// serves index.html for any non-API routes (SPA support)
app.get('/', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
});
/**
 * new export conditional function for vesrcel
 * contradicts the earlier mere declaration of app.listen() function
 * 
 */
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`local server running on this thang http://localhost:${PORT}`);
    });
}

module.exports = app;