import { useEffect, useState } from 'react';
import { AlertTriangle, Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CopyButton } from '@/components/ui/copy-button';
import { useToast } from '@/components/providers/ToastProvider';
import { verifyVaultPassword } from '@/utils/secureStorage';

export function RecoveryModal({ open, onClose, mnemonic }) {
  const { toast } = useToast();
  const [step, setStep] = useState('auth');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep('auth');
    setPassword('');
    setShowPassword(false);
    setRevealed(false);
    setError('');
    setLoading(false);
  }, [open]);

  async function authenticate(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const ok = await verifyVaultPassword(password);
    setLoading(false);
    if (!ok) {
      setError('Incorrect password.');
      return;
    }
    setStep('reveal');
    toast({ title: 'Vault verified', description: 'Keep this phrase offline and private.', variant: 'warning' });
  }

  const words = mnemonic ? mnemonic.split(' ') : [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={step === 'auth' ? 'Reveal recovery phrase' : 'Recovery phrase'}
      description={step === 'auth' ? 'Re-enter your vault password to continue.' : 'Anyone with these words controls your wallet.'}
      size="md"
    >
      {step === 'auth' ? (
        <form onSubmit={authenticate} className="space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-300">
            <KeyRound size={24} />
          </div>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(event) => { setPassword(event.target.value); setError(''); }}
              placeholder="Vault password"
              className="pr-11"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(value => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 transition hover:text-white"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && (
            <p className="rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-3.5 py-2.5 text-xs font-medium text-rose-300">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" className="h-12 w-full" loading={loading} disabled={!password}>
            <ShieldCheck size={16} />
            Verify & reveal
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-400/20 bg-amber-400/[0.05] p-3">
            <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-300" />
            <p className="text-[11px] leading-relaxed text-amber-200/70">
              Never share this phrase. Vela support will never ask for it. Store it offline.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {words.map((word, index) => (
              <div key={`${word}-${index}`} className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-2.5 py-2">
                <span className="w-4 shrink-0 text-right text-[9px] font-bold tabular-nums text-slate-600">{index + 1}</span>
                <span className={`text-xs font-semibold text-white transition ${revealed ? '' : 'blur-[6px]'}`}>{word}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="glass" onClick={() => setRevealed(value => !value)}>
              {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
              {revealed ? 'Hide' : 'Reveal'}
            </Button>
            <CopyButton value={mnemonic} label="Recovery phrase" showLabel className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5" />
            <Button size="sm" variant="ghost" className="ml-auto" onClick={onClose}>Done</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
