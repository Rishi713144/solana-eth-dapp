import { useState } from 'react';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { CheckCircle2, PenLine, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/ui/copy-button';
import { useToast } from '@/components/providers/ToastProvider';
import { shortenAddress } from '@/lib/format';

export function SignMessageCard({ account }) {
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  async function signMessage() {
    if (!account) {
      toast({ title: 'No Solana account', variant: 'error' });
      return;
    }
    if (!message.trim()) return;
    setLoading(true);
    setSignature('');
    setVerified(false);
    try {
      const encoded = new TextEncoder().encode(message.trim());
      const sig = nacl.sign.detached(encoded, account.keypair.secretKey);
      const isValid = nacl.sign.detached.verify(encoded, sig, account.keypair.publicKey.toBytes());
      setSignature(bs58.encode(sig));
      setVerified(isValid);
      toast({
        title: isValid ? 'Message signed' : 'Signature verification failed',
        description: isValid ? 'Ownership proof generated locally.' : 'Please try again.',
        variant: isValid ? 'success' : 'error',
      });
    } catch {
      toast({ title: 'Could not sign message', variant: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="rounded-3xl border-white/[0.07] bg-card/60">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10 text-violet-300">
            <PenLine size={18} />
          </div>
          <Badge tone="primary">Off-chain</Badge>
        </div>
        <CardTitle className="pt-1 text-base">Sign a message</CardTitle>
        <p className="text-xs leading-relaxed text-slate-500">
          Prove wallet ownership without sending a transaction or paying fees.
        </p>
      </CardHeader>
      <CardContent className="space-y-3.5">
        <div>
          <textarea
            value={message}
            onChange={(event) => { setMessage(event.target.value.slice(0, 200)); setSignature(''); setVerified(false); }}
            placeholder="Enter a message to sign…"
            className="min-h-[88px] w-full resize-none rounded-xl border border-white/10 bg-white/[0.035] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-600">
            <span>{account ? `Signing as ${shortenAddress(account.address, 5, 4)}` : 'No account selected'}</span>
            <span>{message.length}/200</span>
          </div>
        </div>

        <Button className="w-full" variant="glass" loading={loading} onClick={signMessage} disabled={!message.trim() || !account}>
          <ShieldCheck size={15} />
          Sign message
        </Button>

        {signature && (
          <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.04] p-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-300/80">
                <CheckCircle2 size={12} />
                {verified ? 'Verified signature' : 'Signature'}
              </span>
              <CopyButton value={signature} label="Signature" />
            </div>
            <p className="mt-1 break-all font-mono text-[10px] leading-relaxed text-emerald-100/60">{signature}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
