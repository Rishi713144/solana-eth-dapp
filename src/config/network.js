import { clusterApiUrl } from '@solana/web3.js';

const NETWORK_KEY = 'vela_network';
const LEGACY_NETWORK_KEY = 'sikka_network';

export const NETWORKS = {
  devnet: {
    key: 'devnet',
    name: 'Solana Devnet',
    shortName: 'Devnet',
    cluster: 'devnet',
    endpoint: clusterApiUrl('devnet'),
    tone: 'warning',
    evm: {
      chainId: 11155111,
      name: 'Sepolia',
      rpc: 'https://ethereum-sepolia-rpc.publicnode.com',
      explorer: 'https://sepolia.etherscan.io',
    },
  },
  testnet: {
    key: 'testnet',
    name: 'Solana Testnet',
    shortName: 'Testnet',
    cluster: 'testnet',
    endpoint: clusterApiUrl('testnet'),
    tone: 'accent',
    evm: {
      chainId: 11155111,
      name: 'Sepolia',
      rpc: 'https://ethereum-sepolia-rpc.publicnode.com',
      explorer: 'https://sepolia.etherscan.io',
    },
  },
};

export const NETWORK_OPTIONS = Object.values(NETWORKS);

export function getNetwork() {
  try {
    const stored = localStorage.getItem(NETWORK_KEY) || localStorage.getItem(LEGACY_NETWORK_KEY);
    if (stored && NETWORKS[stored]) return stored;
  } catch {
    // ignore storage failures
  }
  return 'devnet';
}

export function setNetwork(network) {
  try {
    if (NETWORKS[network]) {
      localStorage.setItem(NETWORK_KEY, network);
      return true;
    }
  } catch {
    // ignore storage failures
  }
  return false;
}

export function getEndpoint(network = getNetwork()) {
  return NETWORKS[network]?.endpoint || clusterApiUrl('devnet');
}

export function getNetworkConfig(network = getNetwork()) {
  return NETWORKS[network] || NETWORKS.devnet;
}

export function getEvmConfig(network = getNetwork()) {
  return getNetworkConfig(network).evm;
}
