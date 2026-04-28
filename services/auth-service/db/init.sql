-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insert default admin user (password: admin123)
-- bcrypt hash for 'admin123' with 12 rounds
INSERT INTO users (name, email, password_hash, role) VALUES
    ('Admin User', 'admin@eventsphere.com', '$2a$12$cuQoySOUPCWu/fBamzO2ROllF2HjYqrdDnN4IhH65veevw0I2ZJ8y', 'admin')
ON CONFLICT (email) DO NOTHING;
