import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { PlanProvider } from './context/PlanContext';
import { ToastProvider } from './components/ui/Toast';
import Landing     from './pages/Landing';
import Login       from './pages/Login';
import Register    from './pages/Register';
import Chat        from './pages/Chat';
import Dashboard   from './pages/Dashboard';

import PlanDetail from './pages/PlanDetail';
import Settings   from './pages/Settings';
import CalendarView  from './pages/CalendarView';
import HabitsStreaks from './pages/HabitsStreaks';
import './styles/globals.css';
import './styles/animations.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-navy flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gblu/30 border-t-gblu rounded-full animate-spin" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <SocketProvider>
          <PlanProvider>
            <Routes>
              {/* Public guarded entries */}
              <Route path="/"         element={<PublicRoute><Landing /></PublicRoute>} />
              <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

              {/* Private routes */}
              <Route path="/chat"         element={<PrivateRoute><Chat /></PrivateRoute>} />
              <Route path="/dashboard"    element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/plans/:id"    element={<PrivateRoute><PlanDetail /></PrivateRoute>} />
              <Route path="/settings"     element={<PrivateRoute><Settings /></PrivateRoute>} />
              <Route path="/calendar" element={<PrivateRoute><CalendarView /></PrivateRoute>} />
              <Route path="/habits"   element={<PrivateRoute><HabitsStreaks /></PrivateRoute>} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </PlanProvider>
        </SocketProvider>
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;