
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Leaf, Recycle, Car } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  change?: string;
  positive?: boolean;
}

const StatCard = ({ title, value, description, icon, change, positive = true }: StatCardProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-5"
    >
      <div className="flex justify-between items-start">
        <div className="bg-eco-cream p-2 rounded-lg">
          {icon}
        </div>
        {change && (
          <span className={`text-xs font-medium flex items-center ${positive ? 'text-eco-green' : 'text-eco-accent'}`}>
            {positive ? '+' : '-'}{change}
            <ArrowUpRight size={14} className={positive ? 'rotate-0' : 'rotate-180'} />
          </span>
        )}
      </div>
      
      <h3 className="mt-3 text-xs font-medium text-eco-dark/70 uppercase tracking-wide">{title}</h3>
      <p className="text-2xl font-semibold mt-1">{value}</p>
      <p className="text-xs text-eco-dark/70 mt-1">{description}</p>
    </motion.div>
  );
};

interface ProgressStatsProps {
  stats: {
    streak: number;
    co2Saved: number;
    wasteRecycled: number;
  }
}

const ProgressStats = ({ stats }: ProgressStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard 
        title="Current Streak"
        value={`${stats.streak} days`}
        description="Consecutive days of eco actions"
        icon={<Leaf size={18} className="text-eco-green" />}
        change="2 days"
        positive={true}
      />
      
      <StatCard 
        title="CO₂ Saved"
        value={`${stats.co2Saved} kg`}
        description="Estimated carbon footprint reduction"
        icon={<Car size={18} className="text-eco-dark/80" />}
        change="5.2 kg"
        positive={true}
      />
      
      <StatCard 
        title="Waste Recycled"
        value={`${stats.wasteRecycled}%`}
        description="Of your total waste properly sorted"
        icon={<Recycle size={18} className="text-eco-dark/80" />}
        change="8%"
        positive={true}
      />
    </div>
  );
};

export default ProgressStats;
