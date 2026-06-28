import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-gblu hover:bg-blue-500 text-white shadow-glow',
  ghost:   'glass border border-white/10 hover:border-gblu/50 text-white',
  danger:  'bg-gred hover:bg-red-400 text-white shadow-glow-red',
  success: 'bg-ggrn hover:bg-green-400 text-white shadow-glow-green',
  gradient:'bg-gradient-to-r from-gblu via-gpurp to-gred text-white'
};

const Button = ({
  children,
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  disabled = false,
  className = '',
  onClick,
  type     = 'button',
  icon
}) => {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base'
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.03, y: disabled ? 0 : -2 }}
      whileTap={{ scale: 0.97 }}
      className={[
        'rounded-xl font-semibold transition-all duration-200 flex items-center gap-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      ].filter(Boolean).join(' ')}
    >
      {loading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
        />
      ) : icon && (
        <i className={`ti ti-${icon}`} />
      )}
      {children}
    </motion.button>
  );
};

export default Button;