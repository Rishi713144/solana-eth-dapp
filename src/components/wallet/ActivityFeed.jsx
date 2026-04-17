import React, { useEffect, useState, useMemo } from 'react';
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { Activity, ExternalLink, Clock } from 'lucide-react';
import { mnemonicToSeedSync } from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import nacl from 'tweetnacl';

export const ActivityFeed = ({ mnemonic }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const connection = useMemo(() => new Connection(clusterApiUrl('devnet'), 'confirmed'), []);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const seed = mnemonicToSeedSync(mnemonic);
        const path = `m/44'/501'/0'/0'`; 
        const derivedSeed = derivePath(path, seed.toString('hex')).key;
        const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
        const pubkey = new PublicKey(nacl.sign.keyPair.fromSeed(derivedSeed).publicKey);

        const signatures = await connection.getSignaturesForAddress(pubkey, { limit: 15 });
        setTransactions(signatures);
      } catch (e) {
        console.error('Failed to fetch activity', e);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [mnemonic, connection]);

  if (loading) return <div className="p-10 text-center text-dim font-bold animate-pulse">Scanning On-Chain Activity...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <Activity className="text-primary" /> On-Chain Activity
          </h3>
          <p className="text-dim text-sm mt-1">Recent operations on Solana Devnet</p>
        </div>
        <span className="orbit-badge bg-white/5 border border-white/10 uppercase tracking-widest text-[10px]">Primary Account</span>
      </div>

      <div className="space-y-3">
        {transactions.length > 0 ? (
          transactions.map((tx, i) => (
            <div key={i} className="wallet-item-orbit group hover:bg-white/5 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <Clock size={16} className="text-dim" />
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-xs opacity-40 group-hover:opacity-100 transition-opacity">
                    {tx.signature.slice(0, 16)}...
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest mt-1 text-dim">
                    Validated &bull; {tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleTimeString() : 'Recent'}
                  </span>
                </div>
              </div>
              <a 
                href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`} 
                target="_blank" 
                rel="noreferrer"
                className="p-2 text-dim hover:text-primary transition-colors"
                title="View in Explorer"
              >
                <ExternalLink size={18} />
              </a>
            </div>
          ))
        ) : (
          <div className="p-10 border border-dashed border-white/10 rounded-3xl text-center text-dim">
            No recent activity detected on Devnet.
          </div>
        )}
      </div>
    </div>
  );
};


