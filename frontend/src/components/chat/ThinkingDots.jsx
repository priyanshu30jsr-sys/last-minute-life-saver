import { motion } from 'framer-motion';
import GeminiBadge from '../GeminiBadge';

const COLORS = ['#4285F4', '#FBBC04', '#34A853'];

const ThinkingDots = () => (
  <div className="flex flex-col gap-2">
    <GeminiBadge />
    <div className="flex items-center gap-2 glass rounded-2xl rounded-tl-none px-5 py-4 w-fit">
      {COLORS.map((color, i) => (
        <motion.div
          key={i}
          style={{ background: color }}
          className="w-2.5 h-2.5 rounded-full"
          animate={{ scale: [0.6, 1, 0.6], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
      <span className="text-white/50 text-sm ml-1 font-mono">Gemini is thinking...</span>
    </div>
  </div>
);

export default ThinkingDots;