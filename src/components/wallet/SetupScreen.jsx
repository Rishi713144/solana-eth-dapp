import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { validateMnemonic } from 'bip39';
import {
  ArrowRight,
  Download,
  Fingerprint,
  KeyRound,
  Layers,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brand } from '@/components/layout/Brand';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Encrypted by default',
    description: 'Your recovery phrase is sealed with AES-256-GCM and never leaves this device.',
  },
  {
    icon: Layers,
    title: 'Solana + Ethereum',
    description: 'One seed phrase derives accounts across both ecosystems in a single vault.',
  },
  {
    icon: Fingerprint,
    title: 'You hold the keys',
    description: 'Non-custodial, no sign-up, no tracking. Vela never sees your secret.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.2, 0.65, 0.3, 0.9] } },
};

export function SetupScreen({ onCreateWallet, onImportWallet, legacyMnemonic, onMigrateLegacy }) {
  const [mode, setMode] = useState('choose');
  const [phrase, setPhrase] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const words = phrase.trim() ? phrase.trim().split(/\s+/).filter(Boolean) : [];

  function handleImport() {
    setError('');
    const clean = phrase.trim().toLowerCase().replace(/\s+/g, ' ');
    const count = clean ? clean.split(' ').length : 0;
    if (![12, 15, 18, 21, 24].includes(count)) {
      setError('Enter a valid recovery phrase of 12–24 words.');
      return;
    }
    if (!validateMnemonic(clean)) {
      setError('That recovery phrase is not valid. Check the spelling and word order.');
      return;
    }
    setLoading(true);
    onImportWallet(clean);
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -left-40 top-16 h-[28rem] w-[28rem] rounded-full bg-violet-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[26rem] w-[26rem] rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-[100px]" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-5 pb-16 pt-28 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pt-24">
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-xl"
        >
          <motion.div variants={itemVariants}>
            <Badge tone="primary" dot className="mb-6">Self-custodial · Multichain</Badge>
          </motion.div>
          <motion.h1 variants={itemVariants} className="font-display text-5xl font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
            Your keys.
            <br />
            <span className="text-gradient">Every chain.</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="mt-6 max-w-lg text-base leading-relaxed text-slate-400 sm:text-lg">
            A beautifully simple wallet for Solana and Ethereum. Create an encrypted vault in seconds and move across chains without switching apps.
          </motion.p>
          <motion.p variants={itemVariants} className="mt-4 max-w-lg rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-3.5 py-2.5 text-xs leading-relaxed text-amber-200/80">
            Experimental software for Devnet, Testnet, and Sepolia only. Do not use real funds. This project is unaudited and provides no production security guarantee.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-10 space-y-4">
            {FEATURES.map(feature => (
              <div key={feature.title} className="flex items-start gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-violet-300">
                  <feature.icon size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{feature.title}</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-slate-500">{feature.description}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="mt-10 flex flex-wrap items-center gap-2">
            <Badge tone="warning">Devnet ready</Badge>
            <Badge tone="accent">Solana</Badge>
            <Badge tone="primary">Ethereum</Badge>
            <span className="ml-1 flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <Sparkles size={12} className="text-violet-300" />
              No sign-up required
            </span>
          </motion.div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.18, duration: 0.55, ease: [0.2, 0.65, 0.3, 0.9] }}
        >
          <Card className="relative overflow-hidden rounded-3xl border-white/10 bg-[#0a0f1e]/85 p-1.5 shadow-[0_50px_140px_-60px_rgba(124,92,255,0.7)]">
            <div className="rounded-[calc(1.5rem-0.375rem)] border border-white/[0.05] bg-gradient-to-b from-white/[0.045] to-transparent p-6 sm:p-8">
              <div className="mb-7 flex items-center justify-between">
                <Brand compact subtitle={null} />
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Vault setup</span>
              </div>

              <AnimatePresence mode="wait">
                {mode === 'choose' ? (
                  <motion.div
                    key="choose"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    className="space-y-5"
                  >
                    <div>
                      <h2 className="font-display text-2xl font-semibold text-white">Get started</h2>
                      <p className="mt-1 text-sm text-slate-400">Create a new vault or bring an existing wallet.</p>
                    </div>

                    {legacyMnemonic && (
                      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-amber-300">
                            <ShieldCheck size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-amber-200">Saved wallet detected</p>
                            <p className="mt-0.5 text-xs leading-relaxed text-amber-200/60">
                              Your old wallet is stored without encryption. Set a password to encrypt it now.
                            </p>
                            <Button size="sm" variant="outline" className="mt-3 border-amber-400/25 text-amber-200 hover:bg-amber-400/10" onClick={() => onMigrateLegacy?.(legacyMnemonic)}>
                              Encrypt existing wallet
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button size="lg" className="h-14 w-full" onClick={onCreateWallet}>
                      <WalletCards size={18} />
                      Create new wallet
                    </Button>
                    <Button size="lg" variant="secondary" className="h-14 w-full" onClick={() => setMode('import')}>
                      <Download size={18} />
                      Import recovery phrase
                    </Button>

                    <p className="pt-1 text-center text-[11px] leading-relaxed text-slate-500">
                      By continuing you agree that Vela is non-custodial software. You are solely responsible for your recovery phrase.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="import"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    className="space-y-4"
                  >
                    <div>
                      <h2 className="font-display text-2xl font-semibold text-white">Import wallet</h2>
                      <p className="mt-1 text-sm text-slate-400">Paste your 12–24 word recovery phrase.</p>
                    </div>

                    <div className="relative">
                      <textarea
                        value={phrase}
                        onChange={(event) => {
                          setPhrase(event.target.value.toLowerCase());
                          setError('');
                        }}
                        placeholder="word one word two word three…"
                        spellCheck={false}
                        autoCorrect="off"
                        autoCapitalize="off"
                        className="thin-scrollbar min-h-[132px] w-full resize-none rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3.5 font-mono text-sm leading-relaxed text-white placeholder:text-slate-600 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
                      />
                      <div className="absolute bottom-3 right-3 rounded-lg bg-black/30 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                        {words.length} words
                      </div>
                    </div>

                    {error && (
                      <p className="rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-3.5 py-2.5 text-xs font-medium text-rose-300">
                        {error}
                      </p>
                    )}

                    <div className="flex gap-2.5 pt-1">
                      <Button size="lg" className="h-12 flex-1" loading={loading} onClick={handleImport}>
                        Import wallet
                      </Button>
                      <Button size="lg" variant="ghost" className="h-12" onClick={() => { setMode('choose'); setError(''); }}>
                        Back
                      </Button>
                    </div>

                    <div className="flex items-start gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
                      <KeyRound size={14} className="mt-0.5 shrink-0 text-slate-500" />
                      <p className="text-[11px] leading-relaxed text-slate-500">
                        Vela derives accounts locally. Your phrase is passed directly into the encrypted vault.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>

          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ArrowRight size={12} />
            No servers. No custody. No compromise.
          </div>
        </motion.section>
      </div>
    </div>
  );
}
