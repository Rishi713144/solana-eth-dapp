import { useState } from "react";
import PropTypes from "prop-types";
import { mnemonicToSeed } from "bip39";
import { Wallet, HDNodeWallet } from "ethers";
import { Copy, CheckCheck } from "lucide-react";

export const EthWallet = ({ mnemonic }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [copied, setCopied] = useState(null);

  async function addWallet() {
    const seed = await mnemonicToSeed(mnemonic);
    const derivationPath = `m/44'/60'/${currentIndex}'/0'`;
    const hdNode = HDNodeWallet.fromSeed(seed);
    const child = hdNode.derivePath(derivationPath);
    const privateKey = child.privateKey;
    const wallet = new Wallet(privateKey);
    setCurrentIndex(currentIndex + 1);
    setAddresses([...addresses, wallet.address]);
  }

  function copyAddress(addr, idx) {
    navigator.clipboard.writeText(addr);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="chain-wallet-section">
      <div className="chain-header">
        <div className="chain-title">
          <span className="orbit-badge">ETH</span>
          Ethereum
        </div>
        <button className="btn-orbit py-2 px-4 text-xs" onClick={addWallet}>
          + Create
        </button>
      </div>

      {addresses.length === 0 && (
        <p className="no-wallets-hint">No Ethereum wallets generated yet.</p>
      )}

      <div className="wallet-list-orbit">
        {addresses.map((addr, index) => (
          <div key={index} className="wallet-item-orbit">
            <div className="text-sm font-bold opacity-40">#{index + 1}</div>
            <div className="address-orbit">{addr.slice(0, 12)}...{addr.slice(-10)}</div>
            <button
              className="p-2 hover:bg-white/5 rounded-lg transition-all"
              onClick={() => copyAddress(addr, `eth-${index}`)}
            >
              {copied === `eth-${index}` ? <CheckCheck size={16} className="text-primary" /> : <Copy size={16} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

EthWallet.propTypes = {
  mnemonic: PropTypes.string.isRequired,
};


