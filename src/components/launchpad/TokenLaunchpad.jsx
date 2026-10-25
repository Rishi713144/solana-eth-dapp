import { useState } from "react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  MINT_SIZE,
  TOKEN_2022_PROGRAM_ID,
  createMintToInstruction,
  createAssociatedTokenAccountInstruction,
  getMintLen,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  TYPE_SIZE,
  LENGTH_SIZE,
  ExtensionType,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { createInitializeInstruction, pack } from "@solana/spl-token-metadata";
import { Rocket, CheckCircle, AlertCircle, Loader } from "lucide-react";

export function TokenLaunchpad() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [supply, setSupply] = useState("1000000000");
  const [status, setStatus] = useState(null); 
  const [mintAddress, setMintAddress] = useState(null);

  async function createToken() {
    if (!wallet.publicKey) {
      setStatus({ type: "error", msg: "Please connect your wallet first." });
      return;
    }
    try {
      setStatus({ type: "loading", msg: "Creating token mint..." });
      const mintKeypair = Keypair.generate();
      const metadata = {
        mint: mintKeypair.publicKey,
        name,
        symbol,
        uri: imageUrl,
        additionalMetadata: [],
      };

      const mintLen = getMintLen([ExtensionType.MetadataPointer]);
      const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
      const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: mintLen,
          lamports,
          programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeMetadataPointerInstruction(
          mintKeypair.publicKey, wallet.publicKey, mintKeypair.publicKey, TOKEN_2022_PROGRAM_ID
        ),
        createInitializeMintInstruction(
          mintKeypair.publicKey, 9, wallet.publicKey, null, TOKEN_2022_PROGRAM_ID
        ),
        createInitializeInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          mint: mintKeypair.publicKey,
          metadata: mintKeypair.publicKey,
          name: metadata.name,
          symbol: metadata.symbol,
          uri: metadata.uri,
          mintAuthority: wallet.publicKey,
          updateAuthority: wallet.publicKey,
        })
      );

      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      transaction.partialSign(mintKeypair);
      await wallet.sendTransaction(transaction, connection);

      setStatus({ type: "loading", msg: "Creating associated token account..." });
      const associatedToken = getAssociatedTokenAddressSync(
        mintKeypair.publicKey, wallet.publicKey, false, TOKEN_2022_PROGRAM_ID
      );

      const transaction2 = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey, associatedToken, wallet.publicKey,
          mintKeypair.publicKey, TOKEN_2022_PROGRAM_ID
        )
      );
      await wallet.sendTransaction(transaction2, connection);

      setStatus({ type: "loading", msg: "Minting tokens..." });
      const transaction3 = new Transaction().add(
        createMintToInstruction(
          mintKeypair.publicKey, associatedToken, wallet.publicKey,
          parseInt(supply), [], TOKEN_2022_PROGRAM_ID
        )
      );
      await wallet.sendTransaction(transaction3, connection);

      setMintAddress(mintKeypair.publicKey.toBase58());
      setStatus({ type: "success", msg: `Token deployed! Mint: ${mintKeypair.publicKey.toBase58().slice(0, 16)}...` });
      setName(""); setSymbol(""); setImageUrl(""); setSupply("1000000000");
    } catch (err) {
      setStatus({ type: "error", msg: err?.message?.slice(0, 80) || "Token creation failed." });
    }
  }

  return (
    <div className="launchpad-wrapper">
      <div className="bg-glow-1" />
      <div className="bg-glow-2" />
      <div className="launchpad-card glass">
        <div className="launchpad-card-icon">
          {imageUrl ? (
            <img src={imageUrl} alt="Token" onError={(e) => (e.target.style.display = "none")} />
          ) : (
            <Rocket size={32} color="#14F195" />
          )}
        </div>
        <h2 className="launchpad-title">Launch Token</h2>
        <p className="launchpad-subtitle">Deploy a Solana SPL Token-2022 in seconds</p>

        <form
          className="launchpad-form"
          onSubmit={(e) => { e.preventDefault(); createToken(); }}
        >
          <div className="form-row-2">
            <input
              className="dapp-input"
              type="text"
              placeholder="Token Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              className="dapp-input"
              type="text"
              placeholder="Symbol (e.g. SOL)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              maxLength={6}
              required
            />
          </div>
          <input
            className="dapp-input"
            type="url"
            placeholder="Metadata / Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
          />
          <input
            className="dapp-input"
            type="number"
            placeholder="Initial Supply"
            value={supply}
            onChange={(e) => setSupply(e.target.value)}
            min={1}
            required
          />
          <button
            type="submit"
            className="btn-launch"
            disabled={!wallet.publicKey || status?.type === "loading"}
          >
            {status?.type === "loading" ? (
              <><Loader size={16} className="spin-icon" /> {status.msg}</>
            ) : (
              <><Rocket size={16} /> Deploy Token</>
            )}
          </button>
        </form>

        {status && status.type !== "loading" && (
          <div className={`launch-status ${status.type}`}>
            {status.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{status.msg}</span>
          </div>
        )}
        {mintAddress && (
          <a
            href={`https://explorer.solana.com/address/${mintAddress}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="explorer-link"
          >
            View on Explorer ↗
          </a>
        )}
      </div>
    </div>
  );
}


