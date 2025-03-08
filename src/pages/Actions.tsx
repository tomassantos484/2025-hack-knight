import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ActionCard from '../components/ActionCard';
import { useAuth, useUser } from '@clerk/clerk-react';
import { 
  Check, X, PlusCircle, Train, Bus, Car, Bike, 
  Coffee, ShoppingBag, Utensils, Leaf, PenTool, Recycle,
  Droplets, LightbulbOff, ShowerHead, Sun, Wind, Trash2, Zap 
} from 'lucide-react';
import actionsData, { Action, CATEGORIES } from '@/data/actionsData';

const Actions = () => {
  const [showForm, setShowForm] = useState(false);
  const [formAction, setFormAction] = useState<Partial<Action> | null>(null);
  const { isSignedIn } = useAuth();
  const { user, isLoaded: userIsLoaded } = useUser();
  
  // In a real app, you would fetch the user's completed actions from a database
  // For now, we'll just use an empty array for new users
  const [actions, setActions] = useState(actionsData);
  
  // Debug log for authentication state
  useEffect(() => {
    console.log('Auth state in Actions:', { 
      isSignedIn, 
      user: user?.username || user?.firstName
    });
  }, [isSignedIn, user]);
  
  const openForm = (action?: Partial<Action>) => {
    setFormAction(action || {});
    setShowForm(true);
  };
  
  const closeForm = () => {
    setShowForm(false);
    setFormAction(null);
  };
  
  // Function to handle logging an action (marking it as completed)
  const handleLogAction = (actionId: number) => {
    // In a real app, you would send this to a backend
    // For now, we'll just update the local state
    setActions(prevActions => {
      const newActions = { ...prevActions };
      
      // Find the category that contains this action
      for (const category in newActions) {
        const actionIndex = newActions[category].findIndex(a => a.id === actionId);
        if (actionIndex !== -1) {
          // Create a new array for this category with the updated action
          newActions[category] = [
            ...newActions[category].slice(0, actionIndex),
            { ...newActions[category][actionIndex], completed: true },
            ...newActions[category].slice(actionIndex + 1)
          ];
          break;
        }
      }
      
      return newActions;
    });
    
    // Close the form
    closeForm();
  };

  const customAction = {
    id: 999,
    title: 'Add custom action',
    impact: 'Track your impact',
    category: CATEGORIES.CUSTOM,
    icon: <PenTool size={18} className="text-eco-dark/80" />
  };

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
              {Object.values(actions).flat().map((action) => (
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
              <ActionCard 
                title={customAction.title}
                impact={customAction.impact}
                category={customAction.category}
                icon={customAction.icon}
                onClick={() => openForm()}
              />
            </div>
          </TabsContent>
          
          {Object.keys(actions).map((category) => (
            <TabsContent key={category} value={category} className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {actions[category].map((action) => (
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
          ))}
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
              
              <form className="space-y-4">
                {!formAction?.title && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Action Title</label>
                    <input 
                      type="text" 
                      placeholder="What eco-friendly action did you take?"
                      className="w-full p-2 border border-eco-lightGray/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-eco-green focus:border-eco-green"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select 
                    defaultValue={formAction?.category || ""}
                    className="w-full p-2 border border-eco-lightGray/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-eco-green focus:border-eco-green"
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
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full p-2 border border-eco-lightGray/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-eco-green focus:border-eco-green"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                  <textarea 
                    placeholder="Any additional details about this action..."
                    className="w-full p-2 border border-eco-lightGray/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-eco-green focus:border-eco-green"
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-4 py-2 border border-eco-lightGray rounded-lg text-eco-dark/80 hover:bg-eco-lightGray/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-eco-green text-white rounded-lg hover:bg-eco-green/90 transition-colors flex items-center gap-1.5"
                    onClick={() => formAction?.id ? handleLogAction(formAction.id) : closeForm()}
                  >
                    <Check size={16} />
                    Log Action
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
