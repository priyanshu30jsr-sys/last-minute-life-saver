import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDeadline, formatDuration } from '../../utils/helpers';

const StepCard = ({ step, index, onComplete, onSkip, loading }) => {
  const [pressed, setPressed] = useState(false);

  const handleComplete = () => {
    setPressed(true);
    setTimeout(() => setPressed(false), 400);
    onComplete(index);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`glass border rounded-xl p-4 transition-all duration-300
        ${step.completed ? 'border-ggrn/30 bg-ggrn/5' : 'border-white/10'}
        ${step.skipped  ? 'border-gred/20 opacity-60' : ''}
      `}
    >
      <div className="flex items-start gap-4">
        {/* Step number / check button */}
        <motion.button
          onClick={!step.completed && !step.skipped ? handleComplete : undefined}
          animate={pressed ? { scale: [1, 0.85, 1.1, 1] } : {}}
          transition={{ duration: 0.4 }}
          disabled={step.completed || step.skipped || loading}
          className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center
            flex-shrink-0 transition-all duration-300 font-bold text-sm
            ${step.completed
              ? 'border-ggrn bg-ggrn text-white'
              : 'border-white/20 text-white/40 hover:border-ggrn/60 hover:text-ggrn'
            }`}
        >
          <AnimatePresence mode="wait">
            {step.completed ? (
              <motion.svg
                key="check"
                viewBox="0 0 24 24"
                width={16}
                height={16}
                fill="none"
                stroke="white"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <motion.polyline
                  points="20,6 9,17 4,12"
                  className="draw-check"
                />
              </motion.svg>
            ) : (
              <span key="num">{index + 1}</span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-sm mb-0.5
            ${step.completed ? 'line-through text-white/40' : 'text-white'}`}>
            {step.title}
          </h4>
          <p className="text-white/50 text-xs mb-2 leading-relaxed">{step.description}</p>
          <div className="flex items-center gap-3 text-xs text-white/30">
            <span className="flex items-center gap-1">
              <i className="ti ti-clock" />
              {formatDuration(step.durationMinutes)}
            </span>
            {step.deadline && (
              <span className="flex items-center gap-1">
                <i className="ti ti-calendar" />
                {formatDeadline(step.deadline)}
              </span>
            )}
          </div>
        </div>

        {/* Skip button */}
        {!step.completed && !step.skipped && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSkip(index)}
            disabled={loading}
            className="text-white/20 hover:text-gred text-xs flex items-center gap-1
              transition-colors px-2 py-1 rounded-lg hover:bg-gred/10"
          >
            <i className="ti ti-x" />
            Skip
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default StepCard;