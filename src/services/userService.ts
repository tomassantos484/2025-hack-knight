import { supabase } from './supabaseClient';
import { formatUuid } from './supabaseService';
import { safeLog } from '../utils/logUtils';

/**
 * Interface for Clerk user data
 */
export interface ClerkUser {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  emailAddresses?: Array<{ emailAddress: string }>;
  imageUrl?: string;
}

/**
 * Interface for Supabase user data
 */
export interface SupabaseUser {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  clerk_id: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Ensure a user exists in the Supabase users table
 * This should be called before any operations that require a user to exist
 */
export const ensureUserExists = async (userId: string): Promise<boolean> => {
  try {
    const formattedUserId = formatUuid(userId);
    
    // First check if the user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', formattedUserId)
      .maybeSingle();
    
    if (checkError) {
      safeLog.error('Error checking if user exists:', checkError);
      return false;
    }
    
    // If user already exists, return true
    if (existingUser) {
      return true;
    }
    
    // Try to get the user's email from Clerk ID
    let userEmail = `user_${userId.substring(0, 8)}@example.com`;
    
    // Check if this is a Clerk user ID and try to find their email
    if (userId.startsWith('user_')) {
      try {
        // First check if we already have this user in Supabase with a different ID
        const { data: clerkUser, error: clerkUserError } = await supabase
          .from('users')
          .select('email')
          .eq('clerk_id', userId)
          .maybeSingle();
        
        if (!clerkUserError && clerkUser && clerkUser.email) {
          userEmail = clerkUser.email;
        }
      } catch (e) {
        safeLog.error('Error checking for existing Clerk user:', e);
      }
    }
    
    // Try to use upsert first (insert if not exists, update if exists)
    try {
      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          id: formattedUserId,
          clerk_id: userId,
          email: userEmail,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      
      if (!upsertError) {
        safeLog.log(`User record created/updated with ID: ${formattedUserId}`);
        return true;
      }
      
      safeLog.error('Error upserting user record:', upsertError);
      
      // Fall back to insert with conflict handling
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: formattedUserId,
          clerk_id: userId,
          email: userEmail,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (insertError) {
        safeLog.error('Error creating user record:', insertError);
        
        // If the error is a conflict (user already exists), try to update instead
        if (insertError.code === '23505' && insertError.message.includes('already exists')) {
          safeLog.log(`User with ID ${formattedUserId} already exists, trying to update instead`);
          
          // Update the existing user
          const { error: updateError } = await supabase
            .from('users')
            .update({
              clerk_id: userId,
              email: userEmail,
              updated_at: new Date().toISOString()
            })
            .eq('id', formattedUserId);
          
          if (updateError) {
            safeLog.error('Error updating existing user:', updateError);
            return false;
          }
          
          safeLog.log(`Updated existing user record with ID: ${formattedUserId}`);
          return true;
        }
        
        return false;
      }
    } catch (error) {
      safeLog.error('Exception during user upsert/insert:', error);
      return false;
    }
    
    safeLog.log(`Created new user record with ID: ${formattedUserId}`);
    return true;
  } catch (error) {
    safeLog.error('Exception in ensureUserExists:', error);
    return false;
  }
};

/**
 * Synchronize a Clerk user with Supabase
 * This function will create or update a user record in Supabase based on Clerk user data
 * 
 * @param clerkUser The Clerk user object
 * @returns The Supabase user ID
 */
export const syncUserWithSupabase = async (clerkUser: ClerkUser): Promise<string | null> => {
  try {
    if (!clerkUser || !clerkUser.id) {
      safeLog.error('No Clerk user provided for synchronization');
      return null;
    }

    safeLog.log('Synchronizing Clerk user with Supabase:', clerkUser.id);
    
    // Get the primary email address from Clerk
    const primaryEmail = clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0
      ? clerkUser.emailAddresses[0].emailAddress
      : `user_${clerkUser.id.substring(0, 8)}@example.com`;
    
    // Get the display name from Clerk
    const displayName = [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean)
      .join(' ') || `User ${clerkUser.id.substring(0, 8)}`;
    
    // Check if we need to update the users table schema to include clerk_id
    await ensureUserTableHasClerkIdColumn();
    
    // Try to check if a user with this Clerk ID already exists
    try {
      const { data: existingUsersByClerkId, error: clerkIdCheckError } = await supabase
        .from('users')
        .select('id, email, clerk_id')
        .eq('clerk_id', clerkUser.id);
      
      if (clerkIdCheckError) {
        // If the error is about the column not existing, we'll skip this check
        if (clerkIdCheckError.message && !clerkIdCheckError.message.includes('column "clerk_id" does not exist')) {
          safeLog.error('Error checking if user exists by Clerk ID:', clerkIdCheckError);
        }
      } else if (existingUsersByClerkId && existingUsersByClerkId.length > 0) {
        // If the user exists by Clerk ID, return the first one's Supabase ID
        safeLog.log('User exists in Supabase with Clerk ID:', clerkUser.id);
        
        // If there are multiple users with the same Clerk ID, log a warning
        if (existingUsersByClerkId.length > 1) {
          safeLog.warn(`Found ${existingUsersByClerkId.length} users with the same Clerk ID: ${clerkUser.id}. Using the first one.`);
        }
        
        return existingUsersByClerkId[0].id;
      }
    } catch (clerkIdError) {
      safeLog.error('Error checking user by Clerk ID:', clerkIdError);
      // Continue to the next check
    }
    
    // Check if a user with this email already exists
    const { data: existingUsersByEmail, error: emailCheckError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', primaryEmail);
    
    if (emailCheckError) {
      safeLog.error('Error checking if user exists by email:', emailCheckError);
    }
    
    // If the user exists by email, try to update their record with the Clerk ID
    if (existingUsersByEmail && existingUsersByEmail.length > 0) {
      // If there are multiple users with the same email, log a warning
      if (existingUsersByEmail.length > 1) {
        safeLog.warn(`Found ${existingUsersByEmail.length} users with the same email: ${primaryEmail}. Using the first one.`);
      }
      
      const existingUserByEmail = existingUsersByEmail[0];
      safeLog.log('User exists in Supabase by email:', existingUserByEmail.id);
      
      try {
        // Try to update the user with the Clerk ID
        const updateData: Record<string, string> = {
          updated_at: new Date().toISOString()
        };
        
        // Only include clerk_id if the column exists
        try {
          const { error: testClerkIdError } = await supabase
            .from('users')
            .select('clerk_id')
            .limit(1);
          
          if (!testClerkIdError || !testClerkIdError.message || !testClerkIdError.message.includes('column "clerk_id" does not exist')) {
            updateData.clerk_id = clerkUser.id;
          }
        } catch (e) {
          // If there's an error, we'll assume the column doesn't exist
          safeLog.error('Error testing clerk_id column:', e);
        }
        
        // Try to update display_name and avatar_url if they exist
        try {
          const { error: testDisplayNameError } = await supabase
            .from('users')
            .select('display_name')
            .limit(1);
          
          if (!testDisplayNameError || !testDisplayNameError.message || !testDisplayNameError.message.includes('column "display_name" does not exist')) {
            updateData.display_name = displayName;
          }
        } catch (e) {
          safeLog.error('Error testing display_name column:', e);
        }
        
        try {
          const { error: testAvatarUrlError } = await supabase
            .from('users')
            .select('avatar_url')
            .limit(1);
          
          if (!testAvatarUrlError || !testAvatarUrlError.message || !testAvatarUrlError.message.includes('column "avatar_url" does not exist')) {
            updateData.avatar_url = clerkUser.imageUrl;
          }
        } catch (e) {
          safeLog.error('Error testing avatar_url column:', e);
        }
        
        const { error: updateError } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', existingUserByEmail.id);
        
        if (updateError) {
          safeLog.error('Error updating user:', updateError);
        } else {
          safeLog.log('User updated with Clerk data:', existingUserByEmail.id);
        }
      } catch (updateError) {
        safeLog.error('Error updating user:', updateError);
      }
      
      return existingUserByEmail.id;
    }
    
    // If no user exists, create a new one
    safeLog.log('Creating new user in Supabase for Clerk user:', clerkUser.id);
    
    // Generate a UUID for the new user
    const supabaseUserId = formatUuid(clerkUser.id);
    
    // Ensure the user exists in the database
    const userExists = await ensureUserExists(clerkUser.id);
    if (!userExists) {
      safeLog.error('Failed to ensure user exists in database');
      return null;
    }
    
    safeLog.log('User created/updated in Supabase with ID:', supabaseUserId);
    return supabaseUserId;
  } catch (error) {
    safeLog.error('Error in syncUserWithSupabase:', error);
    return null;
  }
};

/**
 * Get a Supabase user by Clerk ID
 * 
 * @param clerkId The Clerk user ID
 * @returns The Supabase user ID or null if not found
 */
export const getUserByClerkId = async (clerkId: string): Promise<string | null> => {
  if (!clerkId) {
    safeLog.error('No Clerk ID provided');
    return null;
  }

  try {
    // Try to query by clerk_id
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', clerkId);
      
      if (error) {
        // If the error is about the column not existing, we'll handle it gracefully
        if (error.message && error.message.includes('column "clerk_id" does not exist')) {
          safeLog.warn('clerk_id column does not exist in users table. Please run the SQL script to add it.');
          return null;
        }
        
        safeLog.error('Error getting user by Clerk ID:', error);
        return null;
      }
      
      if (data && data.length > 0) {
        // If there are multiple users with the same Clerk ID, log a warning
        if (data.length > 1) {
          safeLog.warn(`Found ${data.length} users with the same Clerk ID: ${clerkId}. Using the first one.`);
        }
        
        return data[0].id;
      }
    } catch (e) {
      safeLog.error('Error querying user by Clerk ID:', e);
    }
    
    return null;
  } catch (error) {
    safeLog.error('Error in getUserByClerkId:', error);
    return null;
  }
};

/**
 * Get a Supabase user by email
 * 
 * @param email The user's email address
 * @returns The Supabase user ID or null if not found
 */
export const getUserByEmail = async (email: string): Promise<string | null> => {
  if (!email) {
    safeLog.error('No email provided');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email);
    
    if (error) {
      safeLog.error('Error getting user by email:', error);
      return null;
    }
    
    if (data && data.length > 0) {
      // If there are multiple users with the same email, log a warning
      if (data.length > 1) {
        safeLog.warn(`Found ${data.length} users with the same email: ${email}. Using the first one.`);
      }
      
      return data[0].id;
    }
    
    return null;
  } catch (error) {
    safeLog.error('Error in getUserByEmail:', error);
    return null;
  }
};

