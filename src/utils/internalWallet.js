import { Keypair } from '@solana/web3.js';
import { mnemonicToSeedSync } from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import nacl from 'tweetnacl';
import { HDNodeWallet, Wallet } from 'ethers';

export function deriveSolanaKeypair(mnemonic, index = 0) {
  if (!mnemonic) throw new Error('A recovery phrase is required');
  const seed = mnemonicToSeedSync(mnemonic);
  const path = `m/44'/501'/${index}'/0'`;
  const derivedSeed = derivePath(path, seed.toString('hex')).key;
  const keypair = nacl.sign.keyPair.fromSeed(derivedSeed);
  return Keypair.fromSecretKey(keypair.secretKey);
}

export function deriveEthWallet(mnemonic, index = 0) {
  if (!mnemonic) throw new Error('A recovery phrase is required');
  const seed = mnemonicToSeedSync(mnemonic);
  const path = `m/44'/60'/${index}'/0'`;
  const node = HDNodeWallet.fromSeed(seed);
  const child = node.derivePath(path);
  return new Wallet(child.privateKey);
}

export function getSolanaKeypair(mnemonic, index = 0) {
  return deriveSolanaKeypair(mnemonic, index);
}

export function getEthWallet(mnemonic, index = 0) {
  return deriveEthWallet(mnemonic, index);
}

export function getSolanaPublicKey(mnemonic, index = 0) {
  return deriveSolanaKeypair(mnemonic, index).publicKey.toBase58();
}

export function getEthAddress(mnemonic, index = 0) {
  return deriveEthWallet(mnemonic, index).address;
}

export function deriveSolanaAccounts(mnemonic, count = 1) {
  return Array.from({ length: Math.max(1, count) }, (_, index) => {
    const keypair = deriveSolanaKeypair(mnemonic, index);
    return {
      index,
      keypair,
      address: keypair.publicKey.toBase58(),
    };
  });
}

export function deriveEthAccounts(mnemonic, count = 1) {
  return Array.from({ length: Math.max(1, count) }, (_, index) => {
    const wallet = deriveEthWallet(mnemonic, index);
    return {
      index,
      wallet,
      address: wallet.address,
    };
  });
}
