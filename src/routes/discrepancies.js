const express = require('express');
const router = express.Router();
const db = require('../config/database');

// PUT /discrepancies/:id/resolve - Mark discrepancy as resolved
router.put('/:id/resolve', async (req, res) => {
    const discrepancyId = req.params.id;

    try {
        //first check if the discrepancy exists
        const check = await db.query(
            'SELECT * FROM discrepancies WHERE discrepancy_id = $1', [discrepancyId]
        );

        if (check.rowCount == 0) {
            return res.status(404).json({ error: 'Discrepancy not found' });
        }

        //update discrepancy to resolved
        const result = await db.query(
            `UPDATE discrepancies SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP 
            WHERE discrepancy_id = $1 RETURNING *`, [discrepancyId]
        );

        //update the item status to 'available'
        await db.query(
            `UPDATE items SET status = 'available'
             WHERE item_id = (
                 SELECT ri.item_id 
                 FROM reservation_items ri
                 JOIN discrepancies d ON ri.reservation_item_id = d.reservation_item_id
                 WHERE d.discrepancy_id = $1
             )`,
            [discrepancyId]
        );

        res.json({
            message: 'Discrepancy resolved',
            discrepancy: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                d.discrepancy_id,
                d.type,
                d.status,
                d.reported_at,
                d.resolved_at,
                d.notes,
                o.name as organization_name,
                i.name as item_name,
                ri.quantity_requested,
                ri.quantity_returned,
                r.reservation_id,
                r.start_time as reservation_start
            FROM discrepancies d
            JOIN reservation_items ri ON d.reservation_item_id = ri.reservation_item_id
            JOIN items i ON ri.item_id = i.item_id
            JOIN reservations r ON ri.reservation_id = r.reservation_id
            JOIN organizations o ON r.organization_id = o.organization_id
            ORDER BY d.reported_at DESC       
            `);

        res.json({
            count: result.rowCount,
            flagged: result.rows.filter(d => d.status === 'flagged').length,
            resolved: result.rows.filter(d => d.status === 'resolved').length,
            data: result.rows
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
