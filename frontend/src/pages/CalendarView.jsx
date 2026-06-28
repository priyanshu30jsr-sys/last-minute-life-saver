import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import GlassCard from '../components/ui/GlassCard';
import NeonBadge from '../components/ui/NeonBadge';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { usePlans } from '../context/PlanContext';
import { getCalendarStatus, getCalendarAuthUrl } from '../services/calendarService';
import { getStatusColor } from '../utils/helpers';

const CalendarView = () => {
  const [calLinked, setCalLinked] = useState(false);
  const [loading,   setLoading]   = useState(true);
  const { plans, fetchPlans }     = usePlans();
  const { show } = useToast();

  useEffect(() => {
    const init = async () => {
      try {
        const status = await getCalendarStatus();
        setCalLinked(status.connected);
        await fetchPlans();
      } catch {/* silent */}
      finally { setLoading(false); }
    };
    init();

    const params = new URLSearchParams(window.location.search);
    if (params.get('calendar') === 'connected') {
      setCalLinked(true);
      show('Google Calendar connected! 🎉', 'success');
      window.history.replaceState({}, '', '/calendar');
    }
  }, []);

  // Flatten all incomplete steps and sort by deadline
  const allSteps = plans
    .filter(p => p.status !== 'completed')
    .flatMap(p =>
      p.steps
        .filter(s => !s.completed && s.deadline)
        .map(s => ({
          ...s,
          planTitle:  p.title,
          planId:     p._id,
          planStatus: p.status
        }))
    )
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  const now      = new Date();
  const todayStr = now.toDateString();
  const weekEnd  = new Date(now.getTime() + 7 * 86400_000);

  const overdue    = allSteps.filter(s => new Date(s.deadline) < now);
  const dueToday   = allSteps.filter(s => new Date(s.deadline).toDateString() === todayStr && new Date(s.deadline) >= now);
  const thisWeek   = allSteps.filter(s => new Date(s.deadline) > now && new Date(s.deadline) <= weekEnd && new Date(s.deadline).toDateString() !== todayStr);
  const later      = allSteps.filter(s => new Date(s.deadline) > weekEnd);

  const handleConnect = async () => {
    try {
      const url = await getCalendarAuthUrl();
      window.location.href = url;
    } catch {
      show('Failed to initiate Google Calendar connection.', 'error');
    }
  };

  const StepRow = ({ step, idx }) => {
    const color   = getStatusColor(step.planStatus);
    const d       = new Date(step.deadline);
    const isPast  = d < now;
    const isToday = d.toDateString() === todayStr;

    return (
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0  }}
        transition={{ delay: idx * 0.04 }}
      >
        <GlassCard className={`p-4 border
          ${isPast  ? 'border-gred/25'  :
            isToday ? 'border-gyel/30'  :
            'border-white/8'}`}
        >
          <div className="flex items-center gap-4">
            {/* Date block */}
            <div
              className="w-12 h-12 rounded-xl flex flex-col items-center
                justify-center flex-shrink-0"
              style={{ background: `${color}18` }}
            >
              <span className="text-[10px] font-bold uppercase" style={{ color }}>
                {d.toLocaleDateString('en', { month: 'short' })}
              </span>
              <span className="text-xl font-black leading-none" style={{ color }}>
                {d.getDate()}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{step.title}</p>
              <p className="text-white/40 text-xs mt-0.5 truncate">
                {step.planTitle}
              </p>
            </div>

            {/* Right */}
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-white/50 text-xs">
                {d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
              </span>
              {step.calendarEventId && (
                <NeonBadge variant="green" icon="calendar-check" size="xs">Synced</NeonBadge>
              )}
              {isPast && (
                <NeonBadge variant="red" size="xs">Overdue</NeonBadge>
              )}
              {isToday && !isPast && (
                <NeonBadge variant="yellow" size="xs">Today</NeonBadge>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    );
  };

  const Section = ({ label, steps, emptyMsg, color = 'blue' }) => {
    if (steps.length === 0) return null;
    return (
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <NeonBadge variant={color} size="sm">{label}</NeonBadge>
          <span className="text-white/30 text-xs">{steps.length} step{steps.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex flex-col gap-3">
          {steps.map((s, i) => <StepRow key={`${s._id}-${i}`} step={s} idx={i} />)}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">Calendar</h1>
            <p className="text-white/40 text-sm mt-1">
              AI-scheduled tasks across all your plans
            </p>
          </div>
          {calLinked ? (
            <NeonBadge variant="green" icon="circle-check" size="md" pulse>
              Google Calendar Connected
            </NeonBadge>
          ) : (
            <Button icon="brand-google" variant="success" onClick={handleConnect}>
              Connect Google Calendar
            </Button>
          )}
        </div>

        {/* Connect CTA card — shown when not linked */}
        {!calLinked && !loading && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="mb-8">
            <GlassCard className="p-6 border-gblu/30">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gblu/15 flex items-center
                  justify-center text-gblu text-2xl flex-shrink-0">
                  <i className="ti ti-calendar-event" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg mb-1">
                    Sync with Google Calendar
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    Connect once and LifeSaver AI will automatically
                    create calendar events for every plan step — with
                    30-minute and 10-minute reminders built in.
                  </p>
                </div>
                <Button icon="brand-google" onClick={handleConnect} className="flex-shrink-0">
                  Connect
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main timeline */}
          <div className="md:col-span-2">
            {loading ? (
              <div className="flex flex-col gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass rounded-xl h-20 animate-pulse" />
                ))}
              </div>
            ) : allSteps.length === 0 ? (
              <GlassCard className="p-12 text-center">
                <i className="ti ti-calendar-check text-5xl text-white/15 block mb-4" />
                <p className="text-white/40 font-semibold mb-1">All clear!</p>
                <p className="text-white/25 text-sm">No upcoming steps right now.</p>
              </GlassCard>
            ) : (
              <>
                <Section label="Overdue"   steps={overdue}  color="red"    />
                <Section label="Today"     steps={dueToday} color="yellow" />
                <Section label="This Week" steps={thisWeek} color="blue"   />
                <Section label="Later"     steps={later}    color="purple" />
              </>
            )}
          </div>

          {/* Stats panel */}
          <div className="flex flex-col gap-4">
            {[
              { label: 'Synced Events',   color: '#34A853', icon: 'calendar-check',
                value: plans.flatMap(p => p.steps).filter(s => s.calendarEventId).length },
              { label: 'Due Today',       color: '#FBBC04', icon: 'clock',
                value: dueToday.length },
              { label: 'Overdue',         color: '#EA4335', icon: 'alert-triangle',
                value: overdue.length },
              { label: 'This Week',       color: '#4285F4', icon: 'calendar-week',
                value: thisWeek.length }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0  }}
                transition={{ delay: 0.1 + i * 0.07 }}
              >
                <GlassCard className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${stat.color}18`, color: stat.color }}>
                    <i className={`ti ti-${stat.icon} text-lg`} />
                  </div>
                  <div>
                    <p className="text-2xl font-black" style={{ color: stat.color }}>
                      {loading ? '—' : stat.value}
                    </p>
                    <p className="text-white/40 text-xs">{stat.label}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}

            {calLinked && (
              <GlassCard className="p-4 border-ggrn/20 mt-1">
                <p className="text-ggrn text-sm font-bold flex items-center gap-2 mb-2">
                  <i className="ti ti-circle-check" /> Auto-sync active
                </p>
                <p className="text-white/35 text-xs leading-relaxed">
                  Every new plan step is automatically added to Google
                  Calendar with two reminders.
                </p>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CalendarView;