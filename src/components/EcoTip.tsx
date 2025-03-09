import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, X, ExternalLink, Check } from 'lucide-react';

interface EcoTipProps {
  title: string;
  description: string;
  impact?: string;
  category?: string;
  onClose?: () => void;
  onTryThis?: () => void;
}

const EcoTip: React.FC<EcoTipProps> = ({
  title,
  description,
  impact,
  category,
  onClose,
  onTryThis
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white border border-eco-lightGray/50 rounded-xl p-5 shadow-md mb-4 relative"
    >
      <div className="absolute top-3 right-3 flex space-x-2">
        {onTryThis && (
          <button 
            onClick={onTryThis}
            className="text-eco-green hover:text-eco-green/80 transition-colors"
            title="Try this action"
          >
            <Check size={18} />
          </button>
        )}
        {onClose && (
          <button 
            onClick={onClose}
            className="text-eco-dark/50 hover:text-eco-dark/80 transition-colors"
            title="Dismiss tip"
          >
            <X size={18} />
          </button>
        )}
      </div>
      
      <div className="flex items-start">
        <div className="bg-eco-green/10 p-2 rounded-full mr-4 flex-shrink-0">
          <Lightbulb className="text-eco-green" size={20} />
        </div>
        
        <div>
          <h3 className="font-medium text-lg mb-1">{title}</h3>
          <p className="text-eco-dark/70 mb-3">{description}</p>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {impact && (
              <span className="text-xs bg-eco-green/10 text-eco-green px-2 py-1 rounded-full">
                {impact}
              </span>
            )}
            
            {category && (
              <span className="text-xs bg-eco-cream px-2 py-1 rounded-full text-eco-dark/70">
                {category}
              </span>
            )}
          </div>
          
          {onTryThis && (
            <button
              onClick={onTryThis}
              className="mt-4 text-sm text-eco-green flex items-center hover:underline"
            >
              <span>Try this action</span>
              <ExternalLink size={14} className="ml-1" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EcoTip;
