-- First, check if the eco_actions table exists
DO $$
DECLARE
    table_exists BOOLEAN;
    constraint_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'eco_actions'
    ) INTO table_exists;

    IF table_exists THEN
        -- Check if the foreign key constraint exists
        SELECT EXISTS (
            SELECT FROM information_schema.table_constraints
            WHERE constraint_name = 'eco_actions_category_id_fkey'
            AND table_name = 'eco_actions'
        ) INTO constraint_exists;
        
        -- If constraint exists, drop it first
        IF constraint_exists THEN
            RAISE NOTICE 'Dropping foreign key constraint eco_actions_category_id_fkey';
            ALTER TABLE eco_actions DROP CONSTRAINT eco_actions_category_id_fkey;
        END IF;
        
        -- Table exists, check column type
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'eco_actions' 
            AND column_name = 'category_id' 
            AND data_type = 'uuid'
        ) THEN
            -- Column exists and is UUID type, alter it to TEXT
            ALTER TABLE eco_actions ALTER COLUMN category_id TYPE TEXT USING category_id::TEXT;
            RAISE NOTICE 'Changed category_id from UUID to TEXT';
        ELSIF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'eco_actions' 
            AND column_name = 'category_id'
        ) THEN
            -- Column exists but is not UUID type
            RAISE NOTICE 'category_id column already exists with non-UUID type';
        ELSE
            -- Column doesn't exist, add it
            ALTER TABLE eco_actions ADD COLUMN category_id TEXT;
            RAISE NOTICE 'Added category_id column as TEXT';
        END IF;
    ELSE
        -- Table doesn't exist, create it with correct schema
        CREATE TABLE eco_actions (
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
        RAISE NOTICE 'Created eco_actions table with category_id as TEXT';
    END IF;
END $$;

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
  total_carbon_footprint NUMERIC DEFAULT 0,
  total_buds_earned INTEGER DEFAULT 0,
  total_buds_spent INTEGER DEFAULT 0,
  eco_friendly_percentage NUMERIC DEFAULT 0,
  average_eco_score NUMERIC DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT user_stats_user_id_key UNIQUE (user_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_action_id ON user_actions(action_id);
CREATE INDEX IF NOT EXISTS idx_eco_actions_category_id ON eco_actions(category_id);

-- Print a success message
DO $$
BEGIN
  RAISE NOTICE 'Eco actions schema fixed successfully!';
END $$;