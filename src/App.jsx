import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { generateMnemonic } from 'bip39';

import './styles/App.css';
import { Navbar } from './components/layout/Navbar';
import { SetupScreen } from './components/wallet/SetupScreen';
import { MnemonicScreen } from './components/wallet/MnemonicScreen';
import { SecureWalletScreen } from './components/wallet/SecureWalletScreen';
import { UnlockScreen } from './components/wallet/UnlockScreen';
import { WalletDashboard } from './components/layout/WalletDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider, useToast } from './components/providers/ToastProvider';
import { ConfirmProvider, useConfirm } from './components/providers/ConfirmProvider';
import { NetworkProvider, useNetwork } from './components/providers/NetworkProvider';
import {
  clearLegacyPlainMnemonic,
  clearVault,
  createVault,
  getLegacyPlainMnemonic,
  getVaultCreatedAt,
  hasVault,
  unlockVault,
} from './utils/secureStorage';
import {
  clearSession,
  isSessionExpired,
  setSessionActive,
  touchSession,
} from './utils/sessionLock';

const STORAGE_KEYS_TO_WIPE = [
  'vela_sol_accounts',
  'vela_eth_accounts',
  'vela_address_book',
  'vela_prices_v1',
  'vela_session_lock',
  'vela_autolock_minutes',
  'sikka_session_lock',
  'sikka_mnemonic',
  'sikka_mnemonic_enc',
];

