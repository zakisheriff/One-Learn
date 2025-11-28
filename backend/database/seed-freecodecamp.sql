-- Pre-populate database with FreeCodeCamp courses
-- Run this after the main schema.sql

-- Course 1: Python for Everybody
INSERT INTO courses (slug, title, description, thumbnail_url, syllabus, is_published) VALUES
('python-for-everybody', 
 'Python for Everybody', 
 'Learn Python programming from scratch with FreeCodeCamp. This comprehensive course covers Python basics, data structures, web scraping, databases, and more.',
 'https://i.ytimg.com/vi/8DvywoWv6fI/maxresdefault.jpg',
 'Complete Python programming course covering variables, loops, functions, data structures, file handling, databases, and web development basics.',
 true);

-- Course 2: JavaScript Algorithms and Data Structures
INSERT INTO courses (slug, title, description, thumbnail_url, syllabus, is_published) VALUES
('javascript-algorithms-data-structures',
 'JavaScript Algorithms and Data Structures',
 'Master JavaScript fundamentals, ES6, algorithms, and data structures with FreeCodeCamp. Build a strong foundation for web development.',
 'https://i.ytimg.com/vi/PkZNo7MFNFg/maxresdefault.jpg',
 'Comprehensive JavaScript course covering basics, ES6 features, functional programming, object-oriented programming, algorithms, and data structures.',
 true);

-- Course 3: Responsive Web Design
INSERT INTO courses (slug, title, description, thumbnail_url, syllabus, is_published) VALUES
('responsive-web-design',
 'Responsive Web Design (HTML, CSS, JavaScript)',
 'Learn to build responsive websites with HTML, CSS, and JavaScript. Master modern web design principles and best practices.',
 'https://i.ytimg.com/vi/mU6anWqZJcc/maxresdefault.jpg',
 'Complete web design course covering HTML5, CSS3, Flexbox, Grid, responsive design, accessibility, and modern JavaScript for interactive websites.',
 true);

-- Course 4: Full Stack Development
INSERT INTO courses (slug, title, description, thumbnail_url, syllabus, is_published) VALUES
('full-stack-development',
 'Full Stack Development',
 'Become a full stack developer with FreeCodeCamp. Learn frontend and backend technologies, databases, and deployment.',
 'https://i.ytimg.com/vi/nu_pCVPKzTk/maxresdefault.jpg',
 'End-to-end full stack development covering React, Node.js, Express, MongoDB, authentication, APIs, and deployment to production.',
 true);

-- Course 5: Java Programming
INSERT INTO courses (slug, title, description, thumbnail_url, syllabus, is_published) VALUES
('java-programming',
 'Java Programming',
 'Learn Java programming from beginner to advanced with FreeCodeCamp. Master object-oriented programming and build real applications.',
 'https://i.ytimg.com/vi/grEKMHGYyns/maxresdefault.jpg',
 'Comprehensive Java course covering syntax, OOP principles, data structures, algorithms, file I/O, multithreading, and application development.',
 true);

-- Add modules and lessons for Python for Everybody
DO $$
DECLARE
    python_course_id UUID;
    module1_id UUID;
BEGIN
    SELECT id INTO python_course_id FROM courses WHERE slug = 'python-for-everybody';
    
    -- Module 1: Python Basics
    INSERT INTO modules (course_id, title, description, order_index)
    VALUES (python_course_id, 'Python Basics', 'Introduction to Python programming fundamentals', 0)
    RETURNING id INTO module1_id;
    
    -- Lesson 1: Full Python Course (FreeCodeCamp)
    INSERT INTO lessons (module_id, title, description, youtube_url, duration_seconds, order_index)
    VALUES (
        module1_id,
        'Python for Everybody - Full Course',
        'Complete Python programming course from FreeCodeCamp covering all fundamentals',
        'https://www.youtube.com/watch?v=8DvywoWv6fI',
        46420, -- ~13 hours
        0
    );
END $$;

-- Add modules and lessons for JavaScript Algorithms
DO $$
DECLARE
    js_course_id UUID;
    module1_id UUID;
BEGIN
    SELECT id INTO js_course_id FROM courses WHERE slug = 'javascript-algorithms-data-structures';
    
    INSERT INTO modules (course_id, title, description, order_index)
    VALUES (js_course_id, 'JavaScript Fundamentals', 'Master JavaScript from basics to advanced', 0)
    RETURNING id INTO module1_id;
    
    INSERT INTO lessons (module_id, title, description, youtube_url, duration_seconds, order_index)
    VALUES (
        module1_id,
        'JavaScript Algorithms and Data Structures',
        'Complete JavaScript course from FreeCodeCamp',
        'https://www.youtube.com/watch?v=PkZNo7MFNFg',
        21600, -- ~6 hours
        0
    );
END $$;

-- Add modules and lessons for Responsive Web Design
DO $$
DECLARE
    web_course_id UUID;
    module1_id UUID;
BEGIN
    SELECT id INTO web_course_id FROM courses WHERE slug = 'responsive-web-design';
    
    INSERT INTO modules (course_id, title, description, order_index)
    VALUES (web_course_id, 'Web Design Fundamentals', 'HTML, CSS, and responsive design', 0)
    RETURNING id INTO module1_id;
    
    INSERT INTO lessons (module_id, title, description, youtube_url, duration_seconds, order_index)
    VALUES (
        module1_id,
        'Responsive Web Design - Full Course',
        'Complete web design course from FreeCodeCamp',
        'https://www.youtube.com/watch?v=mU6anWqZJcc',
        14400, -- ~4 hours
        0
    );
END $$;

-- Add modules and lessons for Full Stack Development
DO $$
DECLARE
    fullstack_course_id UUID;
    module1_id UUID;
BEGIN
    SELECT id INTO fullstack_course_id FROM courses WHERE slug = 'full-stack-development';
    
    INSERT INTO modules (course_id, title, description, order_index)
    VALUES (fullstack_course_id, 'Full Stack Fundamentals', 'Frontend, backend, and databases', 0)
    RETURNING id INTO module1_id;
    
    INSERT INTO lessons (module_id, title, description, youtube_url, duration_seconds, order_index)
    VALUES (
        module1_id,
        'Full Stack Development - Complete Course',
        'End-to-end full stack development from FreeCodeCamp',
        'https://www.youtube.com/watch?v=nu_pCVPKzTk',
        36000, -- ~10 hours
        0
    );
END $$;

-- Add modules and lessons for Java Programming
DO $$
DECLARE
    java_course_id UUID;
    module1_id UUID;
BEGIN
    SELECT id INTO java_course_id FROM courses WHERE slug = 'java-programming';
    
    INSERT INTO modules (course_id, title, description, order_index)
    VALUES (java_course_id, 'Java Fundamentals', 'Object-oriented programming with Java', 0)
    RETURNING id INTO module1_id;
    
    INSERT INTO lessons (module_id, title, description, youtube_url, duration_seconds, order_index)
    VALUES (
        module1_id,
        'Java Programming - Full Course',
        'Complete Java programming course from FreeCodeCamp',
        'https://www.youtube.com/watch?v=grEKMHGYyns',
        14400, -- ~4 hours
        0
    );
END $$;
