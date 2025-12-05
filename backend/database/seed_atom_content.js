const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { pool } = require('./connection');

const seedData = async () => {
    const client = await pool.connect();
    try {
        console.log('🌱 Seeding Atom Path Content...');
        await client.query('BEGIN');

        // --- 1. Python Foundations Track ---
        console.log('Creating Python Track...');
        const pythonTrackRes = await client.query(`
            INSERT INTO atom_tracks (title, slug, description, difficulty, icon_type, is_published)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `, ['Python Foundations', 'python-foundations', 'Master the basics of Python programming.', 'beginner', 'python', true]);
        const pythonTrackId = pythonTrackRes.rows[0].id;

        // Module 1: Python Basics (Reading)
        const m1Res = await client.query(`
            INSERT INTO atom_modules (track_id, title, type, order_index, xp_reward)
            VALUES ($1, $2, $3, $4, $5) RETURNING id
        `, [pythonTrackId, 'Introduction to Python', 'reading', 1, 50]);

        await client.query(`
            INSERT INTO atom_content_reading (module_id, content_markdown)
            VALUES ($1, $2)
        `, [m1Res.rows[0].id, '# Welcome to Python\n\nPython is a high-level, interpreted programming language known for its readability.\n\n```python\nprint("Hello, World!")\n```']);

        // Module 2: Variables & Types (Coding)
        const m2Res = await client.query(`
            INSERT INTO atom_modules (track_id, title, type, order_index, xp_reward)
            VALUES ($1, $2, $3, $4, $5) RETURNING id
        `, [pythonTrackId, 'Variables & Data Types', 'coding', 2, 100]);

        await client.query(`
            INSERT INTO atom_problems (module_id, title, description_markdown, starter_code, solution_code, test_cases, language)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
            m2Res.rows[0].id,
            'Create a Variable',
            'Create a variable named `greeting` and assign it the value "Hello Atom". Print the variable.',
            '# Write your code here\n',
            'greeting = "Hello Atom"\nprint(greeting)',
            JSON.stringify([{ input: "", expected_output: "Hello Atom" }]),
            'python'
        ]);

        // Module 3: Control Flow (Quiz)
        const m3Res = await client.query(`
            INSERT INTO atom_modules (track_id, title, type, order_index, xp_reward)
            VALUES ($1, $2, $3, $4, $5) RETURNING id
        `, [pythonTrackId, 'Control Flow Quiz', 'quiz', 3, 75]);

        await client.query(`
            INSERT INTO atom_quizzes (module_id, questions, passing_score, time_limit_seconds)
            VALUES ($1, $2, $3, $4)
        `, [
            m3Res.rows[0].id,
            JSON.stringify([
                {
                    question: "What is the output of `if True: print('Yes')`?",
                    options: ["Yes", "No", "Error", "Nothing"],
                    correct_index: 0
                },
                {
                    question: "Which keyword is used for loops?",
                    options: ["loop", "for", "repeat", "iterate"],
                    correct_index: 1
                }
            ]),
            70,
            300
        ]);

        // Module 4: Final Interview (Interview)
        const m4Res = await client.query(`
            INSERT INTO atom_modules (track_id, title, type, order_index, xp_reward)
            VALUES ($1, $2, $3, $4, $5) RETURNING id
        `, [pythonTrackId, 'Python Concept Check', 'interview', 4, 150]);

        await client.query(`
            INSERT INTO atom_interviews (module_id, questions)
            VALUES ($1, $2)
        `, [
            m4Res.rows[0].id,
            JSON.stringify([
                { question: "Explain the difference between a list and a tuple in Python.", keywords: ["mutable", "immutable"] }
            ])
        ]);


        // --- 2. Data Science with Pandas Track ---
        console.log('Creating Data Science Track...');
        const dsTrackRes = await client.query(`
            INSERT INTO atom_tracks (title, slug, description, difficulty, icon_type, is_published)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `, ['Data Science with Pandas', 'data-science-pandas', 'Learn data manipulation with Pandas.', 'intermediate', 'data', true]);
        const dsTrackId = dsTrackRes.rows[0].id;

        // Module 1: Pandas Intro (Reading)
        const dsM1Res = await client.query(`
            INSERT INTO atom_modules (track_id, title, type, order_index, xp_reward)
            VALUES ($1, $2, $3, $4, $5) RETURNING id
        `, [dsTrackId, 'Intro to Pandas', 'reading', 1, 50]);

        await client.query(`
            INSERT INTO atom_content_reading (module_id, content_markdown)
            VALUES ($1, $2)
        `, [dsM1Res.rows[0].id, '# Pandas Library\n\nPandas is a fast, powerful, flexible and easy to use open source data analysis and manipulation tool.']);


        await client.query('COMMIT');
        console.log('✅ Seeding Complete!');
        process.exit(0);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Seeding Failed:', error);
        process.exit(1);
    } finally {
        client.release();
    }
};

seedData();
