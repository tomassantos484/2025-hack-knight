import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ScrollToTopProps {
  threshold?: number;
  className?: string;
  showTooltip?: boolean;
}

/**
 * A button that appears when the user scrolls down and allows them to scroll back to the top
 * @param threshold The scroll position at which the button appears (default: 300)
 * @param className Additional CSS classes for the button
 * @param showTooltip Whether to show a tooltip on hover (default: true)
 */
const ScrollToTop = ({ 
  threshold = 300, 
  className = '',
  showTooltip = true
}: ScrollToTopProps) => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when user scrolls down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [threshold]);

  // Scroll to top with smooth behavior
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const buttonContent = (
    <motion.button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 p-3 rounded-full bg-eco-green text-white shadow-lg hover:bg-eco-green-dark transition-all duration-300 z-50 ${className}`}
      aria-label="Scroll to top"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <ArrowUp size={20} />
    </motion.button>
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          {showTooltip ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {buttonContent}
                </TooltipTrigger>
                <TooltipContent>
                  <p>Scroll to top</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            buttonContent
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop; 