/**
 * Ensure the users table has a clerk_id column
 * This function will add the column if it doesn't exist
 */
const ensureUserTableHasClerkIdColumn = async (): Promise<void> => {
  try {
    // We can't directly query information_schema from the client API
    // Instead, we'll try to use the table and handle the error if the column doesn't exist
    
    // First, let's try to query a user with clerk_id to see if the column exists
    const { data, error } = await supabase
      .from('users')
      .select('clerk_id')
      .limit(1);
    
    if (error) {
      // If the error is about the column not existing, we need to add it
      if (error.message && error.message.includes('column "clerk_id" does not exist')) {
        safeLog.log('clerk_id column does not exist in users table');
        
        // We can't alter the table directly from the client
        // We need to run the SQL script manually or use a custom RPC function
        safeLog.log('Please run the following SQL in the Supabase SQL editor:');
        safeLog.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_id TEXT;');
        safeLog.log('CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);');
        
        // For now, we'll assume the column doesn't exist and continue
        return;
      } else {
        safeLog.error('Error checking if clerk_id column exists:', error);
        return;
      }
    }
    
    // If we got here, the column exists
    safeLog.log('clerk_id column exists in users table');
    
    // Now let's check if we need to add other columns
    const columnsToCheck = ['display_name', 'avatar_url', 'updated_at'];
    const missingColumns = [];
    
    for (const column of columnsToCheck) {
      try {
        const { error: columnError } = await supabase
          .from('users')
          .select(column)
          .limit(1);
        
        if (columnError && columnError.message && columnError.message.includes(`column "${column}" does not exist`)) {
          missingColumns.push(column);
        }
      } catch (e) {
        safeLog.error(`Error checking if ${column} column exists:`, e);
      }
    }
    
    if (missingColumns.length > 0) {
      safeLog.log(`Missing columns in users table: ${missingColumns.join(', ')}`);
      safeLog.log('Please run the following SQL in the Supabase SQL editor:');
      
      for (const column of missingColumns) {
        if (column === 'updated_at') {
          safeLog.log(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${column} TIMESTAMP WITH TIME ZONE;`);
        } else {
          safeLog.log(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${column} TEXT;`);
        }
      }
    }
  } catch (error) {
    safeLog.error('Error in ensureUserTableHasClerkIdColumn:', error);
  }
};

