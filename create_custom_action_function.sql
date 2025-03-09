-- Function to create a custom eco action
CREATE OR REPLACE FUNCTION create_custom_eco_action(
  action_title TEXT,
  action_category TEXT,
  action_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_action_id UUID;
BEGIN
  -- Insert the new action and return its ID
  INSERT INTO eco_actions (
    title,
    category_id,
    description,
    impact,
    buds_reward,
    is_verified
  ) VALUES (
    action_title,
    action_category,
    action_description,
    'Custom eco action: ' || action_title,
    5, -- Default reward
    FALSE -- Not verified by default
  )
  RETURNING id INTO new_action_id;
  
  RETURN new_action_id;
END;
$$; 