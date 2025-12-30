import fs from 'fs';
import { query } from './lib/db.js';

// Simple .env parser
try {
    let envPath = '.env.local';
    if (!fs.existsSync(envPath)) {
        envPath = '.env';
    }

    if (fs.existsSync(envPath)) {
        console.log(`Loading env from ${envPath}`);
        const envConfig = fs.readFileSync(envPath, 'utf8');
        for (const line of envConfig.split('\n')) {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, '');
                process.env[key] = value;
            }
        }
    } else {
        console.log('No .env file found');
    }
} catch (e) {
    console.log(e);
}

async function checkSchema() {
    try {
        const res = await query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'courses'");
        console.log('Columns in courses:', JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkSchema();
