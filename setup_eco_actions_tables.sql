-- Create eco_actions table if it doesn't exist
CREATE TABLE IF NOT EXISTS eco_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category_id TEXT,
  impact TEXT NOT NULL,
  co2_saved NUMERIC,
  buds_reward INTEGER NOT NULL DEFAULT 10,
  image_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_actions table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_actions (
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
CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_action_id ON user_actions(action_id);
CREATE INDEX IF NOT EXISTS idx_eco_actions_category_id ON eco_actions(category_id);

-- Insert some sample eco actions if the table is empty
INSERT INTO eco_actions (title, description, category_id, impact, co2_saved, buds_reward, is_verified)
SELECT 'Used public transit', 'Took public transportation instead of driving a car', 'transportation', '2.3 kg CO₂ saved', 2.3, 15, TRUE
WHERE NOT EXISTS (SELECT 1 FROM eco_actions LIMIT 1);

INSERT INTO eco_actions (title, description, category_id, impact, co2_saved, buds_reward, is_verified)
SELECT 'Walked instead of drove', 'Chose to walk to a destination instead of driving', 'transportation', '1.8 kg CO₂ saved', 1.8, 12, TRUE
WHERE EXISTS (SELECT 1 FROM eco_actions LIMIT 1);

INSERT INTO eco_actions (title, description, category_id, impact, co2_saved, buds_reward, is_verified)
SELECT 'Carpooled to work', 'Shared a ride with others to reduce emissions', 'transportation', '1.5 kg CO₂ saved', 1.5, 10, TRUE
WHERE EXISTS (SELECT 1 FROM eco_actions LIMIT 1);

INSERT INTO eco_actions (title, description, category_id, impact, co2_saved, buds_reward, is_verified)
SELECT 'Brought reusable mug', 'Used a reusable mug instead of disposable cups', 'waste', '0.5 kg waste reduced', 0.05, 8, TRUE
WHERE EXISTS (SELECT 1 FROM eco_actions LIMIT 1);

INSERT INTO eco_actions (title, description, category_id, impact, co2_saved, buds_reward, is_verified)
SELECT 'Used reusable bags', 'Brought reusable bags for shopping', 'waste', '0.3 kg waste reduced', 0.03, 5, TRUE
WHERE EXISTS (SELECT 1 FROM eco_actions LIMIT 1);

INSERT INTO eco_actions (title, description, category_id, impact, co2_saved, buds_reward, is_verified)
SELECT 'Ate a meatless meal', 'Chose plant-based food options', 'food', '1.5 kg CO₂ saved', 1.5, 10, TRUE
WHERE EXISTS (SELECT 1 FROM eco_actions LIMIT 1);

INSERT INTO eco_actions (title, description, category_id, impact, co2_saved, buds_reward, is_verified)
SELECT 'Bought local produce', 'Purchased locally grown food to reduce transportation emissions', 'food', '0.4 kg CO₂ saved', 0.4, 7, TRUE
WHERE EXISTS (SELECT 1 FROM eco_actions LIMIT 1);

INSERT INTO eco_actions (title, description, category_id, impact, co2_saved, buds_reward, is_verified)
SELECT 'Used natural lighting', 'Relied on natural light instead of electric lighting', 'energy', '0.2 kg CO₂ saved', 0.2, 5, TRUE
WHERE EXISTS (SELECT 1 FROM eco_actions LIMIT 1);

INSERT INTO eco_actions (title, description, category_id, impact, co2_saved, buds_reward, is_verified)
SELECT 'Turned off lights', 'Turned off lights when leaving a room', 'energy', '0.3 kg CO₂ saved', 0.3, 5, TRUE
WHERE EXISTS (SELECT 1 FROM eco_actions LIMIT 1);

-- Print a success message
DO $$
BEGIN
  RAISE NOTICE 'Eco actions tables set up successfully!';
END $$; 