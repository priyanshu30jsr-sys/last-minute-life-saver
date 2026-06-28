import { motion } from 'framer-motion';

export const CardFlipReveal = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ rotateY: 90, opacity: 0 }}
    animate={{ rotateY: 0,  opacity: 1 }}
    transition={{
      duration: 0.5,
      delay,
      ease: [0.4, 0, 0.2, 1]
    }}
    style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerFlipContainer = ({ children, staggerDelay = 0.08 }) => (
  <motion.div
    variants={{
      hidden: {},
      show:   { transition: { staggerChildren: staggerDelay } }
    }}
    initial="hidden"
    animate="show"
  >
    {children}
  </motion.div>
);