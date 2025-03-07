
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {motion} from 'framer-motion';
import { Menu, X, Leaf, User } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  
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

  const navItems = [
    { name: 'home', path: '/' },
    { name: 'about us', path: '/about' },
    { name: 'dashboard', path: '/actions' },
    { name: 'trash scanner', path: '/trash-scanner' },
    { name: 'profile', path: '/profile' },
  ];

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
          <div className="hidden md:flex items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-eco-cream hover:bg-eco-lightGray transition-colors"
            >
              <User size={18} className="text-eco-dark" />
            </motion.button>
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
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Navbar;
