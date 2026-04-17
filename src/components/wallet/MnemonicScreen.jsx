import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, EyeOff, Eye, ChevronRight } from 'lucide-react';

export const MnemonicScreen = ({ mnemonic, onComplete }) => {
  const [revealed, setRevealed] = useState(false);
  const words = mnemonic.split(' ');

  return (
    <div className="onboarding-container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <div className="flex items-center gap-6 mb-12">
           <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
             <Shield size={40} />
           </div>
           <div>
             <h2 className="text-5xl font-extrabold mb-2">Gatekey.</h2>
             <p className="text-xl text-dim">Never share these 12 words. Total control, total responsibility.</p>
           </div>
        </div>

        <div className="card-orbit glass-orbit p-10 max-w-none">
          <div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
            style={{ transition: 'all 0.5s' }}
          >
            {words.map((word, i) => (
              <div key={i} className="flex flex-col p-4 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-[10px] text-muted font-bold mb-2 uppercase">{i + 1}</span>
                <span className="text-lg font-bold tracking-tight" style={{ filter: revealed ? 'none' : 'blur(10px)' }}>{word}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-6">
            <button className="btn-orbit w-full py-6 flex items-center justify-center gap-3 text-xl" onClick={onComplete}>
              Vault Locked <ChevronRight size={24} />
            </button>
            <button className="text-sm font-bold uppercase tracking-widest text-primary hover:opacity-80 transition-all" onClick={() => setRevealed(!revealed)}>
              {revealed ? 'Hide Gatekey' : 'Reveal Gatekey'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};


