import { useState } from 'react';

/**
 * Custom hook for managing mobile menu state
 * @returns Object containing isOpen state and toggle function
 */
export function useMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleMenu = () => setIsOpen(prev => !prev);
  const closeMenu = () => setIsOpen(false);
  
  return {
    isOpen,
    toggleMenu,
    closeMenu
  };
} 