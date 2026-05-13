exports.up = (pgm) => {
  //organizations table
  //note that this is just a sample structure that defines a structural data set to be migrated into the gre platform
  pgm.createTable('organizations', {
    organization_id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(100)', notNull: true },
    type: { type: 'varchar(50)', notNull: true }, //club, department, university
    contact_email: { type: 'varchar(100)' },
    status: { type: 'varchar(20)', default: 'active' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
  });

  //locations table
  pgm.createTable('locations', {
    location_id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(100)', notNull: true },
    type: { type: 'varchar(20)', notNull: true }, // on_campus, off_campus
    address: { type: 'text' }
  });

  //items table
  pgm.createTable('items', {
    item_id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(100)', notNull: true },
    category: { type: 'varchar(50)' },
    current_location_id: { type: 'integer', references: 'locations(location_id)' },
    status: { type: 'varchar(20)', default: 'available' } //available, but could also be reserved, checked_out, maintenance
  });

  //reservations table
  pgm.createTable('reservations', {
    reservation_id: { type: 'serial', primaryKey: true },
    organization_id: { type: 'integer', notNull: true, references: 'organizations(organization_id)' },
    location_id: { type: 'integer', references: 'locations(location_id)' },
    start_time: { type: 'timestamp', notNull: true },
    end_time: { type: 'timestamp', notNull: true },
    status: { type: 'varchar(20)', default: 'pending' } //pending, active, completed, cancelled
  });

  //junction table: reservation_items
  pgm.createTable('reservation_items', {
    reservation_item_id: { type: 'serial', primaryKey: true },
    reservation_id: { type: 'integer', notNull: true, references: 'reservations(reservation_id)', onDelete: 'CASCADE' },
    item_id: { type: 'integer', notNull: true, references: 'items(item_id)' },
    quantity_requested: { type: 'integer', notNull: true, default: 1 },
    quantity_returned: { type: 'integer', default: 0 }
  });

  //discrepancies table
  pgm.createTable('discrepancies', {
    discrepancy_id: { type: 'serial', primaryKey: true },
    reservation_item_id: { type: 'integer', notNull: true, references: 'reservation_items(reservation_item_id)' },
    type: { type: 'varchar(50)', notNull: true },
    reported_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    resolved_at: { type: 'timestamp' },
    status: { type: 'varchar(20)', default: 'flagged' }, //flagged, under_review, resolved, escalated
    notes: { type: 'text' }
  });

};

exports.down = (pgm) => {
  //the reversed drop in is intentional (says it's respecting the foreign keys??)
  pgm.dropTable('discrepancies');
  pgm.dropTable('reservation_items');
  pgm.dropTable('reservations');
  pgm.dropTable('items');
  pgm.dropTable('locations');
  pgm.dropTable('organizations');
};
