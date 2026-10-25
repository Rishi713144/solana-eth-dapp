import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Droplets } from "lucide-react";

export function RequestAirdrop() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestAirdrop() {
    if (!wallet.publicKey) {
      setStatus("Please connect your wallet first.");
      return;
    }
    try {
      setLoading(true);
      setStatus("Requesting airdrop...");
      await connection.requestAirdrop(wallet.publicKey, parseFloat(amount) * LAMPORTS_PER_SOL);
      setStatus(`✅ Successfully airdropped ${amount} SOL!`);
      setAmount("");
    } catch {
      setStatus("❌ Airdrop failed. Devnet limits may apply.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dapp-card glass">
      <div className="dapp-card-header">
        <Droplets size={18} />
        <h3>Request Airdrop</h3>
      </div>
      <div className="dapp-card-body">
        <input
          className="dapp-input"
          type="number"
          placeholder="Amount in SOL"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
        />
        <button
          className="btn-dapp-action"
          onClick={requestAirdrop}
          disabled={!wallet.publicKey || loading || !amount}
        >
          {loading ? "Requesting..." : "Request Airdrop"}
        </button>
        {status && <p className={`dapp-status ${status.startsWith("✅") ? "success" : status.startsWith("❌") ? "error" : ""}`}>{status}</p>}
      </div>
    </div>
  );
}


