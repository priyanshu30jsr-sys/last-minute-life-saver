import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const navItems = [
  { to: '/chat',      icon: 'message-2',       label: 'Chat' },
  { to: '/dashboard', icon: 'layout-dashboard', label: 'My Plans' },
  { to: '/calendar',  icon: 'calendar-event',   label: 'Calendar' },
  { to: '/habits',    icon: 'chart-bar',         label: 'Habits' },
  { to: '/settings',  icon: 'settings',          label: 'Settings' }
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { connected }    = useSocket() || {};
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0,   opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 h-screen w-[72px] glass border-r border-white/5
        flex flex-col items-center py-6 gap-2 z-40"
    >
      {/* Logo */}
      <NavLink to="/chat" className="mb-4">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-gblu to-gpurp
            flex items-center justify-center shadow-glow"
        >
          <i className="ti ti-bolt text-white text-lg" />
        </motion.div>
      </NavLink>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 flex-1 w-full px-2">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                title={item.label}
                className={`relative w-full h-12 rounded-xl flex items-center justify-center
                  transition-all duration-200 group cursor-pointer
                  ${isActive
                    ? 'bg-gblu/20 text-gblu shadow-glow'
                    : 'text-white/35 hover:text-white hover:bg-white/5'
                  }`}
              >
                <i className={`ti ti-${item.icon} text-xl`} />

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute right-0 top-1/2 -translate-y-1/2
                      w-0.5 h-6 bg-gblu rounded-l-full"
                  />
                )}

                {/* Tooltip */}
                <span className="absolute left-full ml-3 px-2.5 py-1.5 text-xs font-semibold
                  bg-navy-light border border-white/10 rounded-lg text-white whitespace-nowrap
                  opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity
                  shadow-xl z-50">
                  {item.label}
                </span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: socket indicator + user avatar + logout */}
      <div className="flex flex-col items-center gap-2 mt-auto">
        {/* Live connection dot */}
        <div
          title={connected ? 'Live connected' : 'Offline'}
          className={`w-2 h-2 rounded-full transition-colors duration-500
            ${connected ? 'bg-ggrn shadow-glow-green' : 'bg-white/20'}`}
        />

        {/* User avatar */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-gblu to-gpurp
            flex items-center justify-center text-white text-xs font-black cursor-default"
          title={user?.name}
        >
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </motion.div>

        {/* Logout */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleLogout}
          title="Sign Out"
          className="w-10 h-10 rounded-xl text-white/30 hover:text-gred
            hover:bg-gred/10 transition-colors flex items-center justify-center"
        >
          <i className="ti ti-logout text-lg" />
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;