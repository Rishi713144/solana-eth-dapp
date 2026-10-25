import { useState } from 'react';
import {
  AlertTriangle,
  Check,
  Database,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  Network,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/ui/copy-button';
import { useNetwork } from '@/components/providers/NetworkProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { NETWORK_OPTIONS } from '@/config/network';
import { AUTO_LOCK_OPTIONS, getAutoLockMinutes, setAutoLockMinutes } from '@/utils/sessionLock';
import { shortenAddress } from '@/lib/format';
import { cn } from '@/lib/utils';
import { RecoveryModal } from '@/components/modals/RecoveryModal';
import { ChangePasswordModal } from '@/components/modals/ChangePasswordModal';

const DOT_TONES = {
  devnet: 'bg-amber-400',
  testnet: 'bg-cyan-400',
};

export function SettingsPage({ mnemonic, wallet, onLock, onReset }) {
  const { network, setNetwork } = useNetwork();
  const { toast } = useToast();
  const [autoLock, setAutoLockState] = useState(getAutoLockMinutes);
  const [showRecovery, setShowRecovery] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function updateAutoLock(minutes) {
    const next = setAutoLockMinutes(minutes);
    setAutoLockState(next);
    toast({ title: 'Auto-lock updated', description: `Vela will lock after ${next} minutes of inactivity.`, variant: 'success' });
  }

  function changeNetwork(option) {
    if (option.key === network) return;
    setNetwork(option.key);
    toast({
      title: `Switched to ${option.shortName}`,
      description: `Balances will refresh for ${option.shortName}.`,
      variant: 'info',
    });
  }

  const primary = wallet.solAccounts[0];

  return (
    <div className="space-y-5">
      <Card className="rounded-3xl border-white/[0.07] bg-card/60">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
              <Network size={16} />
            </div>
            <div>
              <CardTitle className="text-base">Networks</CardTitle>
              <p className="text-xs text-slate-500">Choose the Solana cluster and matching EVM chain.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {NETWORK_OPTIONS.map(option => {
            const active = option.key === network;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => changeNetwork(option)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition',
                  active
                    ? 'border-primary/25 bg-primary/[0.07]'
                    : 'border-white/[0.05] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]',
                )}
              >
                <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', DOT_TONES[option.key])} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-white">{option.name}</span>
                  </div>
                  <p className="mt-0.5 truncate text-[10px] text-slate-500">
                    {new URL(option.endpoint).hostname} · {option.evm.name}
                  </p>
                </div>
                {active && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-violet-300">
                    <Check size={13} />
                  </span>
                )}
              </button>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="rounded-3xl border-white/[0.07] bg-card/60">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10 text-violet-300">
                <ShieldCheck size={16} />
              </div>
              <div>
                <CardTitle className="text-base">Security</CardTitle>
                <p className="text-xs text-slate-500">Vault protection and session controls.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Auto-lock after inactivity</span>
                <span className="text-[10px] text-slate-500">{autoLock} min</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {AUTO_LOCK_OPTIONS.map(minutes => (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() => updateAutoLock(minutes)}
                    className={cn(
                      'rounded-lg border py-2 text-xs font-semibold transition',
                      autoLock === minutes
                        ? 'border-primary/30 bg-primary/10 text-violet-200'
                        : 'border-white/[0.07] bg-white/[0.02] text-slate-500 hover:text-slate-300',
                    )}
                  >
                    {minutes}m
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 border-t border-white/5 pt-3">
              <button
                type="button"
                onClick={() => setShowRecovery(true)}
                className="flex w-full items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-left transition hover:border-white/10 hover:bg-white/[0.04]"
              >
                <KeyRound size={15} className="text-amber-300" />
                <span className="flex-1">
                  <span className="block text-xs font-semibold text-white">Reveal recovery phrase</span>
                  <span className="block text-[10px] text-slate-500">Password required</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setShowPassword(true)}
                className="flex w-full items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-left transition hover:border-white/10 hover:bg-white/[0.04]"
              >
                <Fingerprint size={15} className="text-violet-300" />
                <span className="flex-1">
                  <span className="block text-xs font-semibold text-white">Change vault password</span>
                  <span className="block text-[10px] text-slate-500">Re-encrypt your vault</span>
                </span>
              </button>
              <Button variant="glass" className="w-full" onClick={onLock}>
                <LockKeyhole size={15} />
                Lock wallet now
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-white/[0.07] bg-card/60">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                <Database size={16} />
              </div>
              <div>
                <CardTitle className="text-base">Vault</CardTitle>
                <p className="text-xs text-slate-500">Local storage and account details.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Primary Solana address</p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="truncate font-mono text-xs text-slate-300">{primary ? shortenAddress(primary.address, 10, 8) : '—'}</span>
                {primary && <CopyButton value={primary.address} label="Primary address" />}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Solana accounts</p>
                <p className="mt-1 font-display text-xl font-semibold text-white">{wallet.solAccounts.length}</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Ethereum accounts</p>
                <p className="mt-1 font-display text-xl font-semibold text-white">{wallet.ethAccounts.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.04] p-3">
              <ShieldCheck size={14} className="shrink-0 text-emerald-300" />
              <p className="text-[10px] leading-relaxed text-emerald-100/60">
                AES-256-GCM · PBKDF2 210,000 iterations · keys never leave this browser.
              </p>
            </div>
            <div className="flex items-start gap-2 rounded-xl border border-rose-400/15 bg-rose-400/[0.04] p-3">
              <AlertTriangle size={14} className="mt-0.5 shrink-0 text-rose-300" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-rose-200">Danger zone</p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-rose-100/50">Remove the encrypted vault and all local settings from this device.</p>
                <Button size="sm" variant="destructive" className="mt-2.5" onClick={onReset}>
                  Reset wallet
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border-white/[0.07] bg-card/60">
        <CardContent className="flex flex-col items-start justify-between gap-3 p-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold text-white">Vela Wallet <span className="ml-1 text-slate-500">v1.0.0</span></p>
            <p className="mt-0.5 text-[11px] text-slate-500">Self-custodial multichain wallet for Solana and Ethereum.</p>
          </div>
          <Badge tone="primary" dot>Encrypted local vault</Badge>
        </CardContent>
      </Card>

      <RecoveryModal open={showRecovery} onClose={() => setShowRecovery(false)} mnemonic={mnemonic} />
      <ChangePasswordModal open={showPassword} onClose={() => setShowPassword(false)} />
    </div>
  );
}
