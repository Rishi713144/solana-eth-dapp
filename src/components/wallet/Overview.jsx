import { useState } from 'react';
import {
  ArrowDownToLine,
  ArrowUpRight,
  Eye,
  EyeOff,
  Gauge,
  Layers3,
  RefreshCw,
  Send,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wrench,
} from 'lucide-react';
import { AssetIcon } from '@/components/ui/asset-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CopyButton } from '@/components/ui/copy-button';
import { Skeleton } from '@/components/ui/skeleton';
import { ActivityFeed } from './ActivityFeed';
import { AccountsPanel } from './AccountsPanel';
import { useNetwork } from '@/components/providers/NetworkProvider';
import { useSplTokens } from '@/hooks/useSplTokens';
import { explorerAddressUrl } from '@/lib/rpc';
import { formatPercent, formatToken, formatUsd, shortenAddress } from '@/lib/format';
import { cn } from '@/lib/utils';

function QuickAction({ icon: Icon, label, description, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group flex flex-col items-start gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.04] p-3.5 text-left transition hover:border-white/15 hover:bg-white/[0.08] disabled:opacity-50"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05] text-violet-200 transition group-hover:border-primary/30 group-hover:bg-primary/15 group-hover:text-violet-100">
        <Icon size={15} />
      </span>
      <span className="text-sm font-semibold text-white">{label}</span>
      <span className="hidden text-[10px] leading-tight text-slate-500 sm:block">{description}</span>
    </button>
  );
}

function StatCard({ label, value, detail, trend, icon: Icon, loading }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
        {Icon && <Icon size={13} className="text-slate-600" />}
      </div>
      {loading ? (
        <Skeleton className="mt-2 h-6 w-20" />
      ) : (
        <p className="mt-1.5 font-display text-lg font-semibold tabular-nums text-white">{value}</p>
      )}
      <p className={cn(
        'mt-0.5 flex items-center gap-1 text-[11px]',
        trend === 'up' ? 'text-emerald-300' : trend === 'down' ? 'text-rose-300' : 'text-slate-500',
      )}>
        {trend === 'up' && <TrendingUp size={11} />}
        {trend === 'down' && <TrendingDown size={11} />}
        {detail}
      </p>
    </div>
  );
}

