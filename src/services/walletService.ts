// This is a temporary version to help debug

import { v4 as uuidv4 } from 'uuid';
import { formatUuid } from './receiptProcessingService';
import { supabase } from './supabaseService';

// Interface for transaction
export interface Transaction {
  id: string;
  user_id: string;
  type: 'earned' | 'spent';
  amount: number;
  description: string;
  created_at: string;
}

/**
 * Get user's Buds balance
 * @param userId User ID
 * @returns User's Buds balance
 */
export const getBudsBalance = async (userId: string): Promise<number> => {
  try {
    const formattedUserId = formatUuid(userId);
    
    // Calculate from transactions first for accuracy
    const { data: earnedData, error: earnedError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', formattedUserId)
      .eq('type', 'earned');
    
    if (earnedError) {
      console.error('Error getting earned transactions:', earnedError);
      
      // If we can't get transactions, fall back to user_stats
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('buds_earned')
        .eq('user_id', formattedUserId)
        .maybeSingle();
      
      if (statsError) {
        console.error('Error getting buds balance from user_stats:', statsError);
        return 0;
      } else if (statsData && statsData.buds_earned >= 0) {
        return statsData.buds_earned;
      }
      
      return 0;
    }
    
    const { data: spentData, error: spentError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', formattedUserId)
      .eq('type', 'spent');
    
    if (spentError) {
      console.error('Error getting spent transactions:', spentError);
      return 0;
    }
    
    // Calculate total earned
    const totalEarned = earnedData?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
    
    // Calculate total spent
    const totalSpent = spentData?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
    
    // Calculate balance
    const balance = totalEarned - totalSpent;
    
    // Get the current value in user_stats
    const { data: statsData, error: statsError } = await supabase
      .from('user_stats')
      .select('buds_earned')
      .eq('user_id', formattedUserId)
      .maybeSingle();
    
    // If the balance differs from what's in user_stats, update user_stats
    if (!statsError && (statsData === null || statsData.buds_earned !== balance)) {
      try {
        // Use the RPC function to ensure consistency
        const { error } = await supabase.rpc('update_buds_balance', {
          p_user_id: formattedUserId,
          p_amount: balance,
          p_is_earning: true
        });
        
        if (error) {
          console.error('Error updating buds balance with RPC:', error);
          
          // Fallback to direct update
          const { error: updateError } = await supabase
            .from('user_stats')
            .update({ buds_earned: balance })
            .eq('user_id', formattedUserId);
          
          if (updateError) {
            console.error('Error updating buds balance in user_stats:', updateError);
          }
        }
      } catch (updateError) {
        console.error('Error updating buds balance:', updateError);
      }
    }
    
    return balance;
  } catch (error) {
    console.error('Error getting Buds balance:', error);
    return 0;
  }
};

/**
 * Update user's Buds balance
 * @param userId User ID
 * @param newBalance New Buds balance
 */
export const updateBudsBalance = async (userId: string, newBalance: number): Promise<void> => {
  try {
    // For testing, just log
    console.log(`Updated buds balance for ${userId} to ${newBalance}`);
  } catch (error) {
    console.error('Error updating Buds balance:', error);
    throw error;
  }
};

/**
 * Get user's transaction history
 * @param userId User ID
 * @returns Array of transactions
 */
export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const formattedUserId = formatUuid(userId);
    
    // Get transactions from the database
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', formattedUserId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
    
    // If no transactions are found, check if the user has the Early Adopter badge
    // and ensure a transaction is recorded for it
    if (!data || data.length === 0) {
      // First get the Early Adopter badge ID
      const { data: badgeData, error: badgeError } = await supabase
        .from('badges')
        .select('id')
        .eq('name', 'Early Adopter')
        .single();
      
      if (badgeError || !badgeData) {
        console.error('Error finding Early Adopter badge:', badgeError);
      } else {
        // Check if user has this badge
        const { data: userBadgeData, error: userBadgeError } = await supabase
          .from('user_badges')
          .select('id')
          .eq('user_id', formattedUserId)
          .eq('badge_id', badgeData.id)
          .maybeSingle();
        
        if (userBadgeError) {
          console.error('Error checking if user has Early Adopter badge:', userBadgeError);
        } else if (userBadgeData) {
          // User has the badge but no transaction - create one
          const { error: insertError } = await supabase
            .from('transactions')
            .insert({
              user_id: formattedUserId,
              type: 'earned',
              amount: 100,
              description: 'Earned badge: Early Adopter'
            });
          
          if (insertError) {
            console.error('Error creating Early Adopter transaction:', insertError);
          } else {
            // Fetch transactions again
            const { data: updatedData, error: refetchError } = await supabase
              .from('transactions')
              .select('*')
              .eq('user_id', formattedUserId)
              .order('created_at', { ascending: false });
            
            if (refetchError) {
              console.error('Error refetching transactions:', refetchError);
            } else if (updatedData) {
              return updatedData;
            }
          }
        }
      }
    }
    
    return data || [];
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
};

/**
 * Earn Buds for an eco-friendly action
 * @param userId User ID
 * @param amount Amount of Buds to earn
 * @param description Description of the action
 */
export const earnBuds = async (
  userId: string,
  amount: number,
  description: string
): Promise<boolean> => {
  try {
    const formattedUserId = formatUuid(userId);
    
    // Get current buds balance
    const currentBalance = await getBudsBalance(userId);
    const newBalance = currentBalance + amount;
    
    // 1. Update user stats to add buds
    const { error: statsError } = await supabase.rpc('update_buds_balance', {
      p_user_id: formattedUserId,
      p_amount: amount,
      p_is_earning: true
    });
    
    if (statsError) {
      console.error('Error updating user stats:', statsError);
      return false;
    }
    
    // 2. Record the transaction
    const { error: recordError } = await supabase
      .from('transactions')
      .insert({
        user_id: formattedUserId,
        type: 'earned',
        amount,
        description
      });
    
    if (recordError) {
      console.error('Error recording transaction:', recordError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error earning Buds:', error);
    return false;
  }
};

/**
 * Spend Buds for a redemption
 * @param userId User ID
 * @param amount Amount of Buds to spend
 * @param description Description of the redemption
 */
export const spendBuds = async (
  userId: string,
  amount: number,
  description: string
): Promise<boolean> => {
  try {
    const formattedUserId = formatUuid(userId);
    
    // Check if user has enough buds
    const currentBalance = await getBudsBalance(userId);
    
    if (currentBalance < amount) {
      console.error(`User ${userId} doesn't have enough buds (${currentBalance}) to spend ${amount}`);
      return false;
    }
    
    // 1. Update user stats to subtract buds
    const { error: statsError } = await supabase.rpc('update_buds_balance', {
      p_user_id: formattedUserId,
      p_amount: amount,
      p_is_earning: false
    });
    
    if (statsError) {
      console.error('Error updating user stats:', statsError);
      return false;
    }
    
    // 2. Record the transaction
    const { error: recordError } = await supabase
      .from('transactions')
      .insert({
        user_id: formattedUserId,
        type: 'spent',
        amount,
        description
      });
    
    if (recordError) {
      console.error('Error recording transaction:', recordError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error spending Buds:', error);
    return false;
  }
};

// Helper function to generate mock transactions for development
const generateMockTransactions = (userId: string): Transaction[] => {
  const now = new Date();
  
  return [
    {
      id: '1',
      user_id: userId,
      type: 'earned',
      amount: 50,
      description: 'Scanned eco-friendly receipt',
      created_at: new Date(now.setDate(now.getDate() - 1)).toISOString()
    },
    {
      id: '2',
      user_id: userId,
      type: 'earned',
      amount: 25,
      description: 'Recycled plastic bottle',
      created_at: new Date(now.setDate(now.getDate() - 3)).toISOString()
    },
    {
      id: '3',
      user_id: userId,
      type: 'earned',
      amount: 100,
      description: 'Completed eco challenge',
      created_at: new Date(now.setDate(now.getDate() - 7)).toISOString()
    },
    {
      id: '4',
      user_id: userId,
      type: 'spent',
      amount: 75,
      description: 'Redeemed: Early Adopter Badge',
      created_at: new Date(now.setDate(now.getDate() - 10)).toISOString()
    }
  ];
}; 