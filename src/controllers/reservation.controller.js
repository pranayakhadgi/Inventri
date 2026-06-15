import { sql } from 'slonik';
import { pool } from '../db/pool.js';
import { mapPostgresError } from '../middleware/error.mapper.js';

export const createReservation = async (req, res) => {
    const { itemId, startTime, endTime, organization } = req.body;
    const start = Temporal.Instant.from(startTime);
    const end = Temporal.Instant.from(endTime);
    const startIso = start.toString();
    const endIso = end.toString();

    try {
        const reservation = await pool.transaction(async (connection) => {
            const item = await connection.maybeOne(sql`
                SELECT id FROM items WHERE id = ${itemId}
            `);

            if (!item) {
                const err = new Error('Item not found');
                err.code = 'ITEM_NOT_FOUND';
                throw err;
            }

            const inserted = await connection.one(sql`
                INSERT INTO reservations (item_id, organization, reserved_range)
                VALUES (
                ${itemId},
                ${organization},
                tstzrange(${startIso}::timestamptz, ${endIso}::timestamptz, '[)')
                )
                RETURNING
                    id,
                    item_id,
                    organization,
                    lower(reserved_range) AS start_time,
                    upper(reserved_range) AS end_time,
                    created_at
                `);

            return inserted;
        });

        return res.status(201).json({
            success: true,
            data: { reservation },
        });
    } catch (err) {
        if (err.code === 'ITEM_NOT_FOUND') {
            return res.status(404).json({
                error: 'ITEM_NOT_FOUND',
                message: `Item with id ${itemId} does not exist.`,
            });
        }

        if (err.code) {
            const { status, body } = mapPostgresError(err);

            if (err.code === '23P01') {
                try {
                    const conflicts = await pool.any(sql`
                        SELECT
                            id,
                            organization,
                            lower(reserved_range) AS start_time,
                            upper(reserved_range) AS end_time
                            FROM reservations WHERE item_id = ${itemId}
                            AND reserved_range && tstzrange(${startIso}::timestamptz, 
                            ${endIso}::timestamptz, '[)')
                            ORDER BY lower(reserved_range) ASC LIMIT 5
                        `);
                    body.conflicttingReservations = conflicts;
                    body.requestedRange = { start: startIso, end: endIso };
                } catch (lookupErr) {
                    console.error('Conflict lookup failed: ', lookupErr);
                }
            }
            return res.status(status).json(body);
        }

        console.error('Reservation creation failed: ', err);
        return res.status(500).json({
            error: 'INTERNAL_SERVER_ERROR',
            message: process.env.NODE_ENV === 'production'
                ? 'An unexpected error occured.' : err.message,
        });
    }
};

export const checkAvailability = async (req, res) => {
    const itemId = parseInt(req.params.id, 10);
    const { start, end } = req.query;
    const startIso = Temporal.Instant.from(start).toString();
    const endIso = Temporal.Instant.from(end).toString();

    try {
        const result = await pool.one(sql`
            SELECT is_item_available(${itemId}, ${startIso}::timestamptz, 
            ${endIso}::timestamptz) AS available
            `);

        return res.json({
            itemId,
            requestedRange: { start: startIso, end: endIso },
            available: result.available,
        });
    } catch (err) {
        console.error('Availability check failed: ', err);
        return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR ' });
    }
};