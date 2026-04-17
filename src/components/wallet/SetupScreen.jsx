import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { validateMnemonic } from 'bip39';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] } },
};

export const SetupScreen = ({ onCreateWallet }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importPhrase, setImportPhrase] = useState('');
  const [error, setError] = useState('');

  const handleImport = () => {
    const clean = importPhrase.trim().toLowerCase();
    if (validateMnemonic(clean)) {
      onCreateWallet(clean);
    } else {
      setError('Invalid 12-word mnemonic phrase.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="onboarding-container">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="orbit-hero-content"
      >
        <motion.h1 variants={itemVariants} className="orbit-hero-title">
          Sikka<span>One</span>.
        </motion.h1>

        <motion.p variants={itemVariants} className="orbit-subtitle">
          Your Web3 Orbit.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1, ease: [0.2, 0.65, 0.3, 0.9] }}
        className="card-orbit glass-orbit"
      >
        <AnimatePresence mode="wait">
          {!isImporting ? (
            <motion.div 
              key="buttons"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col gap-5"
            >
              <button className="btn-orbit" onClick={() => onCreateWallet()}>
                Create Orbit
              </button>
              <button
                className="btn-orbit-secondary"
                onClick={() => setIsImporting(true)}
              >
                Import Session
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="import"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-5"
            >
              <textarea 
                className="orbit-input min-h-[100px] text-center"
                placeholder="Enter 12-word recovery phrase..."
                value={importPhrase}
                onChange={(e) => setImportPhrase(e.target.value)}
              />
              {error && <p className="text-red-400 text-xs text-center font-bold uppercase">{error}</p>}
              <div className="flex gap-3">
                <button className="btn-orbit flex-1" onClick={handleImport}>Confirm</button>
                <button className="btn-orbit-secondary flex-1" onClick={() => setIsImporting(false)}>Back</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 flex justify-between items-center opacity-30">
          <span className="text-[10px] font-extrabold uppercase tracking-widest">Personal Access</span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest">SikkaCore v4.2</span>
        </div>
      </motion.div>
    </div>
  );
};


