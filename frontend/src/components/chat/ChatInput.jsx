import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const ChatInput = ({ onSend, loading, placeholder }) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  const handleSend = () => {
    if (!value.trim() || loading) return;
    onSend(value.trim());
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  };

  return (
    <div className="glass border border-white/10 rounded-2xl p-3 flex items-end gap-3
      neon-pulse focus-within:border-gblu/50 transition-all">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Describe your goal and deadline..."}
        rows={1}
        className="flex-1 bg-transparent text-white placeholder-white/30 resize-none
          outline-none text-sm leading-relaxed font-sans min-h-[40px] max-h-[160px] py-2 px-1"
        style={{ fontFamily: 'var(--font-sans)' }}
      />
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={handleSend}
        disabled={!value.trim() || loading}
        className="w-10 h-10 rounded-xl bg-gblu disabled:opacity-40 disabled:cursor-not-allowed
          flex items-center justify-center text-white flex-shrink-0 shadow-glow
          transition-all hover:bg-blue-400"
      >
        {loading
          ? <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            />
          : <i className="ti ti-send text-sm" />
        }
      </motion.button>
    </div>
  );
};

export default ChatInput;