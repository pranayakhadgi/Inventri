const fs = require('fs');
const path = require('path');
const db = require('../src/config/database');

async function seedDatabase() {
    try {
        const sqlPath = path.join(__dirname, '001_demo_data.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('Seeding database with demo data...');
        await db.query(sql);
        console.log('Database seeded successfully!');
    } catch (err) {
        console.error('Error seeding database:', err.message);
        // Sometimes it fails if already seeded, so we don't exit with error
    } finally {
        // End the pool so the script can exit
        db.pool.end();
    }
}

seedDatabase();
