import { useState } from 'react';
import { ArrowUpRight, Plus, Send } from 'lucide-react';
import { AssetIcon } from '@/components/ui/asset-icon';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/copy-button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useNetwork } from '@/components/providers/NetworkProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { explorerAddressUrl } from '@/lib/rpc';
import { formatToken, shortenAddress } from '@/lib/format';
import { cn } from '@/lib/utils';

export function AccountsPanel({ wallet, onSend }) {
  const [chain, setChain] = useState('sol');
  const [adding, setAdding] = useState(false);
  const { network, config } = useNetwork();
  const { toast } = useToast();

  const accounts = chain === 'sol' ? wallet.solAccounts : wallet.ethAccounts;
  const balances = chain === 'sol' ? wallet.solBalances : wallet.ethBalances;
  const unit = chain === 'sol' ? 'SOL' : 'ETH';
  const addingDisabled = accounts.length >= 10;

  function addAccount() {
    setAdding(true);
    if (chain === 'sol') wallet.addSolAccount();
    else wallet.addEthAccount();
    window.setTimeout(() => {
      setAdding(false);
      toast({ title: `New ${chain === 'sol' ? 'Solana' : 'Ethereum'} account`, description: 'Derived from your encrypted recovery phrase.', variant: 'success' });
    }, 350);
  }

  function explorer(address) {
    if (chain === 'sol') return explorerAddressUrl(network, address);
    return `${config.evm.explorer}/address/${address}`;
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-xl border border-white/[0.07] bg-white/[0.03] p-1">
          <button
            type="button"
            onClick={() => setChain('sol')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
              chain === 'sol' ? 'bg-white/[0.08] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300',
            )}
          >
            <AssetIcon chain="sol" size="sm" className="h-5 w-5 rounded-md text-xs" />
            Solana
          </button>
          <button
            type="button"
            onClick={() => setChain('eth')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
              chain === 'eth' ? 'bg-white/[0.08] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300',
            )}
          >
            <AssetIcon chain="eth" size="sm" className="h-5 w-5 rounded-md text-xs" />
            Ethereum
          </button>
        </div>

        <Button size="sm" variant="glass" onClick={addAccount} disabled={addingDisabled} loading={adding}>
          <Plus size={14} />
          Add account
        </Button>
      </div>

      <div className="space-y-2">
        {accounts.map(account => {
          const balance = balances[account.address];
          return (
            <div
              key={`${chain}-${account.index}`}
              className="group flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-3 transition hover:border-white/10 hover:bg-white/[0.04]"
            >
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.04]">
                <AssetIcon chain={chain} size="sm" className="h-8 w-8 rounded-xl text-sm" />
                <span className="absolute -bottom-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-[#0b1020] bg-slate-700 px-1 text-[8px] font-bold text-slate-200">
                  {account.index + 1}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">Account {account.index + 1}</p>
                  {account.index === 0 && <Badge tone="primary" className="hidden px-1.5 py-0.5 sm:inline-flex">Primary</Badge>}
                </div>
                <p className="mt-0.5 font-mono text-[11px] text-slate-500">{shortenAddress(account.address, 6, 6)}</p>
              </div>

              <div className="hidden text-right sm:block">
                {balance === undefined ? (
                  <Skeleton className="ml-auto h-4 w-20" />
                ) : (
                  <p className="text-sm font-semibold tabular-nums text-white">
                    {formatToken(balance)} <span className="text-[11px] font-medium text-slate-500">{unit}</span>
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-0.5">
                <CopyButton value={account.address} label={`${unit} address`} />
                <a
                  href={explorer(account.address)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white"
                  aria-label="View account in explorer"
                >
                  <ArrowUpRight size={14} />
                </a>
                {chain === 'sol' && onSend && (
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="hidden text-slate-400 sm:inline-flex"
                    onClick={() => onSend('sol', account.index)}
                    aria-label="Send from account"
                  >
                    <Send size={13} />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-slate-600">
        Accounts are deterministically derived from your recovery phrase. Never share private keys.
      </p>
    </div>
  );
}
