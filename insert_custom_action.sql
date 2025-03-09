-- Function to insert a custom action
CREATE OR REPLACE FUNCTION insert_custom_action(
  action_title TEXT,
  action_impact TEXT,
  action_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert the new action with minimal fields
  INSERT INTO eco_actions (
    title,
    impact,
    description,
    buds_reward,
    is_verified
  ) VALUES (
    action_title,
    action_impact,
    action_notes,
    5, -- Default reward
    FALSE -- Not verified by default
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error inserting custom action: %', SQLERRM;
    RETURN FALSE;
END;
$$; 