const express = require('express');
const router = express.Router();
const db = require('../config/database');

// PUT /discrepancies/:id/resolve - Mark discrepancy as resolved
router.put('/:id/resolve', async (req, res) => {
    const discrepancyId = req.params.id;

    try {
        const { resolutionType, resolutionNotes } = req.body;

        const validTypes = ['returned', 'lost', 'damaged', 'false-alarm'];

        if (!resolutionType || !validTypes.includes(resolutionType)) {
            return res.status(400).json({ error: 'Invalid or missing resolution type. Must be returned, lost, damaged, or false_alarm' });
        }
        //check if the discrepancy exists
        const check = await db.query(
            'SELECT * FROM discrepancies WHERE discrepancy_id = $1',
            [discrepancyId]
        );

        if (check.rowCount == 0) {
            return res.status(404).json({ error: 'Discrepancy not found' });
        }

        if (check.rows[0].status === 'resolved') {
            return res.status(400).json({ error: 'Discrepancy is already resolved' });
        }

        //update discrepancy to resolved
        const result = await db.query(
            `UPDATE discrepancies SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP
            WHERE discrepancy_id = $1 RETURNING *`, [discrepancyId]
        );

        let targetItemStatus = 'available';
        if (resolutionType == 'lost' || resolutionType == 'damaged') {
            targetItemStatus = 'maintenance';
        }

        //update the item status using the target status
        await db.query(
            `UPDATE items
            SET status = $1
            WHERE item_id = (
                SELECT ri.item_id
                FROM reservation_items ri
                JOIN discrepancies d ON ri.reservation_item_id = d.reservation_item_id
                WHERE d.discrepancy_id = $2
            )`,
            [targetItemStatus, discrepancyId]
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
