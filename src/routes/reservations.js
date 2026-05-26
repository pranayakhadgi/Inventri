const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { reservationRules, returnRules, validate } = require('../middleware/validation');

// POST /reservations - Create new reservation
router.post('/', reservationRules, validate, async (req, res) => {
    const { organization_id, location_id, start_time, end_time, items } = req.body;

    try {
        await db.query('BEGIN');

        // Create reservation
        const resResult = await db.query(
            `INSERT INTO reservations (organization_id, location_id, start_time, end_time, status)
            VALUES ($1, $2, $3, $4, 'pending') 
            RETURNING *`,
            [organization_id, location_id, start_time, end_time]
        );

        const reservationId = resResult.rows[0].reservation_id;

        // Link items
        if (items && Array.isArray(items)) {
            for (const item of items) {
                await db.query(
                    `INSERT INTO reservation_items (reservation_id, item_id, quantity_requested, quantity_returned)
                    VALUES ($1, $2, $3, 0)`,
                    [reservationId, item.item_id, item.quantity_requested || 1]
                );
                await db.query(
                    `UPDATE items SET status = 'checked_out'
                    WHERE item_id = $1`,
                    [item.item_id]
                );
            }
        }

        await db.query('COMMIT');
        res.status(201).json(resResult.rows[0]);
    } catch (err) {
        await db.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    }
});

// GET /reservations/:id - Get reservation details with items and discrepancies
router.get('/:id', async (req, res) => {
    const reservationId = req.params.id;
    try {
        const reservationResult = await db.query(`
            SELECT 
                r.reservation_id,
                o.name as organization_name,
                o.organization_id,
                o.contact_email,
                l.location_id,
                l.name as location_name,
                l.type as location_type,
                r.start_time,
                r.end_time,
                r.status
            FROM reservations r
            JOIN organizations o ON r.organization_id = o.organization_id
            LEFT JOIN locations l ON r.location_id = l.location_id
            WHERE r.reservation_id = $1
        `, [reservationId]);

        if (reservationResult.rowCount === 0) {
            return res.status(404).json({ error: 'Reservation not found' });
        }

        const itemsResult = await db.query(`
            SELECT
                ri.reservation_item_id,
                i.item_id,
                i.name as item_name,
                i.category,
                ri.quantity_requested,
                ri.quantity_returned,
                d.discrepancy_id,
                d.type as discrepancy_type,
                d.status as discrepancy_status,
                d.notes as discrepancy_notes
            FROM reservation_items ri
            JOIN items i ON ri.item_id = i.item_id
            LEFT JOIN discrepancies d ON ri.reservation_item_id = d.reservation_item_id
            WHERE ri.reservation_id = $1
        `, [reservationId]);

        res.json({
            reservation: reservationResult.rows[0],
            items: itemsResult.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT r.reservation_id, o.name as organization_name,
             l.name as location_name, r.start_time, r.end_time, r.status,
             STRING_AGG(DISTINCT i.name, ', ') as item_names
             FROM reservations r
             JOIN organizations o ON r.organization_id = o.organization_id
             LEFT JOIN locations l ON r.location_id = l.location_id
             LEFT JOIN reservation_items ri ON r.reservation_id = ri.reservation_id
             LEFT JOIN items i ON ri.item_id = i.item_id
             GROUP BY r.reservation_id, o.name, l.name, r.start_time, r.end_time, r.status
             ORDER BY r.start_time DESC
            `);

        res.json({ count: result.rowCount, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /reservations/:id/return - Process return and check for discrepancies
router.post('/:id/return', returnRules, validate, async (req, res) => {
    const reservationId = req.params.id;
    const { items } = req.body;

    try {
        await db.query('BEGIN');
        const discrepancies = [];

        for (const item of items) {
            // Update returned quantity
            await db.query(
                `UPDATE reservation_items
                 SET quantity_returned = $1
                 WHERE reservation_item_id = $2`,
                [item.quantity_returned, item.reservation_item_id]
            );

            // Check for discrepancy
            const itemCheck = await db.query(
                `SELECT quantity_requested, quantity_returned
                 FROM reservation_items
                 WHERE reservation_item_id = $1`,
                [item.reservation_item_id]
            );

            const { quantity_requested, quantity_returned } = itemCheck.rows[0];

            if (quantity_returned < quantity_requested) {
                const discResult = await db.query(
                    `INSERT INTO discrepancies (reservation_item_id, type, status, notes)
                     VALUES ($1, 'ghost_return', 'flagged', $2)
                     RETURNING *`,
                    [item.reservation_item_id, `Expected ${quantity_requested}, returned ${quantity_returned}`]
                );
                discrepancies.push(discResult.rows[0]);
            }

            if (quantity_returned >= quantity_requested) {
                await db.query(
                    `UPDATE items SET status = 'available'
                    WHERE item_id = (
                        SELECT item_id FROM reservation_items WHERE reservation_item_id = $1
                    )`,
                    [item.reservation_item_id]
                );

                // reconcile and resolve any ghost discrepancies
                await db.query(
                    //what's the notes line doing here?
                    //i see that it adds onto notes if there is one, but what if there's no notes?
                    //
                    `UPDATE discrepancies SET status = 'resolved'
                    notes = COALESCE(notes, '') || ' (Auto-resolved: late full return)'
                    WHERE reservation_item_id = $1 AND status = 'flagged'`,
                    [item.reservation_item_id]
                );
            }
        }

        await db.query(
            `UPDATE reservations SET status = 'completed' WHERE reservation_id = $1`,
            [reservationId]
        );

        await db.query('COMMIT');

        res.json({
            message: 'Return processed',
            discrepancies: discrepancies.length > 0 ? discrepancies : null
        });
    } catch (err) {
        await db.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
