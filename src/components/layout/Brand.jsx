import logo from '@/assets/logo.svg';
import { cn } from '@/lib/utils';

export function Brand({ compact = false, subtitle = 'Multichain wallet', className, onClick }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn('flex items-center gap-3 text-left', onClick && 'transition hover:opacity-90', className)}
    >
      <img src={logo} alt="Vela" className={cn('shrink-0 rounded-xl shadow-glow', compact ? 'h-8 w-8' : 'h-10 w-10')} />
      <span className="flex min-w-0 flex-col">
        <span className={cn('font-display font-semibold tracking-tight text-white', compact ? 'text-base' : 'text-lg')}>
          Vela
        </span>
        {subtitle && <span className="text-[11px] font-medium text-slate-500">{subtitle}</span>}
      </span>
    </Tag>
  );
}
