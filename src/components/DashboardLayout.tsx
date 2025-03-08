import React, { ReactNode, useState, useEffect, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Leaf, User, LogOut, Menu, X, BarChart3, Camera, Settings, Wallet, Receipt } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';
import EcoChatbot from './EcoChatbot';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn, signOut } = useAuth();
  const { user, isLoaded: userIsLoaded } = useUser();

  // Use useLayoutEffect to ensure scroll position is set before browser paint
  useLayoutEffect(() => {
    // Force scroll to top immediately
    window.scrollTo(0, 0);
    
    // Also set body scroll position
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, [location.pathname]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      window.location.href = '/sign-in';
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  // Dashboard navigation items
  const navItems = [
    { name: 'Dashboard', path: '/actions', icon: <BarChart3 size={18} /> },
    { name: 'Trash Scanner', path: '/trash-scanner', icon: <Camera size={18} /> },
    { name: 'EcoWallet', path: '/eco-wallet', icon: <Wallet size={18} /> },
    { name: 'Receiptify', path: '/receiptify', icon: <Receipt size={18} /> },
    { name: 'Profile', path: '/profile', icon: <User size={18} /> }
  ];

  return (
    <div className="min-h-screen bg-eco-cream/30 flex flex-col">
      {/* Dashboard Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/actions" className="flex items-center">
              <img 
                src="/lovable-uploads/19d21855-df32-4986-8eba-bab60462047b.png" 
                alt="EcoVision Logo" 
                className="h-8"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navItems.slice(0, 4).map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    location.pathname === item.path
                      ? 'text-eco-green bg-eco-green/10'
                      : 'text-gray-600 hover:text-eco-green hover:bg-eco-green/5'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-sm text-gray-700">
                {userIsLoaded && user ? (user.firstName || user.username || 'User') : 'User'}
              </div>
              
              <div className="relative">
                <button 
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-eco-cream hover:bg-eco-lightGray transition-colors"
                  onClick={() => navigate('/profile')}
                >
                  {userIsLoaded && user?.imageUrl ? (
                    <img 
                      src={user.imageUrl} 
                      alt="Profile" 
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <User size={18} className="text-eco-dark" />
                  )}
                </button>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:flex items-center justify-center w-9 h-9 rounded-full bg-eco-cream hover:bg-eco-lightGray transition-colors"
                onClick={handleSignOut}
                aria-label="Sign out"
              >
                <LogOut size={18} className="text-eco-dark" />
              </motion.button>
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-eco-green hover:bg-eco-green/5"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === item.path
                      ? 'text-eco-green bg-eco-green/10'
                      : 'text-gray-600 hover:text-eco-green hover:bg-eco-green/5'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
              
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} className="mr-2" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Add the chatbot */}
      <EcoChatbot />
      
      {/* Footer */}
      <footer className="py-6 w-full mt-auto bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} EcoVision. All rights reserved.
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <Link to="/actions" className="text-sm text-gray-500 hover:text-eco-green">
                Dashboard
              </Link>
              <Link to="/" className="text-sm text-gray-500 hover:text-eco-green">Home</Link>
              <Link to="/how-it-works" className="text-sm text-gray-500 hover:text-eco-green">
                How It Works
              </Link>
              <Link to="/features" className="text-sm text-gray-500 hover:text-eco-green">
                Features
              </Link>
              <Link to="/about" className="text-sm text-gray-500 hover:text-eco-green">
                About
              </Link>
              <a 
                href="https://github.com/tomassantos484/2025-hack-knight" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-gray-500 hover:text-eco-green"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout; 