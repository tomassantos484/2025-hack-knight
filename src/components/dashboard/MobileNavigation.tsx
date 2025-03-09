import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { NavItem } from '@/types/navigation';

interface MobileNavigationProps {
  navItems: NavItem[];
  isOpen: boolean;
  onItemClick: () => void;
  onSignOut: () => Promise<void>;
}

const MobileNavigation = ({ 
  navItems, 
  isOpen, 
  onItemClick, 
  onSignOut 
}: MobileNavigationProps) => {
  const location = useLocation();
  
  if (!isOpen) return null;
  
  return (
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
            onClick={onItemClick}
          >
            <span className="mr-2">{item.icon}</span>
            {item.name}
          </Link>
        ))}
        
        <button
          onClick={onSignOut}
          className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut size={18} className="mr-2" />
          sign out
        </button>
      </div>
    </motion.div>
  );
};

export default MobileNavigation; 