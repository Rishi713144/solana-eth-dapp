import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { Send } from "lucide-react";

export function SendTokens() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendTokens() {
    if (!wallet.publicKey) return setStatus("❌ Wallet not connected");
    try {
      setLoading(true);
      setStatus("Sending...");
      const transaction = new Transaction();
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: new PublicKey(toAddress),
          lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
        })
      );
      await wallet.sendTransaction(transaction, connection);
      setStatus(`✅ Sent ${amount} SOL to ${toAddress.substring(0, 8)}...`);
      setToAddress("");
      setAmount("");
    } catch (error) {
      setStatus(`❌ Transaction failed: ${error?.message?.slice(0, 50) || "unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dapp-card glass">
      <div className="dapp-card-header">
        <Send size={18} />
        <h3>Send SOL</h3>
      </div>
      <div className="dapp-card-body">
        <input
          className="dapp-input"
          type="text"
          placeholder="Recipient Address"
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
        />
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
          onClick={sendTokens}
          disabled={!wallet.publicKey || loading || !toAddress || !amount}
        >
          {loading ? "Sending..." : "Send Tokens"}
        </button>
        {status && <p className={`dapp-status ${status.startsWith("✅") ? "success" : status.startsWith("❌") ? "error" : ""}`}>{status}</p>}
      </div>
    </div>
  );
}


