import React from 'react';
import { motion } from 'framer-motion';
import { LightbulbIcon } from 'lucide-react';

interface EcoTipProps {
  tip: string;
  source?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning';
  icon?: React.ReactNode;
  className?: string;
}

const EcoTip = ({ 
  tip, 
  source, 
  children, 
  variant = 'default',
  icon,
  className = ''
}: EcoTipProps) => {
  // Define variant-specific styles
  const variantStyles = {
    default: {
      bg: 'bg-eco-green/10',
      border: 'border-eco-green/20',
      iconBg: 'bg-eco-green/20',
      iconColor: 'text-eco-green',
      title: 'daily eco tip'
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      title: 'eco success'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      title: 'eco alert'
    }
  };

  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${styles.bg} border ${styles.border} rounded-xl p-5 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className={`${styles.iconBg} rounded-full p-2 mt-1`}>
          {icon || <LightbulbIcon size={16} className={styles.iconColor} />}
        </div>
        <div>
          <h3 className="text-sm font-medium mb-1">{styles.title}</h3>
          <p className="text-eco-dark/80 text-sm">{tip}</p>
          {children}
          {source && (
            <p className="text-xs text-eco-dark/60 mt-2">source: {source}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EcoTip;
