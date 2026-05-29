const pg = require('pg');
require('dotenv').config();

async function main() {
    const client = new pg.Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    await client.connect();
    try {
        console.log("--- Tables ---");
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log(tables.rows.map(r => r.table_name));

        console.log("--- Columns in reservations ---");
        const cols = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'reservations'
        `);
        console.log(cols.rows);

        console.log("--- Run Migrations ---");
        const migrations = await client.query(`
            SELECT name, run_on FROM pgmigrations ORDER BY run_on DESC
        `);
        console.log(migrations.rows);
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
main();
