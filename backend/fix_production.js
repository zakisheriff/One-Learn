require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const COURSES = [
    {
        title: 'Python for Everybody',
        slug: 'python-for-everybody',
        description: 'Learn Python programming from scratch with FreeCodeCamp.',
        thumbnail: 'https://i.ytimg.com/vi/8DvywoWv6fI/hqdefault.jpg',
        videoId: '8DvywoWv6fI',
        category: 'Technology',
        duration: '13h',
        likes: '2.5M',
        views: '45M'
    },
    {
        title: 'JavaScript Algorithms and Data Structures',
        slug: 'javascript-algorithms-data-structures',
        description: 'Master JavaScript fundamentals, ES6, algorithms, and data structures.',
        thumbnail: 'https://i.ytimg.com/vi/PkZNo7MFNFg/hqdefault.jpg',
        videoId: 'PkZNo7MFNFg',
        category: 'Technology',
        duration: '3h',
        likes: '800K',
        views: '15M'
    },
    {
        title: 'Responsive Web Design',
        slug: 'responsive-web-design',
        description: 'Learn to build responsive websites with HTML, CSS, and JavaScript.',
        thumbnail: 'https://i.ytimg.com/vi/mU6anWqZJcc/hqdefault.jpg',
        videoId: 'mU6anWqZJcc',
        category: 'Technology',
        duration: '4h',
        likes: '500K',
        views: '12M'
    },
    {
        title: 'Full Stack Development',
        slug: 'full-stack-development',
        description: 'Become a full stack developer with FreeCodeCamp.',
        thumbnail: 'https://i.ytimg.com/vi/nu_pCVPKzTk/hqdefault.jpg',
        videoId: 'nu_pCVPKzTk',
        category: 'Technology',
        duration: '10h',
        likes: '1.1M',
        views: '22M'
    },
    {
        title: 'Java Programming',
        slug: 'java-programming',
        description: 'Learn Java programming from beginner to advanced.',
        thumbnail: 'https://i.ytimg.com/vi/grEKMHGYyns/hqdefault.jpg',
        videoId: 'grEKMHGYyns',
        category: 'Technology',
        duration: '4h',
        likes: '600K',
        views: '14M'
    },
    // Bro Code
    {
        title: 'Python Full Course for free',
        slug: 'python-full-course-bro-code',
        description: 'Learn Python programming with Bro Code.',
        thumbnail: 'https://img.youtube.com/vi/IXqmoyIpZsg/hqdefault.jpg',
        videoId: 'IXqmoyIpZsg',
        category: 'Technology',
        duration: '12h',
        likes: '300K',
        views: '7.1M'
    },
    {
        title: 'Java Full Course for free',
        slug: 'java-full-course-bro-code',
        description: 'A complete Java course for beginners.',
        thumbnail: 'https://img.youtube.com/vi/xk4_1vDrzzo/hqdefault.jpg',
        videoId: 'xk4_1vDrzzo',
        category: 'Technology',
        duration: '12h',
        likes: '150K',
        views: '2.4M'
    },
    {
        title: 'C Programming Full Course',
        slug: 'c-programming-full-course-bro-code',
        description: 'Master C programming with this full course.',
        thumbnail: 'https://img.youtube.com/vi/87SH2Cn0s9A/hqdefault.jpg',
        videoId: '87SH2Cn0s9A',
        category: 'Technology',
        duration: '4h',
        likes: '5K',
        views: '958K'
    },
    {
        title: 'HTML & CSS Full Course',
        slug: 'html-css-full-course-bro-code',
        description: 'Learn to build websites with HTML and CSS.',
        thumbnail: 'https://img.youtube.com/vi/HGTJBPNC-Gw/hqdefault.jpg',
        videoId: 'HGTJBPNC-Gw',
        category: 'Technology',
        duration: '4h',
        likes: '200K',
        views: '4.6M'
    },
    {
        title: 'JavaScript Full Course',
        slug: 'javascript-full-course-bro-code-2',
        description: 'A comprehensive JavaScript course for beginners.',
        thumbnail: 'https://img.youtube.com/vi/8dWL3wF_ryQ/hqdefault.jpg',
        videoId: '8dWL3wF_ryQ',
        category: 'Technology',
        duration: '8h',
        likes: '180K',
        views: '4.3M'
    },
    {
        title: 'React Full Course',
        slug: 'react-full-course-bro-code',
        description: 'Learn React.js from scratch.',
        thumbnail: 'https://img.youtube.com/vi/CgkZ7MvWUAA/hqdefault.jpg',
        videoId: 'CgkZ7MvWUAA',
        category: 'Technology',
        duration: '4h',
        likes: '120K',
        views: '3.2M'
    },
    {
        title: 'C# Full Course',
        slug: 'csharp-full-course-bro-code',
        description: 'Learn C# programming for game development.',
        thumbnail: 'https://img.youtube.com/vi/46DWl9VozBs/hqdefault.jpg',
        videoId: '46DWl9VozBs',
        category: 'Technology',
        duration: '4h',
        likes: '100K',
        views: '2.2M'
    },
    // Mosh
    {
        title: 'Python for Beginners (Mosh)',
        slug: 'python-for-beginners-mosh',
        description: 'Mosh Hamedani\'s famous Python course.',
        thumbnail: 'https://img.youtube.com/vi/_uQrJ0TkZlc/hqdefault.jpg',
        videoId: '_uQrJ0TkZlc',
        category: 'Technology',
        duration: '6h',
        likes: '800K',
        views: '35M'
    },
    {
        title: 'JavaScript for Beginners (Mosh)',
        slug: 'javascript-for-beginners-mosh',
        description: 'Learn JavaScript in 1 hour.',
        thumbnail: 'https://img.youtube.com/vi/W6NZfCO5SIk/hqdefault.jpg',
        videoId: 'W6NZfCO5SIk',
        category: 'Technology',
        duration: '1h',
        likes: '500K',
        views: '12M'
    },
    {
        title: 'C++ Tutorial for Beginners (Mosh)',
        slug: 'cpp-tutorial-mosh',
        description: 'Learn C++ programming with Mosh.',
        thumbnail: 'https://img.youtube.com/vi/ZzaPdXTrSb8/hqdefault.jpg',
        videoId: 'ZzaPdXTrSb8',
        category: 'Technology',
        duration: '1h',
        likes: '200K',
        views: '5M'
    },
    {
        title: 'Java Tutorial for Beginners (Mosh)',
        slug: 'java-tutorial-mosh',
        description: 'Learn Java with Mosh.',
        thumbnail: 'https://img.youtube.com/vi/eIrMbAQW348/hqdefault.jpg',
        videoId: 'eIrMbAQW348',
        category: 'Technology',
        duration: '2h',
        likes: '300K',
        views: '8M'
    },
    {
        title: 'MySQL Tutorial for Beginners (Mosh)',
        slug: 'mysql-tutorial-mosh',
        description: 'Learn SQL and database management with MySQL.',
        thumbnail: 'https://img.youtube.com/vi/7S_tz1z_5bA/hqdefault.jpg',
        videoId: '7S_tz1z_5bA',
        category: 'Technology',
        duration: '3h',
        likes: '400K',
        views: '10M'
    }
];

