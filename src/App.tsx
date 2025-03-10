import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ClerkProvider, useAuth, useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { useEffect, useState, lazy, Suspense } from "react";
import ErrorBoundary from './components/ErrorBoundary';
import { testDatabaseConnection } from './services/receiptProcessingService';
import { syncUserWithSupabase, ClerkUser as ClerkUserType } from './services/userService';

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
const SupabaseTest = lazy(() => import("./components/SupabaseTest"));
const FAQs = lazy(() => import("./pages/FAQs"));
const ContactSupport = lazy(() => import("./pages/ContactSupport"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));

// Get the publishable key from environment variables
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

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
  const { user } = useUser();
  const location = useLocation();
  
  useEffect(() => {
    // Synchronize the user with Supabase when they sign in
    const syncUser = async () => {
      if (isSignedIn && user) {
        try {
          // Convert Clerk user to the format expected by syncUserWithSupabase
          const clerkUser: ClerkUserType = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            emailAddresses: user.emailAddresses?.map(email => ({
              emailAddress: email.emailAddress
            })),
            imageUrl: user.imageUrl
          };
          
          // Synchronize the user
          const supabaseUserId = await syncUserWithSupabase(clerkUser);
          console.log('User synchronized with Supabase:', supabaseUserId);
        } catch (error) {
          console.error('Error synchronizing user with Supabase:', error);
        }
      }
    };
    
    if (isLoaded && isSignedIn) {
      syncUser();
    }
  }, [isLoaded, isSignedIn, user]);
  
  if (!isLoaded) {
    return <PageLoader />;
  }
  
  if (!isSignedIn) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
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
        <Route path="/supabase-test" element={
          <Suspense fallback={<PageLoader />}>
            <SupabaseTest />
          </Suspense>
        } />
        <Route path="/faqs" element={
          <Suspense fallback={<PageLoader />}>
            <FAQs />
          </Suspense>
        } />
        <Route path="/contact-support" element={
          <Suspense fallback={<PageLoader />}>
            <ContactSupport />
          </Suspense>
        } />
        <Route path="/privacy-policy" element={
          <Suspense fallback={<PageLoader />}>
            <PrivacyPolicy />
          </Suspense>
        } />
        <Route path="/terms-of-service" element={
          <Suspense fallback={<PageLoader />}>
            <TermsOfService />
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
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </ErrorBoundary>
  );
};

export default App;
