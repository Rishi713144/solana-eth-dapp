import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { validateMnemonic } from 'bip39';
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Globe,
  Home,
  KeyRound,
  Layers,
  Lock,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
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

// Curated high-res portraits matching reference design
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
};

export function SetupScreen({
  onCreateWallet,
  onImportWallet,
  legacyMnemonic,
  onMigrateLegacy,
}) {
  const [activeDropdown, setActiveDropdown] = useState(null); // 'features' | 'networks' | 'security' | 'docs' | null
  const [importOpen, setImportOpen] = useState(false);
  const [infoModal, setInfoModal] = useState(null);
  const [phrase, setPhrase] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  function toggleDropdown(name) {
    setActiveDropdown((prev) => (prev === name ? null : name));
  }

  return (
    <div className="relative min-h-screen lg:h-screen lg:max-h-screen flex flex-col overflow-x-hidden lg:overflow-hidden select-none bg-[#f7f5f0]">
      {/* Background ambient subtle warm lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-24 h-[28rem] w-[28rem] rounded-full bg-blue-600/10 blur-[130px]" />
        <div className="absolute -right-32 top-1/3 h-[28rem] w-[28rem] rounded-full bg-indigo-600/10 blur-[130px]" />
      </div>

      {/* Main Hero Canvas */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto w-full max-w-[1536px] h-full min-h-screen lg:h-screen bg-[#f7f5f0] flex flex-col justify-between overflow-hidden text-slate-900"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.95) 0%, rgba(247, 245, 240, 0.98) 60%, rgba(242, 238, 230, 0.95) 100%)
          `,
        }}
      >
        {/* ========================================================= */}
        {/* TOP NAVBAR                                                */}
        {/* ========================================================= */}
        <header className="relative z-40 flex items-center justify-between px-5 pt-3.5 sm:px-8 sm:pt-4 lg:px-10">
          {/* Brand Logo */}
          <div className="flex items-center gap-2">
            <Brand compact subtitle={null} theme="light" className="scale-105" />
          </div>

          {/* Center Floating Dark Pill Navigation with Dropdowns */}
          <div ref={navRef} className="relative hidden sm:block">
            <nav className="flex items-center gap-1 rounded-full bg-[#121316] px-2 py-1.5 shadow-xl border border-white/5">
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-white/25"
                onClick={() => setActiveDropdown(null)}
              >
                <Home size={12} className="text-white" />
                <span>Home</span>
              </button>

              {/* Features Trigger */}
              <button
                type="button"
                onClick={() => toggleDropdown('features')}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-medium transition rounded-full ${activeDropdown === 'features'
                    ? 'text-white bg-white/10'
                    : 'text-slate-300 hover:text-white'
                  }`}
              >
                <span>Features</span>
                <ChevronDown
                  size={12}
                  className={`text-slate-400 transition-transform duration-200 ${activeDropdown === 'features' ? 'rotate-180 text-white' : ''
                    }`}
                />
              </button>

              {/* Networks Trigger */}
              <button
                type="button"
                onClick={() => toggleDropdown('networks')}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-medium transition rounded-full ${activeDropdown === 'networks'
                    ? 'text-white bg-white/10'
                    : 'text-slate-300 hover:text-white'
                  }`}
              >
                <span>Networks</span>
                <ChevronDown
                  size={12}
                  className={`text-slate-400 transition-transform duration-200 ${activeDropdown === 'networks' ? 'rotate-180 text-white' : ''
                    }`}
                />
              </button>

              {/* Security Trigger */}
              <button
                type="button"
                onClick={() => toggleDropdown('security')}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-medium transition rounded-full ${activeDropdown === 'security'
                    ? 'text-white bg-white/10'
                    : 'text-slate-300 hover:text-white'
                  }`}
              >
                <span>Security</span>
                <ChevronDown
                  size={12}
                  className={`text-slate-400 transition-transform duration-200 ${activeDropdown === 'security' ? 'rotate-180 text-white' : ''
                    }`}
                />
              </button>

              {/* Docs Trigger */}
              <button
                type="button"
                onClick={() => toggleDropdown('docs')}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-medium transition rounded-full ${activeDropdown === 'docs'
                    ? 'text-white bg-white/10'
                    : 'text-slate-300 hover:text-white'
                  }`}
              >
                <span>Docs</span>
                <ChevronDown
                  size={12}
                  className={`text-slate-400 transition-transform duration-200 ${activeDropdown === 'docs' ? 'rotate-180 text-white' : ''
                    }`}
                />
              </button>
            </nav>

            {/* ===================================================== */}
            {/* INTERACTIVE FLOATING MEGA MENU DROPDOWNS              */}
            {/* ===================================================== */}
            <AnimatePresence>
              {activeDropdown && (
                <motion.div
                  key={activeDropdown}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="absolute top-full mt-2.5 left-1/2 -translate-x-1/2 z-50 w-[820px] max-w-[95vw] rounded-xl bg-white p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-slate-200/90 text-slate-900"
                >
                  {/* ================================================= */}
                  {/* 1. NETWORKS MEGA MENU                             */}
                  {/* ================================================= */}
                  {activeDropdown === 'networks' && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Left 2 Columns */}
                      <div className="md:col-span-7 flex flex-col justify-between">
                        <div className="grid grid-cols-2 gap-3">
                          {/* Solana Column */}
                          <div>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-[#0052ff] uppercase mb-2.5">
                              <Zap size={13} className="text-[#0052ff]" />
                              <span>Solana Ecosystem</span>
                            </div>
                            <div className="space-y-2">
                              <div
                                onClick={() => {
                                  setActiveDropdown(null);
                                  onCreateWallet();
                                }}
                                className="group cursor-pointer rounded-lg bg-[#f7f5f0] hover:bg-[#ede9df] p-2.5 transition-colors"
                              >
                                <h4 className="text-xs font-semibold text-slate-900 group-hover:text-[#0052ff] transition-colors flex items-center justify-between">
                                  <span>Solana Devnet</span>
                                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#0052ff]" />
                                </h4>
                                <p className="mt-0.5 text-[11px] text-slate-500 leading-snug">
                                  Use Solana Devnet/Testnet for test balances and transfers.
                                </p>
                              </div>
                              <div
                                onClick={() => {
                                  setActiveDropdown(null);
                                  onCreateWallet();
                                }}
                                className="group cursor-pointer rounded-lg bg-[#f7f5f0] hover:bg-[#ede9df] p-2.5 transition-colors"
                              >
                                <h4 className="text-xs font-semibold text-slate-900 group-hover:text-[#0052ff] transition-colors flex items-center justify-between">
                                  <span>SPL Token Standard</span>
                                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#0052ff]" />
                                </h4>
                                <p className="mt-0.5 text-[11px] text-slate-500 leading-snug">
                                  View supported SPL token balances for your primary account.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Ethereum Column */}
                          <div>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-[#0052ff] uppercase mb-2.5">
                              <Globe size={13} className="text-[#0052ff]" />
                              <span>Ethereum Ecosystem</span>
                            </div>
                            <div className="space-y-2">
                              <div
                                onClick={() => {
                                  setActiveDropdown(null);
                                  onCreateWallet();
                                }}
                                className="group cursor-pointer rounded-lg bg-[#f7f5f0] hover:bg-[#ede9df] p-2.5 transition-colors"
                              >
                                <h4 className="text-xs font-semibold text-slate-900 group-hover:text-[#0052ff] transition-colors flex items-center justify-between">
                                  <span>Ethereum Sepolia</span>
                                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#0052ff]" />
                                </h4>
                                <p className="mt-0.5 text-[11px] text-slate-500 leading-snug">
                                  Use Sepolia for test ETH balances and transfers.
                                </p>
                              </div>
                              <div
                                onClick={() => {
                                  setActiveDropdown(null);
                                  onCreateWallet();
                                }}
                                className="group cursor-pointer rounded-lg bg-[#f7f5f0] hover:bg-[#ede9df] p-2.5 transition-colors"
                              >
                                <h4 className="text-xs font-semibold text-slate-900 group-hover:text-[#0052ff] transition-colors flex items-center justify-between">
                                  <span>ERC-20 Compatibility</span>
                                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#0052ff]" />
                                </h4>
                                <p className="mt-0.5 text-[11px] text-slate-500 leading-snug">
                                  Keep Solana and Ethereum accounts in one encrypted vault.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Left Note */}
                        <div className="mt-3 border-t border-slate-100 pt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Configured endpoints for supported test networks.</span>
                          <span className="font-semibold text-emerald-600">Devnet & Sepolia</span>
                        </div>
                      </div>

                      {/* Right Brand & Create Wallet CTA Card */}
                      <div className="md:col-span-5 relative flex flex-col justify-between rounded-lg bg-[#0e121e] p-4 text-white border border-white/10 shadow-inner overflow-hidden">
                        <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-blue-500/20 blur-2xl" />
                        <div className="relative z-10 space-y-2">
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-blue-300">
                            <Sparkles size={11} className="text-blue-400" />
                            <span>LOCAL MULTI-CHAIN WALLET</span>
                          </div>
                          <div>
                            <h4 className="font-display text-sm font-bold tracking-tight text-white">
                              Dual-chain wallet
                            </h4>
                            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                              View balances and manage Solana and Ethereum testnet accounts from one local wallet.
                            </p>
                          </div>
                          <div className="space-y-1.5 pt-1 text-[11px] text-slate-300">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                              <span>Solana and Ethereum test networks</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                              <span>Send and receive supported assets</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                              <span>One recovery phrase for both chains</span>
                            </div>
                          </div>
                        </div>

                        <div className="relative z-10 pt-3 mt-3 border-t border-white/10">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveDropdown(null);
                              onCreateWallet();
                            }}
                            className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#0052ff] hover:bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
                          >
                            <span>Create wallet</span>
                            <ArrowUpRight size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveDropdown(null);
                              setImportOpen(true);
                            }}
                            className="mt-1.5 w-full text-center text-[10px] text-slate-400 hover:text-white transition-colors"
                          >
                            Already have a phrase? Import wallet →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ================================================= */}
                  {/* 2. FEATURES MEGA MENU                             */}
                  {/* ================================================= */}
                  {activeDropdown === 'features' && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Left 2 Columns */}
                      <div className="md:col-span-7 flex flex-col justify-between">
                        <div className="grid grid-cols-2 gap-3">
                          {/* Core Architecture */}
                          <div>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-[#0052ff] uppercase mb-2.5">
                              <Zap size={13} className="text-[#0052ff]" />
                              <span>Core Architecture</span>
                            </div>
                            <div className="space-y-2">
                              <div
                                onClick={() => {
                                  setActiveDropdown(null);
                                  onCreateWallet();
                                }}
                                className="group cursor-pointer rounded-lg bg-[#f7f5f0] hover:bg-[#ede9df] p-2.5 transition-colors"
                              >
                                <h4 className="text-xs font-semibold text-slate-900 group-hover:text-[#0052ff] transition-colors flex items-center justify-between">
                                  <span>Dual-Chain Keyring</span>
                                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#0052ff]" />
                                </h4>
                                <p className="mt-0.5 text-[11px] text-slate-500 leading-snug">
                                  Derives Solana & Ethereum keypairs from 1 BIP-39 mnemonic.
                                </p>
                              </div>
                              <div
                                onClick={() => {
                                  setActiveDropdown(null);
                                  onCreateWallet();
                                }}
                                className="group cursor-pointer rounded-lg bg-[#f7f5f0] hover:bg-[#ede9df] p-2.5 transition-colors"
                              >
                                <h4 className="text-xs font-semibold text-slate-900 group-hover:text-[#0052ff] transition-colors flex items-center justify-between">
                                  <span>Multi-Account Engine</span>
                                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#0052ff]" />
                                </h4>
                                <p className="mt-0.5 text-[11px] text-slate-500 leading-snug">
                                  Add up to 10 derived accounts per chain from your recovery phrase.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Developer Suite */}
                          <div>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-[#0052ff] uppercase mb-2.5">
                              <Terminal size={13} className="text-[#0052ff]" />
                              <span>Developer Suite</span>
                            </div>
                            <div className="space-y-2">
                              <div
                                onClick={() => {
                                  setActiveDropdown(null);
                                  onCreateWallet();
                                }}
                                className="group cursor-pointer rounded-lg bg-[#f7f5f0] hover:bg-[#ede9df] p-2.5 transition-colors"
                              >
                                <h4 className="text-xs font-semibold text-slate-900 group-hover:text-[#0052ff] transition-colors flex items-center justify-between">
                                  <span>Cryptographic Signer</span>
                                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#0052ff]" />
                                </h4>
                                <p className="mt-0.5 text-[11px] text-slate-500 leading-snug">
                                  Sign UTF-8 & hex messages offline with verified key validation.
                                </p>
                              </div>
                              <div
                                onClick={() => {
                                  setActiveDropdown(null);
                                  onCreateWallet();
                                }}
                                className="group cursor-pointer rounded-lg bg-[#f7f5f0] hover:bg-[#ede9df] p-2.5 transition-colors"
                              >
                                <h4 className="text-xs font-semibold text-slate-900 group-hover:text-[#0052ff] transition-colors flex items-center justify-between">
                                  <span>Automated Faucets</span>
                                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#0052ff]" />
                                </h4>
                                <p className="mt-0.5 text-[11px] text-slate-500 leading-snug">
                                  1-click Devnet SOL and Sepolia ETH drops directly to balance.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Left Note */}
                        <div className="mt-3 border-t border-slate-100 pt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                          <span>100% self-custodial. Zero telemetry or remote analytics.</span>
                          <span className="font-semibold text-[#0052ff]">BIP-39 & BIP-44 Standard</span>
                        </div>
                      </div>

                      {/* Right Brand & Create Wallet CTA Card */}
                      <div className="md:col-span-5 relative flex flex-col justify-between rounded-lg bg-[#0e121e] p-4 text-white border border-white/10 shadow-inner overflow-hidden">
                        <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-blue-500/20 blur-2xl" />
                        <div className="relative z-10 space-y-2">
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-blue-300">
                            <Sparkles size={11} className="text-blue-400" />
                            <span>NON-CUSTODIAL FREEDOM</span>
                          </div>
                          <div>
                            <h4 className="font-display text-sm font-bold tracking-tight text-white">
                              Pure Ownership & Speed
                            </h4>
                            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                              No middleman cuts, no custodian risk, and no tracking. You remain in complete mathematical control.
                            </p>
                          </div>
                          <div className="space-y-1.5 pt-1 text-[11px] text-slate-300">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                              <span>0% protocol markup on all transfers</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                              <span>Client-side AES-256 encrypted vault</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                              <span>Ready for testnet development</span>
                            </div>
                          </div>
                        </div>

                        <div className="relative z-10 pt-3 mt-3 border-t border-white/10">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveDropdown(null);
                              onCreateWallet();
                            }}
                            className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#0052ff] hover:bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
                          >
                            <span>Create wallet</span>
                            <ArrowUpRight size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveDropdown(null);
                              setImportOpen(true);
                            }}
                            className="mt-1.5 w-full text-center text-[10px] text-slate-400 hover:text-white transition-colors"
                          >
                            Already have a phrase? Import wallet →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ================================================= */}
                  {/* 3. SECURITY MEGA MENU                             */}
                  {/* ================================================= */}
                  {activeDropdown === 'security' && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Left 2 Columns */}
                      <div className="md:col-span-7 flex flex-col justify-between">
                        <div className="grid grid-cols-2 gap-3">
                          {/* Cryptographic Armor */}
                          <div>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-[#0052ff] uppercase mb-2.5">
                              <ShieldCheck size={13} className="text-[#0052ff]" />
                              <span>Cryptographic Armor</span>
                            </div>
                            <div className="space-y-2">
                              <div
                                onClick={() => {
                                  setActiveDropdown(null);
                                  setInfoModal('security');
                                }}
                                className="group cursor-pointer rounded-lg bg-[#f7f5f0] hover:bg-[#ede9df] p-2.5 transition-colors"
                              >
                                <h4 className="text-xs font-semibold text-slate-900 group-hover:text-[#0052ff] transition-colors flex items-center justify-between">
                                  <span>AES-256-GCM Vault</span>
                                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#0052ff]" />
                                </h4>
                                <p className="mt-0.5 text-[11px] text-slate-500 leading-snug">
                                  Encrypted in-browser with your vault password.
                                </p>
                              </div>
                              <div
                                onClick={() => {
                                  setActiveDropdown(null);
                                  setInfoModal('security');
                                }}
                                className="group cursor-pointer rounded-lg bg-[#f7f5f0] hover:bg-[#ede9df] p-2.5 transition-colors"
                              >
                                <h4 className="text-xs font-semibold text-slate-900 group-hover:text-[#0052ff] transition-colors flex items-center justify-between">
                                  <span>Zero Server Telemetry</span>
                                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#0052ff]" />
                                </h4>
                                <p className="mt-0.5 text-[11px] text-slate-500 leading-snug">
                                  Keys never touch any external server. Zero tracking.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Safety Controls */}
                          <div>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-[#0052ff] uppercase mb-2.5">
                              <Lock size={13} className="text-[#0052ff]" />
                              <span>Safety Controls</span>
                            </div>
                            <div className="space-y-2">
                              <div
                                onClick={() => {
                                  setActiveDropdown(null);
                                  setInfoModal('security');
                                }}
                                className="group cursor-pointer rounded-lg bg-[#f7f5f0] hover:bg-[#ede9df] p-2.5 transition-colors"
                              >
                                <h4 className="text-xs font-semibold text-slate-900 group-hover:text-[#0052ff] transition-colors flex items-center justify-between">
                                  <span>Session Auto-Lock</span>
                                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#0052ff]" />
                                </h4>
                                <p className="mt-0.5 text-[11px] text-slate-500 leading-snug">
                                  Inactivity timer purges decrypted keys from RAM.
                                </p>
                              </div>
                              <div
                                onClick={() => {
                                  setActiveDropdown(null);
                                  setInfoModal('security');
                                }}
                                className="group cursor-pointer rounded-lg bg-[#f7f5f0] hover:bg-[#ede9df] p-2.5 transition-colors"
                              >
                                <h4 className="text-xs font-semibold text-slate-900 group-hover:text-[#0052ff] transition-colors flex items-center justify-between">
                                  <span>Emergency Reset</span>
                                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#0052ff]" />
                                </h4>
                                <p className="mt-0.5 text-[11px] text-slate-500 leading-snug">
                                  1-click purge scrubs all sensitive vault data locally.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Left Note */}
                        <div className="mt-3 border-t border-slate-100 pt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Local encryption • No backend custody of your keys</span>
                          <span className="font-semibold text-emerald-600">Encrypted locally</span>
                        </div>
                      </div>

                      {/* Right Brand & Create Wallet CTA Card */}
                      <div className="md:col-span-5 relative flex flex-col justify-between rounded-lg bg-[#0e121e] p-4 text-white border border-white/10 shadow-inner overflow-hidden">
                        <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-blue-500/20 blur-2xl" />
                        <div className="relative z-10 space-y-2">
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-blue-300">
                            <Sparkles size={11} className="text-blue-400" />
                            <span>LOCAL VAULT SECURITY</span>
                          </div>
                          <div>
                            <h4 className="font-display text-sm font-bold tracking-tight text-white">
                              Your keys stay local
                            </h4>
                            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                              Your recovery phrase stays under your control while the wallet is encrypted on this device.
                            </p>
                          </div>
                          <div className="space-y-1.5 pt-1 text-[11px] text-slate-300">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                              <span>AES-256-GCM encrypted vault</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                              <span>Password-based key stretching</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                              <span>Zero third-party key custodians</span>
                            </div>
                          </div>
                        </div>

                        <div className="relative z-10 pt-3 mt-3 border-t border-white/10">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveDropdown(null);
                              onCreateWallet();
                            }}
                            className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#0052ff] hover:bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
                          >
                            <span>Create wallet</span>
                            <ArrowUpRight size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveDropdown(null);
                              setImportOpen(true);
                            }}
                            className="mt-1.5 w-full text-center text-[10px] text-slate-400 hover:text-white transition-colors"
                          >
                            Already have a phrase? Import wallet →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ================================================= */}
                  {/* 4. DOCS MEGA MENU                                 */}
                  {/* ================================================= */}
                  {activeDropdown === 'docs' && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Left 2 Columns */}
                      <div className="md:col-span-7 flex flex-col justify-between">
                        <div className="grid grid-cols-2 gap-3">
                          {/* Getting Started */}
                          <div>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-[#0052ff] uppercase mb-2.5">
                              <BookOpen size={13} className="text-[#0052ff]" />
                              <span>Getting Started</span>
                            </div>
                            <div className="space-y-2">
                              <div
                                onClick={() => {
                                  setActiveDropdown(null);
                                  setInfoModal('docs');
                                }}
                                className="group cursor-pointer rounded-lg bg-[#f7f5f0] hover:bg-[#ede9df] p-2.5 transition-colors"
                              >
                                <h4 className="text-xs font-semibold text-slate-900 group-hover:text-[#0052ff] transition-colors flex items-center justify-between">
                                  <span>Quickstart Guide</span>
                                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#0052ff]" />
                                </h4>
                                <p className="mt-0.5 text-[11px] text-slate-500 leading-snug">
                                  Create or import a wallet, then use supported testnet tools.
                                </p>
                              </div>
                              <div
                                onClick={() => {
                                  setActiveDropdown(null);
                                  setInfoModal('docs');
                                }}
                                className="group cursor-pointer rounded-lg bg-[#f7f5f0] hover:bg-[#ede9df] p-2.5 transition-colors"
                              >
                                <h4 className="text-xs font-semibold text-slate-900 group-hover:text-[#0052ff] transition-colors flex items-center justify-between">
                                  <span>Derivation Paths</span>
                                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#0052ff]" />
                                </h4>
                                <p className="mt-0.5 text-[11px] text-slate-500 leading-snug">
                                  Standard BIP-44 pathing for Solana & Ethereum accounts.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Technical Specs */}
                          <div>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-[#0052ff] uppercase mb-2.5">
                              <Layers size={13} className="text-[#0052ff]" />
                              <span>Technical Specs</span>
                            </div>
                            <div className="space-y-2">
                              <div
                                onClick={() => {
                                  setActiveDropdown(null);
                                  setInfoModal('docs');
                                }}
                                className="group cursor-pointer rounded-lg bg-[#f7f5f0] hover:bg-[#ede9df] p-2.5 transition-colors"
                              >
                                <h4 className="text-xs font-semibold text-slate-900 group-hover:text-[#0052ff] transition-colors flex items-center justify-between">
                                  <span>Network endpoints</span>
                                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#0052ff]" />
                                </h4>
                                <p className="mt-0.5 text-[11px] text-slate-500 leading-snug">
                                  Review the configured Solana and Ethereum testnet endpoints.
                                </p>
                              </div>
                              <div
                                onClick={() => {
                                  setActiveDropdown(null);
                                  setInfoModal('docs');
                                }}
                                className="group cursor-pointer rounded-lg bg-[#f7f5f0] hover:bg-[#ede9df] p-2.5 transition-colors"
                              >
                                <h4 className="text-xs font-semibold text-slate-900 group-hover:text-[#0052ff] transition-colors flex items-center justify-between">
                                  <span>Message Signing</span>
                                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#0052ff]" />
                                </h4>
                                <p className="mt-0.5 text-[11px] text-slate-500 leading-snug">
                                  Sign and verify UTF-8 messages locally with your Solana account.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Left Note */}
                        <div className="mt-3 border-t border-slate-100 pt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Open standards • Transparent cryptography</span>
                          <span className="font-semibold text-[#0052ff]">Developer Docs Ready</span>
                        </div>
                      </div>

                      {/* Right Brand & Create Wallet CTA Card */}
                      <div className="md:col-span-5 relative flex flex-col justify-between rounded-lg bg-[#0e121e] p-4 text-white border border-white/10 shadow-inner overflow-hidden">
                        <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-blue-500/20 blur-2xl" />
                        <div className="relative z-10 space-y-2">
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-blue-300">
                            <Sparkles size={11} className="text-blue-400" />
                            <span>DEVELOPER FIRST</span>
                          </div>
                          <div>
                            <h4 className="font-display text-sm font-bold tracking-tight text-white">
                              Build With Confidence
                            </h4>
                            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                              A transparent local wallet for testing dApps and learning on supported networks.
                            </p>
                          </div>
                          <div className="space-y-1.5 pt-1 text-[11px] text-slate-300">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                              <span>BIP-39 recovery phrase support</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                              <span>Devnet & Sepolia sandbox ready</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                              <span>Local account derivation</span>
                            </div>
                          </div>
                        </div>

                        <div className="relative z-10 pt-3 mt-3 border-t border-white/10">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveDropdown(null);
                              onCreateWallet();
                            }}
                            className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#0052ff] hover:bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
                          >
                            <span>Create wallet</span>
                            <ArrowUpRight size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveDropdown(null);
                              setImportOpen(true);
                            }}
                            className="mt-1.5 w-full text-center text-[10px] text-slate-400 hover:text-white transition-colors"
                          >
                            Already have a phrase? Import wallet →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Network & CTA Pill */}
          <div className="flex items-center gap-2.5">
            <div className="hidden items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/90 px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm sm:flex">
              <Globe size={13} className="text-[#0052ff]" />
              <span>Solana Devnet / Ethereum Sepolia</span>
            </div>

            <button
              type="button"
              onClick={onCreateWallet}
              className="flex items-center gap-1.5 rounded-full bg-[#0052ff] hover:bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(0,82,255,0.35)] transition-all hover:scale-105 active:scale-95 sm:px-5 sm:py-2.5"
            >
              <span>Create Wallet</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </header>

        {/* ========================================================= */}
        {/* HERO & BENTO MAIN SECTION (Balanced Spacing)              */}
        {/* ========================================================= */}
        <main className="relative z-20 flex-1 flex flex-col justify-center items-center px-4 sm:px-8 lg:px-10 py-1 sm:py-2.5 max-w-7xl mx-auto w-full">
          {/* Hero text */}
          <div className="flex flex-col items-center justify-center text-center">
            {/* Social Proof Pill Badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-slate-200/90 bg-white px-3.5 py-1.5 shadow-sm">
              <span className="text-xs font-medium text-slate-700 whitespace-nowrap">
                <span className="mr-1 text-blue-500">◆</span> Built for testnet development
              </span>
              <div className="flex -space-x-2 shrink-0 items-center">
                <img src={IMAGES.avatar1} alt="User" className="h-5 w-5 shrink-0 rounded-full border-2 border-white object-cover" />
                <img src={IMAGES.avatar2} alt="User" className="h-5 w-5 shrink-0 rounded-full border-2 border-white object-cover" />
                <img src={IMAGES.avatar3} alt="User" className="h-5 w-5 shrink-0 rounded-full border-2 border-white object-cover" />
              </div>
            </div>

            {/* Main Title & Subtitle */}
            <div className="mt-2 sm:mt-2.5">
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.15rem] font-bold tracking-tight text-slate-900 leading-[1.08]">
                Your Crypto.{' '}
                <span className="text-[#0052ff]">
                  One Simple App.
                </span>
              </h1>
              <p className="mx-auto mt-1.5 max-w-lg text-xs sm:text-sm leading-relaxed text-slate-600">
                Create, encrypt, and use Solana and Ethereum testnet accounts from one local wallet.
              </p>
            </div>

            {/* Action Pill Buttons */}
            <div className="mt-2.5 sm:mt-3 flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={onCreateWallet}
                className="rounded-full bg-[#0052ff] hover:bg-blue-600 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-[0_6px_20px_rgba(0,82,255,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Create wallet
              </button>
              <button
                type="button"
                onClick={() => setImportOpen(true)}
                className="rounded-full border border-slate-200/90 bg-white hover:bg-slate-50 px-6 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Import an existing wallet
              </button>
            </div>

            {/* Legacy Mnemonic Warning if unencrypted seed is present */}
            {legacyMnemonic && (
              <div className="mx-auto mt-2 max-w-md rounded-xl border border-amber-400/40 bg-amber-50/90 p-2 text-left shadow-sm">
                <div className="flex items-center justify-between gap-2 text-xs text-amber-900">
                  <span className="font-medium">⚠️ Unencrypted wallet detected.</span>
                  <button
                    type="button"
                    onClick={() => onMigrateLegacy?.(legacyMnemonic)}
                    className="rounded-md bg-amber-500 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm hover:bg-amber-600"
                  >
                    Encrypt now →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bento Grid (Tight gap directly underneath CTA buttons) */}
          <div className="relative mt-3 sm:mt-4 lg:mt-5 w-full">
            {/* Floating 3D Flower on left flank */}
            <div className="pointer-events-none absolute -left-3 top-1/2 hidden -translate-y-1/2 lg:block z-30">
              <ChromeFlower3D className="h-16 w-16 transform -rotate-12" />
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-end gap-3.5 sm:gap-4 lg:gap-5 w-full">
            {/* ---------------------------------------------------- */}
            {/* COLUMN 1: "Local wallet access" card + Woman photo   */}
            {/* ---------------------------------------------------- */}
            <div className="flex flex-col gap-3">
              {/* Top Mini Card: Local wallet access */}
              <div className="relative flex h-[76px] sm:h-[84px] flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-sm">
                <div>
                  <h3 className="font-display text-sm font-bold tracking-tight text-slate-900">
                    Local wallet access
                  </h3>
                  <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">No custodial account fees</p>
                </div>
                {/* 3D Metallic Sphere Coin hovering */}
                <div className="absolute -bottom-1 -right-1">
                  <ChromeCoin3D symbol="$" className="h-11 w-11" />
                </div>
              </div>

              {/* Bottom Card: Woman Portrait */}
              <div className="relative h-[175px] sm:h-[195px] lg:h-[215px] overflow-hidden rounded-2xl sm:rounded-3xl shadow-md border border-slate-200/60">
                <img
                  src={IMAGES.womanWithCard}
                  alt="Wallet user"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* COLUMN 2: Tall Dark Card: "Testnet tools"             */}
            {/* ---------------------------------------------------- */}
            <div className="relative flex h-[260px] sm:h-[290px] lg:h-[310px] flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-[#101421] p-5 text-white shadow-xl">
              <div>
                <h3 className="font-display text-base sm:text-lg font-bold tracking-tight text-white">
                  Testnet tools
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">Fund, sign, and manage test accounts</p>

                {/* Token Badges Row */}
                <div className="mt-3.5 flex items-center gap-1.5">
                  <TokenBadge symbol="SOL" size={24} />
                  <TokenBadge symbol="ETH" size={24} />
                  <TokenBadge symbol="USDC" size={24} />
                  <span className="flex h-6 items-center rounded-full border border-white/10 bg-white/10 px-2 text-[10px] font-semibold text-slate-300">
                    +100
                  </span>
                </div>
              </div>

              {/* 3D Geometric Watermark */}
              <div className="relative my-auto flex items-center justify-center py-2 opacity-25">
                <svg viewBox="0 0 200 200" className="h-32 w-32 text-blue-400" fill="currentColor">
                  <path d="M100 0 L115 85 L200 100 L115 115 L100 200 L85 115 L0 100 L85 85 Z" />
                </svg>
              </div>

              {/* Sub-label */}
              <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[10px] text-slate-400">
                <span>Solana & Ethereum</span>
                <span className="font-mono text-cyan-400">&lt; 1.2s</span>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* COLUMN 3: Portrait Card: Man smiling in turtleneck   */}
            {/* ---------------------------------------------------- */}
            <div className="relative flex h-[275px] sm:h-[305px] lg:h-[330px] flex-col justify-end overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/60">
              <img
                src={IMAGES.manSmiling}
                alt="Happy crypto user"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>

            {/* ---------------------------------------------------- */}
            {/* COLUMN 4: "Local vault security" + "Send testnet assets" */}
            {/* ---------------------------------------------------- */}
            <div className="relative flex flex-col gap-3">
              {/* Floating 3D metallic coin hovering top-right */}
              <div className="pointer-events-none absolute -right-2 -top-5 hidden sm:block z-30">
                <ChromeCoin3D symbol="ETH" className="h-11 w-11" />
              </div>

              {/* Top Mini Card: Local vault security */}
              <div className="relative flex h-[76px] sm:h-[84px] flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-sm">
                <div>
                  <h3 className="font-display text-sm font-bold tracking-tight text-slate-900">
                    Local vault security
                  </h3>
                  <p className="mt-0.5 text-[11px] text-slate-500">Sealed with AES-256-GCM</p>
                </div>
                <div className="absolute -bottom-1 right-2">
                  <ChromeShield3D className="h-10 w-10" />
                </div>
              </div>

              {/* Bottom Card: Send testnet assets (Solid Vibrant Blue) */}
              <div className="relative flex h-[175px] sm:h-[195px] lg:h-[215px] flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl bg-[#0052ff] p-4 sm:p-5 text-white shadow-xl">
                <div>
                  <h3 className="font-display text-base font-bold tracking-tight text-white">
                    Send testnet assets
                  </h3>
                  <p className="mt-0.5 text-xs text-blue-100">Transfer supported assets on their own network</p>
                </div>

                {/* Sub-label info */}
                <div className="flex items-center justify-between border-t border-white/20 pt-2 text-[10px] text-blue-100">
                  <span>Network-specific transfers</span>
                  <span className="font-semibold text-white">Testnet only</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
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
              className="min-h-[130px] w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] p-4 font-mono text-sm leading-relaxed text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20"
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
            <span>This wallet derives accounts locally. Your seed never leaves your device.</span>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              size="lg"
              className="h-11 flex-1 rounded-full bg-[#0052ff] hover:bg-blue-600 text-white font-semibold"
              loading={loading}
              onClick={handleImportSubmit}
            >
              Import wallet
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="h-11 rounded-full text-slate-300"
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
            ? 'Wallet Features'
            : infoModal === 'networks'
              ? 'Supported Networks'
              : infoModal === 'security'
                ? 'Security Architecture'
                : 'Documentation & Guides'
        }
        description="Learn how the wallet creates, protects, and operates your local Solana and Ethereum testnet accounts."
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
                <p className="font-semibold text-cyan-400">Solana Devnet & Testnet</p>
                <p className="mt-1 text-xs text-slate-400">Use Solana test networks for balances, transfers, activity, and faucet requests.</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                <p className="font-semibold text-indigo-400">Ethereum Sepolia</p>
                <p className="mt-1 text-xs text-slate-400">Use the configured Sepolia endpoint for test ETH balances and transfers.</p>
              </div>
            </>
          )}

          {infoModal === 'security' && (
            <>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                <p className="font-semibold text-emerald-400">AES-256-GCM Vault</p>
                <p className="mt-1 text-xs text-slate-400">Your recovery phrase is encrypted in the browser and protected by your vault password.</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                <p className="font-semibold text-white">Local key custody</p>
                <p className="mt-1 text-xs text-slate-400">The wallet derives accounts locally; never share your recovery phrase or private keys.</p>
              </div>
            </>
          )}

          {infoModal === 'docs' && (
            <div className="space-y-2 text-xs text-slate-400">
              <p>This is experimental software for Solana Devnet/Testnet and Ethereum Sepolia development.</p>
              <p>To begin, click &ldquo;Create wallet&rdquo; to generate a recovery phrase, store it safely, and set an unlock password.</p>
            </div>
          )}

          <Button
            size="lg"
            className="mt-4 w-full rounded-full bg-[#0052ff] hover:bg-blue-600 text-white font-semibold"
            onClick={() => {
              setInfoModal(null);
              onCreateWallet();
            }}
          >
            Create wallet now
          </Button>
        </div>
      </Modal>
    </div>
  );
}
