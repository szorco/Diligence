-- Create tasks table for Diligence app
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
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

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

-- Insert some sample data
INSERT INTO tasks (title, description, duration, category, color, is_recurring) VALUES
('Soccer Practice', 'Team practice session', 120, 'Sports', 'bg-green-500', true),
('Study Session', 'Math and science review', 90, 'Education', 'bg-blue-500', false),
('Gym Workout', 'Strength training routine', 60, 'Fitness', 'bg-red-500', true),
('Project Meeting', 'Weekly team sync', 45, 'Work', 'bg-purple-500', false),
('Morning Run', 'Cardio exercise', 30, 'Fitness', 'bg-orange-500', true),
('Code Review', 'Review team code submissions', 60, 'Work', 'bg-indigo-500', false)
ON CONFLICT DO NOTHING;
