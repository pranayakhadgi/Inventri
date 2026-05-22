 -- SEED DATA: EQUIPMENT INVENTORY SYSTEM
 -- Scenario: We're ensuring a smooth transaction between equipement rentals with exception handling

 -- 1. ORGANIZATIONS
INSERT INTO organizations (name, type, contact_email, status) VALUES 
('Namaste Nepal 2025/26', 'club', 'namaste@truman.edu', 'active'),
('South Asian Student Union', 'club', 'sasu@truman.edu', 'active'),
('Association for Computering Machinery', 'chapter', 'acm@truman.edu', 'active');

 -- 2. LOCATIONS
INSERT INTO locations (name, type, address) VALUES
('Georgian Room A,B and C', 'on_campus', 'SUB 2nd Floor'),
('SUB Down Under', 'on_campus', 'SUB 1st Floor'),
('Baptist Student Union', 'off_campus', '100 N Avenue, Kirksville');

 -- 3. ITEMS (linked to locations)
INSERT INTO items (name, category, current_location_id, status, image_url) VALUES
('Shure SM58 Microphone', 'Audio/Visual', 1, 'available', 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=300&fit=crop'),
('6-Foot Folding Table', 'Furniture', 1, 'available', 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=300&fit=crop'),
('Epson Projector', 'Audio/Visual', 2, 'available', 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=300&fit=crop'),
('Extension Cord (50ft)', 'Utilities', 1, 'checked_out', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'),
('Folding Chairs (Set of 10)', 'Furniture', 3, 'available', 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400&h=300&fit=crop');

 -- 4. RESERVATIONS (Scenario: Namaste Nepal completed the reservations)
INSERT INTO reservations (organization_id, location_id, start_time, end_time, status) VALUES
(1, 1, '2026-02-08 14:32:00', '2026-02-09 13:00:00', 'completed');
 -- (Scenario: SASU had a ghost return)
INSERT INTO reservations (organization_id, location_id, start_time, end_time, status) VALUES
(2, 2, '2026-02-01 10:04:00', '2026-02-01 14:02:00', 'completed');
 -- (Scenario: ACM has a reservation items taken pending future)
INSERT INTO reservations (organization_id, location_id, start_time, end_time, status) VALUES
(3, 1, '2026-01-23 09:02:03', '2026-01-25 00:00:00', 'pending');

 -- 5. RESERVATION_ITEMS
 -- (looking at the first scenario, Namaste Nepal returned everything)
INSERT INTO reservation_items (reservation_id, item_id, quantity_requested, quantity_returned) VALUES
(1, 2, 2, 2), (1, 5, 1, 1); -- 2 tables and 10 chairs returned
 -- (second scenario, SASU had a ghost return)
 -- (Requested: 1 mic, 1 projector, 1 extension cord. Returned: 1 mic, 1 project, (EXTENSION CORD MISSING!!)
INSERT INTO reservation_items(reservation_id, item_id, quantity_requested, quantity_returned) VALUES
(2, 1, 1, 1), -- Microphone Returned
(2, 3, 1, 1), -- Projector Returned
(2, 4, 1, 0); -- Extersion cord remains unreturned
 -- (third scenario, reservation remains pending...)


 -- 6. DISCREPANCIES (we're flagging the ghost return!!)
INSERT INTO discrepancies( reservation_item_id, type, reported_at, status, notes) VALUES
(5, 'ghost_return', '2026-02-01 15:04:00', 'flagged', 'Borrower claims extension cord returned to SUB Down Under, but no scan record. Item currently marked checked_out in inventory.');

