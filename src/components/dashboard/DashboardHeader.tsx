import { Link } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { NavItem } from '@/types/navigation';

// Lazy load components
const DesktopNavigation = lazy(() => import('./DesktopNavigation'));
const UserMenu = lazy(() => import('./UserMenu'));

// Simple loading fallbacks
const NavFallback = () => <div className="h-8 w-64 bg-eco-cream/50 animate-pulse rounded"></div>;
const UserMenuFallback = () => <div className="h-8 w-8 bg-eco-cream/50 animate-pulse rounded-full"></div>;

interface DashboardHeaderProps {
  navItems: NavItem[];
  onSignOut: () => Promise<void>;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

/**
 * Header component for the dashboard
 * Contains logo, navigation, and user menu
 * Uses lazy loading to improve initial load time
 */
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
        <Suspense fallback={<NavFallback />}>
          <DesktopNavigation navItems={navItems} />
        </Suspense>

        {/* User Menu */}
        <Suspense fallback={<UserMenuFallback />}>
          <UserMenu 
            onSignOut={onSignOut}
            isMobileMenuOpen={isMobileMenuOpen}
            toggleMobileMenu={toggleMobileMenu}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default DashboardHeader; 