export function Overview({ wallet, prices = {}, pricesLoading = false, networkStatus, activity, onSend, onReceive, onNavigate }) {
  const { network, config } = useNetwork();
  const [hidden, setHidden] = useState(false);
  const primary = wallet.solAccounts[0];
  const { tokens, loading: tokensLoading, refresh: refreshTokens } = useSplTokens(primary?.address);

  const solPrice = Number(prices?.solana?.usd ?? 0) || 0;
  const solChange = Number(prices?.solana?.usd_24h_change ?? 0) || 0;
  const ethPrice = Number(prices?.ethereum?.usd ?? 0) || 0;
  const ethChange = Number(prices?.ethereum?.usd_24h_change ?? 0) || 0;
  const solValue = wallet.totalSol * solPrice;
  const ethValue = wallet.totalEth * ethPrice;
  const totalUsd = solValue + ethValue;
  const hasPrices = solPrice > 0 || ethPrice > 0;
  const weightedChange = totalUsd > 0
    ? ((solValue * solChange) + (ethValue * ethChange)) / totalUsd
    : 0;
  const accountCount = wallet.solAccounts.length + wallet.ethAccounts.length;
  const empty = wallet.totalSol === 0 && wallet.totalEth === 0;

  function refreshAll() {
    wallet.refresh();
    refreshTokens();
    activity.refresh();
  }

  const displayBalance = hidden
    ? '••••••'
    : hasPrices
      ? formatUsd(totalUsd)
      : `${formatToken(wallet.totalSol)} SOL`;

  return (
    <div className="space-y-5">
      <Card className="relative overflow-hidden rounded-3xl border-white/10 bg-[#0a0f1e]/85 shadow-[0_50px_140px_-80px_rgba(124,92,255,0.9)]">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-violet-500/20 blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-[90px]" />
        <div className="pointer-events-none absolute inset-0 bg-noise opacity-40" />

        <div className="relative p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <Badge tone={network === 'testnet' ? 'accent' : 'warning'} dot>
                {config.shortName}
              </Badge>
              <Badge tone="default">Primary vault</Badge>
            </div>
            <div className="flex items-center gap-1.5">
              {primary && <CopyButton value={primary.address} label="Primary address" showLabel />}
              <Button size="icon-sm" variant="ghost" onClick={() => setHidden(value => !value)} aria-label="Toggle balance visibility">
                {hidden ? <EyeOff size={14} /> : <Eye size={14} />}
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Total portfolio value</p>
            <div className="mt-1 flex flex-wrap items-end gap-3">
              <h1 className="font-display text-4xl font-semibold tracking-tight tabular-nums text-white sm:text-5xl lg:text-6xl">
                {displayBalance}
              </h1>
              {hasPrices && !hidden && (
                <span className={cn('mb-1.5 flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold', weightedChange >= 0 ? 'bg-emerald-400/10 text-emerald-300' : 'bg-rose-400/10 text-rose-300')}>
                  {weightedChange >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {formatPercent(weightedChange)} 24h
                </span>
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
              <span>{hidden ? '••••' : formatToken(wallet.totalSol)} SOL</span>
              <span className="text-slate-700">·</span>
              <span>{hidden ? '••••' : formatToken(wallet.totalEth)} ETH</span>
              <span className="text-slate-700">·</span>
              <span>{accountCount} accounts</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <QuickAction icon={Send} label="Send" description="Transfer funds" onClick={() => onSend('sol', 0)} />
            <QuickAction icon={ArrowDownToLine} label="Receive" description="Show address & QR" onClick={() => onReceive('sol')} />
            <QuickAction icon={Sparkles} label="Airdrop" description="Get test SOL" onClick={() => onNavigate('tools')} />
          </div>

          {primary && (
            <div className="mt-5 flex items-center gap-2 border-t border-white/[0.05] pt-4">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="truncate font-mono text-[11px] text-slate-500">{shortenAddress(primary.address, 8, 8)}</span>
              <a
                href={explorerAddressUrl(network, primary.address)}
                target="_blank"
                rel="noreferrer"
                className="ml-auto flex items-center gap-1 text-[10px] font-medium text-slate-500 transition hover:text-white"
              >
                Explorer <ArrowUpRight size={10} />
              </a>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <StatCard
          label="SOL price"
          value={solPrice ? formatUsd(solPrice) : '—'}
          detail={solPrice ? formatPercent(solChange) : 'Live price unavailable'}
          trend={solPrice ? (solChange >= 0 ? 'up' : 'down') : 'flat'}
          loading={pricesLoading && !solPrice}
        />
        <StatCard
          label="ETH price"
          value={ethPrice ? formatUsd(ethPrice) : '—'}
          detail={ethPrice ? formatPercent(ethChange) : 'Live price unavailable'}
          trend={ethPrice ? (ethChange >= 0 ? 'up' : 'down') : 'flat'}
          loading={pricesLoading && !ethPrice}
        />
        <StatCard
          label="Network"
          value={networkStatus.online ? 'Live' : 'Offline'}
          detail={networkStatus.loading ? 'Syncing…' : `Epoch ${networkStatus.epoch ?? '—'} · ${networkStatus.slot ? networkStatus.slot.toLocaleString() : '—'}`}
          icon={Gauge}
          loading={networkStatus.loading}
          trend={networkStatus.online ? 'up' : 'down'}
        />
        <StatCard
          label="Vault accounts"
          value={`${accountCount}`}
          detail={`${wallet.solAccounts.length} Solana · ${wallet.ethAccounts.length} Ethereum`}
          icon={Layers3}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
        <Card className="rounded-3xl border-white/[0.07] bg-card/60">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base">Assets</CardTitle>
              <p className="mt-1 text-xs text-slate-500">Balances across your derived accounts</p>
            </div>
            <Button size="icon-sm" variant="ghost" onClick={refreshAll} aria-label="Refresh balances">
              <RefreshCw size={14} className={wallet.loading ? 'animate-spin' : ''} />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-3.5">
              <AssetIcon chain="sol" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">Solana</p>
                <p className="text-[11px] text-slate-500">{wallet.solAccounts.length} account{wallet.solAccounts.length > 1 ? 's' : ''} · {config.shortName}</p>
              </div>
              <div className="text-right">
                {wallet.loading && wallet.totalSol === 0 ? (
                  <Skeleton className="ml-auto h-4 w-20" />
                ) : (
                  <p className="text-sm font-semibold tabular-nums text-white">{hidden ? '••••' : formatToken(wallet.totalSol)} SOL</p>
                )}
                {hasPrices && <p className="mt-0.5 text-[10px] text-slate-500">{hidden ? '••••' : formatUsd(solValue)}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-3.5">
              <AssetIcon chain="eth" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">Ethereum</p>
                <p className="text-[11px] text-slate-500">{wallet.ethAccounts.length} account{wallet.ethAccounts.length > 1 ? 's' : ''} · {config.evm.name}</p>
              </div>
              <div className="text-right">
                {wallet.loading && wallet.totalEth === 0 ? (
                  <Skeleton className="ml-auto h-4 w-20" />
                ) : (
                  <p className="text-sm font-semibold tabular-nums text-white">{hidden ? '••••' : formatToken(wallet.totalEth)} ETH</p>
                )}
                {hasPrices && <p className="mt-0.5 text-[10px] text-slate-500">{hidden ? '••••' : formatUsd(ethValue)}</p>}
              </div>
            </div>

            {tokensLoading && tokens.length === 0 && (
              <div className="flex items-center gap-3 rounded-2xl border border-white/[0.04] bg-white/[0.015] p-3.5">
                <Skeleton className="h-10 w-10 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              </div>
            )}

            {tokens.map(token => (
              <a
                key={token.address}
                href={explorerAddressUrl(network, token.mint)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-3.5 transition hover:border-white/10 hover:bg-white/[0.04]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-gradient-to-br from-slate-500/20 to-slate-700/20 font-display text-sm font-bold text-slate-300">
                  {token.mint.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">Token {shortenAddress(token.mint, 4, 4)}</p>
                  <p className="text-[11px] text-slate-500">SPL token · {token.decimals} decimals</p>
                </div>
                <p className="text-sm font-semibold tabular-nums text-white">{hidden ? '••••' : formatToken(token.amount)}</p>
              </a>
            ))}

            {!tokensLoading && tokens.length > 0 && (
              <p className="px-1 pt-1 text-[10px] text-slate-600">Showing up to 12 SPL token accounts for your primary Solana account.</p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-white/[0.07] bg-card/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Accounts</CardTitle>
            <p className="text-xs text-slate-500">Derived from your recovery phrase</p>
          </CardHeader>
          <CardContent>
            <AccountsPanel wallet={wallet} onSend={onSend} />
          </CardContent>
        </Card>
      </div>

      {empty && (
        <Card className="overflow-hidden rounded-3xl border-primary/15 bg-gradient-to-br from-primary/[0.08] via-transparent to-cyan-400/[0.04]">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-violet-300">
                  <Sparkles size={19} />
                </div>
                <div>
                  <p className="font-display text-base font-semibold text-white">Your vault is empty</p>
                  <p className="mt-0.5 max-w-md text-xs leading-relaxed text-slate-400">
                    Receive funds, request devnet SOL from the faucet, or deploy your first Token-2022 asset to explore Vela.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="glass" onClick={() => onReceive('sol')}>
                  <ArrowDownToLine size={14} /> Receive
                </Button>
                <Button size="sm" variant="glass" onClick={() => onNavigate('tools')}>
                  <Wrench size={14} /> Airdrop
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-3xl border-white/[0.07] bg-card/60">
        <CardContent className="p-5 sm:p-6">
          <ActivityFeed
            transactions={activity.transactions}
            loading={activity.loading}
            error={activity.error}
            refresh={activity.refresh}
            compact
            limit={4}
            onViewAll={() => onNavigate('activity')}
          />
        </CardContent>
      </Card>
    </div>
  );
}
