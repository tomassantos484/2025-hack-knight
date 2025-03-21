import React, { ReactNode, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Leaf } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const location = useLocation();
  
  // Use useEffect for scrolling to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return (
    <div className="min-h-screen pattern-bg flex flex-col">
      {/* Simple header with logo */}
      <header className="w-full px-4 sm:px-6 lg:px-10 py-6">
        <div className="max-w-7xl mx-auto">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/19d21855-df32-4986-8eba-bab60462047b.png" 
              alt="ecovision logo" 
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
              © {new Date().getFullYear()} ecovision. all rights reserved.
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <Link to="/" className="text-sm text-gray-500 hover:text-eco-green">
                home
              </Link>
              <Link to="/how-it-works" className="text-sm text-gray-500 hover:text-eco-green">
                how it works
              </Link>
              <Link to="/features" className="text-sm text-gray-500 hover:text-eco-green">
                features
              </Link>
              <Link to="/about" className="text-sm text-gray-500 hover:text-eco-green">
                about
              </Link>
              <a 
                href="https://github.com/tomassantos484/2025-hack-knight" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-gray-500 hover:text-eco-green"
              >
                github
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout; 