import { motion, AnimatePresence } from 'framer-motion';
import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const icons = { success: 'check', error: 'x', info: 'info-circle', warning: 'alert-triangle' };
  const colors = {
    success: 'border-ggrn/40 bg-ggrn/10',
    error:   'border-gred/40 bg-gred/10',
    info:    'border-gblu/40 bg-gblu/10',
    warning: 'border-gyel/40 bg-gyel/10'
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0,   opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              className={`glass border rounded-xl px-4 py-3 flex items-center gap-3 max-w-xs ${colors[toast.type]}`}
            >
              <i className={`ti ti-${icons[toast.type]} text-lg`} />
              <span className="text-sm font-medium text-white">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);