import { supabase } from './supabaseClient';
import { formatUuid } from './ecoActionsService';
import { toast } from 'sonner';
import { earnBuds } from './walletService';

// Badge interface
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  buds_reward: number;
  requirements?: string;
  created_at?: string;
}

// User Badge interface
export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  created_at?: string;
  badge?: Badge;
}

/**
 * Get all available badges
 */
export const getAllBadges = async (): Promise<{ data: Badge[] | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching badges:', error);
      return { data: null, error: error.message };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception in getAllBadges:', error);
    return { data: null, error: 'Failed to fetch badges' };
  }
};

/**
 * Get badges earned by a user
 */
export const getUserBadges = async (userId: string): Promise<{ data: UserBadge[] | null; error: string | null }> => {
  try {
    const formattedUserId = formatUuid(userId);
    
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        *,
        badge:badge_id (*)
      `)
      .eq('user_id', formattedUserId)
      .order('earned_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user badges:', error);
      return { data: null, error: error.message };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception in getUserBadges:', error);
    return { data: null, error: 'Failed to fetch user badges' };
  }
};

/**
 * Check if a user has earned a specific badge
 */
export const hasUserEarnedBadge = async (userId: string, badgeName: string): Promise<boolean> => {
  try {
    const formattedUserId = formatUuid(userId);
    
    // First, get the badge ID
    const { data: badgeData, error: badgeError } = await supabase
      .from('badges')
      .select('id')
      .eq('name', badgeName)
      .single();
    
    if (badgeError || !badgeData) {
      console.error('Error fetching badge:', badgeError);
      return false;
    }
    
    // Check if the user has earned this badge
    const { data, error } = await supabase
      .from('user_badges')
      .select('id')
      .eq('user_id', formattedUserId)
      .eq('badge_id', badgeData.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking if user earned badge:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Exception in hasUserEarnedBadge:', error);
    return false;
  }
};

/**
 * Award a badge to a user
 */
export const awardBadge = async (userId: string, badgeName: string): Promise<{ success: boolean; error: string | null }> => {
  try {
    const formattedUserId = formatUuid(userId);
    
    // Check if the user already has this badge
    const alreadyEarned = await hasUserEarnedBadge(userId, badgeName);
    if (alreadyEarned) {
      console.log(`User ${userId} already has the ${badgeName} badge`);
      return { success: true, error: null };
    }
    
    // Get the badge details
    const { data: badge, error: badgeError } = await supabase
      .from('badges')
      .select('*')
      .eq('name', badgeName)
      .single();
    
    if (badgeError || !badge) {
      console.error('Error fetching badge:', badgeError);
      return { success: false, error: 'Badge not found' };
    }
    
    // Award the badge to the user
    const { error: awardError } = await supabase
      .from('user_badges')
      .insert({
        user_id: formattedUserId,
        badge_id: badge.id,
        earned_at: new Date().toISOString()
      });
    
    if (awardError) {
      console.error('Error awarding badge:', awardError);
      return { success: false, error: awardError.message };
    }
    
    // Award buds for earning the badge
    if (badge.buds_reward > 0) {
      const budsSuccess = await earnBuds(
        userId,
        badge.buds_reward,
        `Earned badge: ${badge.name}`
      );
      
      if (!budsSuccess) {
        console.error(`Failed to award buds for badge ${badge.name}`);
        // Continue anyway, the badge was awarded successfully
      }
    }
    
    // Show a notification
    showBadgeNotification(badge);
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Exception in awardBadge:', error);
    return { success: false, error: 'Failed to award badge' };
  }
};

/**
 * Check and award badges based on user actions
 */
export const checkAndAwardBadges = async (userId: string): Promise<void> => {
  try {
    const formattedUserId = formatUuid(userId);
    
    // Get user actions
    const { data: userActions, error: actionsError } = await supabase
      .from('user_actions')
      .select(`
        *,
        eco_actions (
          id,
          category_id,
          title
        )
      `)
      .eq('user_id', formattedUserId)
      .order('completed_at', { ascending: false });
    
    if (actionsError || !userActions) {
      console.error('Error fetching user actions:', actionsError);
      return;
    }
    
    // Count actions by category
    const actionCounts: Record<string, number> = {};
    const actionTitles: Record<string, number> = {};
    
    // Track unique days with actions
    const actionDays = new Set<string>();
    
    // Track consecutive days for streak
    let consecutiveDays = 0;
    let lastDate: Date | null = null;
    
    // Track energy actions by date
    const energyActionDays = new Set<string>();
    
    userActions.forEach(action => {
      const category = action.eco_actions?.category_id || 'unknown';
      const title = action.eco_actions?.title || 'unknown';
      const completedAt = new Date(action.completed_at);
      const dateStr = completedAt.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Count by category
      actionCounts[category] = (actionCounts[category] || 0) + 1;
      
      // Count by title
      actionTitles[title] = (actionTitles[title] || 0) + 1;
      
      // Add to unique days
      actionDays.add(dateStr);
      
      // Track energy actions by date
      if (category === 'energy') {
        energyActionDays.add(dateStr);
      }
      
      // Check for consecutive days (for streak badge)
      if (!lastDate) {
        lastDate = completedAt;
        consecutiveDays = 1;
      } else {
        const dayDiff = Math.floor((lastDate.getTime() - completedAt.getTime()) / (1000 * 60 * 60 * 24));
        if (dayDiff === 1) {
          consecutiveDays++;
          lastDate = completedAt;
        } else if (dayDiff > 1) {
          // Reset streak if gap is more than 1 day
          consecutiveDays = 1;
          lastDate = completedAt;
        }
      }
    });
    
    // Check for badges
    
    // Waste Warrior: 50+ waste actions
    if (actionCounts['waste'] >= 50) {
      await awardBadge(userId, 'Waste Warrior');
    }
    
    // Transit Champion: 10+ transportation actions
    if (actionCounts['transportation'] >= 10) {
      await awardBadge(userId, 'Transit Champion');
    }
    
    // Plant Power: 15+ meatless meal actions
    if (actionTitles['Ate a meatless meal'] >= 15) {
      await awardBadge(userId, 'Plant Power');
    }
    
    // Eco Streak: 7-day streak
    if (consecutiveDays >= 7) {
      await awardBadge(userId, 'Eco Streak');
    }
    
    // Energy Saver: 30+ days with energy actions
    if (energyActionDays.size >= 30) {
      await awardBadge(userId, 'Energy Saver');
    }
    
    // Update user stats with streak information
    const { error: statsError } = await supabase
      .from('user_stats')
      .update({
        streak_days: consecutiveDays,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', formattedUserId);
    
    if (statsError) {
      console.error('Error updating user stats with streak:', statsError);
    }
    
  } catch (error) {
    console.error('Exception in checkAndAwardBadges:', error);
  }
};

/**
 * Show a badge notification
 */
export const showBadgeNotification = (badge: Badge): void => {
  // Create a toast notification
  toast.success(`Badge Earned: ${badge.name}`, {
    description: `${badge.description}${badge.buds_reward > 0 ? ` (+${badge.buds_reward} buds)` : ''}`,
    duration: 5000,
    icon: badge.icon,
  });
}; 