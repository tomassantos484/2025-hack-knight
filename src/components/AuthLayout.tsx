import React, { ReactNode, useEffect, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Leaf } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const location = useLocation();
  
  // Use useLayoutEffect to ensure scroll position is set before browser paint
  useLayoutEffect(() => {
    // Force scroll to top immediately
    window.scrollTo(0, 0);
    
    // Also set body scroll position
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, [location.pathname]);
  
  return (
    <div className="min-h-screen pattern-bg flex flex-col">
      {/* Simple header with logo */}
      <header className="w-full px-4 sm:px-6 lg:px-10 py-6">
        <div className="max-w-7xl mx-auto">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/19d21855-df32-4986-8eba-bab60462047b.png" 
              alt="EcoVision Logo" 
              className="h-10"
            />
          </Link>
        </div>
      </header>
      
      <motion.main 
        className="flex-1 w-full flex items-center justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.main>

      {/* Simple footer */}
      <footer className="py-6 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} ecovision. All rights reserved.
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <Link to="/" className="text-sm text-gray-500 hover:text-eco-green">
                Home
              </Link>
              <Link to="/about" className="text-sm text-gray-500 hover:text-eco-green">
                About
              </Link>
              <a 
                href="https://github.com/tomassantos484/2025-hack-knight" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-gray-500 hover:text-eco-green"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout; 