exports.up = (pgm) => {
    pgm.addColumns('organizations', {
        icon: {
            type: 'varchar(50)',
            default: '🏢'
        }
    });
};

exports.down = (pgm) => {
    pgm.dropColumns('organizations', ['icon']);
};
