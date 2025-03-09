-- Check if the eco_actions table is empty
DO $$
DECLARE
    action_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO action_count FROM eco_actions;
    
    IF action_count = 0 THEN
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
            
        RAISE NOTICE 'Inserted 12 sample eco actions';
    ELSE
        RAISE NOTICE 'eco_actions table already has % rows, skipping sample data insertion', action_count;
    END IF;
END $$; 