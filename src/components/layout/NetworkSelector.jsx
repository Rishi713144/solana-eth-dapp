import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, CircleDot } from 'lucide-react';
import { useNetwork } from '@/components/providers/NetworkProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { NETWORK_OPTIONS } from '@/config/network';
import { cn } from '@/lib/utils';

const DOT_TONES = {
  devnet: 'bg-amber-400',
  testnet: 'bg-cyan-400',
};

export function NetworkSelector({ compact = false }) {
  const { network, config, setNetwork } = useNetwork();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function choose(nextKey) {
    const next = NETWORK_OPTIONS.find(option => option.key === nextKey);
    if (nextKey !== network) {
      setNetwork(nextKey);
      toast({
        title: `Switched to ${next?.shortName || nextKey}`,
        description: 'Balances and activity will refresh for the new cluster.',
        variant: 'info',
      });
    }
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className={cn(
          'flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] font-medium text-slate-300 transition hover:border-white/15 hover:bg-white/[0.07] hover:text-white',
          compact ? 'h-8 px-2.5 text-[11px]' : 'h-10 px-3.5 text-xs',
        )}
      >
        <span className={cn('h-1.5 w-1.5 rounded-full shadow-[0_0_8px_currentColor]', DOT_TONES[network])} />
        <span className="uppercase tracking-[0.12em]">{config.shortName}</span>
        <ChevronDown size={compact ? 12 : 14} className={cn('text-slate-500 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-72 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020]/98 p-2 shadow-2xl backdrop-blur-2xl"
          >
            <div className="flex items-center gap-2 px-2.5 pb-2 pt-1">
              <CircleDot size={12} className="text-slate-500" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Solana cluster</span>
            </div>
            {NETWORK_OPTIONS.map(option => {
              const active = option.key === network;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => choose(option.key)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition',
                    active ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]',
                  )}
                >
                  <span className={cn('h-2 w-2 shrink-0 rounded-full', DOT_TONES[option.key])} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-white">{option.shortName}</span>
                    <span className="block truncate text-[10px] text-slate-500">{new URL(option.endpoint).hostname}</span>
                  </span>
                  {active && <Check size={14} className="text-emerald-400" />}
                </button>
              );
            })}
            <div className="mt-1 rounded-xl border border-amber-400/15 bg-amber-400/[0.05] px-3 py-2">
              <p className="text-[10px] leading-relaxed text-amber-200/60">
                Testing networks only. Never send real assets to these accounts.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
