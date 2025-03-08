import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import LandingLayout from "../components/LandingLayout";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <LandingLayout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md px-4"
        >
          <h1 className="text-6xl font-bold text-eco-green mb-6">404</h1>
          <h2 className="text-2xl font-medium text-eco-dark mb-4">Page Not Found</h2>
          <p className="text-eco-dark/70 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-eco-green text-white px-6 py-3 rounded-full flex items-center mx-auto"
            >
              <Home size={18} className="mr-2" />
              <span>Return to Home</span>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </LandingLayout>
  );
};

export default NotFound;
