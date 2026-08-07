import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { validateMnemonic } from 'bip39';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center mb-12 z-10"
      >
        <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black tracking-tighter text-foreground mb-4">
          Sikka<span className="text-primary">One</span>
        </motion.h1>

        <motion.p variants={itemVariants} className="text-xl text-muted-foreground font-medium tracking-wide">
          Secure Web3 Wallet
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1, ease: [0.2, 0.65, 0.3, 0.9] }}
        className="w-full max-w-[480px]"
      >
        <Card className="w-full bg-background/50 backdrop-blur-xl border-white/10 shadow-2xl p-8 pt-10">
          <CardContent className="p-0">
            <AnimatePresence mode="wait">
          {!isImporting ? (
            <motion.div 
              key="buttons"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col gap-5"
            >
              <Button size="lg" className="w-full font-bold text-md h-14" onClick={() => onCreateWallet()}>
                Create New Wallet
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="w-full font-bold text-md h-14"
                onClick={() => setIsImporting(true)}
              >
                Import Existing Wallet
              </Button>
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
                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-center resize-none"
                placeholder="Enter 12-word recovery phrase..."
                value={importPhrase}
                onChange={(e) => setImportPhrase(e.target.value)}
              />
              {error && <p className="text-red-400 text-xs text-center font-bold uppercase">{error}</p>}
              <div className="flex gap-3 mt-2">
                <Button size="lg" className="flex-1 font-bold h-12" onClick={handleImport}>Confirm</Button>
                <Button variant="secondary" size="lg" className="flex-1 font-bold h-12" onClick={() => setIsImporting(false)}>Back</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

            <div className="mt-12 flex justify-center items-center opacity-30">
              <span className="text-[10px] font-extrabold uppercase tracking-widest">Personal Access</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};


