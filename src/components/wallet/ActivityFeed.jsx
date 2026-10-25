import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
  RefreshCw,
  Repeat,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SkeletonRows } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useNetwork } from '@/components/providers/NetworkProvider';
import { explorerTxUrl } from '@/lib/rpc';
import { formatDateTime, formatToken, shortenAddress, timeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'received', label: 'Received' },
  { id: 'sent', label: 'Sent' },
];

const ICONS = {
  received: ArrowDownLeft,
  sent: ArrowUpRight,
  interaction: Repeat,
};

const TONES = {
  received: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  sent: 'border-violet-400/20 bg-violet-400/10 text-violet-300',
  interaction: 'border-slate-400/15 bg-white/[0.04] text-slate-400',
};

export function ActivityFeed({
  transactions,
  loading,
  error,
  refresh,
  compact = false,
  limit,
  onViewAll,
}) {
  const { network } = useNetwork();
  const [filter, setFilter] = useState('all');

  const visible = useMemo(() => {
    const filtered = filter === 'all' ? transactions : transactions.filter(tx => tx.type === filter);
    return limit ? filtered.slice(0, limit) : filtered;
  }, [transactions, filter, limit]);

  return (
    <div>
      {!compact && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-xl border border-white/[0.07] bg-white/[0.03] p-1">
            {FILTERS.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                  filter === item.id ? 'bg-white/[0.08] text-white' : 'text-slate-500 hover:text-slate-300',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <Button size="sm" variant="glass" onClick={refresh} loading={loading}>
            <RefreshCw size={13} />
            Refresh
          </Button>
        </div>
      )}

      {compact && (
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-semibold text-white">Recent activity</h3>
            <p className="text-xs text-slate-500">Latest Solana transactions</p>
          </div>
          {onViewAll && (
            <Button size="sm" variant="ghost" onClick={onViewAll}>
              View all
              <ArrowUpRight size={13} />
            </Button>
          )}
        </div>
      )}

      {loading && transactions.length === 0 && <SkeletonRows count={compact ? 3 : 5} />}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-400/15 bg-rose-400/[0.04] px-5 py-10 text-center">
          <AlertCircle size={22} className="text-rose-300" />
          <p className="mt-3 text-sm font-semibold text-white">{error}</p>
          <Button size="sm" variant="glass" className="mt-3" onClick={refresh}>
            Try again
          </Button>
        </div>
      )}

      {!loading && !error && visible.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-5 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03] text-slate-500">
            <Activity size={20} />
          </div>
          <p className="mt-3 text-sm font-semibold text-white">
            {filter === 'all' ? 'No activity yet' : `No ${filter} transactions`}
          </p>
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
            Transactions on {network} will appear here. Send or request an airdrop to get started.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {visible.map((tx, index) => {
          const Icon = tx.status === 'failed' ? AlertCircle : (ICONS[tx.type] || Repeat);
          const tone = tx.status === 'failed' ? 'border-rose-400/20 bg-rose-400/10 text-rose-300' : (TONES[tx.type] || TONES.interaction);
          return (
            <motion.a
              key={tx.signature}
              href={explorerTxUrl(network, tx.signature)}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.025 }}
              className="group flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-3 transition hover:border-white/10 hover:bg-white/[0.04]"
            >
              <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border', tone)}>
                <Icon size={15} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold capitalize text-white">
                    {tx.status === 'failed' ? 'Failed transaction' : tx.type === 'interaction' ? 'Contract interaction' : tx.type}
                  </p>
                  <span className={cn('hidden h-1.5 w-1.5 shrink-0 rounded-full sm:block', tx.status === 'failed' ? 'bg-rose-400' : 'bg-emerald-400')} />
                </div>
                <p className="mt-0.5 truncate text-[11px] text-slate-500">
                  {tx.counterparty ? `${tx.type === 'received' ? 'From' : 'To'} ${shortenAddress(tx.counterparty)}` : shortenAddress(tx.signature, 8, 6)}
                  <span className="mx-1.5 text-slate-700">·</span>
                  {tx.blockTime ? timeAgo(tx.blockTime) : 'Recent'}
                </p>
              </div>

              <div className="shrink-0 text-right">
                {tx.amount > 0 ? (
                  <p className={cn('text-sm font-semibold tabular-nums', tx.type === 'received' ? 'text-emerald-300' : 'text-slate-200')}>
                    {tx.type === 'received' ? '+' : '−'}{formatToken(tx.amount)} <span className="text-[10px] text-slate-500">SOL</span>
                  </p>
                ) : (
                  <Badge tone={tx.status === 'failed' ? 'danger' : 'default'} className="px-2 py-0.5">
                    {tx.status === 'failed' ? 'Failed' : 'Signed'}
                  </Badge>
                )}
                {!compact && tx.blockTime && (
                  <p className="mt-0.5 hidden text-[10px] text-slate-600 sm:block">{formatDateTime(tx.blockTime)}</p>
                )}
              </div>

              <ExternalLink size={13} className="hidden shrink-0 text-slate-600 transition group-hover:text-slate-300 sm:block" />
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}
