
import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Leaf, Github, Twitter, Heart } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen pattern-bg flex flex-col">
      {/* Navbar - Using the same design as landing page */}
      <nav className="w-full px-4 sm:px-6 lg:px-10 py-6 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <img 
            src="/lovable-uploads/19d21855-df32-4986-8eba-bab60462047b.png" 
            alt="EcoVision Logo" 
            className="h-10"
          />
        </Link>
        
        <div className="flex items-center space-x-10">
          <Link to="/" className="text-gray-800 hover:text-eco-green transition-colors">
            home
          </Link>
          <Link to="/about" className="text-gray-800 hover:text-eco-green transition-colors">
            about us
          </Link>
          <Link to="/actions" className="text-gray-800 hover:text-eco-green transition-colors">
            dashboard
          </Link>
          <Link to="/trash-scanner" className="text-gray-800 hover:text-eco-green transition-colors">
            trash scanner
          </Link>
          <Link to="/profile">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-eco-green text-white px-5 py-2 rounded-md flex items-center space-x-2"
            >
              <span>sign in</span>
            </motion.button>
          </Link>
        </div>
      </nav>
      
      <motion.main 
        className="flex-1 w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.main>

      {/* New Footer Design */}
      <footer className="border-t border-gray-200 bg-white/50 py-12 mt-12 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Logo and description */}
            <div className="space-y-4">
              <Link to="/" className="flex items-center">
                <img 
                  src="/lovable-uploads/19d21855-df32-4986-8eba-bab60462047b.png" 
                  alt="EcoVision Logo" 
                  className="h-8"
                />
              </Link>
              <p className="text-sm text-gray-600 leading-relaxed">
                track your sustainability journey and make a positive impact on the environment
              </p>
            </div>
            
            {/* Navigation Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-800">navigation</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-sm text-gray-600 hover:text-eco-green transition-colors">
                    home
                  </Link>
                </li>
                <li>
                  <Link to="/actions" className="text-sm text-gray-600 hover:text-eco-green transition-colors">
                    dashboard
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Eco Actions */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-800">eco actions</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/actions" className="text-sm text-gray-600 hover:text-eco-green transition-colors">
                    log actions
                  </Link>
                </li>
                <li>
                  <Link to="/trash-scanner" className="text-sm text-gray-600 hover:text-eco-green transition-colors">
                    trash scanner
                  </Link>
                </li>
                <li>
                  <Link to="/actions" className="text-sm text-gray-600 hover:text-eco-green transition-colors">
                    challenges
                  </Link>
                </li>
                <li>
                  <Link to="/actions" className="text-sm text-gray-600 hover:text-eco-green transition-colors">
                    eco tips
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Connect */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-800">connect</h4>
              <div className="flex space-x-4">
                <a href="https://github.com/tomassantos484/2025-hack-knight" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-eco-green transition-colors">
                  <Github size={20} />
                </a>
                <a href="https://twitter.com/TomasJSantosY" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-eco-green transition-colors">
                  <Twitter size={20} />
                </a>
              </div>
            </div>
          </div>
          
          {/* Bottom copyright section */}
          <div className="flex flex-col md:flex-row md:justify-between items-center pt-8 mt-8 border-t border-gray-200 text-xs text-gray-500">
            <p>© 2023 ecovision. all rights reserved.</p>
            <p className="flex items-center mt-4 md:mt-0">
              made with <Heart size={14} className="mx-1 text-eco-accent" /> for the planet <Leaf size={14} className="ml-1 text-eco-green" />
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
