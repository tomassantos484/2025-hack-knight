import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { useEffect, Suspense } from "react";
import ErrorBoundary from './components/ErrorBoundary';
import Debug from './components/Debug';
import { testDatabaseConnection } from './services/receiptProcessingService';

// Get the publishable key from environment variables
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

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
  if (!clerkPubKey) {
    return <div className="flex items-center justify-center min-h-screen">
      Missing Clerk Publishable Key. Please add it to your .env file.
    </div>;
  }

  // Call the test function to verify database connection
  testDatabaseConnection();

  return (
    <ErrorBoundary>
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
              <Debug />
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </ErrorBoundary>
  );
};

export default App;
