const express = require('express');
const router = express.Router();
const db = require('../config/database');
// removed stray node-pg-migrate import

// GET /items - lists all equipement with locations
router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
             i.item_id,
             i.name,
             i.category,
             i.status,
             i.image_url,
             l.name as location_name,
             l.type as location_type
            FROM items i
            LEFT JOIN locations l ON i.current_location_id = l.location_id
            ORDER BY i.name
        `);

        res.json({
            count: result.rowCount,
            data: result.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    const { name, category, location_id, status, image_url } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Item name is required' });
    }

    try {
        const result = await db.query(
            `INSERT INTO items
            (name, category, current_location_id, status, image_url)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [name, category || null, location_id || null, status || 'available', image_url || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /items/:id - deletes an item safely
router.delete('/:id', async (req, res) => {
    const itemId = parseInt(req.params.id);

    if (isNaN(itemId)) {
        return res.status(400).json({ error: 'Invalid item ID' });
    }

    try {
        // 1. Check if the item is currently linked to any active or pending reservations
        const activeResCheck = await db.query(`
            SELECT r.reservation_id, r.status, o.name as org_name
            FROM reservation_items ri
            JOIN reservations r ON ri.reservation_id = r.reservation_id
            JOIN organizations o ON r.organization_id = o.organization_id
            WHERE ri.item_id = $1 AND r.status IN ('pending', 'active')
        `, [itemId]);

        if (activeResCheck.rowCount > 0) {
            const orgs = [...new Set(activeResCheck.rows.map(row => row.org_name))].join(', ');
            return res.status(400).json({
                error: `Cannot delete item. It is currently reserved or checked out by: ${orgs}.`
            });
        }

        // 2. Perform a safe transactional deletion of historical logs and the item itself
        await db.query('BEGIN');

        // Delete associated discrepancies
        await db.query(`
            DELETE FROM discrepancies
            WHERE reservation_item_id IN (
                SELECT reservation_item_id FROM reservation_items WHERE item_id = $1
            )
        `, [itemId]);

        // Delete associated reservation items (historical only)
        await db.query(`
            DELETE FROM reservation_items WHERE item_id = $1
        `, [itemId]);

        // Delete the item itself
        const deleteResult = await db.query(`
            DELETE FROM items WHERE item_id = $1 RETURNING *
        `, [itemId]);

        await db.query('COMMIT');

        if (deleteResult.rowCount === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json({ message: 'Item successfully deleted', deletedItem: deleteResult.rows[0] });
    } catch (err) {
        await db.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
