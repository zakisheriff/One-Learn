// Script to generate quizzes for all FreeCodeCamp courses
// Run with: node scripts/generate-all-quizzes.js

require('dotenv').config();
const { pool } = require('../database/connection');
const { generateQuiz } = require('../services/geminiService');

async function generateAllQuizzes() {
    try {
        console.log('🎯 Generating quizzes for all FreeCodeCamp courses...\n');

        // Get all published courses with their lessons
        const coursesResult = await pool.query(`
            SELECT 
                c.id,
                c.slug,
                c.title,
                json_agg(
                    json_build_object(
                        'lessonId', l.id,
                        'youtubeUrl', l.youtube_url
                    ) ORDER BY m.order_index, l.order_index
                ) as lessons
            FROM courses c
            JOIN modules m ON m.course_id = c.id
            JOIN lessons l ON l.module_id = m.id
            WHERE c.is_published = true
            GROUP BY c.id, c.slug, c.title
        `);

        for (const course of coursesResult.rows) {
            console.log(`\n📚 Processing: ${course.title}`);
            console.log(`   Slug: ${course.slug}`);

            // Check if quiz already exists
            const existingQuiz = await pool.query(
                'SELECT id FROM quizzes WHERE course_id = $1',
                [course.id]
            );

            if (existingQuiz.rows.length > 0) {
                console.log('   ⏭️  Quiz already exists, skipping...');
                continue;
            }

            // Extract YouTube URLs
            const videoUrls = course.lessons
                .map(l => l.youtubeUrl)
                .filter(url => url && url.includes('youtube'));

            if (videoUrls.length === 0) {
                console.log('   ⚠️  No YouTube URLs found, skipping...');
                continue;
            }

            console.log(`   📹 Found ${videoUrls.length} video(s)`);
            console.log(`   🤖 Generating quiz with Gemini AI...`);

            try {
                // Generate quiz using Gemini
                const quizData = await generateQuiz(videoUrls, course.title);

                // Save quiz to database
                await pool.query(
                    `INSERT INTO quizzes (course_id, quiz_data, passing_score, created_at)
                     VALUES ($1, $2, $3, NOW())`,
                    [course.id, JSON.stringify(quizData), 80]
                );

                console.log(`   ✅ Quiz generated successfully! (${quizData.questions.length} questions)`);

            } catch (error) {
                console.error(`   ❌ Failed to generate quiz: ${error.message}`);
            }

            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        console.log('\n✨ Quiz generation complete!\n');
        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

generateAllQuizzes();