/**
 * Update a user's profile information in Supabase
 * 
 * @param userId The Supabase user ID
 * @param profileData Object containing display_name and bio
 * @returns Boolean indicating success or failure
 */
export const updateUserProfile = async (
  userId: string, 
  profileData: { displayName: string; bio: string }
): Promise<boolean> => {
  try {
    if (!userId) {
      safeLog.error('No user ID provided for profile update');
      return false;
    }

    safeLog.log('Updating user profile in Supabase:', userId);
    
    // Prepare update data
    const updateData: Record<string, string> = {
      updated_at: new Date().toISOString()
    };
    
    // Add display_name if provided
    if (profileData.displayName) {
      updateData.display_name = profileData.displayName;
    }
    
    // Check if bio column exists and add it if it does
    try {
      const { error: testBioError } = await supabase
        .from('users')
        .select('bio')
        .limit(1);
      
      // If no error about missing column, we can update bio
      if (!testBioError || !testBioError.message || !testBioError.message.includes('column "bio" does not exist')) {
        updateData.bio = profileData.bio || '';
      } else {
        // Bio column doesn't exist, try to add it
        try {
          // This would require admin privileges, so it might fail in production
          // In a real app, you'd handle this with a migration script
          const { error: alterTableError } = await supabase.rpc('add_bio_column_if_not_exists');
          
          if (!alterTableError) {
            updateData.bio = profileData.bio || '';
          } else {
            safeLog.error('Could not add bio column:', alterTableError);
          }
        } catch (e) {
          safeLog.error('Error adding bio column:', e);
        }
      }
    } catch (e) {
      safeLog.error('Error testing bio column:', e);
    }
    
    // Update the user record
    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);
    
    if (updateError) {
      safeLog.error('Error updating user profile:', updateError);
      return false;
    }
    
    safeLog.log('User profile updated successfully:', userId);
    return true;
  } catch (error) {
    safeLog.error('Error in updateUserProfile:', error);
    return false;
  }
}; 