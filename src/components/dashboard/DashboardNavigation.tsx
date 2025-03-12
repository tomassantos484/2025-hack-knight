import { lazy, Suspense } from 'react';
import { NavItem } from '@/types/navigation';
import { useMobileMenu } from '@/hooks/useMobileMenu';

// Lazy load components
const DashboardHeader = lazy(() => import('./DashboardHeader'));
const MobileNavigation = lazy(() => import('./MobileNavigation'));

// Simple loading fallbacks
const HeaderFallback = () => <div className="h-16 bg-white animate-pulse"></div>;
const MobileMenuFallback = () => <div className="h-0"></div>; // Empty fallback for mobile menu

interface DashboardNavigationProps {
  navItems: NavItem[];
  onSignOut: () => Promise<void>;
}

/**
 * Component to handle dashboard navigation
 * Manages both desktop and mobile navigation components
 * Uses lazy loading to improve initial load time
 */
const DashboardNavigation = ({ navItems, onSignOut }: DashboardNavigationProps) => {
  const { isOpen, toggleMenu, closeMenu } = useMobileMenu();

  return (
    <>
      <Suspense fallback={<HeaderFallback />}>
        <DashboardHeader 
          navItems={navItems}
          onSignOut={onSignOut}
          isMobileMenuOpen={isOpen}
          toggleMobileMenu={toggleMenu}
        />
      </Suspense>
      
      {/* Mobile menu */}
      <Suspense fallback={<MobileMenuFallback />}>
        <MobileNavigation 
          navItems={navItems}
          isOpen={isOpen}
          onItemClick={closeMenu}
          onSignOut={onSignOut}
        />
      </Suspense>
    </>
  );
};

export default DashboardNavigation; 