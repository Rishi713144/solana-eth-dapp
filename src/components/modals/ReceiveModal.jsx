import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ExternalLink, Info, QrCode } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/copy-button';
import { AssetIcon } from '@/components/ui/asset-icon';
import { useNetwork } from '@/components/providers/NetworkProvider';
import { explorerAddressUrl } from '@/lib/rpc';
import { shortenAddress } from '@/lib/format';
import { cn } from '@/lib/utils';

export function ReceiveModal({ open, onClose, solAccounts = [], ethAccounts = [], initialChain = 'sol' }) {
  const { network, config } = useNetwork();
  const [chain, setChain] = useState(initialChain);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    setChain(initialChain);
    setIndex(0);
  }, [open, initialChain]);

  useEffect(() => {
    setIndex(0);
  }, [chain]);

  const accounts = chain === 'sol' ? solAccounts : ethAccounts;
  const account = accounts[Math.min(index, Math.max(0, accounts.length - 1))];
  const address = account?.address || '';
  const explorer = chain === 'sol'
    ? explorerAddressUrl(network, address)
    : `${config.evm.explorer}/address/${address}`;
  const networkLabel = chain === 'sol' ? config.name : config.evm.name;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Receive funds"
      description="Scan the QR code or copy your address."
      size="md"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'sol', label: 'Solana' },
            { id: 'eth', label: 'Ethereum' },
          ].map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => setChain(item.id)}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition',
                chain === item.id
                  ? 'border-primary/30 bg-primary/10 text-white'
                  : 'border-white/[0.07] bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]',
              )}
            >
              <AssetIcon chain={item.id} size="sm" className="h-6 w-6 rounded-lg text-xs" />
              {item.label}
            </button>
          ))}
        </div>

        {accounts.length > 1 && (
          <select
            value={index}
            onChange={(event) => setIndex(Number(event.target.value))}
            className="h-10 w-full appearance-none rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs text-white focus:border-primary/50 focus:outline-none"
          >
            {accounts.map(item => (
              <option key={`${chain}-${item.index}`} value={item.index} className="bg-[#0b1020]">
                Account {item.index + 1} · {shortenAddress(item.address, 6, 4)}
              </option>
            ))}
          </select>
        )}

        {address ? (
          <>
            <div className="flex justify-center">
              <div className="relative rounded-3xl border border-white/10 bg-white p-4 shadow-[0_30px_80px_-30px_rgba(124,92,255,0.7)]">
                <QRCodeSVG
                  value={address}
                  size={196}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#0b1020"
                  marginSize={0}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border-4 border-white bg-[#0b1020]">
                    <QrCode size={16} className="text-violet-300" />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge tone="warning" dot>{networkLabel}</Badge>
                  <span className="text-[10px] text-slate-500">Account {account.index + 1}</span>
                </div>
                <CopyButton value={address} label={`${chain === 'sol' ? 'Solana' : 'Ethereum'} address`} showLabel />
              </div>
              <p className="mt-3 break-all text-center font-mono text-xs leading-relaxed text-slate-300">{address}</p>
            </div>

            <div className="flex items-start gap-2 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.04] p-3">
              <Info size={14} className="mt-0.5 shrink-0 text-cyan-300" />
              <p className="text-[11px] leading-relaxed text-cyan-100/60">
                Only send {chain === 'sol' ? 'SOL and Solana assets' : 'ETH and Ethereum assets'} on {networkLabel} to this address. Sending assets from another network may result in permanent loss.
              </p>
            </div>

            <Button variant="glass" className="w-full" asChild>
              <a href={explorer} target="_blank" rel="noreferrer">
                View on explorer
                <ExternalLink size={14} />
              </a>
            </Button>
          </>
        ) : (
          <div className="py-10 text-center text-sm text-slate-500">No accounts available.</div>
        )}
      </div>
    </Modal>
  );
}
