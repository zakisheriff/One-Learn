-- You Learn LMS - PostgreSQL Database Schema
-- Complete schema with all required tables for authentication, courses, quizzes, and certificates

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table: Stores user credentials and profile information
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL, -- Used exactly as-is on certificates
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- Bcrypt hash, NULL for OAuth-only users
    oauth_provider VARCHAR(50), -- 'google' or NULL for regular signup
    oauth_id VARCHAR(255), -- OAuth provider's user ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure either password or OAuth is provided
    CONSTRAINT user_auth_method CHECK (
        (password_hash IS NOT NULL AND oauth_provider IS NULL) OR
        (password_hash IS NULL AND oauth_provider IS NOT NULL) OR
        (password_hash IS NOT NULL AND oauth_provider IS NOT NULL)
    )
);

-- Create index for faster email lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id);

-- Courses table: Stores course metadata
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL, -- URL-friendly identifier
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    thumbnail_url TEXT,
    syllabus TEXT, -- JSON or text description of course structure
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_published ON courses(is_published);

-- Modules table: Course sections/chapters
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL, -- For ordering modules within a course
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(course_id, order_index)
);

CREATE INDEX idx_modules_course ON modules(course_id);

-- Lessons table: Individual video lessons within modules
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    youtube_url TEXT NOT NULL, -- Full YouTube URL or video ID
    duration_seconds INTEGER, -- Video duration in seconds
    order_index INTEGER NOT NULL, -- For ordering lessons within a module
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(module_id, order_index)
);

CREATE INDEX idx_lessons_module ON lessons(module_id);

-- Quizzes table: Stores AI-generated quizzes for courses
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    quiz_data JSONB NOT NULL, -- Structured quiz JSON from Gemini API
    passing_score INTEGER DEFAULT 80, -- Minimum score to pass (percentage)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one quiz per course (can be updated)
    UNIQUE(course_id)
);

CREATE INDEX idx_quizzes_course ON quizzes(course_id);

-- Enrollments table: Tracks user course enrollments and progress
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_lessons JSONB DEFAULT '[]', -- Array of lesson IDs completed
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    
    -- One enrollment per user per course
    UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);

-- Quiz Attempts table: Records quiz submissions and scores
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    answers JSONB NOT NULL, -- User's submitted answers
    score INTEGER NOT NULL, -- Percentage score (0-100)
    passed BOOLEAN NOT NULL, -- True if score >= passing_score
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_enrollment ON quiz_attempts(enrollment_id);

-- Certificates table: Stores certificate data with verification
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    quiz_attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    
    -- Certificate details (for display and verification)
    recipient_name VARCHAR(255) NOT NULL, -- Copied from users.full_name at time of issuance
    course_title VARCHAR(500) NOT NULL, -- Copied from courses.title
    completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Verification system
    verification_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 hash for verification
    pdf_path TEXT, -- Path to generated PDF file
    
    -- Metadata
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- One certificate per user per course
    UNIQUE(user_id, course_id)
);

CREATE INDEX idx_certificates_user ON certificates(user_id);
CREATE INDEX idx_certificates_verification ON certificates(verification_hash);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional)
-- Uncomment to insert test data

/*
-- Insert a test course
INSERT INTO courses (slug, title, description, thumbnail_url, is_published, syllabus) VALUES
('intro-to-javascript', 
 'Introduction to JavaScript', 
 'Learn the fundamentals of JavaScript programming from scratch.',
 'https://img.youtube.com/vi/W6NZfCO5SIk/maxresdefault.jpg',
 true,
 'Module 1: Basics, Module 2: Functions, Module 3: Objects');

-- Insert modules
INSERT INTO modules (course_id, title, description, order_index) VALUES
((SELECT id FROM courses WHERE slug = 'intro-to-javascript'),
 'JavaScript Basics',
 'Variables, data types, and operators',
 1),
((SELECT id FROM courses WHERE slug = 'intro-to-javascript'),
 'Functions and Scope',
 'Function declarations, expressions, and closures',
 2);

-- Insert lessons
INSERT INTO lessons (module_id, title, youtube_url, duration_seconds, order_index) VALUES
((SELECT id FROM modules WHERE title = 'JavaScript Basics'),
 'Variables and Data Types',
 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
 1200,
 1),
((SELECT id FROM modules WHERE title = 'JavaScript Basics'),
 'Operators and Expressions',
 'https://www.youtube.com/watch?v=example2',
 900,
 2);
*/
