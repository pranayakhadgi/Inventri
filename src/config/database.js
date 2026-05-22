const { Pool } = require('pg');

const isDeployed = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

// Parse connection string to add Neon-specific parameters
let connectionString = process.env.DATABASE_URL;

if (connectionString && isDeployed) {
    // Add Neon-specific SSL parameters if not already present
    if (!connectionString.includes('sslmode=')) {
        connectionString += connectionString.includes('?') ? '&sslmode=require' : '?sslmode=require';
    }
}

const pool = new Pool({
    connectionString: connectionString,
    ssl: isDeployed && connectionString
        ? {
            rejectUnauthorized: true,
            // Neon requires these SSL settings
            sslmode: 'require'
        }
        : false,
    // Connection pooling for serverless environments
    max: 1, // Single connection per function instance
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    connectionTimeoutMillis: 10000, // Timeout after 10s
});

// Log database configuration (without exposing sensitive data)
if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. API routes that use the database will return 500.');
} else {
    console.log('Database configured for', isDeployed ? 'production (Vercel)' : 'development');
}

module.exports = {
    query: async (text, params) => {
        if (!process.env.DATABASE_URL) {
            throw new Error(
                'DATABASE_URL is not configured. Add it in Vercel Project Settings → Environment Variables.'
            );
        }
        
        try {
            const result = await pool.query(text, params);
            return result;
        } catch (err) {
            console.error('Database query error:', err.message);
            throw err;
        }
    },
    // Export pool for health checks
    pool
};

