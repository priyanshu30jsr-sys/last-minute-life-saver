import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import GlassCard from '../components/ui/GlassCard';
import NeonBadge from '../components/ui/NeonBadge';
import GlowBorder from '../components/ui/GlowBorder';
import StreakBarChart3D from '../animations/StreakBarChart3D';
import PriorityPodium from '../animations/PriorityPodium';
import { getUserStats } from '../services/calendarService';
import { usePlans } from '../context/PlanContext';
import { useAuth } from '../context/AuthContext';
import { BADGE_TYPES } from '../utils/constants';

const HabitsStreaks = () => {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const { plans, fetchPlans } = usePlans();
  const { user } = useAuth();

  useEffect(() => {
    fetchPlans();
    getUserStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const TOP_STATS = [
    {
      label: 'Current Streak',
      value:  stats?.streakCount        ?? 0,
      unit:  'days',
      color: '#8B5CF6',
      icon:  'flame'
    },
    {
      label: 'Longest Streak',
      value:  stats?.longestStreak      ?? 0,
      unit:  'days',
      color: '#FBBC04',
      icon:  'trophy'
    },
    {
      label: 'Total Points',
      value:  stats?.totalPoints        ?? 0,
      unit:  'pts',
      color: '#4285F4',
      icon:  'bolt'
    },
    {
      label: 'Steps Completed',
      value:  stats?.totalStepsCompleted ?? 0,
      unit:  'steps',
      color: '#34A853',
      icon:  'checks'
    }
  ];

  const earnedBadge = (badgeName) =>
    stats?.badges?.some(b => b.name === badgeName) ?? false;

  return (
    <Layout>
      <div className="p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white">
            Habits & <span className="gradient-text">Streaks</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Consistency is the engine. Keep it running.
          </p>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {TOP_STATS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ delay: i * 0.08 }}
            >
              <GlowBorder color={s.color} animated={!loading}>
                <GlassCard className="p-5 text-center rounded-2xl" tilt>
                  <div
                    className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
                    style={{ background: `${s.color}18`, color: s.color }}
                  >
                    <i className={`ti ti-${s.icon} text-xl`} />
                  </div>
                  <p className="text-3xl font-black" style={{ color: s.color }}>
                    {loading ? '—' : s.value.toLocaleString()}
                  </p>
                  <p className="text-white/40 text-xs mt-1 font-medium">{s.label}</p>
                </GlassCard>
              </GlowBorder>
            </motion.div>
          ))}
        </div>

        {/* Streak message */}
        {!loading && (stats?.streakCount ?? 0) > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0  }}
            className="mb-8"
          >
            <GlassCard className="p-4 border-gpurp/25 flex items-center gap-4">
              <span className="text-3xl">
                {(stats?.streakCount ?? 0) >= 30 ? '🔥' :
                 (stats?.streakCount ?? 0) >= 7  ? '⚡' : '✨'}
              </span>
              <div>
                <p className="text-white font-bold">
                  {(stats?.streakCount ?? 0) >= 30
                    ? `${stats.streakCount}-day legend. You're unstoppable.`
                    : (stats?.streakCount ?? 0) >= 7
                    ? `${stats.streakCount} days strong. The momentum is real.`
                    : `${stats?.streakCount} day streak — keep it going!`
                  }
                </p>
                <p className="text-white/40 text-xs mt-0.5">
                  Longest ever: {stats?.longestStreak ?? 0} days
                </p>
              </div>
            </GlassCard>
          </motion.div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* 3D Bar chart */}
          <div className="md:col-span-2">
            <GlassCard className="p-6">
              <h2 className="text-lg font-bold text-white mb-1">
                30-Day Activity
              </h2>
              <p className="text-white/35 text-xs mb-6">
                Steps completed per day · taller = more done
              </p>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-gblu/25 border-t-gblu
                    rounded-full animate-spin" />
                </div>
              ) : (
                <StreakBarChart3D data={stats?.streakHistory ?? []} />
              )}
            </GlassCard>
          </div>

          {/* Quick stats */}
          <div className="flex flex-col gap-4">
            {[
              {
                label: 'Plans Completed',
                value: stats?.completedPlans ?? 0,
                color: '#34A853',
                icon:  'circle-check'
              },
              {
                label: 'Active Plans',
                value: stats?.activePlans    ?? 0,
                color: '#4285F4',
                icon:  'bolt'
              },
              {
                label: 'Total Plans',
                value: stats?.totalPlans     ?? 0,
                color: '#8B5CF6',
                icon:  'clipboard-list'
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0  }}
                transition={{ delay: 0.2 + i * 0.08 }}
              >
                <GlassCard className="p-4 flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${item.color}18`, color: item.color }}
                  >
                    <i className={`ti ti-${item.icon} text-lg`} />
                  </div>
                  <div>
                    <p className="text-2xl font-black" style={{ color: item.color }}>
                      {loading ? '—' : item.value}
                    </p>
                    <p className="text-white/40 text-xs">{item.label}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Priority Podium */}
        {plans.length > 0 && (
          <GlassCard className="p-6 mb-8">
            <h2 className="text-lg font-bold text-white mb-1">
              🏆 Priority Podium
            </h2>
            <p className="text-white/35 text-xs mb-6">
              Your top 3 plans ranked by Gemini priority score
            </p>
            <PriorityPodium plans={plans} />
          </GlassCard>
        )}

        {/* Badges */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-lg font-bold text-white">Badges</h2>
            <NeonBadge variant="purple" size="sm">
              {stats?.badges?.length ?? 0} / {Object.keys(BADGE_TYPES).length} earned
            </NeonBadge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Object.values(BADGE_TYPES).map((badge, i) => {
              const earned = earnedBadge(badge.name);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.75 }}
                  animate={{ opacity: 1, scale: 1   }}
                  transition={{
                    delay:     0.05 * i,
                    type:      'spring',
                    stiffness: 280,
                    damping:   20
                  }}
                  whileHover={earned ? {
                    scale:  1.06,
                    rotate: [0, -4, 4, 0],
                    transition: { duration: 0.4 }
                  } : {}}
                >
                  {earned ? (
                    <GlowBorder color="purple">
                      <GlassCard className="p-4 text-center rounded-2xl border-gpurp/30">
                        <div className="text-3xl mb-2">{badge.icon}</div>
                        <p className="text-white text-xs font-bold leading-tight mb-1">
                          {badge.name}
                        </p>
                        <NeonBadge variant="purple" size="xs">Earned ✓</NeonBadge>
                      </GlassCard>
                    </GlowBorder>
                  ) : (
                    <GlassCard className="p-4 text-center opacity-35 grayscale">
                      <div className="text-3xl mb-2">{badge.icon}</div>
                      <p className="text-white/60 text-xs font-bold leading-tight mb-1">
                        {badge.name}
                      </p>
                      <span className="text-white/25 text-[10px]">Locked</span>
                    </GlassCard>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HabitsStreaks;