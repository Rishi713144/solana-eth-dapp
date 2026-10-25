import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Check, Download, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/providers/ToastProvider';
import { copyToClipboard } from '@/components/ui/copy-button';

export function MnemonicScreen({ mnemonic, onComplete, onBack }) {
  const [revealed, setRevealed] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const { toast } = useToast();
  const words = mnemonic.split(' ');

  async function copyPhrase() {
    const ok = await copyToClipboard(mnemonic);
    toast(ok
      ? { title: 'Recovery phrase copied', description: 'Clear your clipboard after storing it offline and privately.', variant: 'warning' }
      : { title: 'Could not copy phrase', variant: 'error' });
  }

  function downloadBackup() {
    try {
      const header = [
        'VELA WALLET RECOVERY PHRASE',
        'Keep this file offline and private.',
        'Anyone with these words controls your wallet.',
        '',
      ].join('\n');
      const blob = new Blob([`${header}${mnemonic}\n`], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vela-recovery-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: 'Backup downloaded', description: 'Store it offline and privately.', variant: 'success' });
    } catch {
      toast({ title: 'Could not download backup', variant: 'error' });
    }
  }

  return (
    <div className="relative min-h-screen px-5 pb-16 pt-28 sm:px-8">
      <div className="pointer-events-none absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-600/15 blur-[120px]" />
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mx-auto max-w-3xl"
      >
        <div className="mb-7 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-violet-300">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">Back up your vault</h1>
              <p className="mt-1 text-sm text-slate-400">These words are the only way to recover your wallet.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs font-medium text-slate-500 transition hover:text-white"
          >
            Start over
          </button>
        </div>

        <Card className="overflow-hidden rounded-3xl border-white/10 bg-[#0a0f1e]/85">
          <div className="flex items-start gap-3 border-b border-amber-400/10 bg-amber-400/[0.05] px-5 py-3.5 sm:px-6">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-300" />
            <p className="text-xs leading-relaxed text-amber-200/75">
              Never share this phrase. Vela support will never ask for it. Anyone who has it can drain your accounts.
            </p>
          </div>

          <div className="p-5 sm:p-6">
            <div className="relative">
              <div className={`grid grid-cols-2 gap-2.5 sm:grid-cols-3 ${revealed ? '' : 'select-none'}`}>
                {words.map((word, index) => (
                  <div
                    key={`${word}-${index}`}
                    className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-2.5"
                  >
                    <span className="w-5 shrink-0 text-right text-[10px] font-bold tabular-nums text-slate-600">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className={`text-sm font-semibold text-white transition-all duration-300 ${revealed ? '' : 'blur-[7px]'}`}>
                      {word}
                    </span>
                  </div>
                ))}
              </div>

              {!revealed && (
                <button
                  type="button"
                  onClick={() => setRevealed(true)}
                  className="absolute inset-0 flex items-center justify-center rounded-xl bg-[#0a0f1e]/35 backdrop-blur-[2px]"
                >
                  <span className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs font-semibold text-white shadow-xl transition hover:bg-black/55">
                    <Eye size={14} className="text-violet-300" />
                    Tap to reveal phrase
                  </span>
                </button>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button size="sm" variant="glass" onClick={() => setRevealed(value => !value)}>
                {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
                {revealed ? 'Hide words' : 'Reveal words'}
              </Button>
              <Button size="sm" variant="glass" onClick={copyPhrase}>
                <Check size={14} />
                Copy
              </Button>
              <Button size="sm" variant="glass" onClick={downloadBackup}>
                <Download size={14} />
                Download backup
              </Button>
            </div>

            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition hover:border-white/15 hover:bg-white/[0.04]">
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${confirmed ? 'border-emerald-400/40 bg-emerald-400/20 text-emerald-300' : 'border-white/15 bg-white/[0.03] text-transparent'}`}>
                <Check size={13} />
              </span>
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
                className="sr-only"
              />
              <span className="text-sm leading-relaxed text-slate-300">
                I have written down or downloaded my recovery phrase and understand it cannot be recovered if lost.
              </span>
            </label>

            <Button
              size="lg"
              className="mt-5 h-12 w-full"
              disabled={!confirmed}
              onClick={onComplete}
            >
              Continue to secure vault
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
