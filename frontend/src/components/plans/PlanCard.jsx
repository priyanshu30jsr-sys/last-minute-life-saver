import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../ui/GlassCard';
import ProgressRing from './ProgressRing';
import { getPlanProgress, getDaysLeft, getStatusColor, truncate } from '../../utils/helpers';
import { STATUS_LABELS } from '../../utils/constants';

const PlanCard = ({ plan, index = 0 }) => {
  const navigate  = useNavigate();
  const progress  = getPlanProgress(plan.steps);
  const color     = getStatusColor(plan.status);
  const daysLeft  = getDaysLeft(plan.deadline);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
    >
      <GlassCard
        tilt
        glow
        glowColor="blue"
        onClick={() => navigate(`/plans/${plan._id}`)}
        className="p-5 cursor-pointer group"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="font-bold text-white text-base leading-snug mb-1">
              {truncate(plan.title, 50)}
            </h3>
            <p className="text-white/50 text-xs">{truncate(plan.goal, 70)}</p>
          </div>
          <ProgressRing progress={progress} size={56} strokeWidth={5} color={color} />
        </div>

        {/* Status + deadline */}
        <div className="flex items-center justify-between mb-4">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: `${color}22`, color }}
          >
            {STATUS_LABELS[plan.status] || plan.status}
          </span>
          <div className="flex items-center gap-1.5 text-white/50 text-xs">
            <i className="ti ti-clock" />
            {daysLeft}
          </div>
        </div>

        {/* Steps mini-bar */}
        <div>
          <div className="flex justify-between text-xs text-white/40 mb-1.5">
            <span>{plan.steps?.filter(s => s.completed).length}/{plan.steps?.length} steps</span>
            <span>Priority {plan.priorityScore}/10</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: color }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Calendar synced badge */}
        {plan.calendarSynced && (
          <div className="flex items-center gap-1 mt-3 text-ggrn text-xs font-medium">
            <i className="ti ti-calendar-check" />
            Synced to Google Calendar
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
};

export default PlanCard;