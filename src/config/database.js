const { Pool } = require('pg');

const isDeployed = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isDeployed && process.env.DATABASE_URL
        ? { rejectUnauthorized: false }
        : false
});

//error handling within startup connection (test)
if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. API routes that use the database will return 500.');
} else {
    pool.query('SELECT NOW()', (err, res) => {
        if (err) {
            console.error('Database connection failed:', err.message);
        } else {
            console.log('Database connected at:', res.rows[0].now);
        }
    });
}

module.exports = {
    query: (text, params) => {
        if (!process.env.DATABASE_URL) {
            return Promise.reject(new Error(
                'DATABASE_URL is not configured. Add it in Vercel Project Settings → Environment Variables.'
            ));
        }
        return pool.query(text, params);
    },
};

