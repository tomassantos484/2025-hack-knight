import { Variants } from 'framer-motion';

/**
 * Creates staggered animation variants for a container and its children
 * @param staggerDelay Delay between each child animation in seconds
 * @returns Object containing container and item variants
 */
export const createStaggeredAnimation = (staggerDelay = 0.1): {
  container: Variants;
  item: Variants;
} => {
  return {
    container: {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: 0.1,
        },
      },
    },
    item: {
      hidden: { opacity: 0, y: 20 },
      show: { 
        opacity: 1, 
        y: 0,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 24,
        }
      },
    },
  };
};

/**
 * Animation variants for fading in elements
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

/**
 * Animation variants for sliding in elements from the bottom
 */
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    }
  }
};

/**
 * Animation variants for sliding in elements from the left
 */
export const slideRight: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    }
  }
};

/**
 * Animation variants for sliding in elements from the right
 */
export const slideLeft: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    }
  }
}; 