import { useEffect, useMemo, useState } from 'react';
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { JsonRpcProvider, isAddress, parseEther } from 'ethers';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Send,
  Wallet,
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AssetIcon } from '@/components/ui/asset-icon';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/ui/copy-button';
import { useNetwork } from '@/components/providers/NetworkProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { useAddressBook } from '@/hooks/useAddressBook';
import { explorerTxUrl, withTimeout } from '@/lib/rpc';
import { formatToken, shortenAddress } from '@/lib/format';
import { cn } from '@/lib/utils';

function isValidRecipient(chain, address) {
  if (!address) return false;
  if (chain === 'eth') return isAddress(address);
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export function SendModal({ open, onClose, wallet, initialChain = 'sol', initialIndex = 0, onSuccess }) {
  const { network, config } = useNetwork();
  const { toast } = useToast();
  const { contacts } = useAddressBook();
  const [step, setStep] = useState('form');
  const [chain, setChain] = useState(initialChain);
  const [fromIndex, setFromIndex] = useState(initialIndex);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fee, setFee] = useState('');
  const [signature, setSignature] = useState('');
  const [confirmationNote, setConfirmationNote] = useState('');

  const accounts = chain === 'sol' ? wallet.solAccounts : wallet.ethAccounts;
  const balances = chain === 'sol' ? wallet.solBalances : wallet.ethBalances;
  const unit = chain === 'sol' ? 'SOL' : 'ETH';
  const selectedAccount = accounts[Math.min(fromIndex, Math.max(0, accounts.length - 1))];
  const balance = selectedAccount ? (balances[selectedAccount.address] || 0) : 0;
  const amountNumber = Number.parseFloat(amount) || 0;
  const chainContacts = useMemo(
    () => contacts.filter(contact => contact.chain === chain).slice(0, 4),
    [contacts, chain],
  );

  useEffect(() => {
    if (!open) return;
    setStep('form');
    setChain(initialChain);
    setFromIndex(initialIndex);
    setRecipient('');
    setAmount('');
    setError('');
    setLoading(false);
    setFee('');
    setSignature('');
    setConfirmationNote('');
  }, [open, initialChain, initialIndex]);

  useEffect(() => {
    setFromIndex(0);
    setAmount('');
    setError('');
  }, [chain]);

  if (!accounts.length) {
    return (
      <Modal open={open} onClose={onClose} title="Send funds" size="md">
        <div className="py-8 text-center">
          <Wallet size={28} className="mx-auto text-slate-500" />
          <p className="mt-3 text-sm font-semibold text-white">No accounts available</p>
          <p className="mt-1 text-xs text-slate-500">Create an account from the overview first.</p>
        </div>
      </Modal>
    );
  }

  function setMax() {
    const reserve = chain === 'sol' ? 0.00001 : 0.0003;
    const max = Math.max(0, balance - reserve);
    setAmount(max > 0 ? max.toFixed(chain === 'sol' ? 6 : 6) : '0');
    setError('');
  }

  async function estimateFee() {
    if (chain === 'sol') {
      setFee('~0.000005 SOL');
      return;
    }
    try {
      const provider = new JsonRpcProvider(config.evm.rpc, config.evm.chainId, { staticNetwork: true });
      const [feeData, gas] = await Promise.all([
        withTimeout(provider.getFeeData(), 10000, 'Gas estimate'),
        withTimeout(
          provider.estimateGas({ from: selectedAccount.address, to: recipient, value: parseEther(amount) }),
          10000,
          'Gas estimate',
        ).catch(() => 21000n),
      ]);
      const gasPrice = feeData.maxFeePerGas || feeData.gasPrice || 0n;
      const estimated = Number(gas * gasPrice) / 1e18;
      setFee(`~${formatToken(estimated, 6)} ETH`);
    } catch {
      setFee('Estimated at signing');
    }
  }

  async function goToReview(event) {
    event?.preventDefault();
    setError('');
    if (!isValidRecipient(chain, recipient.trim())) {
      setError(chain === 'sol' ? 'Enter a valid Solana address.' : 'Enter a valid Ethereum address.');
      return;
    }
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      setError('Enter an amount greater than zero.');
      return;
    }
    if (amountNumber > balance) {
      setError(`Insufficient balance. Available: ${formatToken(balance)} ${unit}.`);
      return;
    }
    setLoading(true);
    await estimateFee();
    setLoading(false);
    setStep('review');
  }

  async function send() {
    setLoading(true);
    setError('');
    try {
      if (chain === 'sol') {
        const connection = new Connection(config.endpoint, 'confirmed');
        const keypair = selectedAccount.keypair;
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: keypair.publicKey,
            toPubkey: new PublicKey(recipient.trim()),
            lamports: Math.floor(amountNumber * LAMPORTS_PER_SOL),
          }),
        );
        const { blockhash, lastValidBlockHeight } = await withTimeout(
          connection.getLatestBlockhash('confirmed'),
          12000,
          'Blockhash',
        );
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = keypair.publicKey;
        transaction.sign(keypair);
        const sig = await withTimeout(
          connection.sendRawTransaction(transaction.serialize(), { skipPreflight: false, maxRetries: 3 }),
          25000,
          'Broadcast',
        );
        try {
          await withTimeout(
            connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, 'confirmed'),
            45000,
            'Confirmation',
          );
        } catch {
          setConfirmationNote('Submitted. Confirmation is taking longer than usual.');
        }
        setSignature(sig);
      } else {
        const provider = new JsonRpcProvider(config.evm.rpc, config.evm.chainId, { staticNetwork: true });
        const signer = selectedAccount.wallet.connect(provider);
        const tx = await withTimeout(
          signer.sendTransaction({ to: recipient.trim(), value: parseEther(amount) }),
          30000,
          'Ethereum transaction',
        );
        setSignature(tx.hash);
        try {
          await withTimeout(tx.wait(1), 60000, 'Confirmation');
        } catch {
          setConfirmationNote('Submitted. Confirmation is taking longer than usual.');
        }
      }
      setStep('success');
      onSuccess?.(chain, fromIndex);
      toast({
        title: 'Transaction submitted',
        description: `${formatToken(amountNumber)} ${unit} sent to ${shortenAddress(recipient)}.`,
        variant: 'success',
      });
    } catch (err) {
      const message = err?.message?.includes('insufficient')
        ? 'Insufficient funds for this transaction.'
        : err?.message?.includes('timed out')
          ? err.message
          : 'Transaction failed. Check your connection and try again.';
      setError(message);
      setStep('form');
    } finally {
      setLoading(false);
    }
  }

  const explorerLink = signature
    ? chain === 'sol'
      ? explorerTxUrl(network, signature)
      : `${config.evm.explorer}/tx/${signature}`
    : '';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={step === 'success' ? 'Transaction sent' : step === 'review' ? 'Review transaction' : 'Send funds'}
      description={step === 'review' ? 'Confirm the details before signing.' : 'Transfer assets from your encrypted vault.'}
      size="md"
    >
      {step === 'form' && (
        <form onSubmit={goToReview} className="space-y-4">
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

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500" htmlFor="send-from">
              From account
            </label>
            <div className="relative">
              <select
                id="send-from"
                value={fromIndex}
                onChange={(event) => setFromIndex(Number(event.target.value))}
                className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-sm text-white focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
              >
                {accounts.map(account => (
                  <option key={`${chain}-${account.index}`} value={account.index} className="bg-[#0b1020]">
                    Account {account.index + 1} · {shortenAddress(account.address, 6, 4)} · {formatToken(balances[account.address] || 0)} {unit}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500" htmlFor="send-recipient">
              Recipient
            </label>
            <Input
              id="send-recipient"
              value={recipient}
              onChange={(event) => { setRecipient(event.target.value.trim()); setError(''); }}
              placeholder={chain === 'sol' ? 'Solana wallet address' : '0x…'}
              className="font-mono text-xs sm:text-sm"
              spellCheck={false}
              autoComplete="off"
            />
            {chainContacts.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {chainContacts.map(contact => (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => { setRecipient(contact.address); setError(''); }}
                    className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-2 py-1 text-[10px] font-medium text-slate-400 transition hover:border-primary/25 hover:text-white"
                  >
                    {contact.label} · {shortenAddress(contact.address, 3, 3)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500" htmlFor="send-amount">
                Amount
              </label>
              <span className="text-[10px] text-slate-500">Available {formatToken(balance)} {unit}</span>
            </div>
            <div className="relative">
              <Input
                id="send-amount"
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(event) => { setAmount(event.target.value); setError(''); }}
                placeholder="0.00"
                className="h-14 pr-16 text-lg font-semibold tabular-nums"
              />
              <button
                type="button"
                onClick={setMax}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-300 transition hover:bg-primary/20"
              >
                Max
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-3.5 py-2.5 text-xs font-medium text-rose-300">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="h-12 w-full" loading={loading}>
            Continue
          </Button>
        </form>
      )}

      {step === 'review' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AssetIcon chain={chain} />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">You send</p>
                  <p className="mt-0.5 font-display text-2xl font-semibold tabular-nums text-white">
                    {formatToken(amountNumber, 6)} <span className="text-base text-slate-400">{unit}</span>
                  </p>
                </div>
              </div>
              <Badge tone="warning">{config.shortName}</Badge>
            </div>
          </div>

          <div className="space-y-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-sm">
            <div className="flex items-start justify-between gap-4">
              <span className="text-slate-500">From</span>
              <span className="text-right font-mono text-xs text-slate-300">
                Account {selectedAccount.index + 1} · {shortenAddress(selectedAccount.address, 6, 6)}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-slate-500">To</span>
              <span className="break-all text-right font-mono text-xs text-slate-300">{recipient}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Network fee</span>
              <span className="text-right text-xs text-slate-300">{fee || 'Estimated at signing'}</span>
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-3.5 py-2.5 text-xs font-medium text-rose-300">
              {error}
            </p>
          )}

          <div className="flex gap-2.5">
            <Button size="lg" className="h-12 flex-1" loading={loading} onClick={send}>
              <Send size={16} />
              Confirm & send
            </Button>
            <Button size="lg" variant="ghost" className="h-12" disabled={loading} onClick={() => setStep('form')}>
              <ArrowLeft size={15} />
              Back
            </Button>
          </div>
        </div>
      )}

      {step === 'success' && (
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300 shadow-[0_20px_60px_-20px_rgba(16,185,129,0.6)]">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p className="font-display text-2xl font-semibold text-white">{formatToken(amountNumber, 6)} {unit}</p>
            <p className="mt-1 text-sm text-slate-400">sent to {shortenAddress(recipient, 6, 6)}</p>
            {confirmationNote && <p className="mt-1 text-[11px] text-amber-300/80">{confirmationNote}</p>}
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Transaction signature</p>
            <div className="mt-1.5 flex items-center justify-center gap-1">
              <span className="break-all font-mono text-[11px] text-slate-300">{shortenAddress(signature, 14, 14)}</span>
              <CopyButton value={signature} label="Signature" />
            </div>
          </div>

          <div className="flex gap-2.5">
            <Button size="lg" variant="glass" className="h-12 flex-1" onClick={onClose}>
              Done
            </Button>
            <Button size="lg" className="h-12 flex-1" asChild>
              <a href={explorerLink} target="_blank" rel="noreferrer">
                Explorer
                <ExternalLink size={14} />
              </a>
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
