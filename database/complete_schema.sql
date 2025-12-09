-- =============================================
-- DILIGENCE APP - COMPLETE DATABASE SETUP
-- =============================================

-- 1. CREATE USERS TABLE (for authentication)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE
);

-- 2. CREATE TASKS TABLE (updated with user relationship)
-- =============================================
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- in minutes
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    color VARCHAR(50) NOT NULL DEFAULT 'bg-blue-500',
    is_recurring BOOLEAN DEFAULT FALSE,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. CREATE USER SESSIONS TABLE (for JWT token management)
-- =============================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. CREATE SCHEDULES TABLE (if you plan to use it)
-- =============================================
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4B.  scheduled_tasks
-- =============================================
--  This NEW table supports drag-and-drop scheduling
--           using scheduled_day + scheduled_time + end_time
CREATE TABLE IF NOT EXISTS scheduled_tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,   
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,    
    scheduled_day DATE NOT NULL,                               
    scheduled_time FLOAT NOT NULL,                             
    end_time FLOAT NOT NULL,                                   
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP             
);

-- 5. CREATE INDEXES FOR PERFORMANCE
-- =============================================
-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Tasks table indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

-- Sessions table indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON user_sessions(expires_at);

-- Schedules table indexes
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(scheduled_date);

-- Scheduled_tasks indexes
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_user_id ON scheduled_tasks(user_id);   
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_day ON scheduled_tasks(scheduled_day); 

-- 6. INSERT SAMPLE DATA (for testing)
-- =============================================
-- Note: You'll need to create a user first, then use their ID for tasks
-- This is just an example - in practice, users will create their own tasks

-- Sample user (password: 'password123' - hashed with bcrypt)
-- You should NOT use this in production - it's just for testing
INSERT INTO users (email, name, password_hash, email_verified) VALUES
('demo@diligence.com', 'Demo User', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.8.2.', true)
ON CONFLICT (email) DO NOTHING;

-- Get the demo user ID for sample tasks
-- Note: In a real app, you'd get this from the authenticated user's session
DO $$
DECLARE
    demo_user_id INTEGER;
BEGIN
    SELECT id INTO demo_user_id FROM users WHERE email = 'demo@diligence.com';
    
    -- Insert sample tasks for the demo user
    INSERT INTO tasks (user_id, title, description, duration, category, color, is_recurring) VALUES
    (demo_user_id, 'Soccer Practice', 'Team practice session', 120, 'Sports', 'bg-green-500', true),
    (demo_user_id, 'Study Session', 'Math and science review', 90, 'Education', 'bg-blue-500', false),
    (demo_user_id, 'Project Meeting', 'Weekly team sync', 45, 'Work', 'bg-purple-500', false),
    (demo_user_id, 'Morning Run', 'Cardio exercise', 30, 'Fitness', 'bg-orange-500', true),
    (demo_user_id, 'Code Review', 'Review team code submissions', 60, 'Work', 'bg-indigo-500', false)
    ON CONFLICT DO NOTHING;
END $$;

-- 7. CREATE FUNCTIONS FOR AUTOMATIC UPDATES
-- =============================================
-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. VERIFY SETUP
-- =============================================
-- Check that all tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'tasks', 'user_sessions', 'schedules')
ORDER BY table_name;
