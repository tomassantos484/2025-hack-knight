import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Link } from 'react-router-dom';
import { Wallet, Leaf, Gift, TreePine, Waves, ShoppingBag, CreditCard, ArrowRight, Plus, History, Camera, Receipt, Award } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';
import { supabase } from '../services/supabaseService';
import { formatUuid } from '../services/ecoActionsService';
import { earnBuds, spendBuds, getTransactions } from '../services/walletService';
import { format } from 'date-fns';

// Interface for redemption items
interface RedemptionItem {
  id: string;
  name: string;
  description: string;
  budsCost: number;
  category: 'merch' | 'donation';
  icon: React.ReactNode;
}

// Interface for wallet transactions
type WalletTransaction = {
  id: string;
  user_id: string;
  type: 'earned' | 'spent';
  amount: number;
  description: string;
  created_at: string;
};

const EcoWallet = () => {
  const { isSignedIn } = useAuth();
  const { user, isLoaded: userIsLoaded } = useUser();
  
  // State for Buds balance
  const [budsBalance, setBudsBalance] = useState<number>(0);
  
  // State for selected category
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'merch' | 'donation'>('all');
  
  // State for showing transaction history
  const [showHistory, setShowHistory] = useState<boolean>(false);
  
  // State for transaction history
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  
  // State for redemption items
  const [redemptionItems, setRedemptionItems] = useState<RedemptionItem[]>([]);
  
  // State for loading
  const [loading, setLoading] = useState<boolean>(true);
  
  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      if (isSignedIn && user) {
        try {
          setLoading(true);
          
          // Get user's transaction history first
          const txHistory = await getTransactions(user.id);
          setTransactions(txHistory);
          
          // Calculate balance directly from transactions
          const calculatedBalance = txHistory.reduce((total, tx) => {
            console.log(`Transaction: ${tx.description}, Type: ${tx.type}, Amount: ${tx.amount}, Running Total: ${total}`);
            if (tx.type === 'earned') {
              return total + tx.amount;
            } else if (tx.type === 'spent') {
              return total - tx.amount;
            }
            return total;
          }, 0);
          
          console.log(`Final calculated balance: ${calculatedBalance}`);
          
          // Set the calculated balance
          setBudsBalance(calculatedBalance);
          
          // Also update the balance in the database to fix any discrepancies
          try {
            // Use the RPC function to ensure consistency with how other parts of the app update the balance
            const { error } = await supabase.rpc('update_buds_balance', {
              p_user_id: formatUuid(user.id),
              p_amount: calculatedBalance,
              p_is_earning: true
            });
            
            if (error) {
              console.error('Error updating buds balance in database:', error);
              
              // Fallback to direct update if RPC fails
              const { error: updateError } = await supabase
                .from('user_stats')
                .update({ buds_earned: calculatedBalance })
                .eq('user_id', formatUuid(user.id));
              
              if (updateError) {
                console.error('Error with fallback update of buds balance:', updateError);
              }
            }
          } catch (updateError) {
            console.error('Error updating buds balance:', updateError);
          }
          
          // Add redemption items
          const otherItems: RedemptionItem[] = [
            {
              id: 'merch-1',
              name: 'Recycled Plastic Bracelet',
              description: 'Handmade bracelet from ocean-bound plastic',
              budsCost: 200,
              category: 'merch',
              icon: <ShoppingBag size={24} className="text-eco-green" />
            },
            {
              id: 'donation-1',
              name: 'Plant a Tree',
              description: 'We\'ll plant a tree in a deforested area',
              budsCost: 150,
              category: 'donation',
              icon: <TreePine size={24} className="text-eco-green" />
            },
            {
              id: 'donation-2',
              name: 'Ocean Cleanup Donation',
              description: 'Help remove 1 lb of plastic from the ocean',
              budsCost: 175,
              category: 'donation',
              icon: <Waves size={24} className="text-eco-green" />
            }
          ];
          
          setRedemptionItems(otherItems);
        } catch (error) {
          console.error('Error loading user data:', error);
          toast.error('Failed to load your Buds balance and transaction history.');
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadUserData();
  }, [isSignedIn, user]);
  
  // Filter redemption items by category
  const filteredItems = selectedCategory === 'all' 
    ? redemptionItems 
    : redemptionItems.filter(item => item.category === selectedCategory);
  
  // Handle redemption
  const handleRedeem = async (item: RedemptionItem) => {
    if (!isSignedIn || !user) {
      toast.error('You must be signed in to redeem items.');
      return;
    }
    
    try {
      // Spend buds for the item
      const success = await spendBuds(
        user.id,
        item.budsCost,
        `Redeemed: ${item.name}`
      );
      
      if (success) {
        toast.success(`Successfully redeemed ${item.name}!`);
        
        // Update balance
        const txHistory = await getTransactions(user.id);
        setTransactions(txHistory);
        
        // Recalculate balance
        const newBalance = txHistory.reduce((total, tx) => {
          if (tx.type === 'earned') {
            return total + tx.amount;
          } else if (tx.type === 'spent') {
            return total - tx.amount;
          }
          return total;
        }, 0);
        
        setBudsBalance(newBalance);
      } else {
        toast.error('Failed to redeem item. Please try again.');
      }
    } catch (error) {
      console.error('Error redeeming item:', error);
      toast.error('An error occurred while redeeming the item.');
    }
  };
  
  // Handle connecting bank account (Plaid integration placeholder)
  const handleConnectBank = () => {
    toast.success('bank connection feature coming soon!');
  };
  
  // Get score color
  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-red-500';
    if (score < 60) return 'text-yellow-500';
    return 'text-eco-green';
  };
  
  // Ways to earn more Buds
  const budEarningActions = [
    {
      name: 'Log Eco Actions',
      description: 'Record your daily eco-friendly activities',
      icon: <Leaf size={24} className="text-eco-green" />,
      path: '/actions'
    },
    {
      name: 'Earn Badges',
      description: 'Complete challenges to earn special badges',
      icon: <Award size={24} className="text-eco-green" />,
      path: '/profile'
    },
    {
      name: 'Scan Receipts',
      description: 'Upload receipts for eco-friendly purchases',
      icon: <Receipt size={24} className="text-eco-green" />,
      path: '/receiptify'
    },
    {
      name: 'scan trash',
      description: 'properly dispose of waste items',
      icon: <Camera size={24} className="text-eco-green" />,
      path: '/trash-scanner'
    }
  ];
  
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-medium mb-2 flex items-center"
          >
            <Wallet className="mr-2 text-eco-green" size={28} />
            ecowallet
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-eco-dark/70"
          >
            earn and spend Buds for your eco-friendly actions
          </motion.p>
        </div>
        
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 mb-8 rounded-xl"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-xl font-medium mb-2">Your Balance</h2>
              <div className="text-3xl font-bold text-eco-green flex items-center">
                <Leaf className="mr-2" />
                {loading ? (
                  <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <>{budsBalance} Buds</>
                )}
              </div>
              <p className="text-sm text-eco-dark/60 mt-1">
                Buds are earned through eco-friendly actions
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-col space-y-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center text-eco-green hover:text-eco-green/80 transition-colors"
              >
                <History size={18} className="mr-1" />
                {showHistory ? 'Hide' : 'View'} Transaction History
              </button>
              
              <button
                onClick={handleConnectBank}
                className="flex items-center text-eco-green hover:text-eco-green/80 transition-colors"
              >
                <CreditCard size={18} className="mr-1" />
                Connect Bank Account
              </button>
            </div>
          </div>
          
          {/* Transaction History */}
          {showHistory ? (
            <div className="mt-6 border-t border-eco-light pt-4">
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <History size={20} className="mr-2 text-eco-green" />
                Transaction History
                <button
                  onClick={() => setShowHistory(false)}
                  className="ml-auto text-sm text-eco-green hover:text-eco-green/80 transition-colors"
                >
                  Hide
                </button>
              </h3>
              
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-gray-200 animate-pulse rounded"></div>
                  ))}
                </div>
              ) : transactions.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-hidden">
                  {transactions.map((tx, index) => (
                    <div 
                      key={tx.id} 
                      className="flex justify-between items-center p-3 rounded hover:bg-eco-light/20 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-sm text-eco-dark/60">{new Date(tx.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className={`font-bold ${tx.type === 'earned' ? 'text-eco-green' : 'text-red-500'}`}>
                        {tx.type === 'earned' ? '+' : '-'}{tx.amount} Buds
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-eco-dark/60">No transactions yet. Start earning Buds by logging eco actions!</p>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowHistory(true)}
              className="mt-4 w-full py-2 px-4 bg-eco-light/30 hover:bg-eco-light/50 rounded-lg flex items-center justify-center text-eco-green transition-colors"
            >
              <History size={18} className="mr-2" />
              View Transaction History
            </button>
          )}
        </motion.div>
        
        {/* Ways to Earn Buds */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 mb-8 rounded-xl"
        >
          <h2 className="text-xl font-medium mb-4">ways to earn buds</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {budEarningActions.map((action, index) => (
              <Link
                key={index}
                to={action.path}
                className="p-4 border border-eco-light rounded-lg hover:bg-eco-light/10 transition-colors flex flex-col items-center text-center"
              >
                <div className="mb-2 p-3 bg-eco-light/20 rounded-full">
                  {action.icon}
                </div>
                <h3 className="font-medium mb-1">{action.name}</h3>
                <p className="text-sm text-eco-dark/60">{action.description}</p>
              </Link>
            ))}
          </div>
        </motion.div>
        
        {/* Redemption Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 rounded-xl"
        >
          <h2 className="text-xl font-medium mb-4">Redeem Your Buds</h2>
          
          {/* Category Filters */}
          <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-hidden">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all' 
                  ? 'bg-eco-green text-white' 
                  : 'bg-eco-light/30 hover:bg-eco-light/50'
              }`}
            >
              all
            </button>
            <button
              onClick={() => setSelectedCategory('merch')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${
                selectedCategory === 'merch' 
                  ? 'bg-eco-green text-white' 
                  : 'bg-eco-light/30 hover:bg-eco-light/50'
              }`}
            >
              <ShoppingBag size={16} className="mr-1" />
              Merchandise
            </button>
            <button
              onClick={() => setSelectedCategory('donation')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${
                selectedCategory === 'donation' 
                  ? 'bg-eco-green text-white' 
                  : 'bg-eco-light/30 hover:bg-eco-light/50'
              }`}
            >
              <Gift size={16} className="mr-1" />
              Donations
            </button>
          </div>
          
          {/* Items Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                return (
                  <div 
                    key={item.id}
                    className={`border border-eco-light rounded-lg overflow-hidden transition-all`}
                  >
                    <div className="p-4">
                      <div className="flex items-center mb-2">
                        <div className="p-2 bg-eco-light/20 rounded-full mr-3">
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-eco-green">{item.budsCost} Buds</p>
                        </div>
                      </div>
                      <p className="text-sm text-eco-dark/70 mb-4">{item.description}</p>
                      <button
                        onClick={() => handleRedeem(item)}
                        disabled={budsBalance < item.budsCost}
                        className={`w-full py-2 px-4 rounded text-sm font-medium flex items-center justify-center ${
                          budsBalance >= item.budsCost ? 'bg-eco-green text-white hover:bg-eco-green/90' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {budsBalance >= item.budsCost ? 'Redeem' : 'Not Enough Buds'}
                        {budsBalance >= item.budsCost && <ArrowRight size={16} className="ml-1" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-eco-dark/60 py-8">No items available in this category.</p>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default EcoWallet; 