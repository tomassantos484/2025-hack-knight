import { ReactNode, lazy, Suspense } from 'react';
import { useSignOut } from '@/hooks/useSignOut';
import { dashboardNavItems } from '@/config/navigation';

// Lazy load components
const DashboardContainer = lazy(() => import('./dashboard/DashboardContainer'));
const DashboardNavigation = lazy(() => import('./dashboard/DashboardNavigation'));

// Simple loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center w-full h-screen bg-eco-cream">
    <div className="animate-pulse text-eco-green text-lg">Loading dashboard...</div>
  </div>
);

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Main dashboard layout component
 * Orchestrates the dashboard structure and navigation
 * Uses lazy loading to improve initial load time
 */
const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  // Use the custom sign-out hook
  const { handleSignOut } = useSignOut();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <DashboardContainer
        header={
          <Suspense fallback={<div className="h-16 bg-eco-cream animate-pulse"></div>}>
            <DashboardNavigation 
              navItems={dashboardNavItems}
              onSignOut={handleSignOut}
            />
          </Suspense>
        }
      >
        {children}
      </DashboardContainer>
    </Suspense>
  );
};

export default DashboardLayout; 