import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { validateMnemonic } from 'bip39';
import {
  ArrowUpRight,
  ChevronDown,
  ChevronsRight,
  Globe,
  Home,
  KeyRound,
  Lock,
  Plus,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react';
import { Brand } from '@/components/layout/Brand';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import {
  ChromeCoin3D,
  ChromeFlower3D,
  ChromeShield3D,
  TokenBadge,
} from './HeroVisuals';

// Curated high-res portraits for the hero cards and avatar stack
const IMAGES = {
  womanWithCard:
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
  manSmiling:
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
  avatar1:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
  avatar2:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
  avatar3:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80',
  avatarSeller:
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=80&h=80&q=80',
  avatarBuyer:
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&h=80&q=80',
};

export function SetupScreen({
  onCreateWallet,
  onImportWallet,
  legacyMnemonic,
  onMigrateLegacy,
}) {
  const [importOpen, setImportOpen] = useState(false);
  const [infoModal, setInfoModal] = useState(null);
  const [phrase, setPhrase] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [swiped, setSwiped] = useState(false);

  const words = phrase.trim() ? phrase.trim().split(/\s+/).filter(Boolean) : [];

  function handleImportSubmit() {
    setError('');
    const clean = phrase.trim().toLowerCase().replace(/\s+/g, ' ');
    const count = clean ? clean.split(' ').length : 0;
    if (![12, 15, 18, 21, 24].includes(count)) {
      setError('Enter a valid recovery phrase of 12–24 words.');
      return;
    }
    if (!validateMnemonic(clean)) {
      setError('That recovery phrase is not valid. Check spelling and word order.');
      return;
    }
    setLoading(true);
    onImportWallet(clean);
  }

  function handleSwipeToFund() {
    setSwiped(true);
    setTimeout(() => {
      onCreateWallet();
    }, 450);
  }

  return (
    <div className="relative min-h-screen px-3 py-3 sm:px-6 sm:py-6 lg:px-8">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-48 -top-32 h-[34rem] w-[34rem] rounded-full bg-blue-600/15 blur-[140px]" />
        <div className="absolute -right-40 top-1/4 h-[32rem] w-[32rem] rounded-full bg-cyan-500/15 blur-[140px]" />
        <div className="absolute bottom-10 left-1/3 h-[30rem] w-[30rem] rounded-full bg-indigo-600/15 blur-[140px]" />
      </div>

      {/* Main Framed Hero Canvas replicating the reference layout */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] }}
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.25rem] border border-blue-200/60 bg-gradient-to-b from-[#f3f7fd] via-[#f8fbff] to-[#ebf3fc] shadow-[0_30px_100px_-20px_rgba(30,58,138,0.25)] text-slate-900 sm:rounded-[2.75rem]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 14% 12%, rgba(56, 189, 248, 0.14), transparent 40%),
            radial-gradient(circle at 86% 14%, rgba(59, 130, 246, 0.14), transparent 42%),
            radial-gradient(circle at 50% 95%, rgba(37, 99, 235, 0.08), transparent 50%)
          `,
        }}
      >
        {/* Top Header / Pill Navbar */}
        <header className="relative z-30 flex items-center justify-between px-6 pt-6 sm:px-10 sm:pt-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <Brand compact subtitle={null} className="scale-105" />
          </div>

          {/* Center Floating Dark Pill Navigation */}
          <nav className="hidden items-center gap-1 rounded-full bg-[#111318] px-2 py-1.5 shadow-xl sm:flex">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-white/25"
            >
              <Home size={12} className="text-white" />
              Home
            </button>
            <button
              type="button"
              onClick={() => setInfoModal('features')}
              className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-slate-300 transition hover:text-white"
            >
              Features
              <ChevronDown size={12} className="text-slate-400" />
            </button>
            <button
              type="button"
              onClick={() => setInfoModal('networks')}
              className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-slate-300 transition hover:text-white"
            >
              Networks
              <ChevronDown size={12} className="text-slate-400" />
            </button>
            <button
              type="button"
              onClick={() => setInfoModal('security')}
              className="px-3 py-1 text-xs font-medium text-slate-300 transition hover:text-white"
            >
              Security
            </button>
            <button
              type="button"
              onClick={() => setInfoModal('docs')}
              className="px-3 py-1 text-xs font-medium text-slate-300 transition hover:text-white"
            >
              Docs
            </button>
          </nav>

          {/* Right Network & CTA Pill */}
          <div className="flex items-center gap-2.5">
            <div className="hidden items-center gap-1.5 rounded-full border border-blue-200/80 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm sm:flex">
              <Globe size={13} className="text-blue-500" />
              <span>Devnet / Sepolia</span>
            </div>

            <button
              type="button"
              onClick={onCreateWallet}
              className="group flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 sm:px-5 sm:py-2.5"
            >
              <span>Create Wallet</span>
              <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </header>

        {/* Hero Content Section */}
        <div className="relative z-20 px-6 pb-12 pt-8 sm:px-10 sm:pt-12 lg:px-14">
          {/* Social Proof Pill Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-blue-200/80 bg-white/85 px-4 py-1.5 shadow-sm backdrop-blur-md">
              <span className="text-xs font-medium text-slate-600">
                <span className="mr-1 text-rose-500">❤️</span> Loved by 100K+ people worldwide
              </span>
              <div className="flex -space-x-2">
                <img src={IMAGES.avatar1} alt="User" className="h-6 w-6 rounded-full border-2 border-white object-cover" />
                <img src={IMAGES.avatar2} alt="User" className="h-6 w-6 rounded-full border-2 border-white object-cover" />
                <img src={IMAGES.avatar3} alt="User" className="h-6 w-6 rounded-full border-2 border-white object-cover" />
              </div>
            </div>
          </div>

          {/* Main Title & Subtitle */}
          <div className="mt-5 text-center">
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Your Crypto.{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                One Simple App.
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Manage your crypto, pay with card, and earn yield — without the complexity.
            </p>
          </div>

          {/* Action Pill Buttons */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onCreateWallet}
              className="rounded-full bg-[#111318] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98]"
            >
              Open account
            </button>
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="rounded-full border border-slate-300/90 bg-white/80 px-7 py-3 text-sm font-semibold text-slate-800 shadow-sm transition-all hover:bg-white hover:scale-[1.02] active:scale-[0.98]"
            >
              Learn more
            </button>
          </div>

          {/* Legacy Mnemonic Warning if unencrypted seed is present */}
          {legacyMnemonic && (
            <div className="mx-auto mt-6 max-w-lg rounded-2xl border border-amber-400/30 bg-amber-50/90 p-3.5 shadow-sm backdrop-blur-md">
              <div className="flex items-center justify-between gap-3 text-xs text-amber-900">
                <span className="font-medium">⚠️ Unencrypted wallet detected on this browser.</span>
                <button
                  type="button"
                  onClick={() => onMigrateLegacy?.(legacyMnemonic)}
                  className="rounded-lg bg-amber-500 px-3 py-1 font-semibold text-white shadow-sm transition hover:bg-amber-600"
                >
                  Encrypt now →
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* THE 4-COLUMN STAGGERED BENTO GRID                         */}
          {/* Exactly replicates the reference layout in a blue palette */}
          {/* ========================================================= */}
          <div className="relative mt-12 grid grid-cols-1 items-end gap-5 sm:mt-16 md:grid-cols-2 lg:grid-cols-4">
            {/* 3D Chrome Floating Flower on the left flank */}
            <div className="pointer-events-none absolute -left-5 top-1/2 hidden -translate-y-1/2 lg:block z-30">
              <ChromeFlower3D className="h-20 w-20 transform -rotate-12 transition-transform hover:rotate-6" />
            </div>

            {/* ---------------------------------------------------- */}
            {/* COLUMN 1: "No hidden fees" card + Woman with card    */}
            {/* ---------------------------------------------------- */}
            <div className="flex flex-col gap-5">
              {/* Top Mini Card: No hidden fees */}
              <div className="relative flex h-[120px] flex-col justify-between overflow-hidden rounded-3xl border border-sky-200/80 bg-gradient-to-br from-sky-100/90 via-blue-50/80 to-cyan-100/90 p-5 shadow-sm">
                <div>
                  <h3 className="font-display text-lg font-bold tracking-tight text-slate-900">
                    No hidden fees
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-600">0% protocol markup on swaps</p>
                </div>
                {/* 3D Metallic Sphere Coin hovering */}
                <div className="absolute -bottom-2 -right-2">
                  <ChromeCoin3D symbol="$" className="h-14 w-14" />
                </div>
              </div>

              {/* Bottom Card: Woman with card/phone & Swipe to Fund */}
              <div className="group relative h-[280px] overflow-hidden rounded-3xl border border-white/50 shadow-md">
                <img
                  src={IMAGES.womanWithCard}
                  alt="Vela user"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                {/* Glass "Swipe to Fund" Pill Button */}
                <div className="absolute inset-x-4 bottom-4">
                  <button
                    type="button"
                    onClick={handleSwipeToFund}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-3 text-xs font-semibold tracking-wider text-white shadow-xl backdrop-blur-md transition-all hover:bg-black/60 active:scale-95"
                  >
                    <ChevronsRight size={16} className={`text-cyan-400 transition-transform ${swiped ? 'translate-x-6' : ''}`} />
                    <span>{swiped ? 'CREATING VAULT…' : 'SWIPE TO FUND'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* COLUMN 2: Tall Dark Card: "Buy, Sell & Swap"         */}
            {/* ---------------------------------------------------- */}
            <div className="relative flex h-[415px] flex-col justify-between overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-b from-[#131b36] via-[#0f172a] to-[#090d18] p-6 text-white shadow-xl">
              <div>
                <h3 className="font-display text-xl font-bold tracking-tight text-white">
                  Buy, Sell & Swap
                </h3>
                <p className="mt-1 text-xs text-slate-400">Instant multi-chain liquidity</p>

                {/* Token Badges Row */}
                <div className="mt-5 flex items-center gap-2">
                  <TokenBadge symbol="SOL" size={28} />
                  <TokenBadge symbol="ETH" size={28} />
                  <TokenBadge symbol="USDC" size={28} />
                  <span className="flex h-7 items-center rounded-full border border-white/10 bg-white/10 px-2 text-[10px] font-semibold text-slate-300">
                    +100
                  </span>
                </div>
              </div>

              {/* 3D Geometric Watermark / Stylized Compass in Blue */}
              <div className="relative my-auto flex items-center justify-center py-6 opacity-30">
                <svg viewBox="0 0 200 200" className="h-44 w-44 text-blue-400" fill="currentColor">
                  <path d="M100 0 L115 85 L200 100 L115 115 L100 200 L85 115 L0 100 L85 85 Z" />
                </svg>
                <div className="absolute h-24 w-24 rounded-full bg-blue-500/20 blur-xl" />
              </div>

              {/* Sub-label */}
              <div className="flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-slate-400">
                <span>Solana & Ethereum</span>
                <span className="font-mono text-cyan-400">&lt; 1.2s</span>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* COLUMN 3: The Tallest Hero Card: Man Smiling + ETH   */}
            {/* ---------------------------------------------------- */}
            <div className="group relative flex h-[460px] flex-col justify-end overflow-hidden rounded-3xl border border-white/50 shadow-2xl">
              <img
                src={IMAGES.manSmiling}
                alt="Happy crypto user"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

              {/* Dark Glassmorphic Crypto Balance Overlay */}
              <div className="relative z-10 mx-3 mb-3 rounded-2xl border border-white/15 bg-slate-950/80 p-4 text-white shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TokenBadge symbol="ETH" size={24} />
                    <span className="text-sm font-semibold text-white">ETH</span>
                  </div>
                  <button
                    type="button"
                    onClick={onCreateWallet}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-900 transition hover:bg-slate-200"
                    aria-label="Add funds"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Ethereum</span>
                    <p className="text-[10px] text-emerald-400">+4.8% (24h)</p>
                  </div>
                  <span className="font-mono text-base font-bold text-white sm:text-lg">
                    $32,831.69
                  </span>
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* COLUMN 4: "24/7 protection" + "Send money in seconds"*/}
            {/* ---------------------------------------------------- */}
            <div className="relative flex flex-col gap-5">
              {/* Floating 3D metallic coin hovering top-right */}
              <div className="pointer-events-none absolute -right-3 -top-6 hidden sm:block z-30">
                <ChromeCoin3D symbol="ETH" className="h-14 w-14" />
              </div>

              {/* Top Mini Card: 24/7 protection */}
              <div className="relative flex h-[120px] flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm">
                <div>
                  <h3 className="font-display text-lg font-bold tracking-tight text-slate-900">
                    24/7 protection
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">Sealed with AES-256-GCM</p>
                </div>
                <div className="absolute -bottom-1 right-2">
                  <ChromeShield3D className="h-12 w-12" />
                </div>
              </div>

              {/* Bottom Card: Send money in seconds with chat/transfer pills */}
              <div className="relative flex h-[280px] flex-col justify-between overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 p-5 text-white shadow-xl">
                <div>
                  <h3 className="font-display text-lg font-bold tracking-tight text-white">
                    Send money in seconds
                  </h3>
                  <p className="mt-0.5 text-xs text-blue-100">Zero-lag cross-chain settlement</p>
                </div>

                {/* Transfer Bubble Notification Pills */}
                <div className="space-y-2.5">
                  {/* Bubble 1: Seller with BTC */}
                  <div className="flex items-center justify-between rounded-2xl border border-white/20 bg-white/20 p-2.5 shadow-sm backdrop-blur-md">
                    <div className="flex items-center gap-2">
                      <img
                        src={IMAGES.avatarSeller}
                        alt="Seller"
                        className="h-7 w-7 rounded-full border border-white/30 object-cover"
                      />
                      <span className="text-xs font-semibold text-white">Seller ↑</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-200">
                      <span>BTC</span>
                      <TokenBadge symbol="BTC" size={16} />
                    </div>
                  </div>

                  {/* Bubble 2: Buyer with OKX */}
                  <div className="flex items-center justify-between rounded-2xl border border-white/20 bg-white/20 p-2.5 shadow-sm backdrop-blur-md">
                    <div className="flex items-center gap-2">
                      <img
                        src={IMAGES.avatarBuyer}
                        alt="Buyer"
                        className="h-7 w-7 rounded-full border border-white/30 object-cover"
                      />
                      <span className="text-xs font-semibold text-white">Buyer ↓</span>
                    </div>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white">
                      OKX Verified
                    </span>
                  </div>
                </div>

                {/* Floating Bitcoin icon badge bottom right */}
                <div className="absolute -bottom-2 -right-2 opacity-30">
                  <TokenBadge symbol="BTC" size={44} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ========================================================= */}
      {/* IMPORT RECOVERY PHRASE MODAL                              */}
      {/* ========================================================= */}
      <Modal
        open={importOpen}
        onClose={() => {
          setImportOpen(false);
          setError('');
        }}
        title="Import recovery phrase"
        description="Paste your 12–24 word phrase to restore your Solana and Ethereum accounts."
      >
        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={phrase}
              onChange={(e) => {
                setPhrase(e.target.value.toLowerCase());
                setError('');
              }}
              placeholder="word one word two word three…"
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              className="min-h-[140px] w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] p-4 font-mono text-sm leading-relaxed text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20"
            />
            <div className="absolute bottom-3 right-3 rounded-lg bg-black/40 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              {words.length} words
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-xs font-medium text-rose-300">
              {error}
            </p>
          )}

          <div className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-slate-400">
            <KeyRound size={15} className="mt-0.5 shrink-0 text-blue-400" />
            <span>Vela derives accounts locally. Your seed never leaves your device.</span>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              size="lg"
              className="h-12 flex-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold"
              loading={loading}
              onClick={handleImportSubmit}
            >
              Import wallet
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="h-12 rounded-full"
              onClick={() => {
                setImportOpen(false);
                setError('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================= */}
      {/* FEATURE INFO MODALS FOR NAV LINKS                         */}
      {/* ========================================================= */}
      <Modal
        open={Boolean(infoModal)}
        onClose={() => setInfoModal(null)}
        title={
          infoModal === 'features'
            ? 'Vela Vault Features'
            : infoModal === 'networks'
              ? 'Supported Networks'
              : infoModal === 'security'
                ? 'Security Architecture'
                : 'Documentation & Guides'
        }
        description="Everything you need to know about your self-custodial multichain wallet."
      >
        <div className="space-y-3.5 text-sm text-slate-300">
          {infoModal === 'features' && (
            <>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                <p className="font-semibold text-white">Dual-Chain Vault</p>
                <p className="mt-1 text-xs text-slate-400">Derive both Solana and Ethereum accounts from a single BIP-39 recovery phrase without switching extensions.</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                <p className="font-semibold text-white">Automated Faucets & Airdrops</p>
                <p className="mt-1 text-xs text-slate-400">Request Devnet SOL and Sepolia ETH in one click to test dApps and smart contracts risk-free.</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                <p className="font-semibold text-white">Address Book & Signing</p>
                <p className="mt-1 text-xs text-slate-400">Save contacts across chains and cryptographically sign custom hex/utf-8 messages.</p>
              </div>
            </>
          )}

          {infoModal === 'networks' && (
            <>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                <p className="font-semibold text-cyan-400">Solana Devnet & Mainnet</p>
                <p className="mt-1 text-xs text-slate-400">High speed, sub-cent fees, native SPL tokens, and wallet-adapter support.</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                <p className="font-semibold text-indigo-400">Ethereum Sepolia & Mainnet</p>
                <p className="mt-1 text-xs text-slate-400">Full EVM support via Ethers.js, ERC-20 standard balances, and gas estimation.</p>
              </div>
            </>
          )}

          {infoModal === 'security' && (
            <>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                <p className="font-semibold text-emerald-400">AES-256-GCM Vault</p>
                <p className="mt-1 text-xs text-slate-400">Your mnemonic is encrypted with 100,000 PBKDF2 iterations and stored strictly in browser localStorage.</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                <p className="font-semibold text-white">Zero Telemetry & Zero Custody</p>
                <p className="mt-1 text-xs text-slate-400">Vela has no analytics, no backend servers, and no trackers. You hold your own private keys.</p>
              </div>
            </>
          )}

          {infoModal === 'docs' && (
            <div className="space-y-2 text-xs text-slate-400">
              <p>This is experimental software for Devnet, Testnet, and Sepolia development.</p>
              <p>To begin, click &ldquo;Open account&rdquo; to generate a 12-word mnemonic, write it down safely, and set an unlock password.</p>
            </div>
          )}

          <Button
            size="lg"
            className="mt-4 w-full rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold"
            onClick={() => {
              setInfoModal(null);
              onCreateWallet();
            }}
          >
            Create new wallet now
          </Button>
        </div>
      </Modal>
    </div>
  );
}
