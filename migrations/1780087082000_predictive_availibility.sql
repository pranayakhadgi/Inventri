CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES items (item_id) ON DELETE CASCADE,
    organization VARCHAR(255) NOT NULL,
    reserved_range TSTZRANGE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT no_overlapping_reservations EXCLUDE USING gist (
        item_id
        WITH
            =,
            reserved_range
        WITH
            &&
    ),
    CONSTRAINT valid_time_range CHECK (
        lower(reserved_range) < upper(reserved_range)
    )
);

CREATE OR REPLACE FUNCTION is_item_available(
    p_item_id INTEGER,
    p_start TIMESTAMPTZ,
    p_end TIMESTAMPTZ
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT EXISTS(
        SELECT 1
        FROM reservations
        WHERE item_id = p_item_id
         AND reserved_range && tstzrange(p_start, p_end, '[)')
    );
END
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE VIEW
items_with_current_availability AS
SELECT
    i.*,
    NOT EXISTS (
        SELECT 1
        FROM reservations r 
        WHERE r.item_id = i.id
         AND r.reserved_range @> NOW()
    ) AS is_available_now
FROM items i;