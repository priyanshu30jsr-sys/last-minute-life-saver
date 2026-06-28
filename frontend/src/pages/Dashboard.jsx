import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import PlanCard from '../components/plans/PlanCard';
import { useAuth } from '../context/AuthContext';
import { usePlans } from '../context/PlanContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { plans, fetchPlans, loading } = usePlans();

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const summary = useMemo(() => {
    const activePlans = plans.filter(plan => plan.status !== 'completed');
    const atRiskPlans = plans.filter(plan => plan.status === 'at-risk');
    const completedSteps = plans.reduce((sum, plan) => sum + (plan.steps?.filter(step => step.completed).length || 0), 0);
    const totalSteps = plans.reduce((sum, plan) => sum + (plan.steps?.length || 0), 0);

    return {
      activeCount: activePlans.length,
      atRiskCount: atRiskPlans.length,
      completedSteps,
      totalSteps,
      progressPercent: totalSteps ? Math.round((completedSteps / totalSteps) * 100) : 0
    };
  }, [plans]);

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto select-none">
        {/* ========================================================================= */}
        {/* HEADER SECTION                                                            */}
        {/* ========================================================================= */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8 border-b border-white/5 pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#00B4D8] bg-[#00B4D8]/10 px-2.5 py-1 rounded-md">
              Mission control
            </span>
            <h1 className="text-3xl font-black text-white mt-3 tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-white via-slate-200 to-[#00B4D8] bg-clip-text text-transparent">{user?.name?.split(' ')[0] || 'Chief'}</span>
            </h1>
            <p className="text-white/40 text-sm mt-1">
              {summary.activeCount} live plans are tracking your deadlines.
            </p>
          </div>
          <Link to="/chat">
            <Button variant="gradient" icon="sparkles">
              Create new plan
            </Button>
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* METRICS ROW CARDS (Upgraded with high-contrast indicator tracks)         */}
        {/* ========================================================================= */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <GlassCard className="p-5 relative overflow-hidden border-l-4 border-l-[#00B4D8]">
            <p className="text-white/40 text-xs uppercase tracking-[0.2em] font-semibold">Active plans</p>
            <p className="text-3xl font-black text-white mt-2 tracking-tight">{summary.activeCount}</p>
          </GlassCard>

          <GlassCard className="p-5 relative overflow-hidden border-l-4 border-l-[#EF4444]">
            <p className="text-white/40 text-xs uppercase tracking-[0.2em] font-semibold">Needs attention</p>
            <p className="text-3xl font-black text-[#EF4444] mt-2 tracking-tight">{summary.atRiskCount}</p>
          </GlassCard>

          <GlassCard className="p-5 relative overflow-hidden border-l-4 border-l-[#06D6A0]">
            <p className="text-white/40 text-xs uppercase tracking-[0.2em] font-semibold">Progress</p>
            <p className="text-3xl font-black text-[#06D6A0] mt-2 tracking-tight">{summary.progressPercent}%</p>
          </GlassCard>
        </div>

        {/* ========================================================================= */}
        {/* MAIN CONTROLS GRID AREA                                                   */}
        {/* ========================================================================= */}
        <div className="grid lg:grid-cols-[1.35fr_0.65fr] gap-6">
          
          {/* Main Plans Display Board */}
          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-lg font-bold text-white tracking-tight">Your plans</h2>
              <Link to="/calendar" className="text-sm text-[#00B4D8] hover:text-blue-300 transition-colors underline underline-offset-4">
                Open calendar
              </Link>
            </div>

            {loading ? (
              <div className="flex flex-col gap-3">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="glass rounded-2xl h-24 animate-pulse" />
                ))}
              </div>
            ) : plans.length === 0 ? (
              <GlassCard className="p-8 text-center border border-dashed border-white/10">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-[#00B4D8] mx-auto mb-4 border border-white/5">
                  <i className="ti ti-clipboard-list text-2xl" />
                </div>
                <p className="text-white font-semibold mb-2">No plans yet</p>
                <p className="text-white/40 text-sm max-w-sm mx-auto mb-5 leading-relaxed">
                  Start a new mission from chat and Gemini will generate the roadmap for you.
                </p>
                <Link to="/chat">
                  <Button variant="ghost" icon="sparkles">Start planning</Button>
                </Link>
              </GlassCard>
            ) : (
              <div className="flex flex-col gap-4">
                {plans.map((plan, index) => (
                  <PlanCard key={plan._id || index} plan={plan} index={index} />
                ))}
              </div>
            )}
          </section>

          {/* Sidebar Auxiliary Links Board */}
          <aside className="flex flex-col gap-4">
            {/* Next Best Move Widget */}
            <GlassCard className="p-5 border border-white/5">
              <h3 className="text-white font-bold mb-2 text-sm tracking-tight">Next best move</h3>
              <p className="text-white/50 text-xs leading-relaxed">
                Open chat whenever you want a fresh plan or a replan after a missed step.
              </p>
              <Link to="/chat" className="inline-flex items-center gap-2 mt-5 text-xs text-[#00B4D8] bg-[#00B4D8]/10 hover:bg-[#00B4D8]/20 px-3 py-2 rounded-xl border border-[#00B4D8]/20 font-bold transition-colors w-full justify-center">
                <i className="ti ti-message-circle text-sm" /> Continue in chat
              </Link>
            </GlassCard>

            {/* Premium Colored Quick Links Widget */}
            <GlassCard className="p-5 border border-white/5">
              <h3 className="text-white/40 font-bold mb-3 text-xs uppercase tracking-[0.15em]">Quick links</h3>
              <div className="flex flex-col gap-1 text-sm">
                <Link to="/calendar" className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors group">
                  <i className="ti ti-calendar text-[#00B4D8]" />
                  <span>Calendar overview</span>
                </Link>
                <Link to="/habits" className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors group">
                  <i className="ti ti-flame text-[#8B5CF6]" />
                  <span>Habits & streaks</span>
                </Link>
                <Link to="/settings" className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors group">
                  <i className="ti ti-settings text-[#06D6A0]" />
                  <span>Settings</span>
                </Link>
              </div>
            </GlassCard>
          </aside>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;