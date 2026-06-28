import { motion } from 'framer-motion';

const PRESETS = {
  blue:   { bg: 'rgba(66,133,244,0.12)',  border: 'rgba(66,133,244,0.45)',  text: '#4285F4'  },
  red:    { bg: 'rgba(234,67,53,0.12)',   border: 'rgba(234,67,53,0.45)',   text: '#EA4335'  },
  yellow: { bg: 'rgba(251,188,4,0.12)',   border: 'rgba(251,188,4,0.45)',   text: '#FBBC04'  },
  green:  { bg: 'rgba(52,168,83,0.12)',   border: 'rgba(52,168,83,0.45)',   text: '#34A853'  },
  purple: { bg: 'rgba(139,92,246,0.12)',  border: 'rgba(139,92,246,0.45)',  text: '#8B5CF6'  }
};

const SIZES = {
  xs: 'px-2   py-0.5  text-[10px] gap-1',
  sm: 'px-2.5 py-1    text-xs     gap-1.5',
  md: 'px-3.5 py-1.5  text-sm     gap-2'
};

const NeonBadge = ({
  children,
  variant   = 'blue',
  icon,
  size      = 'sm',
  pulse     = false,
  className = ''
}) => {
  const v = PRESETS[variant] || PRESETS.blue;
  const s = SIZES[size]      || SIZES.sm;

  return (
    <motion.span
      animate={pulse ? {
        boxShadow: [
          `0 0 4px  ${v.border}`,
          `0 0 18px ${v.border}`,
          `0 0 4px  ${v.border}`
        ]
      } : {}}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      className={`inline-flex items-center rounded-full font-semibold
        border ${s} ${className}`}
      style={{
        background:  v.bg,
        borderColor: v.border,
        color:       v.text
      }}
    >
      {icon && <i className={`ti ti-${icon}`} />}
      {children}
    </motion.span>
  );
};

export default NeonBadge;