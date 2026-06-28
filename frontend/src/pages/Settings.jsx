import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/layout/Layout';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { getCalendarAuthUrl, getCalendarStatus } from '../services/calendarService';
import { getMe } from '../services/authService';
import api from '../services/api';

const SECTIONS = ['Profile', 'Calendar', 'Preferences', 'Account'];

const Settings = () => {
  const { user, updateUser, login } = useAuth();
  const { show } = useToast();

  const [activeSection,    setActiveSection]    = useState('Profile');
  const [calendarLinked,   setCalendarLinked]   = useState(false);
  const [profileForm,      setProfileForm]      = useState({
    name:              user?.name || '',
    productivityStyle: user?.productivityStyle || 'flexible',
    timezone:          user?.timezone || 'Asia/Kolkata'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const s = await getCalendarStatus();
        setCalendarLinked(s.connected);
      } catch {}

      // Check URL params for calendar connection success and optional JWT
      const params = new URLSearchParams(window.location.search);
      if (params.get('calendar') === 'connected') {
        setCalendarLinked(true);
        show('Google Calendar connected! 🎉', 'success');
      }

      const token = params.get('token');
      if (token) {
        try {
          // Persist token then fetch current user
          localStorage.setItem('lifesaver_token', token);
          const me = await getMe();
          login({ token, user: me });
          show('Signed in via Google!', 'success');
        } catch (err) {
          console.error('Auto-login after OAuth failed', err);
        }
      }
    })();
  }, []);

  const handleCalendarConnect = async () => {
    try {
      const url = await getCalendarAuthUrl();
      window.location.href = url;
    } catch {
      show('Failed to get Calendar auth URL', 'error');
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch('/users/profile', profileForm);
      updateUser(data);
      show('Profile updated!', 'success');
    } catch {
      show('Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'Profile':
        return (
          <div className="flex flex-col gap-5">
            <h2 className="text-lg font-bold text-white">Profile</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-white/60 text-sm mb-1.5 block">Full Name</label>
                <input
                  value={profileForm.name}
                  onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                  className="glass border border-white/10 rounded-xl px-4 py-3 text-white
                    placeholder-white/25 outline-none text-sm focus:border-gblu/50
                    transition-colors w-full"
                />
              </div>
              <div>
                <label className="text-white/60 text-sm mb-1.5 block">Email</label>
                <input
                  value={user?.email || ''}
                  disabled
                  className="glass border border-white/5 rounded-xl px-4 py-3
                    text-white/30 text-sm w-full cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-white/60 text-sm mb-1.5 block">Productivity Style</label>
                <select
                  value={profileForm.productivityStyle}
                  onChange={e => setProfileForm(p => ({ ...p, productivityStyle: e.target.value }))}
                  className="glass border border-white/10 rounded-xl px-4 py-3 text-white
                    text-sm outline-none focus:border-gblu/50 w-full bg-transparent"
                >
                  <option value="morning"  className="bg-navy">Morning person</option>
                  <option value="night"    className="bg-navy">Night owl</option>
                  <option value="flexible" className="bg-navy">Flexible</option>
                </select>
              </div>
            </div>
            <Button loading={saving} onClick={handleSaveProfile} icon="check">
              Save Changes
            </Button>
          </div>
        );

      case 'Calendar':
        return (
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-bold text-white">Google Calendar</h2>
            <GlassCard className="p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-ggrn/20 flex items-center
                  justify-center text-ggrn text-xl">
                  <i className="ti ti-calendar-event" />
                </div>
                <div>
                  <p className="text-white font-bold">Google Calendar Integration</p>
                  <p className="text-white/50 text-sm">
                    Auto-sync all plan steps to your Calendar
                  </p>
                </div>
              </div>
              {calendarLinked ? (
                <div className="flex items-center gap-2 text-ggrn font-semibold text-sm">
                  <i className="ti ti-circle-check" />
                  Connected — steps sync automatically
                </div>
              ) : (
                <Button icon="brand-google" onClick={handleCalendarConnect} variant="success">
                  Connect Google Calendar
                </Button>
              )}
            </GlassCard>
            <p className="text-white/30 text-xs">
              We use OAuth 2.0. Your tokens are encrypted and stored securely.
              We only access your calendar to create plan events.
            </p>
          </div>
        );

      case 'Preferences':
        return (
          <div className="flex flex-col gap-5">
            <h2 className="text-lg font-bold text-white">Preferences</h2>
            {[
              { label: 'Morning AI Brief (7 AM)',   desc: 'Daily AI-generated priority brief', key: 'brief',    default: true },
              { label: 'Auto Replan on Miss',        desc: 'Gemini rebuilds plan when you skip', key: 'replan', default: true },
              { label: 'Calendar Auto-Sync',         desc: 'Sync new plans without asking',    key: 'autosync', default: false }
            ].map(pref => (
              <GlassCard key={pref.key} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold text-sm">{pref.label}</p>
                  <p className="text-white/40 text-xs mt-0.5">{pref.desc}</p>
                </div>
                {/* Toggle switch */}
                <motion.button
                  className={`w-12 h-6 rounded-full relative transition-colors duration-300
                    ${pref.default ? 'bg-gblu' : 'bg-white/20'}`}
                >
                  <motion.div
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                    animate={{ left: pref.default ? 26 : 4 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </motion.button>
              </GlassCard>
            ))}
          </div>
        );

      default:
        return (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-white">Account</h2>
            <GlassCard className="p-4">
              <p className="text-white/60 text-sm">
                Account management options coming soon.
              </p>
            </GlassCard>
          </div>
        );
    }
  };

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-white mb-8">Settings</h1>

        <div className="flex gap-6">
          {/* Sidebar nav */}
          <div className="w-48 flex-shrink-0 flex flex-col gap-1">
            {SECTIONS.map(section => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all
                  ${activeSection === section
                    ? 'bg-gblu/20 text-gblu'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
              >
                {section}
              </button>
            ))}
          </div>

          {/* Content panel */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              >
                <GlassCard className="p-6">
                  {renderSection()}
                </GlassCard>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;