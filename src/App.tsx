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
import { motion } from "framer-motion";
import { useEffect } from "react";

// Get the publishable key from environment variables
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

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
  if (!clerkPubKey) {
    return <div className="flex items-center justify-center min-h-screen">
      Missing Clerk Publishable Key. Please add it to your .env file.
    </div>;
  }

  return (
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
  );
};

export default App;
