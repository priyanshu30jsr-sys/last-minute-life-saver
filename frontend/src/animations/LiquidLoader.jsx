import { motion } from 'framer-motion';

const LiquidLoader = ({ size = 72, progress = 0.5, color = '#4285F4' }) => {
  const waveY = 100 - (progress * 100);

  return (
    <div
      style={{ width: size, height: size }}
      className="relative rounded-full overflow-hidden"
    >
      {/* Background circle */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
        <circle cx="50" cy="50" r="48" fill="rgba(255,255,255,0.05)" stroke={color} strokeWidth="2" />
      </svg>

      {/* Liquid wave */}
      <motion.div
        className="absolute left-0 right-0 bottom-0 overflow-hidden"
        style={{ borderRadius: '0 0 50px 50px' }}
        initial={{ height: '0%' }}
        animate={{ height: `${progress * 100}%` }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      >
        <svg
          viewBox="0 0 200 50"
          preserveAspectRatio="none"
          className="absolute top-0 left-0 w-full"
          style={{ height: 20 }}
        >
          <motion.path
            fill={color}
            fillOpacity="0.6"
            animate={{
              d: [
                'M0,25 C30,10 70,40 100,25 C130,10 170,40 200,25 L200,50 L0,50 Z',
                'M0,25 C40,40 60,10 100,25 C140,40 160,10 200,25 L200,50 L0,50 Z',
                'M0,25 C30,10 70,40 100,25 C130,10 170,40 200,25 L200,50 L0,50 Z'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>
        <div className="w-full h-full" style={{ background: color, opacity: 0.3, marginTop: 15 }} />
      </motion.div>

      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ color }}
        >
          <i className="ti ti-brain text-xl" />
        </motion.div>
      </div>
    </div>
  );
};

export default LiquidLoader;