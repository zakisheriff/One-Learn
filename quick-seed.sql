-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ⚠️ RESET CONTENT TABLES
-- We drop these to ensure the schema matches perfectly
-- This avoids "column missing" or "type mismatch" errors
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS courses CASCADE;

-- Note: We do NOT drop the 'users' table so accounts are preserved.
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  avatar_url TEXT,
  interests TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1. Create Courses Table (Using VARCHAR for likes/views to allow '1.2M')
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  instructor VARCHAR(255),
  thumbnail_url TEXT,
  category VARCHAR(100),
  subject VARCHAR(100),
  level VARCHAR(50),
  estimated_hours VARCHAR(50),
  modules JSONB DEFAULT '[]',
  syllabus TEXT,
  is_published BOOLEAN DEFAULT false,
  likes VARCHAR(50) DEFAULT '0',
  views VARCHAR(50) DEFAULT '0',
  type VARCHAR(50) DEFAULT 'course',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Enrollments Table
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_lessons TEXT[],
  is_completed BOOLEAN DEFAULT false,
  UNIQUE(user_id, course_id)
);

-- 3. Create Modules Table
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Lessons Table
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  youtube_url TEXT,
  duration_seconds INTEGER,
  order_index INTEGER DEFAULT 0,
  is_preview BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Atom Tracks Table (Missing previously)
CREATE TABLE IF NOT EXISTS atom_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  difficulty VARCHAR(50),
  estimated_hours VARCHAR(50),
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Insert Data (Courses)
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

-- 6. Insert Modules and Lessons
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

-- Insert Sample Atom Tracks
INSERT INTO atom_tracks (title, description, difficulty, estimated_hours, thumbnail_url) VALUES 
('Full Stack Java Developer', 'Master Java, Spring Boot, and React for full-stack development.', 'Advanced', '3 Months', 'https://img.youtube.com/vi/Qgl81fPoylE/hqdefault.jpg'),
('Data Science with Python', 'From Python basics to Machine Learning and AI.', 'Intermediate', '2 Months', 'https://img.youtube.com/vi/ua-CiDNNj30/hqdefault.jpg'),
('Frontend Mastery', 'Become a wizard in HTML, CSS, JavaScript and React.', 'Beginner', '6 Weeks', 'https://img.youtube.com/vi/T33NN_pYILQ/hqdefault.jpg');

-- Verify
SELECT COUNT(*) as total_courses FROM courses;
