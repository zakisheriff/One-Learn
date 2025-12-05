-- Atom Path Schema
-- Tables for the structured coding and certification system

-- 1. Tracks (e.g., Python, Data Science)
CREATE TABLE IF NOT EXISTS atom_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    thumbnail_url TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Modules (Steps within a track: Reading -> Coding -> Quiz -> Interview)
CREATE TABLE IF NOT EXISTS atom_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID NOT NULL REFERENCES atom_tracks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('reading', 'coding', 'quiz', 'interview')),
    order_index INTEGER NOT NULL,
    xp_reward INTEGER DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(track_id, order_index)
);

-- 3. Content: Reading
CREATE TABLE IF NOT EXISTS atom_content_reading (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES atom_modules(id) ON DELETE CASCADE,
    content_markdown TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Content: Coding Problems
CREATE TABLE IF NOT EXISTS atom_problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES atom_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description_markdown TEXT NOT NULL,
    language VARCHAR(50) NOT NULL CHECK (language IN ('python', 'javascript', 'sql')),
    starter_code TEXT NOT NULL,
    solution_code TEXT NOT NULL,
    test_cases JSONB NOT NULL, -- Array of {input, expected_output, hidden}
    time_limit_ms INTEGER DEFAULT 2000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Content: Quizzes (Structured)
CREATE TABLE IF NOT EXISTS atom_quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES atom_modules(id) ON DELETE CASCADE,
    questions JSONB NOT NULL, -- Array of {question, options[], correct_index}
    passing_score INTEGER DEFAULT 70,
    time_limit_seconds INTEGER DEFAULT 600,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Content: Interviews
CREATE TABLE IF NOT EXISTS atom_interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES atom_modules(id) ON DELETE CASCADE,
    questions JSONB NOT NULL, -- Array of {question, required_keywords[]}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. User Progress
CREATE TABLE IF NOT EXISTS atom_user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES atom_modules(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'locked' CHECK (status IN ('locked', 'unlocked', 'completed')),
    score INTEGER, -- For quizzes/coding
    completed_at TIMESTAMP,
    
    UNIQUE(user_id, module_id)
);

-- 8. Badges
CREATE TABLE IF NOT EXISTS atom_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon_url TEXT NOT NULL,
    xp_required INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. User Badges
CREATE TABLE IF NOT EXISTS atom_user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES atom_badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, badge_id)
);

-- 10. XP Ledger
CREATE TABLE IF NOT EXISTS atom_xp_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- 'module_completion', 'bonus', etc.
    source_id UUID, -- Reference to module_id or other source
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_atom_modules_track ON atom_modules(track_id);
CREATE INDEX IF NOT EXISTS idx_atom_progress_user ON atom_user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_atom_xp_user ON atom_xp_ledger(user_id);
