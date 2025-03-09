import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Trophy, Settings, Bell, Globe, ChevronRight, ExternalLink, BarChart3, Calendar, LogOut, Leaf, RefreshCw } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import ActionHistory from '../components/ActionHistory';
import { supabase } from '../services/supabaseClient';
import { formatUuid, refreshUserStats } from '../services/ecoActionsService';
import { Badge, UserBadge, getUserBadges, checkAndAwardBadges, awardBadge } from '../services/badgeService';

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
  const [badges, setBadges] = useState<(Badge & { earned: boolean, date?: string | null })[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(true);
  
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
  
  // Fetch user badges
  useEffect(() => {
    const fetchUserBadges = async () => {
      if (!isSignedIn || !user) return;
      
      try {
        setLoadingBadges(true);
        
        // Check for and award badges based on user actions
        await checkAndAwardBadges(user.id);
        
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
            if (updatedBadges) {
              // Format badges for display
              const formattedBadges = updatedBadges.map(userBadge => ({
                ...userBadge.badge!,
                earned: true,
                date: userBadge.earned_at ? format(new Date(userBadge.earned_at), 'MMM yyyy') : null
              }));
              
              setBadges(formattedBadges);
            }
          }
        } else {
          // Format badges for display
          const formattedBadges = userBadges.map(userBadge => ({
            ...userBadge.badge!,
            earned: true,
            date: userBadge.earned_at ? format(new Date(userBadge.earned_at), 'MMM yyyy') : null
          }));
          
          setBadges(formattedBadges);
        }
      } catch (err) {
        console.error('Error in fetchUserBadges:', err);
      } finally {
        setLoadingBadges(false);
      }
    };
    
    fetchUserBadges();
  }, [isSignedIn, user]);
  
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
                // Display earned badges
                badges.map((badge) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-5 rounded-xl glass-card"
                  >
                    <div className="w-12 h-12 rounded-full bg-eco-green/10 flex items-center justify-center text-2xl mb-3">
                      {badge.icon}
                    </div>
                    <h3 className="text-lg font-medium mb-1">{badge.name}</h3>
                    <p className="text-sm text-eco-dark/70 mb-3">{badge.description}</p>
                    <div className="flex items-center text-xs text-eco-green">
                      <Trophy size={12} className="mr-1" />
                      <span>Earned {badge.date || 'recently'}</span>
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
                <div className="px-6 py-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">profile information</h4>
                    <p className="text-sm text-eco-dark/70">update your personal details</p>
                  </div>
                  <ChevronRight size={20} className="text-eco-dark/40" />
                </div>
                
                <div className="px-6 py-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">privacy settings</h4>
                    <p className="text-sm text-eco-dark/70">manage how your data is used</p>
                  </div>
                  <ChevronRight size={20} className="text-eco-dark/40" />
                </div>
                
                <div className="px-6 py-4 flex justify-between items-center">
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
                  <div className="w-10 h-6 bg-eco-green rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                
                <div className="px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Globe size={18} className="text-eco-dark/70" />
                    <h4 className="font-medium">location services</h4>
                  </div>
                  <div className="w-10 h-6 bg-eco-dark/30 rounded-full relative">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-white border border-eco-lightGray/50 rounded-xl overflow-hidden eco-shadow">
              <div className="px-6 py-4 border-b border-eco-lightGray/50">
                <h3 className="font-medium">help & resources</h3>
              </div>
              
              <div className="divide-y divide-eco-lightGray/50">
                <div className="px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">faqs</h4>
                  </div>
                  <ExternalLink size={16} className="text-eco-dark/40" />
                </div>
                
                <div className="px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">contact support</h4>
                  </div>
                  <ExternalLink size={16} className="text-eco-dark/40" />
                </div>
                
                <div className="px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">privacy policy</h4>
                  </div>
                  <ExternalLink size={16} className="text-eco-dark/40" />
                </div>
                
                <div className="px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">terms of service</h4>
                  </div>
                  <ExternalLink size={16} className="text-eco-dark/40" />
                </div>
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
