import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, LogOut, Menu, X } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

interface UserMenuProps {
  onSignOut: () => Promise<void>;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

const UserMenu = ({ 
  onSignOut, 
  isMobileMenuOpen, 
  toggleMobileMenu 
}: UserMenuProps) => {
  const navigate = useNavigate();
  const { user, isLoaded: userIsLoaded } = useUser();
  
  return (
    <div className="flex items-center space-x-4">
      <div className="hidden md:block text-sm text-gray-700">
        {userIsLoaded && user ? (user.firstName || user.username || 'user') : 'user'}
      </div>
      
      <div className="relative">
        <button 
          className="flex items-center justify-center w-9 h-9 rounded-full bg-eco-cream hover:bg-eco-lightGray transition-colors"
          onClick={() => navigate('/profile')}
        >
          {userIsLoaded && user?.imageUrl ? (
            <img 
              src={user.imageUrl} 
              alt="profile" 
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
        onClick={onSignOut}
        aria-label="sign out"
      >
        <LogOut size={18} className="text-eco-dark" />
      </motion.button>
      
      {/* Mobile menu button */}
      <button 
        className="md:hidden p-2 rounded-md text-gray-600 hover:text-eco-green hover:bg-eco-green/5"
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </div>
  );
};

export default UserMenu; 