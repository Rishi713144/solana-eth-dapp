import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { randomId } from '@/lib/rpc';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const TONES = {
  success: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20',
  error: 'text-rose-300 bg-rose-400/10 border-rose-400/20',
  warning: 'text-amber-300 bg-amber-400/10 border-amber-400/20',
  info: 'text-cyan-300 bg-cyan-400/10 border-cyan-400/20',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts(previous => previous.filter(item => item.id !== id));
  }, []);

  const toast = useCallback((options) => {
    const id = randomId();
    const payload = typeof options === 'string' ? { title: options } : options;
    setToasts(previous => [...previous.slice(-3), { id, variant: 'info', duration: 4200, ...payload }]);
    if (payload.duration !== 0) {
      window.setTimeout(() => dismiss(id), payload.duration || 4200);
    }
    return id;
  }, [dismiss]);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6">
          <AnimatePresence initial={false}>
            {toasts.map(item => {
              const Icon = ICONS[item.variant] || Info;
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 24, scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-white/10 bg-[#0b1020]/95 p-4 shadow-2xl backdrop-blur-xl"
                >
                  <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border', TONES[item.variant] || TONES.info)}>
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    {item.description && (
                      <p className="mt-0.5 break-words text-xs leading-relaxed text-slate-400">{item.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => dismiss(item.id)}
                    className="rounded-lg p-1 text-slate-500 transition hover:bg-white/5 hover:text-white"
                    aria-label="Dismiss notification"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
