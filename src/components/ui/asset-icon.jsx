import { cn } from '@/lib/utils';

const SIZES = {
  sm: 'h-8 w-8 text-base rounded-xl',
  md: 'h-10 w-10 text-xl rounded-2xl',
  lg: 'h-12 w-12 text-2xl rounded-2xl',
  xl: 'h-14 w-14 text-3xl rounded-2xl',
};

const STYLES = {
  sol: 'border-violet-300/20 bg-[linear-gradient(145deg,#8b5cf6_0%,#22d3ee_160%)] text-white shadow-[0_10px_30px_-12px_rgba(124,92,255,0.9)]',
  eth: 'border-indigo-300/20 bg-[linear-gradient(145deg,#4f46e5_0%,#818cf8_100%)] text-white shadow-[0_10px_30px_-12px_rgba(99,102,241,0.9)]',
  token: 'border-white/10 bg-white/[0.06] text-slate-300',
};

export function AssetIcon({ chain = 'sol', size = 'md', className }) {
  const symbol = chain === 'eth' ? 'Ξ' : '◎';
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center border font-semibold', SIZES[size], STYLES[chain] || STYLES.token, className)}>
      {symbol}
    </span>
  );
}
