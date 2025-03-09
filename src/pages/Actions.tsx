import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ActionCard from '../components/ActionCard';
import EcoTip from '../components/EcoTip';
import { useAuth, useUser } from '@clerk/clerk-react';
import { 
  Check, X, PlusCircle, Train, Bus, Car, Bike, 
  Coffee, ShoppingBag, Utensils, Leaf, PenTool, Recycle,
  Droplets, LightbulbOff, ShowerHead, Sun, Wind, Trash2, Zap,
  Loader2, Info, Calendar, BarChart
} from 'lucide-react';
import actionsData, { Action, CATEGORIES } from '@/data/actionsData';
import { getEcoActions, logUserAction, createEcoAction, createCustomEcoAction, initializeEcoActions, getUserActions } from '@/services/ecoActionsService';
import { UserAction, EcoAction } from '@/types/database';
import { toast } from 'sonner';

// Define consistent category options
const CATEGORY_OPTIONS = {
  transportation: "Transportation",
  waste: "Waste Reduction",
  food: "Food",
  energy: "Energy",
  water: "Water",
  custom: "Other"
};

// Create a union type that can handle both Action and EcoAction properties
type ActionFormData = {
  id?: string | number;
  title?: string;
  impact?: string;
  category?: string;
  category_id?: string;
  icon?: React.ReactNode;
  co2Saved?: number;
  completed?: boolean;
  description?: string;
  buds_reward?: number;
};

// Define the EcoTip type based on the ECO_TIPS array
type EcoTipType = {
  id: number;
  title: string;
  description: string;
  impact: string;
  category: string;
};

// Sample eco tips to show as suggestions
const ECO_TIPS: EcoTipType[] = [
  {
    id: 1,
    title: 'Used public transit',
    description: 'Taking public transportation instead of driving alone can reduce your carbon footprint significantly.',
    impact: '2.3 kg CO₂ saved per trip',
    category: 'transportation'
  },
  {
    id: 2,
    title: 'Walked instead of drove',
    description: 'Walking short distances instead of driving is not only good for the environment but also for your health.',
    impact: '1.8 kg CO₂ saved per trip',
    category: 'transportation'
  },
  {
    id: 3,
    title: 'Brought reusable mug',
    description: 'Using a reusable mug for your coffee or tea can save hundreds of disposable cups from landfills each year.',
    impact: '0.5 kg waste reduced',
    category: 'waste'
  },
  {
    id: 4,
    title: 'Ate a meatless meal',
    description: 'Plant-based meals typically have a much lower carbon footprint than meat-based ones.',
    impact: '1.5 kg CO₂ saved per meal',
    category: 'food'
  },
  {
    id: 5,
    title: 'Used natural lighting',
    description: 'Taking advantage of natural light reduces electricity usage and creates a more pleasant environment.',
    impact: '0.2 kg CO₂ saved per day',
    category: 'energy'
  },
  {
    id: 6,
    title: 'Collected rainwater',
    description: 'Collecting rainwater for plants conserves treated water and reduces your water footprint.',
    impact: '50 L water saved',
    category: 'water'
  }
];

// Define a type for UserAction with eco_actions
interface UserActionWithEcoAction extends UserAction {
  eco_actions?: EcoAction;
}

