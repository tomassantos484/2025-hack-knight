-- Drop existing tables if they exist (be careful with this in production!)
DROP TABLE IF EXISTS user_actions CASCADE;
DROP TABLE IF EXISTS user_stats CASCADE;
DROP TABLE IF EXISTS eco_actions CASCADE;

-- Create eco_actions table with correct schema
CREATE TABLE eco_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category_id TEXT, -- Using TEXT type for category_id
    impact TEXT NOT NULL,
    co2_saved NUMERIC,
    buds_reward INTEGER NOT NULL DEFAULT 10,
    image_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_actions table
CREATE TABLE user_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    action_id UUID NOT NULL REFERENCES eco_actions(id),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    buds_earned INTEGER NOT NULL DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_stats table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    total_actions_completed INTEGER DEFAULT 0,
    total_carbon_footprint DECIMAL(10, 2) DEFAULT 0,
    buds_earned INTEGER DEFAULT 0,
    total_buds_spent INTEGER DEFAULT 0,
    eco_friendly_percentage INTEGER DEFAULT 0,
    average_eco_score INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_action_date TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create indexes for faster lookups
CREATE INDEX idx_user_actions_user_id ON user_actions(user_id);
CREATE INDEX idx_user_actions_action_id ON user_actions(action_id);
CREATE INDEX idx_eco_actions_category_id ON eco_actions(category_id);

-- Insert sample eco actions
INSERT INTO eco_actions (title, description, category_id, impact, co2_saved, buds_reward, is_verified)
VALUES 
    ('Used public transit', 'Took public transportation instead of driving a car', 'transportation', '2.3 kg CO₂ saved', 2.3, 15, TRUE),
    ('Walked instead of drove', 'Chose to walk to a destination instead of driving', 'transportation', '1.8 kg CO₂ saved', 1.8, 12, TRUE),
    ('Carpooled to work', 'Shared a ride with others to reduce emissions', 'transportation', '1.5 kg CO₂ saved', 1.5, 10, TRUE),
    ('Brought reusable mug', 'Used a reusable mug instead of disposable cups', 'waste', '0.5 kg waste reduced', 0.05, 8, TRUE),
    ('Used reusable bags', 'Brought reusable bags for shopping', 'waste', '0.3 kg waste reduced', 0.03, 5, TRUE),
    ('Ate a meatless meal', 'Chose plant-based food options', 'food', '1.5 kg CO₂ saved', 1.5, 10, TRUE),
    ('Bought local produce', 'Purchased locally grown food to reduce transportation emissions', 'food', '0.4 kg CO₂ saved', 0.4, 7, TRUE),
    ('Used natural lighting', 'Relied on natural light instead of electric lighting', 'energy', '0.2 kg CO₂ saved', 0.2, 5, TRUE),
    ('Turned off lights', 'Turned off lights when leaving a room', 'energy', '0.3 kg CO₂ saved', 0.3, 5, TRUE),
    ('Collected rainwater', 'Used rainwater for plants instead of tap water', 'water', '50 L water saved', 0.1, 8, TRUE),
    ('Fixed leaky faucet', 'Repaired a dripping faucet to save water', 'water', '70 L water saved daily', 0.15, 10, TRUE),
    ('Composted food scraps', 'Diverted food waste from landfill', 'waste', '0.6 kg waste diverted', 0.2, 7, TRUE);

-- Print a success message
DO $$
BEGIN
  RAISE NOTICE 'Eco actions tables created successfully with sample data!';
END $$; 