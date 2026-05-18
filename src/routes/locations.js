const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET/locations- handler that queries 
router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT * FROM locations
            ORDER BY name`);
        res.json({
            count: result.rowCount,
            data: result.rows
        })
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// export router
module.exports = router;