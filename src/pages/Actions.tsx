import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ActionCard from '../components/ActionCard';
import { useAuth, useUser } from '@clerk/clerk-react';
import { 
  Check, X, PlusCircle, Train, Bus, Car, Bike, 
  Coffee, ShoppingBag, Utensils, Leaf, PenTool, Recycle,
  Droplets, LightbulbOff, ShowerHead, Sun, Wind, Trash2, Zap,
  Loader2
} from 'lucide-react';
import actionsData, { Action, CATEGORIES } from '@/data/actionsData';
import { getEcoActions, logUserAction, createEcoAction, createCustomEcoAction } from '@/services/ecoActionsService';
import { EcoAction } from '@/types/database';
import { toast } from 'sonner';

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
  
  // Fetch eco actions from Supabase
  useEffect(() => {
    fetchEcoActions();
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
    
    // Set individual form fields
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
        const { data, error } = await logUserAction(
          user.id,
          formAction.id,
          formNotes || undefined
        );
        
        if (error) {
          console.error('Error logging action:', error);
          toast.error('Failed to log action: ' + error);
        } else {
          toast.success('Eco action logged successfully!');
          closeForm();
        }
      } else {
        // For custom actions, use the client-side approach
        const { data: newAction, error: createError } = await createCustomEcoAction(
          formTitle,
          formCategory,
          formNotes
        );
        
        if (createError) {
          console.error('Error creating custom action:', createError);
          toast.error('Failed to create custom action: ' + createError);
          return;
        }
        
        if (!newAction) {
          toast.error('Failed to create custom action: No data returned');
          return;
        }
        
        // Now log the newly created action
        const { data, error } = await logUserAction(
          user.id,
          newAction.id,
          formNotes || undefined
        );
        
        if (error) {
          console.error('Error logging custom action:', error);
          toast.error('Failed to log custom action: ' + error);
        } else {
          toast.success('Custom eco action logged successfully!');
          
          // Refresh the actions list
          fetchEcoActions();
          
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

  // Group actions by category
  const getActionsByCategory = () => {
    if (!supabaseActions) return {};
    
    return supabaseActions.reduce((acc, action) => {
      const category = action.category_id || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(action);
      return acc;
    }, {} as Record<string, EcoAction[]>);
  };
  
  const actionsByCategory = getActionsByCategory();
  
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
        
        <Tabs defaultValue="all">
          <div className="flex justify-between items-center mb-6">
            <TabsList className="bg-eco-cream">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="transportation">Transportation</TabsTrigger>
              <TabsTrigger value="waste">Waste</TabsTrigger>
              <TabsTrigger value="food">Food</TabsTrigger>
              <TabsTrigger value="energy">Energy</TabsTrigger>
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
          
          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {supabaseActions ? (
                // Display Supabase actions
                supabaseActions.map((action) => (
                  <ActionCard 
                    key={action.id}
                    title={action.title}
                    impact={action.impact}
                    category={action.category_id || 'other'}
                    icon={<Leaf size={18} className="text-eco-dark/80" />}
                    onClick={() => openForm(action)}
                  />
                ))
              ) : (
                // Fallback to local data
                Object.values(actionsData).flat().map((action) => (
                  <ActionCard 
                    key={action.id}
                    title={action.title}
                    impact={action.impact}
                    category={action.category}
                    icon={action.icon}
                    completed={action.completed}
                    onClick={() => openForm(action)}
                  />
                ))
              )}
              
              <ActionCard 
                title="Add custom action"
                impact="Track your impact"
                category={CATEGORIES.CUSTOM}
                icon={<PenTool size={18} className="text-eco-dark/80" />}
                onClick={() => openForm()}
              />
            </div>
          </TabsContent>
          
          {/* Category tabs - show either Supabase categories or local categories */}
          {supabaseActions ? (
            // Display Supabase categories
            Object.keys(actionsByCategory).map((category) => (
              <TabsContent key={category} value={category === 'transportation' ? 'transportation' : 
                                                category === 'waste' ? 'waste' : 
                                                category === 'food' ? 'food' : 
                                                category === 'energy' ? 'energy' : 'other'} 
                          className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {actionsByCategory[category].map((action) => (
                    <ActionCard 
                      key={action.id}
                      title={action.title}
                      impact={action.impact}
                      category={action.category_id || 'other'}
                      icon={<Leaf size={18} className="text-eco-dark/80" />}
                      onClick={() => openForm(action)}
                    />
                  ))}
                </div>
              </TabsContent>
            ))
          ) : (
            // Fallback to local categories
            Object.keys(actionsData).map((category) => (
              <TabsContent key={category} value={category} className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {actionsData[category].map((action) => (
                    <ActionCard 
                      key={action.id}
                      title={action.title}
                      impact={action.impact}
                      category={action.category}
                      icon={action.icon}
                      completed={action.completed}
                      onClick={() => openForm(action)}
                    />
                  ))}
                </div>
              </TabsContent>
            ))
          )}
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
                    <option value="transportation">Transportation</option>
                    <option value="waste">Waste Reduction</option>
                    <option value="food">Food</option>
                    <option value="energy">Energy</option>
                    <option value="water">Water</option>
                    <option value="custom">Other</option>
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
