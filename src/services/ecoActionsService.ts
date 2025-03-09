import { supabase } from '../services/supabaseClient';
import { EcoAction, UserAction } from '@/types/database';
import { v4 as uuidv4 } from 'uuid';

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
  notes?: string
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
      
      return { data: userAction, error: null };
    }
    
    // For database actions, proceed with normal flow
    // First get the action to determine buds reward
    const { data: action, error: actionError } = await getEcoActionById(actionId);
    
    if (actionError) {
      console.error('Error getting action:', actionError);
      return { data: null, error: `Action not found: ${actionError}` };
    }
    
    if (!action) {
      console.error('Action not found with ID:', actionId);
      return { data: null, error: 'Action not found' };
    }
    
    console.log('Found action to log:', action);
    
    const { data, error } = await supabase
      .from('user_actions')
      .insert({
        user_id: formatUuid(userId),
        action_id: actionId,
        buds_earned: action.buds_reward,
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
    // Get all user actions
    const { data: actions } = await supabase
      .from('user_actions')
      .select('buds_earned')
      .eq('user_id', formatUuid(userId));
    
    if (!actions) return;
    
    // Calculate total buds earned
    const totalBudsEarned = actions.reduce((sum, action) => sum + action.buds_earned, 0);
    
    // Update user stats
    await supabase
      .from('user_stats')
      .upsert({
        user_id: formatUuid(userId),
        total_actions_completed: actions.length,
        total_buds_earned: totalBudsEarned,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
      
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
};

/**
 * Create a new eco action
 */
export const createEcoAction = async (
  actionData: {
    title: string;
    description?: string;
    category_id: string;
    impact: string;
    co2_saved?: number;
    buds_reward?: number;
    image_url?: string;
  }
): Promise<{ data: EcoAction | null; error: string | null }> => {
  try {
    // First, let's check the actual structure of the eco_actions table
    await inspectTableStructure('eco_actions');
    
    // Generate a UUID for the new action
    const actionId = uuidv4();
    
    // Create a minimal action object with only essential fields
    const newAction: Record<string, string | number | boolean | null> = {
      id: actionId,
      title: actionData.title,
      category_id: actionData.category_id,
      impact: actionData.impact || `Custom eco action`
    };
    
    // Add optional fields if provided
    if (actionData.description) newAction.description = actionData.description;
    if (actionData.co2_saved !== undefined) newAction.co2_saved = actionData.co2_saved;
    if (actionData.buds_reward !== undefined) newAction.buds_reward = actionData.buds_reward;
    if (actionData.image_url) newAction.image_url = actionData.image_url;
    
    console.log('Creating new eco action with minimal fields:', newAction);
    
    // Insert the new action
    const { data, error } = await supabase
      .from('eco_actions')
      .insert(newAction)
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting eco action:', error);
      
      // Try an alternative approach without the id field (let Supabase generate it)
      if (error.message && error.message.includes('id')) {
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
      
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
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
      console.log(`${tableName} table is empty, trying to get columns from metadata`);
      
      // Try to get columns from metadata
      const { data: columns, error: columnsError } = await supabase.rpc(
        'get_table_columns',
        { table_name: tableName }
      );
      
      if (columnsError) {
        console.error(`Error getting columns for ${tableName}:`, columnsError);
      } else {
        console.log(`${tableName} columns:`, columns);
      }
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
    
    // Create a client-side action object
    const customAction: EcoAction = {
      id: actionId,
      title: title,
      description: notes || null,
      impact: `Custom eco action: ${title}`,
      category_id: category, // Store as string, will be handled in logUserAction
      co2_saved: 0,
      buds_reward: 5,
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