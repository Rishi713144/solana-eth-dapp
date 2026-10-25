import { useEffect, useMemo, useState } from 'react';
import '@solana/wallet-adapter-react-ui/styles.css';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ChevronRight,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  Settings,
  ShieldCheck,
  Wrench,
  X,
} from 'lucide-react';

import { Brand } from './Brand';
import { NetworkSelector } from './NetworkSelector';
import { Overview } from '@/components/wallet/Overview';
import { ActivityFeed } from '@/components/wallet/ActivityFeed';
import { ToolsPage } from '@/components/tools/ToolsPage';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { SendModal } from '@/components/modals/SendModal';
import { ReceiveModal } from '@/components/modals/ReceiveModal';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/copy-button';
import { Card, CardContent } from '@/components/ui/card';
import { useNetwork } from '@/components/providers/NetworkProvider';
import { useWalletData } from '@/hooks/useWalletData';
import { usePrices } from '@/hooks/usePrices';
import { useActivity } from '@/hooks/useActivity';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { shortenAddress } from '@/lib/format';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'tools', label: 'Tools', icon: Wrench },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const PAGE_META = {
  overview: { title: 'Overview', subtitle: 'Portfolio, accounts and network health' },
  activity: { title: 'Activity', subtitle: 'Your recent on-chain transactions' },
  tools: { title: 'Tools', subtitle: 'Airdrops, signing and address book' },
  settings: { title: 'Settings', subtitle: 'Networks, security and vault controls' },
};

function NavList({ activeTab, onNavigate, layoutId = 'nav-active' }) {
  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map(item => {
        const Icon = item.icon;
        const active = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className={cn(
              'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
              active ? 'text-white' : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-200',
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-xl border border-white/[0.08] bg-white/[0.06]"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <Icon size={17} className={cn('relative z-10', active && 'text-violet-300')} />
            <span className="relative z-10">{item.label}</span>
            {active && <ChevronRight size={13} className="relative z-10 ml-auto text-slate-500" />}
          </button>
        );
      })}
    </nav>
  );
}

function VaultCard({ account, networkLabel, onLock }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
          <ShieldCheck size={13} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-white">Encrypted vault</p>
          <p className="text-[9px] uppercase tracking-widest text-slate-500">{networkLabel}</p>
        </div>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
      </div>
      {account && (
        <div className="mt-2.5 flex items-center gap-1 rounded-lg border border-white/[0.05] bg-black/15 px-2 py-1.5">
          <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-slate-400">{shortenAddress(account, 6, 6)}</span>
          <CopyButton value={account} label="Address" size={12} />
        </div>
      )}
      <Button size="sm" variant="ghost" className="mt-1.5 w-full justify-start px-2 text-slate-400 hover:text-white" onClick={onLock}>
        <LockKeyhole size={13} />
        Lock wallet
      </Button>
    </div>
  );
}

