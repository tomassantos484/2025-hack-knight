import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getUserActions, formatUuid } from '@/services/ecoActionsService';
import { UserAction, EcoAction } from '@/types/database';
import { format } from 'date-fns';
import { Leaf, Calendar, Clock, FileText, AlertCircle, BarChart, Droplet } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ActionHistoryProps {
  userId: string;
}

// Extend the UserAction type to include the joined eco_actions data
interface UserActionWithEcoAction extends UserAction {
  eco_actions?: EcoAction;
}

const ActionHistory: React.FC<ActionHistoryProps> = ({ userId }) => {
  const [actions, setActions] = useState<UserActionWithEcoAction[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserActions = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching actions for user ID:', userId);
        
        // Format the user ID as a UUID
        const formattedUserId = formatUuid(userId);
        console.log('Formatted user ID for Supabase:', formattedUserId);
        
        const { data, error } = await getUserActions(formattedUserId);
        
        if (error) {
          console.error('Error fetching user actions:', error);
          setError(error);
        } else {
          console.log('Fetched user actions:', data?.length || 0);
          setActions(data as UserActionWithEcoAction[] | null);
        }
      } catch (err) {
        console.error('Exception fetching user actions:', err);
        setError('failed to load your eco actions. please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserActions();
  }, [userId]);

  // Calculate total impact
  const calculateTotalImpact = () => {
    if (!actions || actions.length === 0) return { co2Saved: 0, budsEarned: 0 };
    
    return actions.reduce((totals, action) => {
      return {
        co2Saved: totals.co2Saved + (action.eco_actions?.co2_saved || 0),
        budsEarned: totals.budsEarned + (action.buds_earned || 0)
      };
    }, { co2Saved: 0, budsEarned: 0 });
  };

  const totalImpact = calculateTotalImpact();

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium mb-4">your eco actions</h3>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-eco-lightGray/30">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-medium">error loading actions</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!actions || actions.length === 0) {
    return (
      <div className="bg-eco-cream/50 rounded-lg p-6 text-center">
        <Leaf className="h-10 w-10 mx-auto mb-3 text-eco-green/70" />
        <h3 className="text-lg font-medium mb-1">no eco actions yet</h3>
        <p className="text-eco-dark/70 mb-4">
          start logging your sustainable actions to track your positive impact.
        </p>
        <button 
          className="bg-eco-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-eco-green/90 transition-colors"
          onClick={() => window.location.href = '/actions'}
        >
          log your first action
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Your Eco Actions</h3>
        <div className="flex gap-4">
          <div className="text-sm bg-eco-green/10 text-eco-green px-3 py-1 rounded-full flex items-center gap-1.5">
            <BarChart className="h-3.5 w-3.5" />
            <span>{totalImpact.co2Saved.toFixed(1)} kg CO₂ saved</span>
          </div>
          <div className="text-sm bg-eco-green/10 text-eco-green px-3 py-1 rounded-full flex items-center gap-1.5">
            <Leaf className="h-3.5 w-3.5" />
            <span>{totalImpact.budsEarned} buds earned</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {actions.map((action) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-4 shadow-sm border border-eco-lightGray/30"
          >
            <div className="flex justify-between items-start">
              <h4 className="font-medium">
                {action.eco_actions?.title || 'eco action'}
              </h4>
              <span className="text-xs bg-eco-green/10 text-eco-green px-2 py-1 rounded-full">
                +{action.buds_earned} buds
              </span>
            </div>
            
            <div className="mt-2 text-sm text-eco-dark/70 flex flex-wrap gap-x-4 gap-y-2">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {action.completed_at ? format(new Date(action.completed_at), 'MMM d, yyyy') : 'unknown date'}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {action.completed_at ? format(new Date(action.completed_at), 'h:mm a') : 'unknown time'}
                </span>
              </div>
              
              {action.eco_actions?.co2_saved && (
                <div className="flex items-center gap-1">
                  <BarChart className="h-3.5 w-3.5" />
                  <span>{action.eco_actions.co2_saved} kg CO₂ saved</span>
                </div>
              )}
              
              {action.eco_actions?.category_id && (
                <div className="flex items-center gap-1">
                  <Droplet className="h-3.5 w-3.5" />
                  <span className="capitalize">{action.eco_actions.category_id}</span>
                </div>
              )}
            </div>
            
            {action.notes && (
              <div className="mt-2 text-sm flex items-start gap-1.5">
                <FileText className="h-3.5 w-3.5 mt-0.5 text-eco-dark/60" />
                <p className="text-eco-dark/80">{action.notes}</p>
              </div>
            )}
            
            {action.eco_actions?.impact && (
              <div className="mt-2 text-xs bg-eco-cream/50 p-2 rounded text-eco-dark/80">
                <strong>Impact:</strong> {action.eco_actions.impact}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ActionHistory; 