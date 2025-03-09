import { supabase } from '../services/supabaseClient';
import { EcoAction, UserAction } from '@/types/database';
import { v4 as uuidv4 } from 'uuid';
import { analyzeEcoAction } from './geminiService';
import { checkAndAwardBadges } from './badgeService';

// Map of category names to UUIDs
const CATEGORY_IDS: Record<string, string> = {
  transportation: uuidv4(),
  waste: uuidv4(),
  food: uuidv4(),
  energy: uuidv4(),
  water: uuidv4(),
  custom: uuidv4()
};

// Helper function to handle Supabase errors
const handleSupabaseError = (error: unknown): { error: string } => {
  console.error('Supabase error:', error);
  return { error: error instanceof Error ? error.message : 'An unknown error occurred' };
};

// Helper function to properly format UUIDs
export function formatUuid(uuid: string): string {
  // Check if the UUID is already properly formatted
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)) {
    return uuid;
  }
  
  // Remove any non-alphanumeric characters
  const cleaned = uuid.replace(/[^a-f0-9]/gi, '');
  
  // Ensure we have enough characters (pad if necessary)
  const padded = (cleaned + '0'.repeat(32)).slice(0, 32);
  
  // Format as UUID
  return `${padded.slice(0, 8)}-${padded.slice(8, 12)}-${padded.slice(12, 16)}-${padded.slice(16, 20)}-${padded.slice(20, 32)}`;
}

/**
 * Fetch all eco actions
 */
export const getEcoActions = async (): Promise<{ data: EcoAction[] | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('eco_actions')
      .select('*');
    
    if (error) throw error;
    
    // Add custom actions from localStorage if available
    try {
      const customActions = JSON.parse(localStorage.getItem('customEcoActions') || '[]');
      if (customActions.length > 0) {
        console.log(`Adding ${customActions.length} custom actions from localStorage`);
        return { data: [...(data || []), ...customActions], error: null };
      }
    } catch (storageError) {
      console.error('Error reading from localStorage:', storageError);
    }
    
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error).error };
  }
};

/**
 * Fetch eco actions by category
 */
export const getEcoActionsByCategory = async (categoryId: string): Promise<{ data: EcoAction[] | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('eco_actions')
      .select('*')
      .eq('category_id', categoryId);
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error).error };
  }
};

/**
 * Fetch a single eco action by ID
 */
