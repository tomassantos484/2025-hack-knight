import { Link, useLocation } from 'react-router-dom';
import { NavItem } from '@/types/navigation';

interface DesktopNavigationProps {
  navItems: NavItem[];
}

const DesktopNavigation = ({ navItems }: DesktopNavigationProps) => {
  const location = useLocation();
  
  return (
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
  );
};

export default DesktopNavigation; 