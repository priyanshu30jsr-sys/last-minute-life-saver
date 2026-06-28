import { motion } from 'framer-motion';
import GeminiBadge from '../GeminiBadge';

const ChatBubble = ({ message, isUser }) => (
  <motion.div
    initial={{ opacity: 0, y: 16, scale: 0.96 }}
    animate={{ opacity: 1, y: 0,  scale: 1 }}
    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    className={`flex flex-col gap-1.5 max-w-[75%] ${isUser ? 'ml-auto items-end' : 'items-start'}`}
  >
    {!isUser && <GeminiBadge />}
    <div
      className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
        ${isUser
          ? 'bg-gblu/30 border border-gblu/30 text-white rounded-tr-none'
          : 'glass border border-white/10 text-white/90 rounded-tl-none'
        }`}
    >
      {message.content}
    </div>
    {message.planGenerated && !isUser && (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-xs text-ggrn flex items-center gap-1.5 font-medium"
      >
        <i className="ti ti-check" />
        Plan generated and saved
      </motion.div>
    )}
  </motion.div>
);

export default ChatBubble;