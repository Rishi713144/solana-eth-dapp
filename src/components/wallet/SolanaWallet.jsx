import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { mnemonicToSeedSync } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair, Connection, clusterApiUrl, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import { Copy, CheckCheck } from "lucide-react";

export function SolanaWallet({ mnemonic }) {
  const [indexes, setIndexes] = useState([0]);
  const [publicKeys, setPublicKeys] = useState([]);
  const [balances, setBalances] = useState({});
  const [copied, setCopied] = useState(null);

  const connection = useMemo(() => new Connection(clusterApiUrl("devnet"), "confirmed"), []);

  const fetchBalance = async (pubkey) => {
    try {
      const bal = await connection.getBalance(new PublicKey(pubkey));
      setBalances(prev => ({ ...prev, [pubkey]: bal / LAMPORTS_PER_SOL }));
    } catch (e) {
      console.error("Balance fetch failed", e);
    }
  };

  useEffect(() => {
    const seed = mnemonicToSeedSync(mnemonic);
    const newKeys = indexes.map(index => {
      const path = `m/44'/501'/${index}'/0'`;
      const derivedSeed = derivePath(path, seed.toString("hex")).key;
      const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
      const keypair = Keypair.fromSecretKey(secret);
      const pk = keypair.publicKey.toBase58();
      fetchBalance(pk);
      return pk;
    });
    setPublicKeys(newKeys);
  }, [mnemonic, indexes]);

  function addWallet() {
    setIndexes([...indexes, indexes.length]);
  }

  function copyKey(key, idx) {
    navigator.clipboard.writeText(key);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="chain-wallet-section">
      <div className="chain-header">
        <div className="chain-title">
          <span className="orbit-badge">SOL</span>
          Solana
        </div>
        <button className="btn-orbit py-2 px-4 text-xs" onClick={addWallet}>
          + Create
        </button>
      </div>

      {publicKeys.length === 0 && (
        <p className="no-wallets-hint">No Solana wallets generated yet.</p>
      )}

      <div className="wallet-list-orbit">
        {publicKeys.map((key, idx) => (
            <div key={idx} className="wallet-item-orbit group">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-dim uppercase tracking-widest">Account {idx}</span>
                <span className="font-mono text-sm opacity-60 group-hover:opacity-100 transition-opacity">
                  {key.slice(0, 8)}...{key.slice(-8)}
                </span>
                <div className="flex items-center gap-2 mt-2">
                    <span className="orbit-badge bg-green-500/10 text-green-400">
                        {balances[key] !== undefined ? balances[key].toFixed(4) : '...'} SOL
                    </span>
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">On Devnet</span>
                </div>
              </div>
            <button
              className="p-2 hover:bg-white/5 rounded-lg transition-all"
              onClick={() => copyKey(key, `sol-${idx}`)}
            >
              {copied === `sol-${idx}` ? <CheckCheck size={16} className="text-primary" /> : <Copy size={16} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

SolanaWallet.propTypes = {
  mnemonic: PropTypes.string.isRequired,
};


