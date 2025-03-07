
import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowUpRight, Leaf } from 'lucide-react';

interface ActionCardProps {
  title: string;
  impact: string;
  category: string;
  icon: React.ReactNode;
  completed?: boolean;
  onClick?: () => void;
}

const ActionCard = ({ 
  title, 
  impact, 
  category, 
  icon, 
  completed = false,
  onClick 
}: ActionCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={`relative p-5 rounded-xl cursor-pointer ${
        completed 
          ? 'bg-eco-green/10 border border-eco-green/20' 
          : 'glass-card hover:border-eco-green/20'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className={`p-2.5 rounded-lg ${completed ? 'bg-eco-green/20' : 'bg-eco-cream'}`}>
          {icon}
        </div>
        
        {completed && (
          <div className="bg-eco-green text-white rounded-full p-1">
            <Check size={14} />
          </div>
        )}
        
        {!completed && (
          <ArrowUpRight size={18} className="text-eco-dark/50" />
        )}
      </div>
      
      <h3 className="mt-3 font-medium text-base">{title}</h3>
      
      <div className="mt-3 flex justify-between items-center">
        <span className="text-xs inline-flex items-center px-2 py-1 rounded-full bg-eco-cream text-eco-dark/70">
          {category}
        </span>
        <span className="text-xs font-medium text-eco-green flex items-center gap-0.5">
          <Leaf size={12} />
          {impact}
        </span>
      </div>
    </motion.div>
  );
};

export default ActionCard;
