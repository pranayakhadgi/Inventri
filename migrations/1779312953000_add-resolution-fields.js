exports.up = (pgm) => {
    //the discrepancies table included field for resolution.
    pgm.addColumns('discrepancies', {
        resolution_type: { type: 'varchar(50)' },//type of resolution
        resolution_notes: { type: 'text' },//self explainatory
    });
};

exports.down = (pgm) => {
    pgm.dropColumns('discrepancies', [
        'resolution_type',
        'resolution_notes'
    ]
    );
};
