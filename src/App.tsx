import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import Index from "./pages/Index";
import TrashScanner from "./pages/TrashScanner";
import Actions from "./pages/Actions";
import Profile from "./pages/Profile";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import EcoWallet from "./pages/EcoWallet";
import Receiptify from "./pages/Receiptify";
import HowItWorks from "./pages/HowItWorks";
import Features from "./pages/Features";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import MissingClerkKeyError from "./components/MissingClerkKeyError";
import { getEnvVariable, hasEnvVariable } from "./utils/env";

// Get the publishable key from environment variables with safe access
const clerkPubKey = getEnvVariable('VITE_CLERK_PUBLISHABLE_KEY');
const hasClerkKey = hasEnvVariable('VITE_CLERK_PUBLISHABLE_KEY');

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();
  
  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-eco-green border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-eco-dark">Loading authentication...</p>
      </div>
    );
  }
  
  if (!isSignedIn) {
    // Redirect to sign-in page with the return URL
    return <Navigate to={`/sign-in?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  
  return <>{children}</>;
};

// For page transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  const { isSignedIn } = useAuth();
  
  // Debug log for authentication state
  console.log('Auth state in AnimatedRoutes:', { isSignedIn, path: location.pathname });
  
  // Animation variants for page transitions
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 10
    },
    in: {
      opacity: 1,
      y: 0
    },
    out: {
      opacity: 0,
      y: -10
    }
  };
  
  const pageTransition = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.3
  };
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/how-it-works" element={
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <HowItWorks />
          </motion.div>
        } />
        <Route path="/features" element={
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Features />
          </motion.div>
        } />
        <Route path="/sign-in/*" element={
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <SignIn />
          </motion.div>
        } />
        <Route path="/sign-up/*" element={
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <SignUp />
          </motion.div>
        } />
        <Route path="/trash-scanner" element={
          <ProtectedRoute>
            <TrashScanner />
          </ProtectedRoute>
        } />
        <Route path="/actions" element={
          <ProtectedRoute>
            <Actions />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/eco-wallet" element={
          <ProtectedRoute>
            <EcoWallet />
          </ProtectedRoute>
        } />
        <Route path="/receiptify" element={
          <ProtectedRoute>
            <Receiptify />
          </ProtectedRoute>
        } />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [envError, setEnvError] = useState<string | null>(null);
  
  // Enhanced environment variable checking
  useEffect(() => {
    try {
      // Check if we can access environment variables
      if (typeof import.meta.env === 'undefined') {
        setEnvError('Unable to access environment variables. This might be due to a configuration issue.');
        setIsLoading(false);
        return;
      }
      
      // Check specifically for Clerk key with more detailed error
      if (!hasClerkKey) {
        setEnvError('Missing Clerk Publishable Key. Please check your .env file configuration.');
        setIsLoading(false);
        return;
      }
      
      // Short timeout to ensure environment variables are fully loaded
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      
      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Error during environment initialization:', error);
      setEnvError(`Initialization error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  }, []);
  
  // Wrap the entire application with an ErrorBoundary
  return (
    <ErrorBoundary>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="w-12 h-12 border-4 border-eco-green border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-eco-dark">Initializing application...</p>
        </div>
      ) : envError ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-md">
            <h2 className="text-xl font-semibold text-amber-700 mb-2">Configuration Error</h2>
            <p className="text-gray-700 mb-4">{envError}</p>
            <div className="bg-gray-50 p-4 rounded text-left mb-4">
              <p className="text-sm font-mono text-gray-600">
                Please add the Clerk Publishable Key to your <code className="bg-gray-200 px-1 rounded">.env</code> file:
              </p>
              <pre className="bg-gray-800 text-green-400 p-2 rounded mt-2 overflow-x-auto text-xs">
                VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
              </pre>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              If you're a developer, check the console for more details. If you're a user, please contact support.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-eco-green text-white rounded hover:bg-eco-green-dark transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <ClerkProvider 
          publishableKey={clerkPubKey}
          appearance={{
            variables: {
              colorPrimary: '#2F855A'
            }
          }}
        >
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AnimatedRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </QueryClientProvider>
        </ClerkProvider>
      )}
    </ErrorBoundary>
  );
};

export default App;
