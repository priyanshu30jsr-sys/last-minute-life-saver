import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/layout/Layout';
import StepCard from '../components/plans/StepCard';
import ProgressRing from '../components/plans/ProgressRing';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import GeminiBadge from '../components/GeminiBadge';
import LiquidLoader from '../animations/LiquidLoader';
import { CardFlipReveal, StaggerFlipContainer } from '../animations/CardFlipReveal';
import { useToast } from '../components/ui/Toast';
import { useSocket } from '../context/SocketContext';
import { usePlans } from '../context/PlanContext';
import * as planService from '../services/planService';
import { syncPlanToCalendar } from '../services/calendarService';
import { getPlanProgress, getDaysLeft, getStatusColor } from '../utils/helpers';

const PlanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { show } = useToast();
  const { socket } = useSocket();
  const { updatePlan } = usePlans();

  const [plan,      setPlan]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [stepLoad,  setStepLoad]  = useState(false);
  const [replanning,setReplanning]= useState(false);
  const [syncingCal,setSyncingCal]= useState(false);

  useEffect(() => {
    planService.getPlanById(id)
      .then(setPlan)
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [id]);

  // Socket: listen for replan event
  useEffect(() => {
    if (!socket) return;
    socket.on('plan:replanned', (data) => {
      if (data.planId === id) {
        setReplanning(false);
        planService.getPlanById(id).then(updated => {
          setPlan(updated);
          updatePlan(updated);
          show('🔄 LifeSaver AI rebuilt your plan!', 'info');
        });
      }
    });
    return () => { socket.off('plan:replanned'); };
  }, [socket, id]);

  const handleComplete = async (stepIndex) => {
    setStepLoad(true);
    try {
      const result = await planService.completeStep(id, stepIndex, { completed: true });
      setPlan(result.plan);
      updatePlan(result.plan);
      show('Step complete! +10 points ⚡', 'success');
    } catch {
      show('Failed to update step', 'error');
    } finally {
      setStepLoad(false);
    }
  };

  const handleSkip = async (stepIndex) => {
    setStepLoad(true);
    setReplanning(true);
    try {
      await planService.completeStep(id, stepIndex, { skipped: true });
      show('🤖 Gemini is rebuilding your plan autonomously...', 'info', 5000);
    } catch {
      show('Failed to skip step', 'error');
      setReplanning(false);
    } finally {
      setStepLoad(false);
    }
  };

  const handleCalendarSync = async () => {
    setSyncingCal(true);
    try {
      await syncPlanToCalendar(id);
      setPlan(prev => ({ ...prev, calendarSynced: true }));
      show('Synced to Google Calendar ✅', 'success');
    } catch (err) {
      show(err.response?.data?.message || 'Sync failed. Connect Google Calendar first.', 'error');
    } finally {
      setSyncingCal(false);
    }
  };

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-screen">
        <LiquidLoader size={80} progress={0.6} />
      </div>
    </Layout>
  );

  if (!plan) return null;

  const progress  = getPlanProgress(plan.steps);
  const color     = getStatusColor(plan.status);
  const daysLeft  = getDaysLeft(plan.deadline);

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-white/40 hover:text-white
            text-sm mb-6 transition-colors"
        >
          <i className="ti ti-arrow-left" />
          Back to Plans
        </button>

        {/* Header card */}
        <GlassCard className="p-6 mb-6 gradient-border">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <GeminiBadge />
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full capitalize"
                  style={{ background: `${color}22`, color }}
                >
                  {plan.status}
                </span>
                <span className="text-white/30 text-xs flex items-center gap-1">
                  <i className="ti ti-clock" /> {daysLeft}
                </span>
              </div>
              <h1 className="text-2xl font-black text-white mb-2">{plan.title}</h1>
              <p className="text-white/60 text-sm leading-relaxed">{plan.goal}</p>
            </div>
            <ProgressRing progress={progress} size={90} strokeWidth={7} color={color} />
          </div>

          {/* Motivational note */}
          {plan.motivationalNote && (
            <div className="border-t border-white/10 pt-4 mt-4">
              <p className="text-white/60 text-sm italic">
                <i className="ti ti-quote mr-2 text-gpurp" />
                {plan.motivationalNote}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-4 flex-wrap">
            {!plan.calendarSynced && (
              <Button
                size="sm"
                variant="ghost"
                icon="calendar-event"
                loading={syncingCal}
                onClick={handleCalendarSync}
              >
                Sync to Calendar
              </Button>
            )}
            {plan.calendarSynced && (
              <span className="flex items-center gap-1.5 text-ggrn text-sm font-semibold">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34A853"
                  strokeWidth="2.5" strokeLinecap="round">
                  <motion.polyline
                    points="20,6 9,17 4,12"
                    className="draw-check"
                    style={{ strokeDasharray: 30, strokeDashoffset: 30 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </svg>
                Synced to Google Calendar
              </span>
            )}
          </div>
        </GlassCard>

        {/* Replanning indicator */}
        <AnimatePresence>
          {replanning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass border border-gpurp/40 rounded-2xl p-4 mb-6
                flex items-center gap-4"
            >
              <LiquidLoader size={48} progress={0.5} color="#8B5CF6" />
              <div>
                <p className="text-white font-bold text-sm">
                  🤖 Gemini is rebuilding your recovery plan...
                </p>
                <p className="text-white/50 text-xs mt-0.5">
                  Your new plan will appear automatically. No action needed.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Steps */}
        <div>
          <h2 className="text-lg font-black text-white mb-4">
            Action Steps
            <span className="text-white/30 text-sm font-normal ml-2">
              {plan.steps.filter(s => s.completed).length}/{plan.steps.length} complete
            </span>
          </h2>

          <StaggerFlipContainer staggerDelay={0.06}>
            <div className="flex flex-col gap-3">
              {plan.steps.map((step, i) => (
                <CardFlipReveal key={step._id || i} delay={i * 0.05}>
                  <StepCard
                    step={step}
                    index={i}
                    onComplete={handleComplete}
                    onSkip={handleSkip}
                    loading={stepLoad}
                  />
                </CardFlipReveal>
              ))}
            </div>
          </StaggerFlipContainer>
        </div>
      </div>
    </Layout>
  );
};

export default PlanDetail;