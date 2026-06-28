import { motion } from 'framer-motion';

const GeminiBadge = ({ size = 'sm', className = '' }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className={`inline-flex items-center gap-1.5 glass border border-white/10 rounded-full
      ${size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'} ${className}`}
  >
    {/* Google 4-dot icon */}
    <span className="grid grid-cols-2 gap-[2px] w-3 h-3">
      <span className="w-1 h-1 rounded-full bg-gblu" />
      <span className="w-1 h-1 rounded-full bg-gred" />
      <span className="w-1 h-1 rounded-full bg-gyel" />
      <span className="w-1 h-1 rounded-full bg-ggrn" />
    </span>
    <span className="text-white/70 font-medium">Powered by Gemini · Google AI Studio</span>
  </motion.div>
);

export default GeminiBadge;