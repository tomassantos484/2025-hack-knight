import { ReactNode } from 'react';

/**
 * Navigation item type definition
 */
export interface NavItem {
  name: string;
  path: string;
  icon: ReactNode;
} 