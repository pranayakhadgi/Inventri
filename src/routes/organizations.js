/**
 * @swagger
 * tags:
 * name: Organizations
 * description: Organization management
 */

const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * @swagger
 * /organizations:
 *   get:
 *     summary: List all organizations
 *     tags: [Organizations]
 *     responses:
 *       200:
 *         description: List of organizations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       organization_id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       type:
 *                         type: string
 *                       contact_email:
 *                         type: string
 *                       status:
 *                         type: string
 *       500:
 *         description: Server error
 */

router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM organizations ORDER BY name');
        res.json({
            count: result.rowCount,
            data: result.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    const { name, type, contact_email } = req.body;

    if (!name || !type) {
        return res.status(400).json({
            error: 'Organization name and type are required'
        });
    }

    try {
        const result = await db.query(
            `INSERT INTO organizations
            (name, type, contact_email, status)
            VALUES ($1, $2, $3, 'active')
            RETURNING *`,
            [name, type, contact_email || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

