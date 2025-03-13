import React, { ReactNode, useState, useEffect, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Leaf, Github, Twitter, Heart, User, LogOut } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn, signOut } = useAuth();
  const { user, isLoaded: userIsLoaded } = useUser();

  // Use useLayoutEffect to ensure scroll position is set before browser paint
  useLayoutEffect(() => {
    // Force scroll to top immediately
    window.scrollTo(0, 0);
    
    // Also set body scroll position
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      // Show success toast
      toast.success('signed out successfully');
      // Use React Router's navigate function instead of window.location.href
      navigate('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('failed to sign out. please try again.');
    }
  };

  return (
    <div className="min-h-screen pattern-bg flex flex-col">
      {/* Navbar - Using the same design as landing page */}
      <nav className={`w-full px-4 sm:px-6 lg:px-10 py-6 flex justify-between items-center fixed top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}>
        <Link to="/" className="flex items-center">
          <img 
            src="/lovable-uploads/19d21855-df32-4986-8eba-bab60462047b.png" 
            alt="ecovision logo" 
            className="h-10"
          />
        </Link>
        
        <div className="hidden md:flex items-center space-x-10">
          <Link to="/" className="text-gray-800 hover:text-eco-green transition-colors">
            home
          </Link>
          <Link to="/how-it-works" className="text-gray-800 hover:text-eco-green transition-colors">
            how it works
          </Link>
          <Link to="/features" className="text-gray-800 hover:text-eco-green transition-colors">
            features
          </Link>
          <Link to="/#demo" className="text-gray-800 hover:text-eco-green transition-colors">
            see ecovision in action
          </Link>
          <Link to="/about" className="text-gray-800 hover:text-eco-green transition-colors">
            about us
          </Link>
          
          {isSignedIn ? (
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-800">
                {userIsLoaded && user ? (user.firstName || user.username || 'user') : 'user'}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-eco-cream hover:bg-eco-lightGray transition-colors"
                onClick={() => navigate('/profile')}
              >
                {userIsLoaded && user?.imageUrl ? (
                  <img 
                    src={user.imageUrl} 
                    alt="profile" 
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <User size={18} className="text-eco-dark" />
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-eco-cream hover:bg-eco-lightGray transition-colors"
                onClick={handleSignOut}
                aria-label="sign out"
              >
                <LogOut size={18} className="text-eco-dark" />
              </motion.button>
            </div>
          ) : (
            <Link to="/sign-in">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-eco-green text-white px-5 py-2 rounded-md flex items-center space-x-2"
              >
                <span>sign in</span>
              </motion.button>
            </Link>
          )}
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
      <footer className="border-t border-gray-200 bg-white/50 py-12 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Logo and description */}
            <div className="space-y-4">
              <Link to="/" className="flex items-center">
                <img 
                  src="/lovable-uploads/19d21855-df32-4986-8eba-bab60462047b.png" 
                  alt="ecovision logo" 
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
                  <Link to="/how-it-works" className="text-sm text-gray-600 hover:text-eco-green transition-colors">
                    how it works
                  </Link>
                </li>
                <li>
                  <Link to="/features" className="text-sm text-gray-600 hover:text-eco-green transition-colors">
                    features
                  </Link>
                </li>
                <li>
                  <Link to="/#demo" className="text-sm text-gray-600 hover:text-eco-green transition-colors">
                    see ecovision in action
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-sm text-gray-600 hover:text-eco-green transition-colors">
                    about us
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Account Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-800">account</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/sign-in" className="text-sm text-gray-600 hover:text-eco-green transition-colors">
                    sign in
                  </Link>
                </li>
                <li>
                  <Link to="/sign-up" className="text-sm text-gray-600 hover:text-eco-green transition-colors">
                    sign up
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
            <p>© {new Date().getFullYear()} ecovision. all rights reserved.</p>
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
