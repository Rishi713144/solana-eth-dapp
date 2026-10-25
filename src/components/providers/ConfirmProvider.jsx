import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback((options) => {
    return new Promise(resolve => {
      resolver.current = resolve;
      setDialog({
        title: 'Are you sure?',
        description: '',
        confirmLabel: 'Confirm',
        cancelLabel: 'Cancel',
        variant: 'default',
        ...options,
      });
    });
  }, []);

  const close = useCallback((result) => {
    setDialog(null);
    if (resolver.current) {
      resolver.current(result);
      resolver.current = null;
    }
  }, []);

  useEffect(() => {
    if (!dialog) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') close(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dialog, close]);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {createPortal(
        <AnimatePresence>
          {dialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[210] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) close(false);
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 8 }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                className="glass-strong w-full max-w-md overflow-hidden rounded-3xl shadow-2xl"
              >
                <div className="flex items-start gap-4 p-6">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${dialog.variant === 'danger' ? 'border-rose-400/20 bg-rose-400/10 text-rose-300' : 'border-primary/20 bg-primary/10 text-primary'}`}>
                    <AlertTriangle size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-lg font-semibold text-white">{dialog.title}</h3>
                    {dialog.description && (
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{dialog.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => close(false)}
                    className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-white"
                    aria-label="Close dialog"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex justify-end gap-2 border-t border-white/5 bg-white/[0.02] px-6 py-4">
                  <Button variant="ghost" onClick={() => close(false)}>{dialog.cancelLabel}</Button>
                  <Button
                    variant={dialog.variant === 'danger' ? 'destructive' : 'default'}
                    onClick={() => close(true)}
                  >
                    {dialog.confirmLabel}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used inside ConfirmProvider');
  return context.confirm;
}
