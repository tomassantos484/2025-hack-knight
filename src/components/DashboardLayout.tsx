import { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Camera, Wallet, Receipt, User } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'sonner';
import EcoChatbot from './EcoChatbot';
import { useMobileMenu } from '@/hooks/useMobileMenu';
import { NavItem } from '@/types/navigation';
import DashboardHeader from './dashboard/DashboardHeader';
import MobileNavigation from './dashboard/MobileNavigation';
import DashboardFooter from './dashboard/DashboardFooter';
import ScrollToTop from './ScrollToTop';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn, signOut } = useAuth();
  const { isOpen, toggleMenu, closeMenu } = useMobileMenu();

  // Removed automatic scroll reset in favor of the ScrollToTop button
  // This allows users to control their scroll position manually

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('signed out successfully');
      navigate('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('failed to sign out. please try again.');
    }
  };

  // Dashboard navigation items
  const navItems: NavItem[] = [
    { name: 'dashboard', path: '/actions', icon: <BarChart3 size={18} /> },
    { name: 'trash scanner', path: '/trash-scanner', icon: <Camera size={18} /> },
    { name: 'ecowallet', path: '/eco-wallet', icon: <Wallet size={18} /> },
    { name: 'receiptify', path: '/receiptify', icon: <Receipt size={18} /> },
    { name: 'profile', path: '/profile', icon: <User size={18} /> }
  ];

  return (
    <div className="min-h-screen bg-eco-cream/30 flex flex-col">
      {/* Dashboard Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <DashboardHeader 
          navItems={navItems}
          onSignOut={handleSignOut}
          isMobileMenuOpen={isOpen}
          toggleMobileMenu={toggleMenu}
        />
        
        {/* Mobile menu */}
        <MobileNavigation 
          navItems={navItems}
          isOpen={isOpen}
          onItemClick={closeMenu}
          onSignOut={handleSignOut}
        />
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Add the chatbot */}
      <EcoChatbot />
      
      {/* Scroll to top button */}
      <ScrollToTop threshold={400} />
      
      {/* Footer */}
      <footer className="py-6 w-full mt-auto bg-white border-t border-gray-200">
        <DashboardFooter />
      </footer>
    </div>
  );
};

export default DashboardLayout; 