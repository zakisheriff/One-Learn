const { pool } = require('../database/connection');
const AtomService = require('../services/atomService');

const debugCompletion = async () => {
    try {
        console.log('🔍 Debugging Module Completion...');

        // 1. Get a user
        const userRes = await pool.query('SELECT id FROM users LIMIT 1');
        if (userRes.rows.length === 0) {
            console.log('No users found.');
            process.exit(0);
        }
        const userId = userRes.rows[0].id;

        // 2. Get a module
        const moduleRes = await pool.query('SELECT id FROM atom_modules LIMIT 1');
        if (moduleRes.rows.length === 0) {
            console.log('No modules found.');
            process.exit(0);
        }
        const moduleId = moduleRes.rows[0].id;

        console.log(`Attempting to complete module ${moduleId} for user ${userId}...`);

        const result = await AtomService.completeModule(userId, moduleId, 100);
        console.log('✅ Success:', result);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
};

debugCompletion();
