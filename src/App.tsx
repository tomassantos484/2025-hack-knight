import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { useEffect, useState, lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import MissingClerkKeyError from "./components/MissingClerkKeyError";
import { getEnvVariable, hasEnvVariable } from "./utils/env";

// Dynamically import page components
const Index = lazy(() => import("./pages/Index"));
const TrashScanner = lazy(() => import("./pages/TrashScanner"));
const Actions = lazy(() => import("./pages/Actions"));
const Profile = lazy(() => import("./pages/Profile"));
const About = lazy(() => import("./pages/About"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const EcoWallet = lazy(() => import("./pages/EcoWallet"));
const Receiptify = lazy(() => import("./pages/Receiptify"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Features = lazy(() => import("./pages/Features"));

// Get the publishable key from environment variables with safe access
const clerkPubKey = getEnvVariable('VITE_CLERK_PUBLISHABLE_KEY');
const hasClerkKey = hasEnvVariable('VITE_CLERK_PUBLISHABLE_KEY');

// Loading component for suspense fallback
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <div className="w-12 h-12 border-4 border-eco-green border-t-transparent rounded-full animate-spin"></div>
    <p className="mt-4 text-eco-dark">Loading page...</p>
  </div>
);

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();
  
  if (!isLoaded) {
    return <PageLoader />;
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
  
  // Wrap component with motion and suspense
  const AnimatedPage = ({ children }: { children: React.ReactNode }) => (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </motion.div>
  );
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <Suspense fallback={<PageLoader />}>
            <Index />
          </Suspense>
        } />
        <Route path="/how-it-works" element={
          <AnimatedPage>
            <HowItWorks />
          </AnimatedPage>
        } />
        <Route path="/features" element={
          <AnimatedPage>
            <Features />
          </AnimatedPage>
        } />
        <Route path="/sign-in/*" element={
          <AnimatedPage>
            <SignIn />
          </AnimatedPage>
        } />
        <Route path="/sign-up/*" element={
          <AnimatedPage>
            <SignUp />
          </AnimatedPage>
        } />
        <Route path="/trash-scanner" element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <TrashScanner />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/actions" element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <Actions />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <Profile />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/eco-wallet" element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <EcoWallet />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/receiptify" element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <Receiptify />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/about" element={
          <Suspense fallback={<PageLoader />}>
            <About />
          </Suspense>
        } />
        <Route path="*" element={
          <Suspense fallback={<PageLoader />}>
            <NotFound />
          </Suspense>
        } />
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
