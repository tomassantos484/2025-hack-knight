
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Calendar } from 'lucide-react';

interface ChallengeProps {
  title: string;
  duration: string;
  description: string;
  impact: string;
  active?: boolean;
  onAccept?: () => void;
}

const Challenge = ({ 
  title, 
  duration, 
  description, 
  impact, 
  active = false,
  onAccept 
}: ChallengeProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white border border-eco-lightGray/50 rounded-xl overflow-hidden eco-shadow"
    >
      <div className="relative px-5 py-4 border-b border-eco-lightGray/50">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-eco-green to-eco-lightGreen" />
        <div className="flex justify-between items-center">
          <h3 className="font-medium">{title}</h3>
          <div className="text-xs flex items-center gap-1 text-eco-dark/70">
            <Calendar size={14} />
            {duration}
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <p className="text-sm text-eco-dark/80">{description}</p>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-medium text-eco-green">
            <Trophy size={14} />
            <span>Impact: {impact}</span>
          </div>
          
          {!active ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAccept}
              className="px-4 py-2 bg-eco-green text-white text-sm rounded-lg hover:bg-eco-green/90 transition-colors"
            >
              Accept Challenge
            </motion.button>
          ) : (
            <span className="px-3 py-1 bg-eco-green/10 text-eco-green text-xs rounded-lg">
              In Progress
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Challenge;