function AppContent() {
  const { toast } = useToast();
  const confirm = useConfirm();
  const { setNetwork } = useNetwork();
  const [initialState] = useState(() => ({
    vault: hasVault(),
    legacy: getLegacyPlainMnemonic(),
    createdAt: getVaultCreatedAt(),
  }));
  const [step, setStep] = useState(initialState.vault ? 'locked' : 'setup');
  const [mnemonic, setMnemonic] = useState('');
  const [pendingMnemonic, setPendingMnemonic] = useState('');
  const [legacyMnemonic, setLegacyMnemonic] = useState(initialState.legacy);
  const [migrating, setMigrating] = useState(false);
  const [vaultCreatedAt, setVaultCreatedAt] = useState(initialState.createdAt);

  const lockWallet = useCallback((notify = true) => {
    setMnemonic('');
    setPendingMnemonic('');
    clearSession();
    setStep('locked');
    if (notify) {
      toast({
        title: 'Wallet locked',
        description: 'Unlock with your vault password to continue.',
        variant: 'info',
      });
    }
  }, [toast]);

  const resetWallet = useCallback(async () => {
    const ok = await confirm({
      title: 'Reset this wallet?',
      description: 'This permanently removes your encrypted vault, accounts and local settings from this browser. Make sure your recovery phrase is backed up.',
      confirmLabel: 'Reset wallet',
      variant: 'danger',
    });
    if (!ok) return;
    clearVault();
    clearLegacyPlainMnemonic();
    clearSession();
    STORAGE_KEYS_TO_WIPE.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore
      }
    });
    setMnemonic('');
    setPendingMnemonic('');
    setLegacyMnemonic('');
    setVaultCreatedAt(null);
    setNetwork('devnet');
    setStep('setup');
    toast({ title: 'Wallet reset', description: 'This device no longer holds a vault.', variant: 'success' });
  }, [confirm, toast, setNetwork]);

  const handleCreateWallet = useCallback(() => {
    const nextMnemonic = generateMnemonic(128);
    setPendingMnemonic(nextMnemonic);
    setMigrating(false);
    setStep('mnemonic');
  }, []);

  const handleImportWallet = useCallback((phrase) => {
    setPendingMnemonic(phrase);
    setMigrating(Boolean(legacyMnemonic) && phrase === legacyMnemonic);
    setStep('secure');
  }, [legacyMnemonic]);

  const handleMigrateLegacy = useCallback((phrase) => {
    setPendingMnemonic(phrase);
    setMigrating(true);
    setStep('secure');
  }, []);

  const handleSecure = useCallback(async (password) => {
    await createVault(pendingMnemonic, password);
    clearLegacyPlainMnemonic();
    setMnemonic(pendingMnemonic);
    setPendingMnemonic('');
    setLegacyMnemonic('');
    setVaultCreatedAt(new Date().toISOString());
    setSessionActive();
    setStep('wallet');
    toast({
      title: migrating ? 'Existing wallet encrypted' : 'Encrypted vault created',
      description: 'Your recovery phrase is now protected with AES-256-GCM.',
      variant: 'success',
    });
  }, [pendingMnemonic, migrating, toast]);

  const handleUnlock = useCallback(async (password) => {
    const phrase = await unlockVault(password);
    if (!phrase) return false;
    clearLegacyPlainMnemonic();
    setMnemonic(phrase);
    setVaultCreatedAt(getVaultCreatedAt());
    setSessionActive();
    setStep('wallet');
    toast({ title: 'Vault unlocked', description: 'Welcome back to Vela.', variant: 'success' });
    return true;
  }, [toast]);

  useEffect(() => {
    if (step !== 'wallet' || !mnemonic) return undefined;

    let lastTouch = 0;
    const noteActivity = () => {
      const now = Date.now();
      if (now - lastTouch > 30000) {
        lastTouch = now;
        touchSession();
      }
    };

    const checkLock = () => {
      if (document.visibilityState === 'visible' && isSessionExpired()) {
        lockWallet(true);
      }
    };

    const interval = window.setInterval(checkLock, 30000);
    const activityEvents = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach(event => window.addEventListener(event, noteActivity, { passive: true }));
    document.addEventListener('visibilitychange', checkLock);

    return () => {
      window.clearInterval(interval);
      activityEvents.forEach(event => window.removeEventListener(event, noteActivity));
      document.removeEventListener('visibilitychange', checkLock);
    };
  }, [step, mnemonic, lockWallet]);

  const createdLabel = useMemo(() => {
    if (!vaultCreatedAt) return '';
    try {
      return `Created ${new Date(vaultCreatedAt).toLocaleDateString()}`;
    } catch {
      return '';
    }
  }, [vaultCreatedAt]);

  return (
    <div className="relative min-h-screen bg-background font-sans text-foreground antialiased">
      {step !== 'wallet' && <Navbar onReset={step === 'setup' ? undefined : resetWallet} />}

      <AnimatePresence mode="wait">
        {step === 'setup' && (
          <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -12 }}>
            <SetupScreen
              onCreateWallet={handleCreateWallet}
              onImportWallet={handleImportWallet}
              legacyMnemonic={legacyMnemonic}
              onMigrateLegacy={handleMigrateLegacy}
            />
          </motion.div>
        )}

        {step === 'mnemonic' && (
          <motion.div key="mnemonic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -12 }}>
            <MnemonicScreen
              mnemonic={pendingMnemonic}
              onComplete={() => setStep('secure')}
              onBack={() => {
                setPendingMnemonic('');
                setStep('setup');
              }}
            />
          </motion.div>
        )}

        {step === 'secure' && (
          <motion.div key="secure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -12 }}>
            <SecureWalletScreen
              onSecure={handleSecure}
              migrating={migrating}
              onBack={() => setStep(migrating ? 'setup' : 'mnemonic')}
            />
          </motion.div>
        )}

        {step === 'locked' && (
          <motion.div key="locked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -12 }}>
            <UnlockScreen onUnlock={handleUnlock} onReset={resetWallet} createdLabel={createdLabel} />
          </motion.div>
        )}

        {step === 'wallet' && (
          <motion.div key="wallet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <WalletDashboard mnemonic={mnemonic} onLock={() => lockWallet(false)} onReset={resetWallet} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ConfirmProvider>
          <NetworkProvider>
            <AppContent />
          </NetworkProvider>
        </ConfirmProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
