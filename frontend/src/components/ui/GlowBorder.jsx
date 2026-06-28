import { motion } from 'framer-motion';

const GLOW_COLORS = {
  blue:   '#4285F4',
  purple: '#8B5CF6',
  green:  '#34A853',
  red:    '#EA4335',
  yellow: '#FBBC04'
};

const GlowBorder = ({
  children,
  color     = 'blue',
  animated  = true,
  rounded   = '2xl',
  className = ''
}) => {
  const hex = GLOW_COLORS[color] || color;

  return (
    <div className={`relative rounded-${rounded} ${className}`}>
      {/* Animated outer glow */}
      <motion.div
        className={`absolute inset-0 rounded-${rounded} pointer-events-none`}
        animate={animated ? {
          boxShadow: [
            `0 0 6px  ${hex}22`,
            `0 0 20px ${hex}55`,
            `0 0 6px  ${hex}22`
          ]
        } : {
          boxShadow: `0 0 12px ${hex}33`
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Gradient border mask */}
      <div
        className={`absolute inset-0 rounded-${rounded} pointer-events-none`}
        style={{
          padding: 1,
          background: `linear-gradient(135deg, ${hex}88, transparent 60%, ${hex}44)`,
          WebkitMask:
            'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude'
        }}
      />

      {children}
    </div>
  );
};

export default GlowBorder;