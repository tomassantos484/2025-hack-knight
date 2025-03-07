
import React from 'react';
import { motion } from 'framer-motion';
import { LightbulbIcon } from 'lucide-react';

interface EcoTipProps {
  tip: string;
  source?: string;
}

const EcoTip = ({ tip, source }: EcoTipProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-eco-green/10 border border-eco-green/20 rounded-xl p-5"
    >
      <div className="flex items-start gap-3">
        <div className="bg-eco-green/20 rounded-full p-2 mt-1">
          <LightbulbIcon size={16} className="text-eco-green" />
        </div>
        <div>
          <h3 className="text-sm font-medium mb-1">daily eco tip</h3>
          <p className="text-eco-dark/80 text-sm">{tip}</p>
          {source && (
            <p className="text-xs text-eco-dark/60 mt-2">source: {source}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EcoTip;
