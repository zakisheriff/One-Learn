const { Pool } = require('pg');

// Vercel/Supabase Connection String
const DATABASE_URL = 'postgres://postgres.auwvfnzwxxfnrpvsqvlv:Zakizaki$5@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres';

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const atomData = [
    {
        title: "Frontend Transformation",
        slug: "frontend-transformation",
        description: "Master Modern React, CSS Architecture, and State Management.",
        difficulty: "Intermediate",
        is_published: true,
        modules: [
            { title: "React Core Concepts", type: "reading", order_index: 0, xp_reward: 100 },
            { title: "Advanced Hooks", type: "reading", order_index: 1, xp_reward: 150 },
            { title: "State Management with Redux", type: "coding", order_index: 2, xp_reward: 300 },
            { title: "CSS-in-JS Mastery", type: "quiz", order_index: 3, xp_reward: 200 }
        ]
    },
    {
        title: "Backend Architecture",
        slug: "backend-architecture",
        description: "Build scalable APIs with Node.js, Express, and PostgreSQL.",
        difficulty: "Advanced",
        is_published: true,
        modules: [
            { title: "Node.js Internals", type: "reading", order_index: 0, xp_reward: 150 },
            { title: "Express Middleware", type: "coding", order_index: 1, xp_reward: 250 },
            { title: "Database Design", type: "quiz", order_index: 2, xp_reward: 200 }
        ]
    }
];

async function seedAtom() {
    try {
        console.log('🌱 Seeding Atom Path...');

        // Ensure schema is up to date
        await pool.query('ALTER TABLE atom_tracks ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50) DEFAULT \'Beginner\'');

        for (const track of atomData) {
            // Check if track exists
            const existingTrack = await pool.query('SELECT id FROM atom_tracks WHERE slug = $1', [track.slug]);

            let trackId;
            if (existingTrack.rows.length === 0) {
                const res = await pool.query(
                    `INSERT INTO atom_tracks (title, slug, description, difficulty, is_published)
                     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                    [track.title, track.slug, track.description, track.difficulty, track.is_published]
                );
                trackId = res.rows[0].id;
                console.log(`✅ Created Track: ${track.title}`);
            } else {
                trackId = existingTrack.rows[0].id;
                console.log(`ℹ️ Track exists: ${track.title}`);
            }

            // Create modules
            for (const module of track.modules) {
                const existingModule = await pool.query(
                    'SELECT id FROM atom_modules WHERE track_id = $1 AND title = $2',
                    [trackId, module.title]
                );

                if (existingModule.rows.length === 0) {
                    await pool.query(
                        `INSERT INTO atom_modules (track_id, title, type, order_index, xp_reward)
                          VALUES ($1, $2, $3, $4, $5)`,
                        [trackId, module.title, module.type, module.order_index, module.xp_reward]
                    );
                    console.log(`   + Added Module: ${module.title}`);
                }
            }
        }

        console.log('✨ Atom Path Seeded Successfully!');
    } catch (err) {
        console.error('❌ Atom Seed Error:', err);
    } finally {
        await pool.end();
    }
}

seedAtom();
