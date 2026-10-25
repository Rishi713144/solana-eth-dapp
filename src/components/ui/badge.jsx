import { cn } from '@/lib/utils';

const TONES = {
  default: 'border-white/10 bg-white/[0.06] text-slate-300',
  primary: 'border-primary/25 bg-primary/10 text-violet-300',
  accent: 'border-cyan-400/25 bg-cyan-400/10 text-cyan-300',
  success: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300',
  warning: 'border-amber-400/25 bg-amber-400/10 text-amber-300',
  danger: 'border-rose-400/25 bg-rose-400/10 text-rose-300',
};

export function Badge({ children, tone = 'default', className, dot = false }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]', TONES[tone] || TONES.default, className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
