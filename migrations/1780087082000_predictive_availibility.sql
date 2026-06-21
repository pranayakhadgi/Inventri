CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE OR REPLACE FUNCTION is_item_available(
    p_item_id INTEGER,
    p_start TIMESTAMPTZ,
    p_end TIMESTAMPTZ
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT EXISTS(
        SELECT 1
        FROM reservations r
        JOIN reservation_items ri ON r.reservation_id = ri.reservation_id
        WHERE ri.item_id = p_item_id
         AND r.status IN ('pending', 'active')
         AND r.start_time < p_end
         AND r.end_time > p_start
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
        JOIN reservation_items ri ON r.reservation_id = ri.reservation_id
        WHERE ri.item_id = i.item_id
         AND r.status IN ('pending', 'active')
         AND r.start_time <= NOW()
         AND r.end_time >= NOW()
    ) AS is_available_now
FROM items i;