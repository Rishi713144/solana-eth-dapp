import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";

export function ShowSolBalance() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getBalance() {
      if (wallet.publicKey) {
        setLoading(true);
        try {
          const bal = await connection.getBalance(wallet.publicKey);
          setBalance(bal / LAMPORTS_PER_SOL);
        } catch (_) {
          setBalance(0);
        } finally {
          setLoading(false);
        }
      } else {
        setBalance(0);
      }
    }
    getBalance();
  }, [connection, wallet.publicKey]);

  return (
    <div className="dapp-card glass">
      <div className="dapp-card-header">
        <Wallet size={18} />
        <h3>SOL Balance</h3>
      </div>
      <div className="balance-display">
        {wallet.publicKey ? (
          loading ? (
            <span className="balance-loading">Loading...</span>
          ) : (
            <span className="balance-amount">{balance.toFixed(4)} <span className="balance-unit">SOL</span></span>
          )
        ) : (
          <span className="balance-no-wallet">Connect wallet to view balance</span>
        )}
      </div>
    </div>
  );
}


