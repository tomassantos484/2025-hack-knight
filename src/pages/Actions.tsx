import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ActionCard from '../components/ActionCard';
import { 
  Check, X, PlusCircle, Train, Bus, Car, Bike, 
  Coffee, ShoppingBag, Utensils, Leaf, PenTool, Recycle,
  Droplets, LightbulbOff, ShowerHead, Sun, Wind, Trash2, Zap 
} from 'lucide-react';

interface Action {
  id: number;
  title: string;
  impact: string;
  category: string;
  icon: React.ReactNode;
  co2Saved?: number;
  completed?: boolean;
}

const Actions = () => {
  const [showForm, setShowForm] = useState(false);
  const [formAction, setFormAction] = useState<Partial<Action> | null>(null);
  
  const actions: Record<string, Action[]> = {
    transportation: [
      {
        id: 1,
        title: 'Used public transit',
        impact: '2.3 kg CO₂ saved',
        category: 'transportation',
        icon: <Train size={18} className="text-eco-dark/80" />,
        co2Saved: 2.3,
        completed: true
      },
      {
        id: 2,
        title: 'Walked instead of drove',
        impact: '1.8 kg CO₂ saved',
        category: 'transportation',
        icon: <Bike size={18} className="text-eco-dark/80" />,
        co2Saved: 1.8,
        completed: true
      },
      {
        id: 3,
        title: 'Carpooled to work',
        impact: '1.5 kg CO₂ saved',
        category: 'transportation',
        icon: <Car size={18} className="text-eco-dark/80" />,
        co2Saved: 1.5
      },
      {
        id: 4,
        title: 'Biked to destination',
        impact: '2.1 kg CO₂ saved',
        category: 'transportation',
        icon: <Bike size={18} className="text-eco-dark/80" />,
        co2Saved: 2.1
      },
      {
        id: 5,
        title: 'Took the bus',
        impact: '1.9 kg CO₂ saved',
        category: 'transportation',
        icon: <Bus size={18} className="text-eco-dark/80" />,
        co2Saved: 1.9
      }
    ],
    waste: [
      {
        id: 6,
        title: 'Brought reusable mug',
        impact: '0.5 kg waste reduced',
        category: 'waste reduction',
        icon: <Coffee size={18} className="text-eco-dark/80" />,
        co2Saved: 0.05,
        completed: true
      },
      {
        id: 7,
        title: 'Used reusable bags',
        impact: '0.3 kg waste reduced',
        category: 'waste reduction',
        icon: <ShoppingBag size={18} className="text-eco-dark/80" />,
        co2Saved: 0.03,
        completed: true
      },
      {
        id: 8,
        title: 'Properly recycled waste',
        impact: '1.2 kg waste diverted',
        category: 'waste reduction',
        icon: <Recycle size={18} className="text-eco-dark/80" />,
        co2Saved: 0.8
      },
      {
        id: 9,
        title: 'Composted food scraps',
        impact: '0.6 kg waste diverted',
        category: 'waste reduction',
        icon: <Trash2 size={18} className="text-eco-dark/80" />,
        co2Saved: 0.2
      }
    ],
    food: [
      {
        id: 10,
        title: 'Ate a meatless meal',
        impact: '1.5 kg CO₂ saved',
        category: 'food',
        icon: <Utensils size={18} className="text-eco-dark/80" />,
        co2Saved: 1.5
      },
      {
        id: 11,
        title: 'Bought local produce',
        impact: '0.4 kg CO₂ saved',
        category: 'food',
        icon: <Leaf size={18} className="text-eco-dark/80" />,
        co2Saved: 0.4
      }
    ],
    energy: [
      {
        id: 12,
        title: 'Used natural lighting',
        impact: '0.2 kg CO₂ saved',
        category: 'energy',
        icon: <Sun size={18} className="text-eco-dark/80" />,
        co2Saved: 0.2
      },
      {
        id: 13,
        title: 'Turned off lights',
        impact: '0.3 kg CO₂ saved',
        category: 'energy',
        icon: <LightbulbOff size={18} className="text-eco-dark/80" />,
        co2Saved: 0.3
      },
      {
        id: 14,
        title: 'Took shorter shower',
        impact: '0.5 kg CO₂ saved',
        category: 'energy',
        icon: <ShowerHead size={18} className="text-eco-dark/80" />,
        co2Saved: 0.5
      },
      {
        id: 15,
        title: 'Unplugged devices',
        impact: '0.2 kg CO₂ saved',
        category: 'energy',
        icon: <Zap size={18} className="text-eco-dark/80" />,
        co2Saved: 0.2
      }
    ],
    water: [
      {
        id: 16,
        title: 'Collected rainwater',
        impact: '50 L water saved',
        category: 'water',
        icon: <Droplets size={18} className="text-eco-dark/80" />,
        co2Saved: 0.1
      },
      {
        id: 17,
        title: 'Fixed leaky faucet',
        impact: '70 L water saved daily',
        category: 'water',
        icon: <Droplets size={18} className="text-eco-dark/80" />,
        co2Saved: 0.15
      }
    ]
  };
  
  const openForm = (action?: Partial<Action>) => {
    setFormAction(action || {});
    setShowForm(true);
  };
  
  const closeForm = () => {
    setShowForm(false);
    setFormAction(null);
  };
  
  const customAction = {
    id: 999,
    title: 'Add custom action',
    impact: 'Track your impact',
    category: 'custom',
    icon: <PenTool size={18} className="text-eco-dark/80" />
  };

  return (
    <Layout>
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
    </Layout>
  );
};

export default Actions;
