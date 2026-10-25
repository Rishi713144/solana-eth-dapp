import { ed25519 } from "@noble/curves/ed25519";
import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import { useState } from "react";
import { PenLine } from "lucide-react";

export function SignMessage() {
  const { publicKey, signMessage } = useWallet();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function onClick() {
    if (!publicKey) return setStatus("❌ Wallet not connected!");
    if (!signMessage) return setStatus("❌ Wallet does not support message signing!");
    try {
      setLoading(true);
      setStatus("Signing...");
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await signMessage(encodedMessage);
      if (!ed25519.verify(signature, encodedMessage, publicKey.toBytes())) {
        throw new Error("Message signature invalid!");
      }
      setStatus(`✅ Signature: ${bs58.encode(signature).substring(0, 20)}...`);
      setMessage("");
    } catch (error) {
      setStatus(`❌ ${error?.message || "Failed to sign message"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dapp-card glass">
      <div className="dapp-card-header">
        <PenLine size={18} />
        <h3>Sign Message</h3>
      </div>
      <div className="dapp-card-body">
        <input
          className="dapp-input"
          type="text"
          placeholder="Enter message to sign"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          className="btn-dapp-action"
          onClick={onClick}
          disabled={!publicKey || loading || !message}
        >
          {loading ? "Signing..." : "Sign Message"}
        </button>
        {status && <p className={`dapp-status ${status.startsWith("✅") ? "success" : status.startsWith("❌") ? "error" : ""}`}>{status}</p>}
      </div>
    </div>
  );
}


