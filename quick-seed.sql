-- Quick Seed: Add Sample Courses to Supabase
-- Run this in Supabase SQL Editor to populate your database with initial courses

-- First, add the extra columns if they don't exist
ALTER TABLE courses ADD COLUMN IF NOT EXISTS estimated_hours VARCHAR(50);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS likes VARCHAR(50);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS views VARCHAR(50);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS level VARCHAR(50);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS type VARCHAR(50);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS subject VARCHAR(100);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor VARCHAR(100);

-- Insert 5 popular courses to get started
INSERT INTO courses (slug, title, description, thumbnail_url, syllabus, is_published, estimated_hours, likes, views, category, level, type, subject, instructor) VALUES
(
    'python-for-beginners',
    'Python Programming for Beginners',
    'Learn Python programming from scratch. This comprehensive course covers variables, data types, functions, loops, and object-oriented programming.',
    'https://img.youtube.com/vi/kqtD5dpn9C8/hqdefault.jpg',
    'Module 1: Introduction to Python
Module 2: Variables and Data Types
Module 3: Control Flow
Module 4: Functions and Modules
Module 5: Object-Oriented Programming',
    true,
    '6h',
    '1.2M',
    '45M',
    'Technology & CS',
    'Beginner',
    'Course',
    'Python',
    'Programming with Mosh'
),
(
    'web-development-bootcamp',
    'Complete Web Development Bootcamp',
    'Master HTML, CSS, JavaScript, and modern web development. Build real-world projects and deploy them online.',
    'https://img.youtube.com/vi/Nu_pCVPKzTk/hqdefault.jpg',
    'Module 1: HTML Fundamentals
Module 2: CSS Styling
Module 3: JavaScript Basics
Module 4: DOM Manipulation
Module 5: Building Projects',
    true,
    '10h',
    '500K',
    '15M',
    'Technology & CS',
    'Beginner',
    'Bootcamp',
    'Web Development',
    'FreeCodeCamp'
),
(
    'machine-learning-intro',
    'Introduction to Machine Learning',
    'Understand the fundamentals of machine learning, including supervised and unsupervised learning, neural networks, and practical applications.',
    'https://img.youtube.com/vi/GwIo3gDZCVQ/hqdefault.jpg',
    'Module 1: What is Machine Learning?
Module 2: Supervised Learning
Module 3: Unsupervised Learning
Module 4: Neural Networks
Module 5: Real-World Applications',
    true,
    '10h',
    '350K',
    '12M',
    'Data Science & AI',
    'Intermediate',
    'Course',
    'Machine Learning',
    'Edureka'
),
(
    'react-complete-guide',
    'React - The Complete Guide',
    'Learn React from the ground up. Build dynamic, interactive web applications with React hooks, state management, and routing.',
    'https://img.youtube.com/vi/SqcY0GlETPk/hqdefault.jpg',
    'Module 1: React Basics
Module 2: Components and Props
Module 3: State and Hooks
Module 4: Routing
Module 5: Advanced Patterns',
    true,
    '8h',
    '450K',
    '18M',
    'Technology & CS',
    'Intermediate',
    'Course',
    'React',
    'Programming with Mosh'
),
(
    'digital-marketing-masterclass',
    'Digital Marketing Masterclass',
    'Master digital marketing strategies including SEO, social media marketing, content marketing, and analytics.',
    'https://img.youtube.com/vi/bixR-KIJKYM/hqdefault.jpg',
    'Module 1: Marketing Fundamentals
Module 2: SEO Basics
Module 3: Social Media Strategy
Module 4: Content Marketing
Module 5: Analytics and Metrics',
    true,
    '3h',
    '45K',
    '2.1M',
    'Business & Finance',
    'Beginner',
    'Masterclass',
    'Marketing',
    'Simplilearn'
);

-- Now add modules for each course
DO $$
DECLARE
    course_record RECORD;
    module_id UUID;
BEGIN
    FOR course_record IN SELECT id, slug FROM courses LOOP
        -- Insert a default module for each course
        INSERT INTO modules (course_id, title, description, order_index)
        VALUES (course_record.id, 'Course Content', 'Main course modules', 0)
        RETURNING id INTO module_id;
        
        -- Insert a lesson for each module
        INSERT INTO lessons (module_id, title, description, youtube_url, duration_seconds, order_index)
        VALUES (
            module_id,
            'Full Course Video',
            'Complete course content',
            CASE course_record.slug
                WHEN 'python-for-beginners' THEN 'https://www.youtube.com/watch?v=kqtD5dpn9C8'
                WHEN 'web-development-bootcamp' THEN 'https://www.youtube.com/watch?v=Nu_pCVPKzTk'
                WHEN 'machine-learning-intro' THEN 'https://www.youtube.com/watch?v=GwIo3gDZCVQ'
                WHEN 'react-complete-guide' THEN 'https://www.youtube.com/watch?v=SqcY0GlETPk'
                WHEN 'digital-marketing-masterclass' THEN 'https://www.youtube.com/watch?v=bixR-KIJKYM'
            END,
            14400,
            0
        );
    END LOOP;
END $$;

-- Verify the data was inserted
SELECT COUNT(*) as total_courses FROM courses;
SELECT COUNT(*) as total_modules FROM modules;
SELECT COUNT(*) as total_lessons FROM lessons;
