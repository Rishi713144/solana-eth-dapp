import React, { useState, useMemo } from 'react';
import '@solana/wallet-adapter-react-ui/styles.css';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';

import { AnimatePresence, motion } from 'framer-motion';
import { Layout, LogOut, Rocket, Settings, Smartphone, History } from 'lucide-react';

import logo from '../../assets/logo.svg';
import { TokenLaunchpad } from '../launchpad/TokenLaunchpad';
import { RequestAirdrop } from '../tools/RequestAirdrop';
import { SendTokens } from '../tools/SendTokens';
import { ShowSolBalance } from '../tools/ShowSolBalance';
import { SignMessage } from '../tools/SignMessage';
import { EthWallet } from '../wallet/EthWallet';
import { SolanaWallet } from '../wallet/SolanaWallet';
import { ActivityFeed } from '../wallet/ActivityFeed';

import { Connection, clusterApiUrl, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { mnemonicToSeedSync } from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import nacl from 'tweetnacl';
import { useEffect } from 'react';

export const WalletDashboard = ({ mnemonic, onBack }) => {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [totalSol, setTotalSol] = useState(0);
  const network = 'devnet';
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  useEffect(() => {
    const fetchTotalBalance = async () => {
      try {
        const seed = mnemonicToSeedSync(mnemonic);
        const path = `m/44'/501'/0'/0'`;
        const derivedSeed = derivePath(path, seed.toString('hex')).key;
        const pubkey = new PublicKey(nacl.sign.keyPair.fromSeed(derivedSeed).publicKey);
        const conn = new Connection(endpoint, 'confirmed');
        const bal = await conn.getBalance(pubkey);
        setTotalSol(bal / LAMPORTS_PER_SOL);
      } catch (e) { console.error(e); }
    };
    fetchTotalBalance();
  }, [mnemonic, endpoint]);

  const tabs = [
    { id: 'portfolio', label: 'Vault', icon: <Layout size={22} /> },
    { id: 'history', label: 'History', icon: <History size={22} /> },
    { id: 'tools', label: 'Lab', icon: <Smartphone size={22} /> },
    { id: 'mint', label: 'Launch', icon: <Rocket size={22} /> },
    { id: 'settings', label: 'Config', icon: <Settings size={22} /> },
  ];

  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="wallet-view">
            <aside className="wallet-sidebar">
              <div className="flex items-center gap-3">
                <div className="logo-icon overflow-hidden">
                  <img src={logo} alt="SikkaOne" className="w-full h-full object-cover" />
                </div>
                <span className="logo-text">SikkaOne</span>
              </div>

              <nav className="sidebar-nav">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.icon} <span>{tab.label}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-auto pt-10 border-t border-white/5">
                <button className="nav-item text-red-400 w-full" onClick={onBack}>
                  <LogOut size={22} /> <span>Disconnect</span>
                </button>
              </div>
            </aside>

            <main className="wallet-content">
              <header className="dashboard-header">
                <div className="address-pill">
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10">
                    <img src={logo} alt="logo" className="w-full h-full object-cover" />
                  </div>
                  <span className="uppercase tracking-widest text-xs font-bold">{activeTab}</span>
                </div>
                <div className="flex gap-4">
                  <WalletMultiButton className="btn-orbit" />
                </div>
              </header>

              <div className="dashboard-body">
                <AnimatePresence mode="wait">
                  {activeTab === 'portfolio' && (
                    <motion.div key="p" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                      <div className="vault-summary-card">
                        <span className="total-balance-title">Global Exposure</span>
                        <div className="total-balance-amount">{totalSol.toFixed(3)} <span className="text-primary/40">SOL</span></div>
                        
                        <div className="stat-group">
                          <div className="stat-item">
                            <span className="stat-label">Network</span>
                            <span className="stat-value flex items-center"><span className="activity-dot"></span>Solana Devnet</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Active Slots</span>
                            <span className="stat-value">3 Active</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Uptime</span>
                            <span className="stat-value">99.9%</span>
                          </div>
                        </div>
                      </div>

                      <div className="portfolio-card glass-orbit">
                        <SolanaWallet mnemonic={mnemonic} />
                      </div>
                      <div className="portfolio-card glass-orbit">
                        <EthWallet mnemonic={mnemonic} />
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'history' && (
                    <motion.div key="h" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                      <div className="card-orbit glass-orbit max-w-none">
                        <ActivityFeed mnemonic={mnemonic} />
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'tools' && (
                    <motion.div key="t" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                      <div className="tools-grid-orbit">
                        <ShowSolBalance />
                        <RequestAirdrop />
                        <SendTokens />
                        <SignMessage />
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'mint' && (
                    <motion.div key="m" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                      <div className="portfolio-card glass-orbit">
                        <TokenLaunchpad />
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'settings' && (
                    <motion.div key="s" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                      <div className="card-orbit glass-orbit max-w-none">
                        <h3 className="text-2xl mb-8">Personal Orbit Config</h3>
                        <div className="flex justify-between items-center py-6 border-b border-white/5">
                          <span className="text-dim font-bold uppercase tracking-widest text-xs">Node Priority</span>
                          <div className="flex items-center gap-2">
                            <span className="orbit-badge">Primary</span>
                            <span className="font-bold">Solana Devnet</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center py-6 border-b border-white/5">
                          <span className="text-dim font-bold uppercase tracking-widest text-xs">Core Engine</span>
                          <span className="font-bold">SikkaOne v4.2 stable</span>
                        </div>
                        <div className="mt-12">
                          <button className="text-red-400 font-bold uppercase tracking-widest text-xs hover:text-red-300" onClick={onBack}>
                            Nuke Local Session Data
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </main>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};


