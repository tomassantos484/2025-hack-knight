import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {motion} from 'framer-motion';
import { Menu, X, Leaf, User, LogOut } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn, signOut } = useAuth();
  const { user, isLoaded: userIsLoaded } = useUser();
  
  // Determine if we're on a protected route
  const isProtectedRoute = ['/actions', '/trash-scanner', '/profile'].includes(location.pathname);
  
  // If we're on a protected route, we must be authenticated
  // Otherwise, use Clerk's authentication state
  const isAuthenticated = isProtectedRoute || isSignedIn;
  
  // Debug log for authentication state
  useEffect(() => {
    console.log('Auth state in Navbar:', { 
      isSignedIn, 
      userIsLoaded,
      hasUserData: user !== null,
      isProtectedRoute,
      isAuthenticated,
      currentPath: location.pathname
    });
  }, [isSignedIn, user, userIsLoaded, isAuthenticated, isProtectedRoute, location.pathname]);
  
  // Track scroll position to add background to navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    try {
      await signOut();
      // Show success toast
      toast.success('Signed out successfully');
      // Force a full page reload to reset all state
      window.location.href = '/sign-in';
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  // Define navigation items based on authentication status
  const getNavItems = () => {
    const items = [
      { name: 'home', path: '/' },
      { name: 'how it works', path: '/how-it-works' },
      { name: 'features', path: '/features' },
      { name: 'about us', path: '/about' },
    ];

    // Add authenticated routes if user is signed in
    if (isAuthenticated) {
      items.push(
        { name: 'dashboard', path: '/actions' },
        { name: 'trash scanner', path: '/trash-scanner' },
        { name: 'profile', path: '/profile' }
      );
    }

    return items;
  };

  const navItems = getNavItems();

  return (
    <header 
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              className="flex items-center"
            >
              <img 
                src="/lovable-uploads/19d21855-df32-4986-8eba-bab60462047b.png" 
                alt="EcoVision Logo" 
                className="h-8 sm:h-10"
              />
            </motion.div>
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-10">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-sm font-medium tracking-wide transition-colors hover:text-eco-green ${
                  location.pathname === item.path 
                    ? 'text-eco-green font-medium' 
                    : 'text-eco-dark/80'
                }`}
              >
                {item.name}
                {location.pathname === item.path && (
                  <motion.div 
                    className="h-0.5 bg-eco-green mt-0.5"
                    layoutId="navbar-indicator"
                  />
                )}
              </Link>
            ))}
          </nav>
          
          {/* User Profile Button - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="text-sm text-eco-dark/80">
                  {userIsLoaded && user ? (user.firstName || user.username || 'User') : 'User'}
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
                      alt="Profile" 
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
                  aria-label="Sign out"
                >
                  <LogOut size={18} className="text-eco-dark" />
                </motion.button>
              </>
            ) : (
              <Link to="/sign-in">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-md bg-eco-green text-white font-medium text-sm flex items-center"
                >
                  <User size={16} className="mr-2" />
                  Sign In
                </motion.button>
              </Link>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-eco-dark p-2 focus:outline-none"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          className="md:hidden bg-white"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`block py-3 px-4 rounded-md ${
                  location.pathname === item.path
                    ? 'bg-eco-green/10 text-eco-green font-medium' 
                    : 'text-eco-dark/80 hover:bg-eco-cream'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Sign In/Out Button (Mobile) */}
            {isAuthenticated ? (
              <button
                onClick={handleSignOut}
                className="flex items-center w-full py-3 px-4 rounded-md text-red-500 hover:bg-red-50"
              >
                <LogOut size={18} className="mr-2" />
                Sign Out
              </button>
            ) : (
              <Link
                to="/sign-in"
                className="flex items-center w-full py-3 px-4 rounded-md text-eco-green font-medium hover:bg-eco-green/10"
              >
                <User size={18} className="mr-2" />
                Sign In
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Navbar;
