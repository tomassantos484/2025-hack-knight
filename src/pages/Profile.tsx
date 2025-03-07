import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Trophy, Settings, Bell, Globe, ChevronRight, ExternalLink, BarChart3, Calendar, LogOut } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Profile = () => {
  const { signOut, isSignedIn } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  
  // Debug log for authentication state
  useEffect(() => {
    console.log('Auth state in Profile:', { isSignedIn, user: user?.username || user?.firstName });
  }, [isSignedIn, user]);
  
  // Redirect if not signed in
  useEffect(() => {
    if (isSignedIn === false) {
      navigate('/sign-in');
    }
  }, [isSignedIn, navigate]);
  
  const [userInfo] = useState({
    name: 'alex chen',
    username: 'eco_alex',
    joinDate: 'member since june 2023',
    stats: {
      streak: 7,
      actions: 42,
      co2Saved: 52.3,
      wasteRecycled: 78
    }
  });
  
  const badges = [
    {
      id: 1,
      name: 'Early Adopter',
      description: 'Joined during the beta phase',
      icon: '🌱',
      earned: true,
      date: 'Jun 2023'
    },
    {
      id: 2,
      name: 'Waste Warrior',
      description: 'Recycled 50+ items correctly',
      icon: '♻️',
      earned: true,
      date: 'Aug 2023'
    },
    {
      id: 3,
      name: 'Eco Streak',
      description: 'Maintained a 7-day action streak',
      icon: '🔥',
      earned: true,
      date: 'Sep 2023'
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
  
  const recentChallenges = [
    {
      id: 1,
      title: 'Plastic-Free Week',
      completed: true,
      date: 'Sep 15, 2023',
      impact: '25 pieces diverted'
    },
    {
      id: 2,
      title: 'Bike to Work Challenge',
      completed: true,
      date: 'Aug 22, 2023',
      impact: '12.4 kg CO₂ saved'
    },
    {
      id: 3,
      title: 'Meatless Mondays',
      completed: false,
      inProgress: true,
      date: 'Current',
      impact: 'In progress'
    }
  ];

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      // Force a full page reload to reset all state
      sessionStorage.setItem('justSignedOut', 'true');
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-24 h-24 rounded-full bg-eco-cream flex items-center justify-center border-4 border-white eco-shadow"
            >
              <User size={40} className="text-eco-dark/70" />
            </motion.div>
            
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl md:text-3xl font-medium"
              >
                {userInfo.name}
              </motion.h1>
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-eco-dark/70 flex items-center gap-2"
              >
                @{userInfo.username}
                <span className="inline-block w-1 h-1 rounded-full bg-eco-dark/40"></span>
                {userInfo.joinDate}
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-4 mt-2"
              >
                <div className="text-sm">
                  <span className="font-medium">{userInfo.stats.actions}</span>
                  <span className="text-eco-dark/70 ml-1">actions</span>
                </div>
                
                <div className="text-sm">
                  <span className="font-medium">{userInfo.stats.co2Saved} kg</span>
                  <span className="text-eco-dark/70 ml-1">CO₂ saved</span>
                </div>
                
                <div className="text-sm">
                  <span className="font-medium">{userInfo.stats.streak} days</span>
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
            <TabsTrigger value="challenges" className="flex items-center gap-1.5">
              <BarChart3 size={16} />
              Challenges
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
            
            <div className="mt-6 text-center">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-1.5 text-sm text-eco-green hover:text-eco-green/80"
              >
                View all badges
                <ChevronRight size={16} />
              </motion.button>
            </div>
          </TabsContent>
          
          <TabsContent value="challenges" className="mt-0">
            <div className="space-y-4">
              {recentChallenges.map((challenge) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: challenge.id * 0.1 }}
                  className="bg-white border border-eco-lightGray/50 rounded-xl overflow-hidden eco-shadow"
                >
                  <div className="px-5 py-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{challenge.title}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Calendar size={14} className="text-eco-dark/60" />
                        <span className="text-xs text-eco-dark/60">{challenge.date}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="mb-1">
                        {challenge.completed && (
                          <span className="text-xs px-2 py-0.5 bg-eco-green/10 text-eco-green rounded-full">
                            Completed
                          </span>
                        )}
                        
                        {challenge.inProgress && (
                          <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full">
                            In Progress
                          </span>
                        )}
                        
                        {!challenge.completed && !challenge.inProgress && (
                          <span className="text-xs px-2 py-0.5 bg-eco-dark/10 text-eco-dark/50 rounded-full">
                            Abandoned
                          </span>
                        )}
                      </div>
                      
                      <div className="text-xs text-eco-dark/70">
                        {challenge.impact}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8 bg-eco-green/5 border border-eco-green/20 rounded-xl p-5">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="font-medium mb-1">Ready for a new challenge?</h3>
                  <p className="text-sm text-eco-dark/70">Explore our list of sustainable challenges and test your eco commitment.</p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-eco-green text-white text-sm rounded-lg hover:bg-eco-green/90 transition-colors whitespace-nowrap"
                >
                  Browse Challenges
                </motion.button>
              </div>
            </div>
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
    </Layout>
  );
};

export default Profile;
