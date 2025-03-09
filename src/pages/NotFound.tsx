import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import LandingLayout from "../components/LandingLayout";
import { Home, ArrowLeft, Search, HelpCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Log the 404 error with more context
    console.error(
      "404 error: user attempted to access non-existent route:",
      {
        path: location.pathname,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    );
    
    // In a production app, you might want to send this to an error tracking service
    // Example: errorTrackingService.captureError('404', { path: location.pathname });
  }, [location.pathname]);

  // Common navigation links that might be helpful
  const commonLinks = [
    { name: "home", path: "/" },
    { name: "actions dashboard", path: "/actions" },
    { name: "ecowallet", path: "/eco-wallet" },
    { name: "about", path: "/about" }
  ];

  return (
    <LandingLayout>
      <div className="min-h-[70vh] flex items-center justify-center py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-lg px-4"
        >
          <h1 className="text-7xl font-bold text-eco-green mb-6">404</h1>
          <h2 className="text-2xl font-medium text-eco-dark mb-4">page not found</h2>
          <p className="text-eco-dark/70 mb-6">
            the page you're looking for doesn't exist or has been moved.
          </p>
          
          {/* Helpful suggestions */}
          <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left">
            <h3 className="text-sm font-medium text-eco-dark mb-2 flex items-center">
              <HelpCircle size={16} className="mr-2 text-eco-green" />
              try one of these instead:
            </h3>
            <ul className="space-y-2 text-sm">
              {commonLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path}
                    className="text-eco-green hover:underline flex items-center"
                  >
                    <ArrowLeft size={14} className="mr-1" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-eco-green text-white px-6 py-3 rounded-full flex items-center"
              >
                <Home size={18} className="mr-2" />
                <span>return to home</span>
              </motion.button>
            </Link>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.history.back()}
              className="border border-eco-green text-eco-green px-6 py-3 rounded-full flex items-center"
            >
              <ArrowLeft size={18} className="mr-2" />
              <span>go back</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </LandingLayout>
  );
};

export default NotFound;