export const getEcoActionById = async (id: string): Promise<{ data: EcoAction | null; error: string | null }> => {
  try {
    // First check if this is a client-side action
    try {
      const customActions = JSON.parse(localStorage.getItem('customEcoActions') || '[]');
      const customAction = customActions.find((action: EcoAction) => action.id === id);
      
      if (customAction) {
        console.log('Found client-side action:', customAction);
        return { data: customAction, error: null };
      }
    } catch (storageError) {
      console.error('Error reading from localStorage:', storageError);
    }
    
    // If not found in localStorage, try the database
    const { data, error } = await supabase
      .from('eco_actions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error).error };
  }
};

/**
 * Log a completed eco action for a user
 */
export const logUserAction = async (
  userId: string, 
  actionId: string,
  notes?: string,
  customTitle?: string,
  customCategory?: string
): Promise<{ data: UserAction | null; error: string | null }> => {
  try {
    console.log(`Logging action ${actionId} for user ${userId}`);
    
    // First check if this is a client-side action by looking it up in localStorage
    let isClientSideAction = false;
    let clientSideAction = null;
    
    try {
      const customActions = JSON.parse(localStorage.getItem('customEcoActions') || '[]');
      clientSideAction = customActions.find((action: EcoAction) => action.id === actionId);
      
      if (clientSideAction) {
        console.log('Found client-side action to log:', clientSideAction);
        isClientSideAction = true;
      }
    } catch (storageError) {
      console.error('Error checking for client-side action:', storageError);
    }
    
    if (isClientSideAction) {
      console.log('Logging client-side action:', actionId);
      
      // For client-side actions, create a client-side user action
      const userAction: UserAction = {
        id: uuidv4(),
        user_id: userId,
        action_id: actionId,
        completed_at: new Date().toISOString(),
        notes: notes || null,
        buds_earned: clientSideAction?.buds_reward || 5,
        is_verified: false,
        created_at: new Date().toISOString()
      };
      
      // Store in localStorage for persistence
      try {
        const existingUserActions = JSON.parse(localStorage.getItem('userActions') || '[]');
        existingUserActions.push(userAction);
        localStorage.setItem('userActions', JSON.stringify(existingUserActions));
        console.log('Saved user action to localStorage');
      } catch (storageError) {
        console.error('Error saving user action to localStorage:', storageError);
      }
      
      // Update user stats
      await updateUserStats(userId);
      
      // Check for and award badges
      await checkAndAwardBadges(userId);
      
      return { data: userAction, error: null };
    }
    
    // For database actions, proceed with normal flow
    let action: EcoAction | null = null;
    let budsEarned = 0;
    let co2Impact = 0;
    let impactStatement = '';
    
    // If this is a custom action (no actionId), analyze it with Gemini
    if (!actionId && customTitle) {
      console.log('Analyzing custom action with Gemini:', customTitle);
      
      // Use Gemini to analyze the environmental impact
      const analysis = await analyzeEcoAction(customTitle, notes || undefined);
      
      // Create a new eco action with the analysis results
      const newAction: Partial<EcoAction> = {
        title: customTitle,
        description: notes || null,
        category_id: customCategory || 'custom',
        impact: analysis.impact,
        co2_saved: -analysis.co2Impact, // Negative CO2 impact means CO2 saved
        buds_reward: analysis.budsReward,
        is_verified: false
      };
      
      // Insert the new action into the database
      const { data: createdAction, error: createError } = await createEcoAction(newAction);
      
      if (createError) {
        console.error('Error creating custom action:', createError);
        return { data: null, error: `Failed to create custom action: ${createError}` };
      }
      
      if (!createdAction) {
        console.error('No action data returned from createEcoAction');
        return { data: null, error: 'Failed to create custom action: No data returned' };
      }
      
      action = createdAction;
      budsEarned = analysis.budsReward;
      co2Impact = -analysis.co2Impact;
      impactStatement = analysis.impact;
      
      console.log('Created new eco action with Gemini analysis:', action);
    } else {
      // Get the existing action to determine buds reward
      const { data: existingAction, error: actionError } = await getEcoActionById(actionId);
      
      if (actionError) {
        console.error('Error getting action:', actionError);
        return { data: null, error: `Action not found: ${actionError}` };
      }
      
      if (!existingAction) {
        console.error('Action not found with ID:', actionId);
        return { data: null, error: 'Action not found' };
      }
      
      action = existingAction;
      budsEarned = existingAction.buds_reward;
      co2Impact = existingAction.co2_saved || 0;
      impactStatement = existingAction.impact;
      
      console.log('Found existing action to log:', action);
    }
    
    // Insert the user action
    const { data, error } = await supabase
      .from('user_actions')
      .insert({
        user_id: formatUuid(userId),
        action_id: action.id,
        buds_earned: budsEarned,
        notes: notes || null,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting user action:', error);
      throw error;
    }
    
    // Update user stats
    await updateUserStats(userId);
    
    // Check for and award badges
    await checkAndAwardBadges(userId);
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception in logUserAction:', error);
    return { data: null, error: handleSupabaseError(error).error };
  }
};

/**
 * Get user's completed actions
 */
export const getUserActions = async (userId: string): Promise<{ data: UserAction[] | null; error: string | null }> => {
  try {
    console.log(`Getting actions for user ${userId}`);
    
    // Initialize with an empty array in case there are no database actions
    let databaseActions: UserAction[] = [];
    
    // Try to get actions from the database
    try {
      const { data, error } = await supabase
        .from('user_actions')
        .select('*, eco_actions(*)')
        .eq('user_id', formatUuid(userId))
        .order('completed_at', { ascending: false });
      
      if (error) {
        console.error('Error getting user actions from database:', error);
      } else {
        databaseActions = data || [];
        console.log(`Found ${databaseActions.length} actions in database`);
      }
    } catch (dbError) {
      console.error('Exception getting user actions from database:', dbError);
    }
    
    // Get client-side actions from localStorage
    let clientSideActions: UserAction[] = [];
    
    try {
      const actionsString = localStorage.getItem('userActions');
      if (actionsString) {
        const allClientActions = JSON.parse(actionsString);
        clientSideActions = allClientActions.filter((action: UserAction) => action.user_id === userId);
        console.log(`Found ${clientSideActions.length} client-side actions`);
        
        // Get custom actions to attach to user actions
        const customActionsString = localStorage.getItem('customEcoActions');
        if (customActionsString) {
          const customActions = JSON.parse(customActionsString);
          
          // Attach eco_actions data to client-side user actions
          clientSideActions = clientSideActions.map((action: UserAction) => {
            const matchingAction = customActions.find((a: EcoAction) => a.id === action.action_id);
            if (matchingAction) {
              return {
                ...action,
                eco_actions: matchingAction
              };
            }
            return action;
          });
        }
      }
    } catch (storageError) {
      console.error('Error reading client-side actions from localStorage:', storageError);
    }
    
    // Combine database and client-side actions
    const combinedActions = [...databaseActions, ...clientSideActions];
    
    // Sort by completed_at date (newest first)
    combinedActions.sort((a, b) => {
      const dateA = new Date(a.completed_at).getTime();
      const dateB = new Date(b.completed_at).getTime();
      return dateB - dateA;
    });
    
    console.log(`Returning ${combinedActions.length} total actions`);
    return { data: combinedActions, error: null };
  } catch (error) {
    console.error('Exception in getUserActions:', error);
    return { data: null, error: handleSupabaseError(error).error };
  }
};

/**
 * Update user stats after completing an action
 */
const updateUserStats = async (userId: string): Promise<void> => {
  try {
    // Format the user ID as a UUID
    const formattedUserId = formatUuid(userId);
    
    console.log(`Updating stats for user ${formattedUserId}`);
    
    // First, get all user actions to count them and sum buds
    const { data: actions, error: actionsError } = await supabase
      .from('user_actions')
      .select('buds_earned')
      .eq('user_id', formattedUserId);
    
    if (actionsError) {
      console.error('Error fetching user actions:', actionsError);
      return;
    }
    
    if (!actions || actions.length === 0) {
      console.log('No actions found for user');
      return;
    }
    
    // Calculate total buds earned
    const totalBudsEarned = actions.reduce((sum, action) => sum + (action.buds_earned || 0), 0);
    
    // Get all action IDs for this user
    const { data: userActions, error: userActionsError } = await supabase
      .from('user_actions')
      .select('action_id')
      .eq('user_id', formattedUserId);
    
    if (userActionsError) {
      console.error('Error fetching user action IDs:', userActionsError);
      return;
    }
    
    if (!userActions || userActions.length === 0) {
      console.log('No action IDs found for user');
      return;
    }
    
    // Extract action IDs
    const actionIds = userActions.map(action => action.action_id);
    
    // Get CO2 saved values for these actions
    const { data: ecoActions, error: ecoActionsError } = await supabase
      .from('eco_actions')
      .select('id, co2_saved')
      .in('id', actionIds);
    
    if (ecoActionsError) {
      console.error('Error fetching eco actions:', ecoActionsError);
      return;
    }
    
    // Calculate total CO2 saved
    let totalCO2Saved = 0;
    if (ecoActions && ecoActions.length > 0) {
      // Create a map of action IDs to CO2 saved values for faster lookup
      const co2SavedMap = new Map();
      ecoActions.forEach(action => {
        co2SavedMap.set(action.id, action.co2_saved || 0);
      });
      
      // Sum up CO2 saved for each user action
      userActions.forEach(action => {
        const co2Saved = co2SavedMap.get(action.action_id) || 0;
        totalCO2Saved += Number(co2Saved);
      });
    }
    
    console.log(`Calculated stats: ${actions.length} actions, ${totalBudsEarned} buds, ${totalCO2Saved.toFixed(2)} kg CO2 saved`);
    
    // Update user stats
    const { error: updateError } = await supabase
      .from('user_stats')
      .upsert({
        user_id: formattedUserId,
        total_actions_completed: actions.length,
        buds_earned: totalBudsEarned,
        total_carbon_footprint: totalCO2Saved,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
    
    if (updateError) {
      console.error('Error updating user stats:', updateError);
      return;
    }
    
    console.log('User stats updated successfully');
  } catch (error) {
    console.error('Exception in updateUserStats:', error);
  }
};

/**
 * Create a new eco action
 */
export const createEcoAction = async (
  actionData: Partial<EcoAction>
): Promise<{ data: EcoAction | null; error: string | null }> => {
  try {
    // Generate a UUID for the action
    const actionId = uuidv4();
    
    // Create a new action object
    const newAction: Record<string, string | number | boolean | null> = {
      id: actionId,
      title: actionData.title || 'Custom Action',
      description: actionData.description || null,
      category_id: actionData.category_id || 'custom',
      impact: actionData.impact || 'Environmental impact',
      co2_saved: actionData.co2_saved || 0,
      buds_reward: actionData.buds_reward || 5,
      image_url: actionData.image_url || null,
      is_verified: actionData.is_verified || false,
      created_at: new Date().toISOString()
    };
    
    console.log('Creating new eco action:', newAction);
    
    // Insert the new action
    const { data, error } = await supabase
      .from('eco_actions')
      .insert(newAction)
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting eco action:', error);
      
      // Try without specifying the ID (let Supabase generate it)
      console.log('Trying without explicit ID...');
      const altAction = { ...newAction };
      delete altAction.id;
      
      const { data: altData, error: altError } = await supabase
        .from('eco_actions')
        .insert(altAction)
        .select()
        .single();
      
      if (altError) {
        console.error('Alternative approach also failed:', altError);
        throw altError;
      }
      
      return { data: altData, error: null };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception in createEcoAction:', error);
    return { data: null, error: handleSupabaseError(error).error };
  }
};

/**
 * Helper function to inspect the structure of a table
 */
async function inspectTableStructure(tableName: string): Promise<void> {
  try {
    // Try to get one row to see the structure
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      console.error(`Error inspecting ${tableName} table:`, error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log(`${tableName} table structure:`, Object.keys(data[0]));
    } else {
      console.log(`${tableName} table is empty, no structure information available`);
      
      // Instead of using RPC, we'll just log that we can't get column information
      console.log(`Cannot retrieve column information for empty table ${tableName}`);
    }
  } catch (e) {
    console.error(`Exception inspecting ${tableName} table:`, e);
  }
}

/**
 * Create a custom eco action (client-side approach)
 */
export const createCustomEcoAction = async (
  title: string,
  category: string,
  notes?: string
): Promise<{ data: EcoAction | null; error: string | null }> => {
  try {
    // Generate a proper UUID for the action
    const actionId = uuidv4();
    
    console.log('Creating client-side action with ID:', actionId);
    
    // Calculate CO2 impact and buds based on category
    const { co2Saved, budsReward, impact } = calculateEcoImpact(title, category);
    
    // Create a client-side action object
    const customAction: EcoAction = {
      id: actionId,
      title: title,
      description: notes || null,
      impact: impact,
      category_id: category,
      co2_saved: co2Saved,
      buds_reward: budsReward,
      image_url: null,
      is_verified: false,
      created_at: new Date().toISOString()
    };
    
    // Store in localStorage for persistence
    try {
      // Get existing actions or initialize empty array
      const existingActionsString = localStorage.getItem('customEcoActions');
      const existingActions = existingActionsString ? JSON.parse(existingActionsString) : [];
      
      // Add new action
      existingActions.push(customAction);
      
      // Save back to localStorage
      localStorage.setItem('customEcoActions', JSON.stringify(existingActions));
      
      console.log('Saved custom action to localStorage. Total actions:', existingActions.length);
    } catch (storageError) {
      console.error('Error saving to localStorage:', storageError);
    }
    
    return { data: customAction, error: null };
  } catch (error) {
    console.error('Exception in createCustomEcoAction:', error);
    return { data: null, error: handleSupabaseError(error).error };
  }
};

/**
 * Calculate the environmental impact and buds reward for an eco action
 */
function calculateEcoImpact(title: string, category: string): { co2Saved: number; budsReward: number; impact: string } {
  // Default values for non-eco actions
  let co2Saved = 0;
  let budsReward = 0;
  let impact = 'No environmental impact';
  
  // Convert title and category to lowercase for easier matching
  const lowerTitle = title.toLowerCase();
  const lowerCategory = category.toLowerCase();
  
  // Check if this is a known eco action
  const isEcoAction = 
    lowerCategory === 'transportation' || 
    lowerCategory === 'waste' || 
    lowerCategory === 'food' || 
    lowerCategory === 'energy' || 
    lowerCategory === 'water';
  
  if (!isEcoAction) {
    return { co2Saved, budsReward, impact };
  }
  
  // Calculate impact based on category
  switch (lowerCategory) {
    case 'transportation':
      if (lowerTitle.includes('public') || lowerTitle.includes('transit') || lowerTitle.includes('bus') || lowerTitle.includes('train')) {
        co2Saved = 2.3;
        budsReward = 15;
        impact = '2.3 kg CO₂ saved';
      } else if (lowerTitle.includes('walk') || lowerTitle.includes('bike') || lowerTitle.includes('cycling')) {
        co2Saved = 1.8;
        budsReward = 12;
        impact = '1.8 kg CO₂ saved';
      } else if (lowerTitle.includes('carpool') || lowerTitle.includes('rideshare')) {
        co2Saved = 1.5;
        budsReward = 10;
        impact = '1.5 kg CO₂ saved';
      } else {
        co2Saved = 1.0;
        budsReward = 8;
        impact = '1.0 kg CO₂ saved';
      }
      break;
      
    case 'waste':
      if (lowerTitle.includes('recycle') || lowerTitle.includes('recycling')) {
        co2Saved = 0.8;
        budsReward = 8;
        impact = '0.8 kg CO₂ saved';
      } else if (lowerTitle.includes('reusable') || lowerTitle.includes('mug') || lowerTitle.includes('bag')) {
        co2Saved = 0.5;
        budsReward = 5;
        impact = '0.5 kg waste reduced';
      } else if (lowerTitle.includes('compost')) {
        co2Saved = 0.6;
        budsReward = 7;
        impact = '0.6 kg waste diverted';
      } else {
        co2Saved = 0.3;
        budsReward = 3;
        impact = '0.3 kg waste reduced';
      }
      break;
      
    case 'food':
      if (lowerTitle.includes('meatless') || lowerTitle.includes('vegetarian') || lowerTitle.includes('vegan') || lowerTitle.includes('plant')) {
        co2Saved = 1.5;
        budsReward = 10;
        impact = '1.5 kg CO₂ saved';
      } else if (lowerTitle.includes('local') || lowerTitle.includes('farmers market')) {
        co2Saved = 0.4;
        budsReward = 7;
        impact = '0.4 kg CO₂ saved';
      } else if (lowerTitle.includes('organic')) {
        co2Saved = 0.3;
        budsReward = 5;
        impact = '0.3 kg CO₂ saved';
      } else {
        co2Saved = 0.2;
        budsReward = 3;
        impact = '0.2 kg CO₂ saved';
      }
      break;
      
    case 'energy':
      if (lowerTitle.includes('light') || lowerTitle.includes('lighting')) {
        co2Saved = 0.3;
        budsReward = 5;
        impact = '0.3 kg CO₂ saved';
      } else if (lowerTitle.includes('unplug') || lowerTitle.includes('standby')) {
        co2Saved = 0.2;
        budsReward = 5;
        impact = '0.2 kg CO₂ saved';
      } else if (lowerTitle.includes('thermostat') || lowerTitle.includes('temperature')) {
        co2Saved = 0.5;
        budsReward = 8;
        impact = '0.5 kg CO₂ saved';
      } else {
        co2Saved = 0.2;
        budsReward = 3;
        impact = '0.2 kg CO₂ saved';
      }
      break;
      
    case 'water':
      if (lowerTitle.includes('shower') || lowerTitle.includes('bath')) {
        co2Saved = 0.2;
        budsReward = 5;
        impact = '50 L water saved';
      } else if (lowerTitle.includes('rain') || lowerTitle.includes('rainwater')) {
        co2Saved = 0.1;
        budsReward = 8;
        impact = '50 L water saved';
      } else if (lowerTitle.includes('leak') || lowerTitle.includes('faucet') || lowerTitle.includes('tap')) {
        co2Saved = 0.15;
        budsReward = 10;
        impact = '70 L water saved';
      } else {
        co2Saved = 0.1;
        budsReward = 3;
        impact = '20 L water saved';
      }
      break;
      
    default:
      co2Saved = 0.1;
      budsReward = 2;
      impact = 'Minimal environmental impact';
  }
  
  return { co2Saved, budsReward, impact };
}

/**
 * Initialize the eco_actions table with sample data if it's empty
 */
export const initializeEcoActions = async (): Promise<{ success: boolean; error: string | null }> => {
  try {
    console.log('Checking if eco_actions table needs initialization...');
    
    // Check if the eco_actions table exists and has data
    const { data: existingActions, error: checkError } = await supabase
      .from('eco_actions')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.error('Error checking eco_actions table:', checkError);
      return { success: false, error: 'Error checking eco_actions table' };
    }
    
    // If there are already actions, no need to initialize
    if (existingActions && existingActions.length > 0) {
      console.log('eco_actions table already has data, no initialization needed');
      return { success: true, error: null };
    }
    
    console.log('eco_actions table is empty, initializing with sample data...');
    
    // Sample eco actions to insert
    const sampleActions = [
      {
        title: 'Used public transit',
        description: 'Took public transportation instead of driving a car',
        category_id: 'transportation',
        impact: '2.3 kg CO₂ saved',
        co2_saved: 2.3,
        buds_reward: 15,
        is_verified: true
      },
      {
        title: 'Walked instead of drove',
        description: 'Chose to walk to a destination instead of driving',
        category_id: 'transportation',
        impact: '1.8 kg CO₂ saved',
        co2_saved: 1.8,
        buds_reward: 12,
        is_verified: true
      },
      {
        title: 'Carpooled to work',
        description: 'Shared a ride with others to reduce emissions',
        category_id: 'transportation',
        impact: '1.5 kg CO₂ saved',
        co2_saved: 1.5,
        buds_reward: 10,
        is_verified: true
      },
      {
        title: 'Brought reusable mug',
        description: 'Used a reusable mug instead of disposable cups',
        category_id: 'waste',
        impact: '0.5 kg waste reduced',
        co2_saved: 0.05,
        buds_reward: 8,
        is_verified: true
      },
      {
        title: 'Used reusable bags',
        description: 'Brought reusable bags for shopping',
        category_id: 'waste',
        impact: '0.3 kg waste reduced',
        co2_saved: 0.03,
        buds_reward: 5,
        is_verified: true
      },
      {
        title: 'Ate a meatless meal',
        description: 'Chose plant-based food options',
        category_id: 'food',
        impact: '1.5 kg CO₂ saved',
        co2_saved: 1.5,
        buds_reward: 10,
        is_verified: true
      },
      {
        title: 'Bought local produce',
        description: 'Purchased locally grown food to reduce transportation emissions',
        category_id: 'food',
        impact: '0.4 kg CO₂ saved',
        co2_saved: 0.4,
        buds_reward: 7,
        is_verified: true
      },
      {
        title: 'Used natural lighting',
        description: 'Relied on natural light instead of electric lighting',
        category_id: 'energy',
        impact: '0.2 kg CO₂ saved',
        co2_saved: 0.2,
        buds_reward: 5,
        is_verified: true
      },
      {
        title: 'Turned off lights',
        description: 'Turned off lights when leaving a room',
        category_id: 'energy',
        impact: '0.3 kg CO₂ saved',
        co2_saved: 0.3,
        buds_reward: 5,
        is_verified: true
      },
      {
        title: 'Collected rainwater',
        description: 'Used rainwater for plants instead of tap water',
        category_id: 'water',
        impact: '50 L water saved',
        co2_saved: 0.1,
        buds_reward: 8,
        is_verified: true
      }
    ];
    
    // Insert the sample actions
    const { error: insertError } = await supabase
      .from('eco_actions')
      .insert(sampleActions);
    
    if (insertError) {
      console.error('Error inserting sample eco actions:', insertError);
      return { success: false, error: 'Error inserting sample eco actions' };
    }
    
    console.log('Successfully initialized eco_actions table with sample data');
    return { success: true, error: null };
  } catch (error) {
    console.error('Exception in initializeEcoActions:', error);
    return { success: false, error: 'Exception initializing eco actions' };
  }
};

/**
 * Manually refresh user stats for existing actions
 * This can be called to fix issues with user stats
 */
export const refreshUserStats = async (userId: string): Promise<{ success: boolean; error: string | null }> => {
  try {
    console.log(`Manually refreshing stats for user ${userId}`);
    
    // Call updateUserStats to recalculate and update the stats
    await updateUserStats(userId);
    
    // Get the updated stats to return to the caller
    const formattedUserId = formatUuid(userId);
    const { data: statsData, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', formattedUserId)
      .maybeSingle();
    
    if (statsError) {
      console.error('Error fetching updated user stats:', statsError);
      return { success: false, error: 'Failed to fetch updated stats' };
    }
    
    if (!statsData) {
      console.error('No stats found after update');
      return { success: false, error: 'No stats found after update' };
    }
    
    console.log('Stats refreshed successfully:', statsData);
    return { success: true, error: null };
  } catch (error) {
    console.error('Exception in refreshUserStats:', error);
    return { success: false, error: handleSupabaseError(error).error };
  }
}; 