async function fixProduction() {
    try {
        console.log('🔌 Connecting to database...');

        // 1. Clear existing data
        console.log('🗑️  Clearing all courses...');
        await pool.query('DELETE FROM courses');

        // 2. Insert fresh data
        console.log('🌱 Inserting fresh course data...');

        for (const course of COURSES) {
            console.log(`   - Adding: ${course.title}`);

            const courseRes = await pool.query(
                `INSERT INTO courses (slug, title, description, thumbnail_url, syllabus, is_published, estimated_hours, likes, views) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
                 RETURNING id`,
                [
                    course.slug,
                    course.title,
                    course.description,
                    course.thumbnail,
                    `Module 1: Introduction\nModule 2: Core Concepts\nModule 3: Advanced Topics`,
                    true,
                    course.duration,
                    course.likes,
                    course.views
                ]
            );

            const courseId = courseRes.rows[0].id;

            // Insert Module
            const moduleRes = await pool.query(
                `INSERT INTO modules (course_id, title, description, order_index) 
                 VALUES ($1, $2, $3, $4) 
                 RETURNING id`,
                [courseId, 'Course Content', 'Main course modules', 0]
            );

            const moduleId = moduleRes.rows[0].id;

            // Insert Lesson
            await pool.query(
                `INSERT INTO lessons (module_id, title, description, youtube_url, duration_seconds, order_index) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    moduleId,
                    course.title,
                    'Full Course Video',
                    `https://www.youtube.com/watch?v=${course.videoId}`,
                    14400,
                    0
                ]
            );
        }

        console.log('✅ Successfully fixed production database!');
        console.log(`   Added ${COURSES.length} courses with correct thumbnails.`);

    } catch (err) {
        console.error('❌ Error fixing database:', err);
    } finally {
        await pool.end();
    }
}

fixProduction();
