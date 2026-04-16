import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Info, AlertCircle } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col-reverse gap-2 items-center pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="pointer-events-auto flex items-center gap-3 pl-3 pr-2 py-2 rounded-xl card shadow-2xl"
              style={{ minWidth: 260 }}
            >
              <div
                className={`
                  flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0
                  ${t.type === 'success' ? 'bg-accent-500/20 text-accent-300' : ''}
                  ${t.type === 'error' ? 'bg-red-500/20 text-red-300' : ''}
                  ${t.type === 'info' ? 'bg-ink-500/30 text-ink-200' : ''}
                `}
              >
                {t.type === 'success' && <Check size={13} strokeWidth={3} />}
                {t.type === 'error' && <AlertCircle size={13} strokeWidth={2.5} />}
                {t.type === 'info' && <Info size={13} strokeWidth={2.5} />}
              </div>
              <p className="text-sm text-ink-100 flex-1 pr-2">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="p-1 rounded-md text-ink-400 hover:text-ink-100 hover:bg-white/5 transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.addToast;
}
