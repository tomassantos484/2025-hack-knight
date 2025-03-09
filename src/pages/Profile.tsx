import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Trophy, Settings, Bell, Globe, ChevronRight, ExternalLink, BarChart3, Calendar, LogOut, Leaf } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import ActionHistory from '../components/ActionHistory';
import { supabase } from '../services/supabaseClient';
import { formatUuid } from '../services/ecoActionsService';

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
            budsEarned: statsData.total_buds_earned || 0
          });
        }
        
        // If no stats found, try to calculate them from user actions
        if (!statsData) {
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
      } catch (error) {
        console.error('Error in fetchUserStats:', error);
      } finally {
        setLoadingStats(false);
      }
    };
    
    fetchUserStats();
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
  
  // Generate badges based on user data
  const getBadges = () => {
    return [
      {
        id: 1,
        name: 'Early Adopter',
        description: 'Joined during the beta phase',
        icon: '🌱',
        earned: true, // Only badge earned by default for new users
        date: formatBadgeDate()
      },
      {
        id: 2,
        name: 'Waste Warrior',
        description: 'Recycled 50+ items correctly',
        icon: '♻️',
        earned: false, // Locked for new users
        date: null
      },
      {
        id: 3,
        name: 'Eco Streak',
        description: 'Maintained a 7-day action streak',
        icon: '🔥',
        earned: false, // Locked for new users
        date: null
      },
      {
        id: 4,
        name: 'Transit Champion',
        description: 'Used public transit 10+ times',
        icon: '🚊',
        earned: false
      },
      {
        id: 5,
        name: 'Plant Power',
        description: 'Logged 15 meatless meals',
        icon: '🥗',
        earned: false
      },
      {
        id: 6,
        name: 'Energy Saver',
        description: 'Reduced energy usage for 30 days',
        icon: '⚡',
        earned: false
      }
    ];
  };
  
  // Get badges with user-specific data
  const badges = getBadges();
  
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
              </motion.div>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="badges">
          <TabsList className="bg-eco-cream mb-6">
            <TabsTrigger value="badges" className="flex items-center gap-1.5">
              <Trophy size={16} />
              Badges
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-1.5">
              <BarChart3 size={16} />
              Action History
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1.5">
              <Settings size={16} />
              Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="badges" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: badge.id * 0.1 }}
                  className={`p-5 rounded-xl ${
                    badge.earned 
                      ? 'glass-card' 
                      : 'border border-dashed border-eco-dark/20 bg-eco-cream/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${
                      badge.earned ? 'bg-eco-green/10' : 'bg-eco-dark/10'
                    }`}>
                      {badge.icon}
                    </div>
                    
                    {badge.earned && (
                      <span className="text-xs px-2 py-0.5 bg-eco-green/10 text-eco-green rounded-full">
                        Earned
                      </span>
                    )}
                    
                    {!badge.earned && (
                      <span className="text-xs px-2 py-0.5 bg-eco-dark/10 text-eco-dark/50 rounded-full">
                        Locked
                      </span>
                    )}
                  </div>
                  
                  <h3 className="mt-3 font-medium">{badge.name}</h3>
                  <p className="text-sm text-eco-dark/70 mt-1">{badge.description}</p>
                  
                  {badge.earned && badge.date && (
                    <div className="mt-3 text-xs text-eco-dark/50 flex items-center gap-1">
                      <Calendar size={12} />
                      Earned {badge.date}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8 bg-eco-green/5 border border-eco-green/20 rounded-xl p-5">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="font-medium mb-1">How to earn more badges?</h3>
                  <p className="text-sm text-eco-dark/70">Complete eco actions and challenges to unlock more badges and track your environmental impact.</p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-eco-green text-white text-sm rounded-lg hover:bg-eco-green/90 transition-colors whitespace-nowrap"
                  onClick={() => navigate('/actions')}
                >
                  Start an Action
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
                <h3 className="font-medium">Account Settings</h3>
              </div>
              
              <div className="divide-y divide-eco-lightGray/50">
                <div className="px-6 py-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Profile Information</h4>
                    <p className="text-sm text-eco-dark/70">Update your personal details</p>
                  </div>
                  <ChevronRight size={20} className="text-eco-dark/40" />
                </div>
                
                <div className="px-6 py-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Privacy Settings</h4>
                    <p className="text-sm text-eco-dark/70">Manage how your data is used</p>
                  </div>
                  <ChevronRight size={20} className="text-eco-dark/40" />
                </div>
                
                <div className="px-6 py-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Email Preferences</h4>
                    <p className="text-sm text-eco-dark/70">Control notifications and updates</p>
                  </div>
                  <ChevronRight size={20} className="text-eco-dark/40" />
                </div>
                
                <div className="px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Bell size={18} className="text-eco-dark/70" />
                    <h4 className="font-medium">Notifications</h4>
                  </div>
                  <div className="w-10 h-6 bg-eco-green rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                
                <div className="px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Globe size={18} className="text-eco-dark/70" />
                    <h4 className="font-medium">Location Services</h4>
                  </div>
                  <div className="w-10 h-6 bg-eco-dark/30 rounded-full relative">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-white border border-eco-lightGray/50 rounded-xl overflow-hidden eco-shadow">
              <div className="px-6 py-4 border-b border-eco-lightGray/50">
                <h3 className="font-medium">Help & Resources</h3>
              </div>
              
              <div className="divide-y divide-eco-lightGray/50">
                <div className="px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">FAQs</h4>
                  </div>
                  <ExternalLink size={16} className="text-eco-dark/40" />
                </div>
                
                <div className="px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">Contact Support</h4>
                  </div>
                  <ExternalLink size={16} className="text-eco-dark/40" />
                </div>
                
                <div className="px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">Privacy Policy</h4>
                  </div>
                  <ExternalLink size={16} className="text-eco-dark/40" />
                </div>
                
                <div className="px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">Terms of Service</h4>
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
                Sign Out
              </motion.button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
