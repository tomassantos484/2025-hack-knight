import { Link } from 'react-router-dom';
import { NavItem } from '@/types/navigation';
import DesktopNavigation from './DesktopNavigation';
import UserMenu from './UserMenu';

interface DashboardHeaderProps {
  navItems: NavItem[];
  onSignOut: () => Promise<void>;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

const DashboardHeader = ({
  navItems,
  onSignOut,
  isMobileMenuOpen,
  toggleMobileMenu
}: DashboardHeaderProps) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        {/* Logo */}
        <Link to="/actions" className="flex items-center">
          <img 
            src="/lovable-uploads/19d21855-df32-4986-8eba-bab60462047b.png" 
            alt="ecovision logo" 
            className="h-8"
          />
        </Link>

        {/* Desktop Navigation */}
        <DesktopNavigation navItems={navItems} />

        {/* User Menu */}
        <UserMenu 
          onSignOut={onSignOut}
          isMobileMenuOpen={isMobileMenuOpen}
          toggleMobileMenu={toggleMobileMenu}
        />
      </div>
    </div>
  );
};

export default DashboardHeader; 