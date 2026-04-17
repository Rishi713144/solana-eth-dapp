import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { generateMnemonic } from 'bip39';

import './styles/App.css';
import { Navbar } from './components/layout/Navbar';
import { SetupScreen } from './components/wallet/SetupScreen';
import { MnemonicScreen } from './components/wallet/MnemonicScreen';
import { WalletDashboard } from './components/layout/WalletDashboard';

export default function App() {
  const [step, setStep] = useState(() => {
    return localStorage.getItem('sikka_mnemonic') ? 'wallet' : 'setup';
  });
  const [mnemonic, setMnemonic] = useState(() => {
    return localStorage.getItem('sikka_mnemonic') || '';
  });

  function handleCreateWallet(existingMnemonic = null) {
    const mn = existingMnemonic || generateMnemonic();
    setMnemonic(mn);
    localStorage.setItem('sikka_mnemonic', mn);
    setStep(existingMnemonic ? 'wallet' : 'mnemonic');
  }

  const resetFlow = () => {
    if (window.confirm('This will wipe your local session. Ensure you have your mnemonic saved. Proceed?')) {
      localStorage.removeItem('sikka_mnemonic');
      setStep('setup');
      setMnemonic('');
    }
  };

  return (
    <div className="app-container">
      {}
      <div className="bg-noise" />
      <div className="orbit-bg">
        <div className="orbit-blob orbit-blob-1" />
        <div className="orbit-blob orbit-blob-2" />
      </div>
      
      {step !== 'wallet' && <Navbar onReset={resetFlow} />}
      
      <AnimatePresence mode="wait">
        {step === 'setup' && (
          <SetupScreen key="setup" onCreateWallet={handleCreateWallet} />
        )}

        {step === 'mnemonic' && (
          <MnemonicScreen key="mnemonic" mnemonic={mnemonic} onComplete={() => setStep('wallet')} />
        )}

        {step === 'wallet' && (
          <WalletDashboard key="wallet" mnemonic={mnemonic} onBack={resetFlow} />
        )}
      </AnimatePresence>
    </div>
  );
}


