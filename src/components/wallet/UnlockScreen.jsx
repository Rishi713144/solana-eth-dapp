import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Fingerprint, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export function UnlockScreen({ onUnlock, onReset, createdLabel }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!password) {
      setError('Enter your vault password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const ok = await onUnlock(password);
      if (!ok) {
        setAttempts(value => value + 1);
        setError('Incorrect password. Please try again.');
        setLoading(false);
      }
    } catch {
      setError('Could not unlock your vault. Try again.');
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-5 pb-16 pt-24 sm:px-8">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-violet-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-cyan-500/10 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.2, 0.65, 0.3, 0.9] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-7 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/20 to-cyan-400/10 text-violet-200 shadow-glow">
            <LockKeyhole size={28} />
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-400">Unlock your encrypted Vela vault to continue.</p>
        </div>

        <Card className="rounded-3xl border-white/10 bg-[#0a0f1e]/85 p-6 shadow-[0_50px_140px_-60px_rgba(124,92,255,0.65)] sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500" htmlFor="unlock-password">
                  Vault password
                </label>
                {attempts > 0 && (
                  <span className="text-[10px] font-medium text-slate-500">{attempts} failed attempt{attempts > 1 ? 's' : ''}</span>
                )}
              </div>
              <div className="relative">
                <Input
                  id="unlock-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => { setPassword(event.target.value); setError(''); }}
                  placeholder="Enter your password"
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
            </div>

            {error && (
              <p className="rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-3.5 py-2.5 text-xs font-medium text-rose-300">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="h-12 w-full" loading={loading} disabled={!password}>
              <Fingerprint size={17} />
              Unlock wallet
            </Button>
          </form>

          <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck size={13} className="text-emerald-400" />
            Local-only decryption
            {createdLabel && <span className="text-slate-600">· {createdLabel}</span>}
          </div>

          <div className="mt-5 border-t border-white/5 pt-4 text-center">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-rose-300"
            >
              <KeyRound size={12} />
              Forgot password? Reset wallet
            </button>
          </div>
        </Card>

        <div className="mt-5 flex justify-center">
          <Badge tone="primary" dot>Encrypted on this device</Badge>
        </div>
      </motion.div>
    </div>
  );
}
