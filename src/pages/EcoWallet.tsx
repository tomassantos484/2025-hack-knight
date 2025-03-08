import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Wallet, Leaf, Gift, TreePine, Waves, Badge, ShoppingBag, CreditCard, ArrowRight, Plus, History, Camera, Receipt } from 'lucide-react';
import { toast } from 'sonner';

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

// Interface for transaction history
interface Transaction {
  id: number;
  type: 'earned' | 'spent';
  amount: number;
  description: string;
  date: string;
}

const EcoWallet = () => {
  const { isSignedIn } = useAuth();
  const { user, isLoaded: userIsLoaded } = useUser();
  
  // State for Buds balance - for new users, start with 0
  const [budsBalance, setBudsBalance] = useState(0);
  
  // State for selected category
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'badge' | 'merch' | 'donation'>('all');
  
  // State for showing transaction history
  const [showHistory, setShowHistory] = useState(false);
  
  // Redemption items
  const redemptionItems: RedemptionItem[] = [
    {
      id: 1,
      name: 'Early Adopter Badge',
      description: 'Show off your early commitment to sustainability',
      budsCost: 50,
      image: '/placeholder.svg',
      category: 'badge',
      icon: <Badge size={24} className="text-eco-green" />
    },
    {
      id: 2,
      name: 'Waste Warrior Badge',
      description: 'Earned by properly recycling 50+ items',
      budsCost: 100,
      image: '/placeholder.svg',
      category: 'badge',
      icon: <Badge size={24} className="text-eco-green" />
    },
    {
      id: 3,
      name: 'Recycled Plastic Bracelet',
      description: 'Handmade bracelet from ocean-bound plastic',
      budsCost: 200,
      image: '/placeholder.svg',
      category: 'merch',
      icon: <ShoppingBag size={24} className="text-eco-green" />
    },
    {
      id: 4,
      name: 'Plant a Tree',
      description: 'We\'ll plant a tree in a deforested area',
      budsCost: 150,
      image: '/placeholder.svg',
      category: 'donation',
      icon: <TreePine size={24} className="text-eco-green" />
    },
    {
      id: 5,
      name: 'Ocean Cleanup Donation',
      description: 'Help remove 1 lb of plastic from the ocean',
      budsCost: 175,
      image: '/placeholder.svg',
      category: 'donation',
      icon: <Waves size={24} className="text-eco-green" />
    }
  ];
  
  // Transaction history - empty for new users
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Filter redemption items by category
  const filteredItems = selectedCategory === 'all' 
    ? redemptionItems 
    : redemptionItems.filter(item => item.category === selectedCategory);
  
  // Handle redemption
  const handleRedeem = (item: RedemptionItem) => {
    if (budsBalance >= item.budsCost) {
      // Update balance
      setBudsBalance(prev => prev - item.budsCost);
      
      // Add transaction
      const newTransaction: Transaction = {
        id: Date.now(),
        type: 'spent',
        amount: item.budsCost,
        description: `Redeemed: ${item.name}`,
        date: new Date().toLocaleDateString()
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      
      // Show success message
      toast.success(`Successfully redeemed ${item.name}!`);
    } else {
      // Show error message
      toast.error(`Not enough Buds to redeem ${item.name}`);
    }
  };
  
  // Handle connecting bank account (Plaid integration placeholder)
  const handleConnectBank = () => {
    toast.success('Bank connection feature coming soon!');
  };
  
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
            EcoWallet
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-eco-dark/70"
          >
            Earn and spend Buds for your eco-friendly actions
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
              <h2 className="text-lg font-medium mb-1">Your Buds Balance</h2>
              <p className="text-3xl font-bold flex items-center">
                <Leaf size={24} className="mr-2" />
                {budsBalance} Buds
              </p>
              <p className="text-sm mt-2 text-white/80">
                Earn more Buds by logging eco actions and scanning receipts
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center transition-colors"
              >
                <History size={18} className="mr-2" />
                Transaction History
              </button>
              
              <button 
                onClick={handleConnectBank}
                className="px-4 py-2 bg-white text-eco-green rounded-lg flex items-center hover:bg-white/90 transition-colors"
              >
                <CreditCard size={18} className="mr-2" />
                Connect Bank Account
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
            <h2 className="text-xl font-medium mb-4">Transaction History</h2>
            
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-eco-dark/70">
                <History size={48} className="mx-auto mb-4 text-eco-dark/30" />
                <p>No transactions yet. Start earning and spending Buds!</p>
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
                      {transaction.type === 'earned' ? '+' : '-'}{transaction.amount} Buds
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
        
        {/* Redemption Options */}
        <div className="mb-6">
          <h2 className="text-xl font-medium mb-4">Redeem Your Buds</h2>
          
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
              All
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
              Digital Badges
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
              Eco Merchandise
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
              Donations
            </button>
          </div>
          
          {/* Redemption Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: item.id * 0.1 }}
                className="bg-white rounded-xl overflow-hidden eco-shadow"
              >
                <div className="h-40 bg-eco-cream flex items-center justify-center">
                  <div className="w-20 h-20 flex items-center justify-center">
                    {item.icon}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{item.name}</h3>
                    <span className="bg-eco-green/10 text-eco-green text-xs px-2 py-1 rounded-full flex items-center">
                      <Leaf size={12} className="mr-1" />
                      {item.budsCost} Buds
                    </span>
                  </div>
                  
                  <p className="text-sm text-eco-dark/70 mb-4">{item.description}</p>
                  
                  <button
                    onClick={() => handleRedeem(item)}
                    disabled={budsBalance < item.budsCost}
                    className={`w-full py-2 rounded-lg flex items-center justify-center ${
                      budsBalance >= item.budsCost
                        ? 'bg-eco-green text-white hover:bg-eco-green/90'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {budsBalance >= item.budsCost ? 'Redeem Now' : 'Not Enough Buds'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* How to Earn More Buds */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-eco-green/10 rounded-xl p-6 mb-8"
        >
          <h2 className="text-xl font-medium mb-4">How to Earn More Buds</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg flex items-start">
              <div className="bg-eco-green/10 p-2 rounded-lg mr-3">
                <Plus size={20} className="text-eco-green" />
              </div>
              <div>
                <h3 className="font-medium text-sm mb-1">Log Eco Actions</h3>
                <p className="text-xs text-eco-dark/70">Each eco-friendly action earns you Buds</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg flex items-start">
              <div className="bg-eco-green/10 p-2 rounded-lg mr-3">
                <Camera size={20} className="text-eco-green" />
              </div>
              <div>
                <h3 className="font-medium text-sm mb-1">Use Trash Scanner</h3>
                <p className="text-xs text-eco-dark/70">Properly dispose of waste to earn Buds</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg flex items-start">
              <div className="bg-eco-green/10 p-2 rounded-lg mr-3">
                <Receipt size={20} className="text-eco-green" />
              </div>
              <div>
                <h3 className="font-medium text-sm mb-1">Scan Receipts</h3>
                <p className="text-xs text-eco-dark/70">Earn Buds for eco-friendly purchases</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default EcoWallet; 