const Actions = () => {
  const [showForm, setShowForm] = useState(false);
  const [formAction, setFormAction] = useState<ActionFormData | null>(null);
  
  // Add separate state variables for form fields
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isSignedIn } = useAuth();
  const { user, isLoaded: userIsLoaded } = useUser();
  
  // State for Supabase eco actions
  const [supabaseActions, setSupabaseActions] = useState<EcoAction[] | null>(null);
  const [loadingActions, setLoadingActions] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  
  // State for visible eco tips
  const [visibleTips, setVisibleTips] = useState<EcoTipType[]>(ECO_TIPS);
  
  // State for user actions
  const [userActions, setUserActions] = useState<UserActionWithEcoAction[]>([]);
  
  // Fetch eco actions from Supabase
  useEffect(() => {
    const loadEcoActions = async () => {
      try {
        // First try to initialize the eco_actions table if needed
        const { success, error } = await initializeEcoActions();
        if (!success) {
          console.warn('Failed to initialize eco actions:', error);
        }
        
        // Then fetch the actions
        await fetchEcoActions();
      } catch (err) {
        console.error('Error in loadEcoActions:', err);
        setActionError('Failed to load eco actions. Please try again later.');
        setLoadingActions(false);
      }
    };
    
    loadEcoActions();
  }, []);
  
  // Move fetchEcoActions outside of useEffect so it can be called from elsewhere
  const fetchEcoActions = async () => {
    try {
      setLoadingActions(true);
      const { data, error } = await getEcoActions();
      
      if (error) {
        console.error('Error fetching eco actions:', error);
        setActionError(error);
      } else {
        setSupabaseActions(data);
      }
    } catch (err) {
      console.error('Exception fetching eco actions:', err);
      setActionError('Failed to load eco actions. Please try again later.');
    } finally {
      setLoadingActions(false);
    }
  };
  
  // Debug log for authentication state
  useEffect(() => {
    console.log('Auth state in Actions:', { 
      isSignedIn, 
      user: user?.username || user?.firstName
    });
  }, [isSignedIn, user]);
  
  const openForm = (action?: Partial<Action> | EcoAction) => {
    // Convert the action to a compatible format
    const formattedAction: ActionFormData = action ? { ...action } : {};
    setFormAction(formattedAction);
    setFormTitle(formattedAction.title || '');
    setFormCategory(formattedAction.category || formattedAction.category_id || '');
    setFormNotes('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setShowForm(true);
  };
  
  const closeForm = () => {
    setShowForm(false);
    setFormAction(null);
    setFormTitle('');
    setFormCategory('');
    setFormNotes('');
    setIsSubmitting(false);
  };
  
  // Function to handle logging an action (marking it as completed)
  const handleLogAction = async () => {
    if (!isSignedIn || !user) {
      toast.error('You must be signed in to log actions');
      return;
    }
    
    // Validate form fields
    if (!formAction?.id && !formTitle) {
      toast.error('Please enter an action title');
      return;
    }
    
    if (!formCategory) {
      toast.error('Please select a category');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // If we have a Supabase action ID, use that
      if (formAction?.id && typeof formAction.id === 'string') {
        console.log('Logging existing action:', formAction.id);
        
        const { data, error } = await logUserAction(
          user.id,
          formAction.id,
          formNotes || undefined
        );
        
        if (error) {
          console.error('Error logging action:', error);
          toast.error('Failed to log action: ' + error);
        } else {
          console.log('Successfully logged action:', data);
          toast.success('Eco action logged successfully!');
          
          // Refresh user actions
          fetchUserActions();
          
          closeForm();
        }
      } else {
        // For custom actions, use the enhanced logUserAction with Gemini analysis
        console.log('Logging custom action with Gemini analysis:', formTitle);
        
        const { data, error } = await logUserAction(
          user.id,
          '', // Empty actionId for custom actions
          formNotes || undefined,
          formTitle, // Custom title
          formCategory // Custom category
        );
        
        if (error) {
          console.error('Error logging custom action:', error);
          toast.error('Failed to log custom action: ' + error);
        } else {
          console.log('Successfully logged custom action:', data);
          
          // Show a success message with the buds earned
          if (data) {
            toast.success(`Eco action logged successfully! You earned ${data.buds_earned} buds.`);
          } else {
            toast.success('Eco action logged successfully!');
          }
          
          // Refresh the actions list and user actions
          fetchEcoActions();
          fetchUserActions();
          
          closeForm();
        }
      }
    } catch (err) {
      console.error('Exception logging action:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Fetch user actions
  const fetchUserActions = async () => {
    if (!isSignedIn || !user) return;
    
    try {
      const { data, error } = await getUserActions(user.id);
      
      if (error) {
        console.error('Error fetching user actions:', error);
      } else if (data) {
        setUserActions(data as UserActionWithEcoAction[]);
      }
    } catch (err) {
      console.error('Exception fetching user actions:', err);
    }
  };
  
  // Load eco actions and user actions
  useEffect(() => {
    const loadData = async () => {
      try {
        // First try to initialize the eco_actions table if needed
        const { success, error } = await initializeEcoActions();
        if (!success) {
          console.warn('Failed to initialize eco actions:', error);
        }
        
        // Then fetch the actions
        await fetchEcoActions();
        
        // And fetch user actions
        if (isSignedIn && user) {
          await fetchUserActions();
        }
      } catch (err) {
        console.error('Error in loadData:', err);
        setActionError('Failed to load data. Please try again later.');
        setLoadingActions(false);
      }
    };
    
    loadData();
  }, [isSignedIn, user]);
  
  // Handle closing a tip
  const handleCloseTip = (tipId: number) => {
    setVisibleTips(visibleTips.filter(tip => tip.id !== tipId));
  };
  
  // Handle trying an action from a tip
  const handleTryAction = (tip: EcoTipType) => {
    tryEcoTip(tip);
  };
  
  // Open form with eco tip data
  const tryEcoTip = async (tip: EcoTipType) => {
    const formattedTip: ActionFormData = {
      title: tip.title,
      impact: tip.impact,
      category: tip.category,
      description: tip.description
    };
    
    setFormAction(formattedTip);
    setFormTitle(tip.title);
    setFormCategory(tip.category);
    setFormNotes(tip.description);
    setFormDate(new Date().toISOString().split('T')[0]);
    setShowForm(true);
  };
  
  // If actions are still loading, show a loading state
  if (loadingActions) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl font-medium mb-2"
            >
              eco actions
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-eco-dark/70"
            >
              log your daily sustainable actions and track your positive impact
            </motion.p>
          </div>
          
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-eco-green" />
            <span className="ml-2 text-eco-dark/70">Loading eco actions...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  // If there was an error loading actions, show fallback to local data
  if (actionError || !supabaseActions) {
    console.warn('Using local actions data due to error:', actionError);
  }
  
  // Use Supabase actions if available, otherwise fall back to local data
  const displayActions = supabaseActions || Object.values(actionsData).flat();

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-medium mb-2"
          >
            eco actions
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-eco-dark/70"
          >
            log your daily sustainable actions and track your positive impact
          </motion.p>
        </div>
        
        <Tabs defaultValue="my-actions">
          <div className="flex justify-between items-center mb-6">
            <TabsList className="bg-eco-cream">
              <TabsTrigger value="my-actions">My Actions</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            </TabsList>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openForm()}
              className="bg-eco-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-eco-green/90 transition-colors flex items-center gap-1.5"
            >
              <PlusCircle size={16} />
              Log New Action
            </motion.button>
          </div>
          
          {/* My Actions Tab */}
          <TabsContent value="my-actions" className="mt-0">
            {loadingActions ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-eco-green" />
                <span className="ml-2 text-eco-dark/70">Loading your actions...</span>
              </div>
            ) : userActions.length > 0 ? (
              <div className="space-y-4">
                {userActions.map((action) => (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg p-4 shadow-sm border border-eco-lightGray/30"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">
                        {action.eco_actions?.title || 'Custom Action'}
                      </h4>
                      <span className="text-xs bg-eco-green/10 text-eco-green px-2 py-1 rounded-full">
                        +{action.buds_earned} buds
                      </span>
                    </div>
                    
                    <div className="mt-2 text-sm text-eco-dark/70 flex flex-wrap gap-x-4 gap-y-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {action.completed_at ? new Date(action.completed_at).toLocaleDateString() : 'Unknown date'}
                        </span>
                      </div>
                      
                      {action.eco_actions?.co2_saved > 0 && (
                        <div className="flex items-center gap-1">
                          <BarChart className="h-3.5 w-3.5" />
                          <span>{action.eco_actions.co2_saved.toFixed(1)} kg CO₂ saved</span>
                        </div>
                      )}
                    </div>
                    
                    {action.notes && (
                      <div className="mt-2 text-sm">
                        <p className="text-eco-dark/80">{action.notes}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-eco-cream/50 rounded-lg p-6 text-center">
                <Leaf className="h-10 w-10 mx-auto mb-3 text-eco-green/70" />
                <h3 className="text-lg font-medium mb-1">No eco actions yet</h3>
                <p className="text-eco-dark/70 mb-4">
                  Start logging your sustainable actions to track your positive impact.
                </p>
                <button 
                  className="bg-eco-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-eco-green/90 transition-colors"
                  onClick={() => openForm()}
                >
                  Log Your First Action
                </button>
              </div>
            )}
          </TabsContent>
          
          {/* Suggestions Tab */}
          <TabsContent value="suggestions" className="mt-0">
            <div className="space-y-4">
              {visibleTips.map((tip) => (
                <EcoTip
                  key={tip.id}
                  title={tip.title}
                  description={tip.description}
                  impact={tip.impact}
                  category={CATEGORY_OPTIONS[tip.category as keyof typeof CATEGORY_OPTIONS]}
                  onClose={() => handleCloseTip(tip.id)}
                  onTryThis={() => handleTryAction(tip)}
                />
              ))}
              
              {visibleTips.length === 0 && (
                <div className="bg-eco-cream/50 rounded-lg p-6 text-center">
                  <Leaf className="h-10 w-10 mx-auto mb-3 text-eco-green/70" />
                  <h3 className="text-lg font-medium mb-1">All suggestions dismissed</h3>
                  <p className="text-eco-dark/70 mb-4">
                    You've dismissed all the eco action suggestions. Refresh the page to see them again.
                  </p>
                  <button 
                    className="bg-eco-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-eco-green/90 transition-colors"
                    onClick={() => setVisibleTips(ECO_TIPS)}
                  >
                    Show Suggestions Again
                  </button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Action Form Modal */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={closeForm}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">
                  {formAction && formAction.title ? `Log: ${formAction.title}` : 'Log Custom Action'}
                </h2>
                <button onClick={closeForm} className="text-eco-dark/70 hover:text-eco-dark">
                  <X size={20} />
                </button>
              </div>
              
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleLogAction(); }}>
                {!formAction?.title && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Action Title</label>
                    <input 
                      type="text" 
                      placeholder="What eco-friendly action did you take?"
                      className="w-full p-2 border border-eco-lightGray/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-eco-green focus:border-eco-green"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      required
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select 
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2 border border-eco-lightGray/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-eco-green focus:border-eco-green"
                    required
                  >
                    <option value="" disabled>Select a category</option>
                    <option value="transportation">{CATEGORY_OPTIONS.transportation}</option>
                    <option value="waste">{CATEGORY_OPTIONS.waste}</option>
                    <option value="food">{CATEGORY_OPTIONS.food}</option>
                    <option value="energy">{CATEGORY_OPTIONS.energy}</option>
                    <option value="water">{CATEGORY_OPTIONS.water}</option>
                    <option value="custom">{CATEGORY_OPTIONS.custom}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input 
                    type="date" 
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full p-2 border border-eco-lightGray/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-eco-green focus:border-eco-green"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                  <textarea 
                    placeholder="Any additional details about this action..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full p-2 border border-eco-lightGray/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-eco-green focus:border-eco-green"
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-4 py-2 border border-eco-lightGray rounded-lg text-eco-dark/80 hover:bg-eco-lightGray/20 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-eco-green text-white rounded-lg hover:bg-eco-green/90 transition-colors flex items-center gap-1.5"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Logging...
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        Log Action
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Actions;
