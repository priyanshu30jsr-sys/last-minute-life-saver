import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Button from '../ui/Button';

const Navbar = ({ transparent = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0,   opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={`flex items-center justify-between px-8 py-5 relative z-20
        ${transparent ? '' : 'glass border-b border-white/5'}`}
    >
      {/* Logo */}
      <Link to={user ? '/chat' : '/'} className="flex items-center gap-2.5">
        <motion.div
          whileHover={{ scale: 1.08 }}
          className="w-8 h-8 rounded-lg bg-gradient-to-br from-gblu to-gpurp
            flex items-center justify-center shadow-glow"
        >
          <i className="ti ti-bolt text-white text-sm" />
        </motion.div>
        <span className="font-black text-white text-lg tracking-tight">
          LifeSaver <span className="gradient-text">AI</span>
        </span>
      </Link>

      {/* Center links — only for logged-in users */}
      {user && (
        <div className="hidden md:flex items-center gap-1">
          {[
            { to: '/chat',      label: 'Chat',      icon: 'message-2' },
            { to: '/dashboard', label: 'Plans',     icon: 'layout-dashboard' },
            { to: '/calendar',  label: 'Calendar',  icon: 'calendar-event' },
            { to: '/habits',    label: 'Habits',    icon: 'chart-bar' }
          ].map(item => (
            <Link key={item.to} to={item.to}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm
                  text-white/50 hover:text-white hover:bg-white/5 transition-all font-medium"
              >
                <i className={`ti ti-${item.icon} text-sm`} />
                {item.label}
              </motion.div>
            </Link>
          ))}
        </div>
      )}

      {/* Right side */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <div className="hidden sm:flex items-center gap-2 glass border border-white/10
              rounded-xl px-3 py-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gblu to-gpurp
                flex items-center justify-center text-white text-xs font-bold">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-white/70 text-sm font-medium">{user.name}</span>
            </div>
            <Button variant="ghost" size="sm" icon="logout" onClick={handleLogout}>
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" icon="rocket">Get Started</Button>
            </Link>
          </>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;