function DashboardContent({ mnemonic, onLock, onReset }) {
  const { config } = useNetwork();
  const wallet = useWalletData(mnemonic);
  const prices = usePrices();
  const activity = useActivity(wallet.solAccounts);
  const networkStatus = useNetworkStatus();
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [send, setSend] = useState({ open: false, chain: 'sol', index: 0 });
  const [receive, setReceive] = useState({ open: false, chain: 'sol' });
  const primary = wallet.solAccounts[0];
  const meta = PAGE_META[activeTab] || PAGE_META.overview;

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileOpen]);

  function navigate(tab) {
    setActiveTab(tab);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openSend(chain = 'sol', index = 0) {
    setSend({ open: true, chain, index });
  }

  function openReceive(chain = 'sol') {
    setReceive({ open: true, chain });
  }

  function refreshAll() {
    wallet.refresh();
    activity.refresh();
  }

  function handleSendSuccess() {
    window.setTimeout(() => {
      wallet.refresh();
      activity.refresh();
    }, 1200);
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[272px] flex-col border-r border-white/[0.06] bg-[#080c17]/80 p-5 backdrop-blur-2xl lg:flex">
        <Brand onClick={() => navigate('overview')} subtitle="Your keys. Every chain." />
        <div className="mt-8">
          <p className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">Wallet</p>
          <NavList activeTab={activeTab} onNavigate={navigate} layoutId="desktop-nav-active" />
        </div>

        <div className="mt-6 border-t border-white/[0.05] pt-4">
          <div className="mb-2 flex items-center justify-between px-3">
            <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">Network</span>
            <NetworkSelector compact />
          </div>
          <div className="px-3 py-2">
            <p className="text-[10px] text-slate-500">{config.name}</p>
            <p className="mt-0.5 truncate text-[9px] text-slate-600">{new URL(config.evm.rpc).hostname}</p>
          </div>
        </div>

        <div className="mt-auto space-y-3">
          <VaultCard account={primary?.address} networkLabel={config.shortName} onLock={onLock} />
          <p className="px-1 text-center text-[9px] text-slate-700">Vela v1.0.0 · Non-custodial</p>
        </div>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex lg:hidden"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 420, damping: 38 }}
              className="relative flex h-full w-[290px] flex-col border-r border-white/10 bg-[#080c17] p-5 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <Brand onClick={() => navigate('overview')} subtitle="Multichain wallet" />
                <button type="button" onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white" aria-label="Close menu">
                  <X size={18} />
                </button>
              </div>
              <div className="mt-8">
                <p className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">Wallet</p>
                <NavList activeTab={activeTab} onNavigate={navigate} layoutId="mobile-nav-active" />
              </div>
              <div className="mt-6 border-t border-white/[0.05] pt-4">
                <div className="flex items-center justify-between px-3 pb-2">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">Network</span>
                  <NetworkSelector compact />
                </div>
              </div>
              <div className="mt-auto space-y-3">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2">
                  <WalletMultiButton className="!w-full !justify-center" />
                </div>
                <VaultCard account={primary?.address} networkLabel={config.shortName} onLock={onLock} />
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-h-screen flex-col lg:pl-[272px]">
        <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-background/75 backdrop-blur-2xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2 text-slate-300 transition hover:bg-white/[0.08] lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-base font-semibold text-white sm:text-lg">{meta.title}</h1>
              <p className="hidden truncate text-[11px] text-slate-500 sm:block">{meta.subtitle}</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:block">
                <NetworkSelector />
              </div>
              <div className="hidden md:block">
                <WalletMultiButton />
              </div>
              <Button size="icon" variant="glass" onClick={onLock} aria-label="Lock wallet">
                <LockKeyhole size={15} />
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-28 pt-5 sm:px-6 sm:pb-10 sm:pt-6 lg:px-8 lg:pb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === 'overview' && (
                <Overview
                  wallet={wallet}
                  prices={prices.prices}
                  pricesLoading={prices.loading}
                  networkStatus={networkStatus}
                  activity={activity}
                  onSend={openSend}
                  onReceive={openReceive}
                  onNavigate={navigate}
                />
              )}

              {activeTab === 'activity' && (
                <Card className="rounded-3xl border-white/[0.07] bg-card/60">
                  <CardContent className="p-5 sm:p-6">
                    <ActivityFeed
                      transactions={activity.transactions}
                      loading={activity.loading}
                      error={activity.error}
                      refresh={activity.refresh}
                    />
                  </CardContent>
                </Card>
              )}

              {activeTab === 'tools' && <ToolsPage wallet={wallet} onRefresh={refreshAll} />}

              {activeTab === 'settings' && (
                <SettingsPage mnemonic={mnemonic} wallet={wallet} onLock={onLock} onReset={onReset} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.07] bg-[#080c17]/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-2xl lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.id)}
                className={cn('flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 transition', active ? 'text-violet-300' : 'text-slate-600')}
              >
                <Icon size={18} />
                <span className="text-[9px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <SendModal
        open={send.open}
        onClose={() => setSend(previous => ({ ...previous, open: false }))}
        wallet={wallet}
        initialChain={send.chain}
        initialIndex={send.index}
        onSuccess={handleSendSuccess}
      />
      <ReceiveModal
        open={receive.open}
        onClose={() => setReceive(previous => ({ ...previous, open: false }))}
        solAccounts={wallet.solAccounts}
        ethAccounts={wallet.ethAccounts}
        initialChain={receive.chain}
      />
    </div>
  );
}

export function WalletDashboard({ mnemonic, onLock, onReset }) {
  const { config } = useNetwork();
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);
  const endpoint = config.endpoint;

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <DashboardContent mnemonic={mnemonic} onLock={onLock} onReset={onReset} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
