
import { cubicBezier } from "framer-motion";

// Custom easing functions
export const softEasing = cubicBezier(0.4, 0.0, 0.2, 1);
export const bounceEasing = cubicBezier(0.68, -0.35, 0.265, 1.35);
export const gentleEasing = cubicBezier(0.4, 0.0, 0.4, 1);

// Shared animation variants
export const fadeInUp = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: softEasing
    }
  }
};

export const fadeInDown = {
  hidden: { 
    opacity: 0, 
    y: -20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: softEasing
    }
  }
};

export const fadeInLeft = {
  hidden: { 
    opacity: 0, 
    x: -20 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.5,
      ease: softEasing
    }
  }
};

export const fadeInRight = {
  hidden: { 
    opacity: 0, 
    x: 20 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.5,
      ease: softEasing
    }
  }
};

export const scaleUp = {
  hidden: { 
    opacity: 0, 
    scale: 0.9 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: bounceEasing
    }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

// Page transition variants
export const pageTransition = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: softEasing
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: softEasing
    }
  }
};

// Button hover animations
export const buttonHover = {
  scale: 1.03,
  transition: {
    duration: 0.2,
    ease: gentleEasing
  }
};

export const buttonTap = {
  scale: 0.97,
  transition: {
    duration: 0.1,
    ease: gentleEasing
  }
};

// Card hover animations
export const cardHover = {
  y: -5,
  transition: {
    duration: 0.3,
    ease: softEasing
  }
};

// List item animations for staggered entries
export const listItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: softEasing
    }
  }
};
