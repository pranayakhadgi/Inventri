const { Pool } = require('pg');

const pool = new Pool({
    connectionString:
        process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false
});

//error handling within startup connection (test)
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Database connected at:', res.rows[0].now);
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};

