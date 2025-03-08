import { Link } from 'react-router-dom';

const DashboardFooter = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="text-sm text-gray-500">
          © {new Date().getFullYear()} EcoVision. All rights reserved.
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <Link to="/actions" className="text-sm text-gray-500 hover:text-eco-green">
            Dashboard
          </Link>
          <Link to="/" className="text-sm text-gray-500 hover:text-eco-green">Home</Link>
          <Link to="/how-it-works" className="text-sm text-gray-500 hover:text-eco-green">
            How It Works
          </Link>
          <Link to="/features" className="text-sm text-gray-500 hover:text-eco-green">
            Features
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
  );
};

export default DashboardFooter; 