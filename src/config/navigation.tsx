import { BarChart3, Camera, Wallet, Receipt, User } from 'lucide-react';
import { NavItem } from '@/types/navigation';

/**
 * Dashboard navigation items configuration
 * Each item includes a name, path, and icon
 */
export const dashboardNavItems: NavItem[] = [
  { name: 'dashboard', path: '/actions', icon: <BarChart3 size={18} /> },
  { name: 'trash scanner', path: '/trash-scanner', icon: <Camera size={18} /> },
  { name: 'ecowallet', path: '/eco-wallet', icon: <Wallet size={18} /> },
  { name: 'receiptify', path: '/receiptify', icon: <Receipt size={18} /> },
  { name: 'profile', path: '/profile', icon: <User size={18} /> }
]; 