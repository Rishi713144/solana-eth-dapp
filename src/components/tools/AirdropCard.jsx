import { useState } from 'react';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { Droplets, ExternalLink, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/ui/copy-button';
import { useNetwork } from '@/components/providers/NetworkProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { explorerTxUrl, withTimeout } from '@/lib/rpc';
import { shortenAddress } from '@/lib/format';
import { cn } from '@/lib/utils';

const PRESETS = [0.5, 1, 2];

export function AirdropCard({ account, onDone }) {
  const { network, config } = useNetwork();
  const { toast } = useToast();
  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState('');

  async function requestAirdrop() {
    if (!account) {
      toast({ title: 'No Solana account', description: 'Create an account from the overview first.', variant: 'error' });
      return;
    }
    setLoading(true);
    setSignature('');
    try {
      const connection = new Connection(config.endpoint, 'confirmed');
      const sig = await withTimeout(
        connection.requestAirdrop(account.keypair.publicKey, Math.round(amount * LAMPORTS_PER_SOL)),
        25000,
        'Airdrop request',
      );
      setSignature(sig);
      try {
        await withTimeout(connection.confirmTransaction(sig, 'confirmed'), 30000, 'Airdrop confirmation');
      } catch {
        // The faucet sometimes confirms after the client timeout.
      }
      toast({
        title: 'Airdrop received',
        description: `${amount} SOL added to ${shortenAddress(account.address)}.`,
        variant: 'success',
      });
      onDone?.();
    } catch (error) {
      toast({
        title: 'Airdrop failed',
        description: error?.message?.includes('timed out')
          ? 'The devnet faucet took too long. Try again shortly.'
          : 'The faucet may be rate-limited. Try again in a moment.',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="rounded-3xl border-white/[0.07] bg-card/60">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
            <Droplets size={18} />
          </div>
          <Badge tone="accent" dot>
            {config.shortName}
          </Badge>
        </div>
        <CardTitle className="pt-1 text-base">Request an airdrop</CardTitle>
        <p className="text-xs leading-relaxed text-slate-500">
          Top up your primary Solana account with free testnet SOL. Faucet limits apply.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Recipient</p>
            <p className="mt-0.5 truncate font-mono text-[11px] text-slate-300">
              {account ? shortenAddress(account.address, 8, 6) : 'No account'}
            </p>
          </div>
          {account && <CopyButton value={account.address} label="Address" />}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map(preset => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(preset)}
              className={cn(
                'rounded-xl border px-2 py-2 text-xs font-semibold transition',
                amount === preset
                  ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200'
                  : 'border-white/[0.07] bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]',
              )}
            >
              {preset} SOL
            </button>
          ))}
        </div>

        <Button className="w-full" loading={loading} onClick={requestAirdrop} disabled={!account}>
          <Sparkles size={15} />
          Request {amount} SOL
        </Button>

        {signature && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-400/15 bg-emerald-400/[0.04] px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-300/70">Last airdrop</p>
              <p className="mt-0.5 truncate font-mono text-[10px] text-emerald-200/80">{shortenAddress(signature, 10, 8)}</p>
            </div>
            <a
              href={explorerTxUrl(network, signature)}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg p-1.5 text-emerald-300 transition hover:bg-emerald-400/10"
              aria-label="View airdrop transaction"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
