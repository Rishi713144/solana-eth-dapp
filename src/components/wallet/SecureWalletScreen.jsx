import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Eye, EyeOff, LockKeyhole, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

function evaluatePassword(password) {
  const checks = [
    { id: 'length', label: 'At least 8 characters', ok: password.length >= 8 },
    { id: 'case', label: 'Upper & lowercase', ok: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { id: 'number', label: 'One number', ok: /\d/.test(password) },
    { id: 'symbol', label: 'One symbol', ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(check => check.ok).length;
  return { checks, score };
}

export function SecureWalletScreen({ onSecure, onBack, migrating = false }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { checks, score } = useMemo(() => evaluatePassword(password), [password]);

  const canSubmit = score >= 3 && password.length >= 8 && password === confirm;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Use at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await onSecure(password);
    } catch (err) {
      setError(err?.message || 'Could not create your vault. Try again.');
      setLoading(false);
    }
  }

  const strengthLabel = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'][score] || 'Very weak';
  const strengthColor = score <= 1 ? 'bg-rose-500' : score === 2 ? 'bg-amber-500' : score === 3 ? 'bg-cyan-500' : 'bg-emerald-500';

  return (
    <div className="relative min-h-screen px-5 pb-16 pt-28 sm:px-8">
      <div className="pointer-events-none absolute left-1/2 top-28 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-600/15 blur-[120px]" />
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mx-auto max-w-lg"
      >
        <div className="mb-7 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-violet-300">
            <LockKeyhole size={22} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">
              {migrating ? 'Encrypt your wallet' : 'Encrypt your vault'}
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              {migrating ? 'Set a password to encrypt your existing wallet.' : 'Choose a password to encrypt your recovery phrase on this device.'}
            </p>
          </div>
        </div>

        <Card className="rounded-3xl border-white/10 bg-[#0a0f1e]/85 p-6 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500" htmlFor="vault-password">
                Vault password
              </label>
              <div className="relative">
                <Input
                  id="vault-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => { setPassword(event.target.value); setError(''); }}
                  placeholder="Enter a strong password"
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

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500" htmlFor="vault-confirm">
                Confirm password
              </label>
              <Input
                id="vault-confirm"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirm}
                onChange={(event) => { setConfirm(event.target.value); setError(''); }}
                placeholder="Repeat your password"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500">Password strength</span>
                <span className={`text-[11px] font-semibold ${score >= 3 ? 'text-emerald-300' : 'text-amber-300'}`}>{strengthLabel}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <div className={`h-full rounded-full transition-all duration-300 ${strengthColor}`} style={{ width: `${Math.max(8, (score / 4) * 100)}%` }} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {checks.map(check => (
                  <div key={check.id} className={`flex items-center gap-1.5 text-[11px] ${check.ok ? 'text-emerald-300' : 'text-slate-500'}`}>
                    {check.ok ? <Check size={12} /> : <X size={12} />}
                    {check.label}
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <p className="rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-3.5 py-2.5 text-xs font-medium text-rose-300">
                {error}
              </p>
            )}

            <div className="flex items-start gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-400" />
              <p className="text-[11px] leading-relaxed text-slate-500">
                AES-256-GCM with PBKDF2 key stretching. Your password never leaves this browser and cannot be recovered.
              </p>
            </div>

            <div className="flex gap-2.5">
              <Button type="submit" size="lg" className="h-12 flex-1" loading={loading} disabled={!canSubmit}>
                {migrating ? 'Encrypt wallet' : 'Create encrypted vault'}
              </Button>
              {onBack && (
                <Button type="button" size="lg" variant="ghost" className="h-12" onClick={onBack}>
                  <ArrowLeft size={16} />
                  Back
                </Button>
              )}
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
