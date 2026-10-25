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

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    { id: 'portfolio', label: 'Portfolio', icon: <Layout size={22} /> },
    { id: 'history', label: 'History', icon: <History size={22} /> },
    { id: 'tools', label: 'Tools', icon: <Smartphone size={22} /> },
    { id: 'mint', label: 'Launchpad', icon: <Rocket size={22} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={22} /> },
  ];

  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="flex min-h-screen bg-background text-foreground">
            <aside className="w-64 border-r border-white/5 bg-background/50 backdrop-blur-xl flex flex-col p-6">
              <div className="flex items-center gap-3 mb-12">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/20 p-2">
                  <img src={logo} alt="SikkaOne" className="w-full h-full object-cover" />
                </div>
                <span className="text-xl font-bold tracking-tight">SikkaOne</span>
              </div>

              <nav className="flex flex-col gap-2">
                {tabs.map(tab => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "secondary" : "ghost"}
                    className="justify-start gap-3 h-12 text-md"
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.icon} <span>{tab.label}</span>
                  </Button>
                ))}
              </nav>

              <div className="mt-auto pt-6 border-t border-white/5">
                <Button variant="ghost" className="justify-start gap-3 h-12 text-md text-red-400 hover:text-red-300 hover:bg-red-950/30 w-full" onClick={onBack}>
                  <LogOut size={22} /> <span>Disconnect</span>
                </Button>
              </div>
            </aside>

            <main className="flex-1 p-8 md:p-12 overflow-y-auto">
              <header className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3 bg-secondary/50 rounded-full px-4 py-2 border border-white/5">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-primary/20 p-1">
                    <img src={logo} alt="logo" className="w-full h-full object-cover" />
                  </div>
                  <span className="uppercase tracking-widest text-xs font-bold">{activeTab}</span>
                </div>
                <div className="flex gap-4">
                  <WalletMultiButton style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', borderRadius: '0.5rem', fontWeight: 'bold' }} />
                </div>
              </header>

              <div className="max-w-5xl mx-auto space-y-8">
                <AnimatePresence mode="wait">
                  {activeTab === 'portfolio' && (
                    <motion.div key="p" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                      <Card className="bg-primary text-primary-foreground border-none">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium uppercase tracking-widest opacity-80">Total Balance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-5xl font-black">{totalSol.toFixed(3)} <span className="text-primary-foreground/50 text-2xl">SOL</span></div>
                          <div className="mt-6 flex items-center gap-2 text-sm font-medium">
                            <span className="opacity-80">Network:</span>
                            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-400"></div> Solana Devnet</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-background/50 backdrop-blur-xl">
                        <CardContent className="p-0">
                          <SolanaWallet mnemonic={mnemonic} />
                        </CardContent>
                      </Card>
                      <Card className="bg-background/50 backdrop-blur-xl">
                        <CardContent className="p-0">
                          <EthWallet mnemonic={mnemonic} />
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {activeTab === 'history' && (
                    <motion.div key="h" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                      <Card className="bg-background/50 backdrop-blur-xl">
                        <CardContent className="p-6">
                          <ActivityFeed mnemonic={mnemonic} />
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {activeTab === 'tools' && (
                    <motion.div key="t" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                      <div className="tools-grid">
                        <ShowSolBalance />
                        <RequestAirdrop />
                        <SendTokens />
                        <SignMessage />
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'mint' && (
                    <motion.div key="m" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                      <Card className="bg-background/50 backdrop-blur-xl">
                        <CardContent className="p-0">
                          <TokenLaunchpad />
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {activeTab === 'settings' && (
                    <motion.div key="s" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                      <Card className="bg-background/50 backdrop-blur-xl">
                        <CardHeader>
                          <CardTitle>Wallet Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center py-6 border-b border-white/5">
                            <span className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Network</span>
                            <div className="flex items-center gap-2">
                              <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-bold uppercase">Active</span>
                              <span className="font-bold">Solana Devnet</span>
                            </div>
                          </div>
                          <div className="mt-8">
                            <Button variant="destructive" onClick={onBack}>
                              Clear Local Data
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
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


