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

router.post('/', async (req, res) => {
    const { name, type, address } = req.body;

    if (!name || !type) {
        return res.status(400).json({
            error: 'location name and type are required'
        });
    }

    try {
        const result = await db.query(
            `INSERT INTO locations
            (name, type, address)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [name, type, address || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// export router
module.exports = router;