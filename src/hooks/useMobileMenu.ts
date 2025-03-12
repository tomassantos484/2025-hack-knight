import { useState, useCallback } from 'react';

/**
 * Custom hook for managing mobile menu state
 * @returns Object containing isOpen state and toggle function
 */
export function useMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Use useCallback to memoize the functions and prevent unnecessary re-renders
  const toggleMenu = useCallback(() => setIsOpen(prev => !prev), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);
  
  return {
    isOpen,
    toggleMenu,
    closeMenu
  };
} 