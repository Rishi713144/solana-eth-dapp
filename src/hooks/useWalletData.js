import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { JsonRpcProvider, formatEther } from 'ethers';
import { useNetwork } from '@/components/providers/NetworkProvider';
import { deriveEthAccounts, deriveSolanaAccounts } from '@/utils/internalWallet';
import { withTimeout } from '@/lib/rpc';

const SOL_COUNT_KEY = 'vela_sol_accounts';
const ETH_COUNT_KEY = 'vela_eth_accounts';
const MAX_ACCOUNTS = 10;

function readCount(key, fallback = 1) {
  try {
    const value = Number.parseInt(localStorage.getItem(key) || '', 10);
    if (Number.isFinite(value) && value >= 1) return Math.min(value, MAX_ACCOUNTS);
  } catch {
    // ignore
  }
  return fallback;
}

export function useWalletData(mnemonic) {
  const { config } = useNetwork();
  const [solCount, setSolCount] = useState(() => readCount(SOL_COUNT_KEY));
  const [ethCount, setEthCount] = useState(() => readCount(ETH_COUNT_KEY));
  const [solBalances, setSolBalances] = useState({});
  const [ethBalances, setEthBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    setSolBalances({});
    setEthBalances({});
  }, [config.endpoint]);

  const solAccounts = useMemo(() => {
    if (!mnemonic) return [];
    try {
      return deriveSolanaAccounts(mnemonic, solCount);
    } catch {
      return [];
    }
  }, [mnemonic, solCount]);

  const ethAccounts = useMemo(() => {
    if (!mnemonic) return [];
    try {
      return deriveEthAccounts(mnemonic, ethCount);
    } catch {
      return [];
    }
  }, [mnemonic, ethCount]);

  const refresh = useCallback(async () => {
    if (!mnemonic || !config) return;
    setLoading(true);
    const nextSol = {};
    const nextEth = {};

    try {
      const connection = new Connection(config.endpoint, 'confirmed');
      const solResults = await Promise.allSettled(
        solAccounts.map(account =>
          withTimeout(connection.getBalance(account.keypair.publicKey), 12000, 'Solana balance'),
        ),
      );
      solResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          nextSol[solAccounts[index].address] = result.value / LAMPORTS_PER_SOL;
        }
      });

      const provider = new JsonRpcProvider(config.evm.rpc, config.evm.chainId, { staticNetwork: true });
      const ethResults = await Promise.allSettled(
        ethAccounts.map(account =>
          withTimeout(provider.getBalance(account.address), 12000, 'Ethereum balance'),
        ),
      );
      ethResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          nextEth[ethAccounts[index].address] = Number(formatEther(result.value));
        }
      });

      if (mounted.current) {
        setSolBalances(previous => ({ ...previous, ...nextSol }));
        setEthBalances(previous => ({ ...previous, ...nextEth }));
        setLastUpdated(new Date());
      }
    } catch {
      // Keep the last known balances when the public RPC is unreachable.
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [mnemonic, config, solAccounts, ethAccounts]);

  useEffect(() => {
    refresh();
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, 30000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const addSolAccount = useCallback(() => {
    setSolCount(previous => {
      const next = Math.min(previous + 1, MAX_ACCOUNTS);
      localStorage.setItem(SOL_COUNT_KEY, String(next));
      return next;
    });
  }, []);

  const addEthAccount = useCallback(() => {
    setEthCount(previous => {
      const next = Math.min(previous + 1, MAX_ACCOUNTS);
      localStorage.setItem(ETH_COUNT_KEY, String(next));
      return next;
    });
  }, []);

  const totalSol = solAccounts.reduce((sum, account) => sum + (solBalances[account.address] || 0), 0);
  const totalEth = ethAccounts.reduce((sum, account) => sum + (ethBalances[account.address] || 0), 0);

  return {
    solAccounts,
    ethAccounts,
    solBalances,
    ethBalances,
    totalSol,
    totalEth,
    loading,
    lastUpdated,
    refresh,
    addSolAccount,
    addEthAccount,
    maxAccountsReached: solCount >= MAX_ACCOUNTS && ethCount >= MAX_ACCOUNTS,
  };
}
