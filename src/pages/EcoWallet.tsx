import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Wallet, Leaf, Gift, TreePine, Waves, Badge, ShoppingBag, CreditCard, ArrowRight, Plus, History, Camera, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { getBudsBalance, getTransactions, spendBuds, Transaction as WalletTransaction } from '../services/walletService';

// Interface for redemption items
interface RedemptionItem {
  id: number;
  name: string;
  description: string;
  budsCost: number;
  image: string;
  category: 'badge' | 'merch' | 'donation';
  icon: React.ReactNode;
}

const EcoWallet = () => {
  const { isSignedIn } = useAuth();
  const { user, isLoaded: userIsLoaded } = useUser();
  
  // State for Buds balance
  const [budsBalance, setBudsBalance] = useState<number>(0);
  
  // State for selected category
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'badge' | 'merch' | 'donation'>('all');
  
  // State for showing transaction history
  const [showHistory, setShowHistory] = useState<boolean>(false);
  
  // State for transaction history
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  
  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      if (isSignedIn && user) {
        try {
          // Get user's Buds balance
          const balance = await getBudsBalance(user.id);
          setBudsBalance(balance);
          
          // Get user's transaction history
          const txHistory = await getTransactions(user.id);
          setTransactions(txHistory);
        } catch (error) {
          console.error('error loading user data:', error);
          toast.error('failed to load your buds balance and transaction history.');
        }
      }
    };
    
    loadUserData();
  }, [isSignedIn, user]);
  
  // Redemption items
  const redemptionItems: RedemptionItem[] = [
    {
      id: 1,
      name: 'early adopter badge',
      description: 'show off your early commitment to sustainability',
      budsCost: 50,
      image: '/placeholder.svg',
      category: 'badge',
      icon: <Badge size={24} className="text-eco-green" />
    },
    {
      id: 2,
      name: 'waste warrior badge',
      description: 'earned by properly recycling 50+ items',
      budsCost: 100,
      image: '/placeholder.svg',
      category: 'badge',
      icon: <Badge size={24} className="text-eco-green" />
    },
    {
      id: 3,
      name: 'recycled plastic bracelet',
      description: 'handmade bracelet from ocean-bound plastic',
      budsCost: 200,
      image: '/placeholder.svg',
      category: 'merch',
      icon: <ShoppingBag size={24} className="text-eco-green" />
    },
    {
      id: 4,
      name: 'plant a tree',
      description: 'we\'ll plant a tree in a deforested area',
      budsCost: 150,
      image: '/placeholder.svg',
      category: 'donation',
      icon: <TreePine size={24} className="text-eco-green" />
    },
    {
      id: 5,
      name: 'ocean cleanup donation',
      description: 'help remove 1 lb of plastic from the ocean',
      budsCost: 175,
      image: '/placeholder.svg',
      category: 'donation',
      icon: <Waves size={24} className="text-eco-green" />
    }
  ];
  
  // Filter redemption items by category
  const filteredItems = selectedCategory === 'all' 
    ? redemptionItems 
    : redemptionItems.filter(item => item.category === selectedCategory);
  
  // Handle redemption
  const handleRedeem = async (item: RedemptionItem) => {
    if (!isSignedIn || !user) {
      toast.error('you must be signed in to redeem items.');
      return;
    }
    
    try {
      // Spend Buds using our wallet service
      const success = await spendBuds(
        user.id,
        item.budsCost,
        `redeemed: ${item.name}`
      );
      
      if (success) {
        // Update local state
        setBudsBalance(prev => prev - item.budsCost);
        
        // Refresh transaction history
        const updatedTransactions = await getTransactions(user.id);
        setTransactions(updatedTransactions);
      }
    } catch (error) {
      console.error('error redeeming item:', error);
      toast.error('failed to redeem item. please try again.');
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
  
  // Routes to earn more Buds
  const budEarningActions = [
    {
      name: 'scan receipts',
      description: 'upload receipts for eco-friendly purchases',
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
          className="bg-gradient-to-r from-eco-green to-eco-green/80 rounded-xl p-6 text-white mb-8 eco-shadow"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-lg font-medium mb-1">your buds balance</h2>
              <p className="text-3xl font-bold flex items-center">
                <Leaf size={24} className="mr-2" />
                {budsBalance} buds
              </p>
              <p className="text-sm mt-2 text-white/80">
                earn more buds by logging eco actions and scanning receipts
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center transition-colors"
              >
                <History size={18} className="mr-2" />
                transaction history
              </button>
              
              <button 
                onClick={handleConnectBank}
                className="px-4 py-2 bg-white text-eco-green rounded-lg flex items-center hover:bg-white/90 transition-colors"
              >
                <CreditCard size={18} className="mr-2" />
                connect bank account
              </button>
            </div>
          </div>
        </motion.div>
        
        {/* Transaction History */}
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 bg-white rounded-xl p-6 eco-shadow"
          >
            <h2 className="text-xl font-medium mb-4">transaction history</h2>
            
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-eco-dark/70">
                <History size={48} className="mx-auto mb-4 text-eco-dark/30" />
                <p>no transactions yet. start earning and spending buds!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map(transaction => (
                  <div 
                    key={transaction.id}
                    className="flex justify-between items-center p-3 border-b border-gray-100"
                  >
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-eco-dark/70">{transaction.date}</p>
                    </div>
                    <div className={`font-medium ${transaction.type === 'earned' ? 'text-eco-green' : 'text-red-500'}`}>
                      {transaction.type === 'earned' ? '+' : '-'}{transaction.amount} buds
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
        
        {/* Ways to Earn Buds */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 bg-white rounded-xl p-6 eco-shadow"
        >
          <h2 className="text-xl font-medium mb-4">ways to earn buds</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budEarningActions.map((action, index) => (
              <a
                key={index}
                href={action.path}
                className="p-4 bg-eco-cream hover:bg-eco-green/10 rounded-lg flex items-start transition-colors"
              >
                <div className="mr-4 mt-1">{action.icon}</div>
                <div>
                  <h3 className="font-medium">{action.name}</h3>
                  <p className="text-sm text-eco-dark/70">{action.description}</p>
                </div>
              </a>
            ))}
          </div>
        </motion.div>
        
        {/* Redemption Options */}
        <div className="mb-6">
          <h2 className="text-xl font-medium mb-4">redeem your buds</h2>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button 
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm ${
                selectedCategory === 'all' 
                  ? 'bg-eco-green text-white' 
                  : 'bg-eco-cream text-eco-dark hover:bg-eco-green/10'
              }`}
            >
              all
            </button>
            <button 
              onClick={() => setSelectedCategory('badge')}
              className={`px-4 py-2 rounded-lg text-sm flex items-center ${
                selectedCategory === 'badge' 
                  ? 'bg-eco-green text-white' 
                  : 'bg-eco-cream text-eco-dark hover:bg-eco-green/10'
              }`}
            >
              <Badge size={16} className="mr-2" />
              digital badges
            </button>
            <button 
              onClick={() => setSelectedCategory('merch')}
              className={`px-4 py-2 rounded-lg text-sm flex items-center ${
                selectedCategory === 'merch' 
                  ? 'bg-eco-green text-white' 
                  : 'bg-eco-cream text-eco-dark hover:bg-eco-green/10'
              }`}
            >
              <ShoppingBag size={16} className="mr-2" />
              eco merch
            </button>
            <button 
              onClick={() => setSelectedCategory('donation')}
              className={`px-4 py-2 rounded-lg text-sm flex items-center ${
                selectedCategory === 'donation' 
                  ? 'bg-eco-green text-white' 
                  : 'bg-eco-cream text-eco-dark hover:bg-eco-green/10'
              }`}
            >
              <TreePine size={16} className="mr-2" />
              donations
            </button>
          </div>
          
          {/* Redemption Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <motion.div
                key={item.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl overflow-hidden eco-shadow"
              >
                <div className="aspect-video bg-eco-light/30 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-eco-green/10 flex items-center justify-center">
                    {item.icon}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium mb-1">{item.name}</h3>
                  <p className="text-sm text-eco-dark/70 mb-4">{item.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm font-medium text-eco-green">
                      <Leaf size={16} className="mr-1" />
                      {item.budsCost} buds
                    </div>
                    
                    <button
                      onClick={() => handleRedeem(item)}
                      disabled={budsBalance < item.budsCost}
                      className={`px-3 py-1.5 rounded-lg text-sm flex items-center ${
                        budsBalance >= item.budsCost
                          ? 'bg-eco-green text-white hover:bg-eco-green/90'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {budsBalance >= item.budsCost ? 'redeem' : 'not enough buds'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EcoWallet; 