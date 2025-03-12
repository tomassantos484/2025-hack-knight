import { ReactNode, lazy, Suspense } from 'react';

// Lazy load components
const ScrollToTop = lazy(() => import('../ScrollToTop'));
const EcoChatbot = lazy(() => import('../EcoChatbot'));
const DashboardFooter = lazy(() => import('./DashboardFooter'));

// Simple loading fallbacks
const FooterFallback = () => <div className="h-16 bg-white animate-pulse"></div>;
const ChatbotFallback = () => <div className="fixed bottom-4 right-4 w-12 h-12 rounded-full bg-eco-green/20 animate-pulse"></div>;

interface DashboardContainerProps {
  header: ReactNode;
  children: ReactNode;
}

/**
 * Container component for the dashboard layout structure
 * Handles the overall layout structure including header, main content, footer, and utility components
 * Uses lazy loading to improve initial load time
 */
const DashboardContainer = ({ header, children }: DashboardContainerProps) => {
  return (
    <div className="min-h-screen bg-eco-cream/30 flex flex-col">
      {/* Dashboard Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        {header}
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Add the chatbot */}
      <Suspense fallback={<ChatbotFallback />}>
        <EcoChatbot />
      </Suspense>
      
      {/* Scroll to top button */}
      <Suspense fallback={<></>}>
        <ScrollToTop threshold={400} />
      </Suspense>
      
      {/* Footer */}
      <footer className="py-6 w-full mt-auto bg-white border-t border-gray-200">
        <Suspense fallback={<FooterFallback />}>
          <DashboardFooter />
        </Suspense>
      </footer>
    </div>
  );
};

export default DashboardContainer; 