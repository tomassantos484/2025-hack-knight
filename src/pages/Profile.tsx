import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Trophy, Settings, Bell, Globe, ChevronRight, ExternalLink, BarChart3, Calendar, LogOut, Leaf, RefreshCw } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import ActionHistory from '../components/ActionHistory';
import { supabase } from '../services/supabaseService';
import { formatUuid, refreshUserStats } from '../services/ecoActionsService';
import { Badge, UserBadge, getUserBadges, checkAndAwardBadges, awardBadge } from '../services/badgeService';
import { updateUserProfile, getUserByClerkId } from '../services/userService';

// Extended Badge type with earned and eligible properties
interface ExtendedBadge extends Badge {
  earned: boolean;
  eligible?: boolean;
  date?: string | null;
}

const Profile = () => {
  const { signOut, isSignedIn } = useAuth();
  const { user, isLoaded: userIsLoaded } = useUser();
  const navigate = useNavigate();
  
  const [userStats, setUserStats] = useState({
    streak: 0,
    actions: 0,
    co2Saved: 0,
    wasteRecycled: 0,
    budsEarned: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshingStats, setRefreshingStats] = useState(false);
  const [badges, setBadges] = useState<ExtendedBadge[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(true);
  
  // User settings state
  const [userSettings, setUserSettings] = useState({
    notifications: true,
    locationServices: false,
    emailPreferences: {
      actionReminders: true,
      weeklyDigest: true,
      promotions: false
    },
    privacySettings: {
      shareData: false,
      anonymizeStats: true
    }
  });
  
  // State for modals
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  // Debug log for authentication state
  useEffect(() => {
    console.log('Auth state in Profile:', { 
      isSignedIn, 
      user: user?.username || user?.firstName,
      userData: user
    });
  }, [isSignedIn, user]);
  
  // Redirect if not signed in
  useEffect(() => {
    if (isSignedIn === false) {
      navigate('/sign-in');
    }
  }, [isSignedIn, navigate]);
  
  // Fetch user stats from Supabase
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!isSignedIn || !user) return;
      
      try {
        setLoadingStats(true);
        
        // Format the user ID as a UUID
        const formattedUserId = formatUuid(user.id);
        console.log('Formatted user ID for Supabase:', formattedUserId);
        
        // Get user stats from Supabase
        const { data: statsData, error: statsError } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', formattedUserId)
          .maybeSingle();
        
        if (statsError) {
          console.error('Error fetching user stats:', statsError);
        } else if (statsData) {
          // Update stats with data from Supabase
          setUserStats({
            streak: 0, // Streak is not tracked in the database yet
            actions: statsData.total_actions_completed || 0,
            co2Saved: statsData.total_carbon_footprint || 0,
            wasteRecycled: 0, // Not tracked in the database yet
            budsEarned: statsData.buds_earned || 0
          });
          
          // Refresh user stats in the background to ensure they're up-to-date
          // This will help fix any discrepancies between the displayed stats and the actual data
          refreshUserStats(user.id).then(({ success, error }) => {
            if (success) {
              console.log('User stats refreshed successfully');
              // Fetch the updated stats
              supabase
                .from('user_stats')
                .select('*')
                .eq('user_id', formattedUserId)
                .maybeSingle()
                .then(({ data: refreshedData, error: refreshError }) => {
                  if (!refreshError && refreshedData) {
                    // Update the UI with the refreshed stats
                    setUserStats({
                      streak: 0,
                      actions: refreshedData.total_actions_completed || 0,
                      co2Saved: refreshedData.total_carbon_footprint || 0,
                      wasteRecycled: 0,
                      budsEarned: refreshedData.buds_earned || 0
                    });
                  }
                });
            } else if (error) {
              console.error('Error refreshing user stats:', error);
            }
          });
        }
        
        // If no stats found, try to calculate them from user actions
        if (!statsData) {
          // Refresh user stats to create them if they don't exist
          const { success, error } = await refreshUserStats(user.id);
          
          if (success) {
            // Fetch the newly created stats
            const { data: newStatsData, error: newStatsError } = await supabase
              .from('user_stats')
              .select('*')
              .eq('user_id', formattedUserId)
              .maybeSingle();
            
            if (!newStatsError && newStatsData) {
              setUserStats({
                streak: 0,
                actions: newStatsData.total_actions_completed || 0,
                co2Saved: newStatsData.total_carbon_footprint || 0,
                wasteRecycled: 0,
                budsEarned: newStatsData.buds_earned || 0
              });
            } else {
              // Fall back to calculating stats from actions
              const { data: actionsData, error: actionsError } = await supabase
                .from('user_actions')
                .select('*, eco_actions(co2_saved)')
                .eq('user_id', formattedUserId);
              
              if (actionsError) {
                console.error('Error fetching user actions:', actionsError);
              } else if (actionsData && actionsData.length > 0) {
                // Calculate stats from actions
                const totalActions = actionsData.length;
                const totalBudsEarned = actionsData.reduce((sum, action) => sum + (action.buds_earned || 0), 0);
                const totalCO2Saved = actionsData.reduce((sum, action) => {
                  const co2Saved = action.eco_actions?.co2_saved || 0;
                  return sum + co2Saved;
                }, 0);
                
                setUserStats({
                  streak: 0,
                  actions: totalActions,
                  co2Saved: totalCO2Saved,
                  wasteRecycled: 0,
                  budsEarned: totalBudsEarned
                });
              }
            }
          } else {
            console.error('Error refreshing user stats:', error);
          }
        }
      } catch (error) {
        console.error('Error in fetchUserStats:', error);
      } finally {
        setLoadingStats(false);
      }
    };
    
    fetchUserStats();
  }, [isSignedIn, user]);
  
  // Check if user is eligible for a badge
  const isEligibleForBadge = useCallback((badgeName: string, stats: typeof userStats): boolean => {
    switch (badgeName) {
      case 'Early Adopter':
        return true; // Everyone is eligible for Early Adopter
      case 'Waste Warrior':
        return stats.actions >= 5; // Eligible after 5 actions
      case 'Transit Champion':
        return stats.actions >= 10; // Eligible after 10 actions
      case 'Plant Power':
        return stats.actions >= 15; // Eligible after 15 actions
      case 'Eco Streak':
        return stats.streak >= 7; // Eligible after 7-day streak
      case 'Energy Saver':
        return stats.co2Saved >= 50; // Eligible after saving 50kg CO2
      default:
        return false;
    }
  }, []);
  
  // Fetch user badges
  useEffect(() => {
    const fetchUserBadges = async () => {
      if (!isSignedIn || !user) return;
      
      try {
        setLoadingBadges(true);
        
        // Check for and award badges based on user actions
        await checkAndAwardBadges(user.id);
        
        // Get all available badges
        const { data: allBadges, error: badgesError } = await supabase
          .from('badges')
          .select('*');
        
        if (badgesError) {
          console.error('Error fetching all badges:', badgesError);
          return;
        }
        
        // Get user badges
        const { data: userBadges, error } = await getUserBadges(user.id);
        
        if (error) {
          console.error('Error fetching user badges:', error);
          return;
        }
        
        if (!userBadges || userBadges.length === 0) {
          // If no badges found, award the Early Adopter badge
          const { success } = await awardBadge(user.id, 'Early Adopter');
          if (success) {
            // Fetch badges again after awarding
            const { data: updatedBadges } = await getUserBadges(user.id);
            
            // Create a map of earned badges
            const earnedBadgesMap = new Map();
            updatedBadges?.forEach(userBadge => {
              if (userBadge.badge) {
                earnedBadgesMap.set(userBadge.badge.id, {
                  ...userBadge.badge,
                  earned: true,
                  date: userBadge.earned_at ? format(new Date(userBadge.earned_at), 'MMM yyyy') : null
                });
              }
            });
            
            // Combine with all badges to show both earned and available
            const formattedBadges = allBadges?.map(badge => {
              const earnedBadge = earnedBadgesMap.get(badge.id);
              return earnedBadge || {
                ...badge,
                earned: false,
                eligible: false // Default to ineligible
              };
            }) || [];
            
            setBadges(formattedBadges);
          }
        } else {
          // Create a map of earned badges
          const earnedBadgesMap = new Map();
          userBadges.forEach(userBadge => {
            if (userBadge.badge) {
              earnedBadgesMap.set(userBadge.badge.id, {
                ...userBadge.badge,
                earned: true,
                date: userBadge.earned_at ? format(new Date(userBadge.earned_at), 'MMM yyyy') : null
              });
            }
          });
          
          // Combine with all badges to show both earned and available
          const formattedBadges = allBadges?.map(badge => {
            const earnedBadge = earnedBadgesMap.get(badge.id);
            return earnedBadge || {
              ...badge,
              earned: false,
              eligible: isEligibleForBadge(badge.name, userStats) // Check eligibility
            };
          }) || [];
          
          setBadges(formattedBadges);
        }
      } catch (err) {
        console.error('Error in fetchUserBadges:', err);
      } finally {
        setLoadingBadges(false);
      }
    };
    
    fetchUserBadges();
  }, [isSignedIn, user, userStats, isEligibleForBadge]);
  
  // Format the user's creation date for display
  const formatJoinDate = () => {
    if (!user?.createdAt) return 'new member';
    
    try {
      const createdAt = new Date(user.createdAt);
      return `member since ${format(createdAt, 'MMMM yyyy')}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'member';
    }
  };
  
  // Format the user's creation date for badge
  const formatBadgeDate = () => {
    if (!user?.createdAt) return 'Recently';
    
    try {
      const createdAt = new Date(user.createdAt);
      return format(createdAt, 'MMM yyyy');
    } catch (error) {
      console.error('Error formatting badge date:', error);
      return 'Recently';
    }
  };
  
  // Get user's display name
  const getDisplayName = () => {
    if (!userIsLoaded || !user) return 'EcoVision User';
    
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
      return user.firstName;
    } else if (user.username) {
      return user.username;
    } else {
      return 'EcoVision User';
    }
  };
  
  // Get username or email as identifier
  const getUserIdentifier = () => {
    if (!userIsLoaded || !user) return 'user';
    
    return user.username || user.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'user';
  };
  
  // Generate user stats based on user data
  const getUserStats = () => {
    // For new users, show starter stats
    return {
      streak: 0,
      actions: 0,
      co2Saved: 0,
      wasteRecycled: 0
    };
  };
  
  // Generate challenges based on user data
  const getChallenges = () => {
    // For new users, show no challenges yet
    return [];
  };
  
  // Get challenges with user-specific data
  const recentChallenges = getChallenges();

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      // Use React Router's navigate function instead of forcing a page reload
      sessionStorage.setItem('justSignedOut', 'true');
      navigate('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  // Handle manual refresh of user stats
  const handleRefreshStats = async () => {
    if (!user) return;
    
    try {
      setRefreshingStats(true);
      toast.info('Refreshing your stats...');
      
      const { success, error } = await refreshUserStats(user.id);
      
      if (success) {
        // Fetch the updated stats
        const formattedUserId = formatUuid(user.id);
        const { data: refreshedData, error: refreshError } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', formattedUserId)
          .maybeSingle();
        
        if (!refreshError && refreshedData) {
          // Update the UI with the refreshed stats
          setUserStats({
            streak: 0,
            actions: refreshedData.total_actions_completed || 0,
            co2Saved: refreshedData.total_carbon_footprint || 0,
            wasteRecycled: 0,
            budsEarned: refreshedData.buds_earned || 0
          });
          toast.success('Stats refreshed successfully!');
        } else {
          toast.error('Failed to fetch updated stats');
        }
      } else {
        toast.error(`Failed to refresh stats: ${error}`);
      }
    } catch (err) {
      console.error('Error in handleRefreshStats:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setRefreshingStats(false);
    }
  };

  // Handle claiming a badge
  const handleClaimBadge = async (badgeName: string) => {
    if (!isSignedIn || !user) return;
    
    try {
      // Award the badge
      const { success, error } = await awardBadge(user.id, badgeName);
      
      if (success) {
        toast.success(`Badge earned: ${badgeName}`);
        
        // Refresh badges
        const { data: updatedBadges } = await getUserBadges(user.id);
        
        // Get all available badges again
        const { data: allBadges } = await supabase
          .from('badges')
          .select('*');
        
        if (updatedBadges && allBadges) {
          // Create a map of earned badges
          const earnedBadgesMap = new Map();
          updatedBadges.forEach(userBadge => {
            if (userBadge.badge) {
              earnedBadgesMap.set(userBadge.badge.id, {
                ...userBadge.badge,
                earned: true,
                date: userBadge.earned_at ? format(new Date(userBadge.earned_at), 'MMM yyyy') : null
              });
            }
          });
          
          // Combine with all badges
          const formattedBadges = allBadges.map(badge => {
            const earnedBadge = earnedBadgesMap.get(badge.id);
            return earnedBadge || {
              ...badge,
              earned: false,
              eligible: isEligibleForBadge(badge.name, userStats)
            };
          });
          
          setBadges(formattedBadges);
        }
      } else {
        toast.error(`Failed to earn badge: ${error}`);
      }
    } catch (err) {
      console.error('Error claiming badge:', err);
      toast.error('An error occurred while claiming the badge.');
    }
  };

  // Handle toggle switches
  const handleToggle = (setting: 'notifications' | 'locationServices') => {
    setUserSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    
    // Show success toast
    toast.success(`${setting === 'notifications' ? 'Notifications' : 'Location services'} ${userSettings[setting] ? 'disabled' : 'enabled'}`);
    
    // In a real app, you would save this to the database
    // For now, we'll just save to localStorage
    setTimeout(() => {
      localStorage.setItem('userSettings', JSON.stringify({
        ...userSettings,
        [setting]: !userSettings[setting]
      }));
    }, 0);
  };
  
  // Handle opening a settings modal
  const openSettingsModal = (modalName: string) => {
    setActiveModal(modalName);
  };
  
  // Handle closing a modal
  const closeModal = () => {
    setActiveModal(null);
  };
  
  // Handle saving email preferences
  const saveEmailPreferences = (preferences: typeof userSettings.emailPreferences) => {
    setUserSettings(prev => ({
      ...prev,
      emailPreferences: preferences
    }));
    
    // Show success toast
    toast.success('Email preferences updated');
    
    // Save to localStorage
    setTimeout(() => {
      localStorage.setItem('userSettings', JSON.stringify({
        ...userSettings,
        emailPreferences: preferences
      }));
    }, 0);
    
    // Close the modal
    closeModal();
  };
  
  // Handle saving privacy settings
  const savePrivacySettings = (settings: typeof userSettings.privacySettings) => {
    setUserSettings(prev => ({
      ...prev,
      privacySettings: settings
    }));
    
    // Show success toast
    toast.success('Privacy settings updated');
    
    // Save to localStorage
    setTimeout(() => {
      localStorage.setItem('userSettings', JSON.stringify({
        ...userSettings,
        privacySettings: settings
      }));
    }, 0);
    
    // Close the modal
    closeModal();
  };
  
  // Handle updating profile information
  const updateProfileInfo = async (profileData: { displayName: string, bio: string }) => {
    if (!isSignedIn || !user) {
      toast.error('You must be signed in to update your profile');
      return;
    }
    
    try {
      // Show loading toast
      toast.loading('Updating profile information...');
      
      // Get the Supabase user ID from the Clerk ID
      const supabaseUserId = await getUserByClerkId(user.id);
      
      if (!supabaseUserId) {
        toast.error('Could not find your user account');
        return;
      }
      
      // Update the profile in Supabase
      const success = await updateUserProfile(supabaseUserId, profileData);
      
      if (success) {
        toast.success('Profile information updated successfully');
      } else {
        toast.error('Failed to update profile information');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An error occurred while updating your profile');
    } finally {
      // Close the modal
      closeModal();
    }
  };

  // Load user settings from localStorage
  useEffect(() => {
    const loadUserSettings = () => {
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          setUserSettings(prev => ({
            ...prev,
            ...parsedSettings
          }));
        } catch (err) {
          console.error('Error loading user settings:', err);
        }
      }
    };
    
    loadUserSettings();
  }, []);

  // Profile Info Modal
  const ProfileInfoModal = ({ 
    isOpen, 
    onClose, 
    onSave, 
    user 
  }: { 
    isOpen: boolean; 
    onClose: () => void; 
    onSave: (data: { displayName: string; bio: string }) => void; 
    user: { id: string; firstName?: string | null; lastName?: string | null } 
  }) => {
    const [displayName, setDisplayName] = useState(user?.firstName || '');
    const [bio, setBio] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    // Fetch current profile data when modal opens
    useEffect(() => {
      const fetchProfileData = async () => {
        if (isOpen && user) {
          setIsLoading(true);
          try {
            // Get the Supabase user ID from the Clerk ID
            const supabaseUserId = await getUserByClerkId(user.id);
            
            if (supabaseUserId) {
              // Fetch the user data from Supabase
              const { data, error } = await supabase
                .from('users')
                .select('display_name, bio')
                .eq('id', supabaseUserId)
                .single();
              
              if (!error && data) {
                // Set the display name and bio from the database
                setDisplayName(data.display_name || user?.firstName || '');
                setBio(data.bio || '');
              }
            }
          } catch (error) {
            console.error('Error fetching profile data:', error);
          } finally {
            setIsLoading(false);
          }
        }
      };
      
      fetchProfileData();
    }, [isOpen, user]);
    
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full">
          <h2 className="text-xl font-medium mb-4">Update Profile Information</h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="w-8 h-8 border-2 border-eco-green border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Display Name</label>
                <input 
                  type="text" 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-24"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2 mt-6">
            <button 
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm"
            >
              Cancel
            </button>
            <button 
              onClick={() => onSave({ displayName, bio })}
              disabled={isLoading}
              className="px-4 py-2 bg-eco-green text-white rounded-md text-sm disabled:bg-eco-green/50"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Email Preferences Modal
  const EmailPreferencesModal = ({ 
    isOpen, 
    onClose, 
    onSave, 
    preferences 
  }: { 
    isOpen: boolean; 
    onClose: () => void; 
    onSave: (preferences: { actionReminders: boolean; weeklyDigest: boolean; promotions: boolean }) => void; 
    preferences: { actionReminders: boolean; weeklyDigest: boolean; promotions: boolean } 
  }) => {
    const [actionReminders, setActionReminders] = useState(preferences.actionReminders);
    const [weeklyDigest, setWeeklyDigest] = useState(preferences.weeklyDigest);
    const [promotions, setPromotions] = useState(preferences.promotions);
    
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full">
          <h2 className="text-xl font-medium mb-4">Email Preferences</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Action Reminders</h3>
                <p className="text-sm text-eco-dark/70">Receive reminders to complete eco actions</p>
              </div>
              <div 
                className={`w-10 h-6 ${actionReminders ? 'bg-eco-green' : 'bg-eco-dark/30'} rounded-full relative cursor-pointer`}
                onClick={() => setActionReminders(!actionReminders)}
              >
                <div className={`absolute ${actionReminders ? 'right-1' : 'left-1'} top-1 w-4 h-4 bg-white rounded-full transition-all`}></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Weekly Digest</h3>
                <p className="text-sm text-eco-dark/70">Receive a weekly summary of your eco impact</p>
              </div>
              <div 
                className={`w-10 h-6 ${weeklyDigest ? 'bg-eco-green' : 'bg-eco-dark/30'} rounded-full relative cursor-pointer`}
                onClick={() => setWeeklyDigest(!weeklyDigest)}
              >
                <div className={`absolute ${weeklyDigest ? 'right-1' : 'left-1'} top-1 w-4 h-4 bg-white rounded-full transition-all`}></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Promotions & News</h3>
                <p className="text-sm text-eco-dark/70">Receive updates about eco-friendly products and news</p>
              </div>
              <div 
                className={`w-10 h-6 ${promotions ? 'bg-eco-green' : 'bg-eco-dark/30'} rounded-full relative cursor-pointer`}
                onClick={() => setPromotions(!promotions)}
              >
                <div className={`absolute ${promotions ? 'right-1' : 'left-1'} top-1 w-4 h-4 bg-white rounded-full transition-all`}></div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <button 
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm"
            >
              Cancel
            </button>
            <button 
              onClick={() => onSave({ actionReminders, weeklyDigest, promotions })}
              className="px-4 py-2 bg-eco-green text-white rounded-md text-sm"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Privacy Settings Modal
  const PrivacySettingsModal = ({ 
    isOpen, 
    onClose, 
    onSave, 
    settings 
  }: { 
    isOpen: boolean; 
    onClose: () => void; 
    onSave: (settings: { shareData: boolean; anonymizeStats: boolean }) => void; 
    settings: { shareData: boolean; anonymizeStats: boolean } 
  }) => {
    const [shareData, setShareData] = useState(settings.shareData);
    const [anonymizeStats, setAnonymizeStats] = useState(settings.anonymizeStats);
    
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full">
          <h2 className="text-xl font-medium mb-4">Privacy Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Share Usage Data</h3>
                <p className="text-sm text-eco-dark/70">Help us improve by sharing anonymous usage data</p>
              </div>
              <div 
                className={`w-10 h-6 ${shareData ? 'bg-eco-green' : 'bg-eco-dark/30'} rounded-full relative cursor-pointer`}
                onClick={() => setShareData(!shareData)}
              >
                <div className={`absolute ${shareData ? 'right-1' : 'left-1'} top-1 w-4 h-4 bg-white rounded-full transition-all`}></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Anonymize Statistics</h3>
                <p className="text-sm text-eco-dark/70">Hide your identity in public statistics</p>
              </div>
              <div 
                className={`w-10 h-6 ${anonymizeStats ? 'bg-eco-green' : 'bg-eco-dark/30'} rounded-full relative cursor-pointer`}
                onClick={() => setAnonymizeStats(!anonymizeStats)}
              >
                <div className={`absolute ${anonymizeStats ? 'right-1' : 'left-1'} top-1 w-4 h-4 bg-white rounded-full transition-all`}></div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <button 
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm"
            >
              Cancel
            </button>
            <button 
              onClick={() => onSave({ shareData, anonymizeStats })}
              className="px-4 py-2 bg-eco-green text-white rounded-md text-sm"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Show loading state while user data is loading
  if (!userIsLoaded) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-eco-green border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-eco-dark">Loading your profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-24 h-24 rounded-full bg-eco-cream flex items-center justify-center border-4 border-white eco-shadow overflow-hidden"
            >
              {user?.imageUrl ? (
                <img 
                  src={user.imageUrl} 
                  alt={getDisplayName()} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={40} className="text-eco-dark/70" />
              )}
            </motion.div>
            
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl md:text-3xl font-medium"
              >
                {getDisplayName()}
              </motion.h1>
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-eco-dark/70 flex items-center gap-2"
              >
                @{getUserIdentifier()}
                <span className="inline-block w-1 h-1 rounded-full bg-eco-dark/40"></span>
                {formatJoinDate()}
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-4 mt-2"
              >
                <div className="text-sm">
                  <span className="font-medium">{userStats.actions}</span>
                  <span className="text-eco-dark/70 ml-1">actions</span>
                </div>
                
                <div className="text-sm">
                  <span className="font-medium">{userStats.co2Saved.toFixed(1)} kg</span>
                  <span className="text-eco-dark/70 ml-1">CO₂ saved</span>
                </div>
                
                <div className="text-sm">
                  <span className="font-medium">{userStats.budsEarned}</span>
                  <span className="text-eco-dark/70 ml-1">buds earned</span>
                </div>
                
                <div className="text-sm">
                  <span className="font-medium">{userStats.streak} days</span>
                  <span className="text-eco-dark/70 ml-1">streak</span>
                </div>
                
                <button
                  onClick={handleRefreshStats}
                  disabled={refreshingStats}
                  className="text-xs flex items-center gap-1 text-eco-green hover:text-eco-green/80 transition-colors"
                  title="Refresh stats"
                >
                  <RefreshCw size={14} className={`${refreshingStats ? 'animate-spin' : ''}`} />
                  <span>{refreshingStats ? 'Refreshing...' : 'Refresh'}</span>
                </button>
              </motion.div>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="badges">
          <TabsList className="bg-eco-cream mb-6">
            <TabsTrigger value="badges" className="flex items-center gap-1.5">
              <Trophy size={16} />
              badges
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-1.5">
              <BarChart3 size={16} />
              action history
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1.5">
              <Settings size={16} />
              settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="badges" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {loadingBadges ? (
                // Loading state for badges
                Array.from({ length: 6 }).map((_, index) => (
                  <motion.div
                    key={`badge-skeleton-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + (index * 0.05) }}
                    className="p-5 rounded-xl border border-dashed border-eco-dark/20 bg-eco-cream/50"
                  >
                    <div className="w-12 h-12 rounded-full bg-eco-cream/70 mb-3 animate-pulse"></div>
                    <div className="h-5 bg-eco-cream/70 rounded w-2/3 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-eco-cream/70 rounded w-full mb-3 animate-pulse"></div>
                    <div className="h-4 bg-eco-cream/70 rounded w-1/3 animate-pulse"></div>
                  </motion.div>
                ))
              ) : badges.length > 0 ? (
                // Display badges
                badges.map((badge) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`p-5 rounded-xl ${
                      badge.earned 
                        ? 'glass-card' 
                        : badge.eligible 
                          ? 'border border-eco-green/30 bg-eco-green/5' 
                          : 'border border-gray-200 bg-gray-100/50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-3 ${
                      badge.earned 
                        ? 'bg-eco-green/10 text-eco-green' 
                        : badge.eligible 
                          ? 'bg-eco-green/5 text-eco-green/70' 
                          : 'bg-gray-200 text-gray-400'
                    }`}>
                      {badge.icon}
                    </div>
                    <h3 className={`text-lg font-medium mb-1 ${
                      !badge.earned && !badge.eligible ? 'text-gray-500' : ''
                    }`}>
                      {badge.name}
                    </h3>
                    <p className={`text-sm mb-3 ${
                      badge.earned 
                        ? 'text-eco-dark/70' 
                        : badge.eligible 
                          ? 'text-eco-dark/60' 
                          : 'text-gray-500'
                    }`}>
                      {badge.description}
                    </p>
                    <div className="flex items-center text-xs">
                      {badge.earned ? (
                        <div className="text-eco-green flex items-center">
                          <Trophy size={12} className="mr-1" />
                          <span>Earned {badge.date || 'recently'}</span>
                        </div>
                      ) : badge.eligible ? (
                        <button 
                          onClick={() => handleClaimBadge(badge.name)}
                          className="text-white bg-eco-green px-3 py-1 rounded-full text-xs hover:bg-eco-green/90 transition-colors flex items-center"
                        >
                          <Trophy size={12} className="mr-1" />
                          Claim Badge
                        </button>
                      ) : (
                        <div className="text-gray-500">
                          <span>Ineligible</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                // No badges yet
                <div className="col-span-full p-8 text-center bg-eco-cream/30 rounded-xl">
                  <Trophy size={40} className="mx-auto mb-4 text-eco-dark/30" />
                  <h3 className="text-lg font-medium mb-2">No Badges Yet</h3>
                  <p className="text-eco-dark/70 mb-4">
                    Complete eco-friendly actions to earn badges and rewards!
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-8 bg-eco-green/5 border border-eco-green/20 rounded-xl p-5">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="font-medium mb-1">how to earn more badges?</h3>
                  <p className="text-sm text-eco-dark/70">complete eco actions and challenges to unlock more badges and track your environmental impact.</p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-eco-green text-white text-sm rounded-lg hover:bg-eco-green/90 transition-colors whitespace-nowrap"
                  onClick={() => navigate('/actions')}
                >
                  start an action
                </motion.button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="actions" className="mt-0">
            {isSignedIn && user && (
              <ActionHistory userId={formatUuid(user.id)} />
            )}
          </TabsContent>
          
          <TabsContent value="settings" className="mt-0">
            <div className="bg-white border border-eco-lightGray/50 rounded-xl overflow-hidden eco-shadow">
              <div className="px-6 py-4 border-b border-eco-lightGray/50">
                <h3 className="font-medium">account settings</h3>
              </div>
              
              <div className="divide-y divide-eco-lightGray/50">
                <div 
                  className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                  onClick={() => openSettingsModal('profileInfo')}
                >
                  <div>
                    <h4 className="font-medium">profile information</h4>
                    <p className="text-sm text-eco-dark/70">update your personal details</p>
                  </div>
                  <ChevronRight size={20} className="text-eco-dark/40" />
                </div>
                
                <div 
                  className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                  onClick={() => openSettingsModal('privacySettings')}
                >
                  <div>
                    <h4 className="font-medium">privacy settings</h4>
                    <p className="text-sm text-eco-dark/70">manage how your data is used</p>
                  </div>
                  <ChevronRight size={20} className="text-eco-dark/40" />
                </div>
                
                <div 
                  className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                  onClick={() => openSettingsModal('emailPreferences')}
                >
                  <div>
                    <h4 className="font-medium">email preferences</h4>
                    <p className="text-sm text-eco-dark/70">control notifications and updates</p>
                  </div>
                  <ChevronRight size={20} className="text-eco-dark/40" />
                </div>
                
                <div className="px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Bell size={18} className="text-eco-dark/70" />
                    <h4 className="font-medium">notifications</h4>
                  </div>
                  <div 
                    className={`w-10 h-6 ${userSettings.notifications ? 'bg-eco-green' : 'bg-eco-dark/30'} rounded-full relative cursor-pointer`}
                    onClick={() => handleToggle('notifications')}
                  >
                    <div className={`absolute ${userSettings.notifications ? 'right-1' : 'left-1'} top-1 w-4 h-4 bg-white rounded-full transition-all`}></div>
                  </div>
                </div>
                
                <div className="px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Globe size={18} className="text-eco-dark/70" />
                    <h4 className="font-medium">location services</h4>
                  </div>
                  <div 
                    className={`w-10 h-6 ${userSettings.locationServices ? 'bg-eco-green' : 'bg-eco-dark/30'} rounded-full relative cursor-pointer`}
                    onClick={() => handleToggle('locationServices')}
                  >
                    <div className={`absolute ${userSettings.locationServices ? 'right-1' : 'left-1'} top-1 w-4 h-4 bg-white rounded-full transition-all`}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-white border border-eco-lightGray/50 rounded-xl overflow-hidden eco-shadow">
              <div className="px-6 py-4 border-b border-eco-lightGray/50">
                <h3 className="font-medium">help & resources</h3>
              </div>
              
              <div className="divide-y divide-eco-lightGray/50">
                <a 
                  href="/faqs" 
                  className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">faqs</h4>
                  </div>
                  <ChevronRight size={16} className="text-eco-dark/40" />
                </a>
                
                <a 
                  href="/contact-support" 
                  className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">contact support</h4>
                  </div>
                  <ChevronRight size={16} className="text-eco-dark/40" />
                </a>
                
                <a 
                  href="/privacy-policy" 
                  className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">privacy policy</h4>
                  </div>
                  <ChevronRight size={16} className="text-eco-dark/40" />
                </a>
                
                <a 
                  href="/terms-of-service" 
                  className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">terms of service</h4>
                  </div>
                  <ChevronRight size={16} className="text-eco-dark/40" />
                </a>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-2 mx-auto"
                onClick={handleSignOut}
              >
                <LogOut size={16} />
                sign Out
              </motion.button>
            </div>
            
            {/* Modals */}
            <ProfileInfoModal 
              isOpen={activeModal === 'profileInfo'} 
              onClose={closeModal} 
              onSave={updateProfileInfo} 
              user={user} 
            />
            
            <EmailPreferencesModal 
              isOpen={activeModal === 'emailPreferences'} 
              onClose={closeModal} 
              onSave={saveEmailPreferences} 
              preferences={userSettings.emailPreferences} 
            />
            
            <PrivacySettingsModal 
              isOpen={activeModal === 'privacySettings'} 
              onClose={closeModal} 
              onSave={savePrivacySettings} 
              settings={userSettings.privacySettings} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
