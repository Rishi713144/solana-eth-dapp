import { useCallback, useEffect, useRef, useState } from 'react';
import { readJson, writeJson } from '@/lib/rpc';

const CACHE_KEY = 'vela_prices_v1';
const REFRESH_MS = 120000;

function normalizePrices(value) {
  return {
    solana: {
      usd: Number(value?.solana?.usd || 0),
      usd_24h_change: Number(value?.solana?.usd_24h_change || 0),
    },
    ethereum: {
      usd: Number(value?.ethereum?.usd || 0),
      usd_24h_change: Number(value?.ethereum?.usd_24h_change || 0),
    },
  };
}

async function fetchPrices(signal) {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=solana,ethereum&vs_currencies=usd&include_24hr_change=true',
    { signal, headers: { accept: 'application/json' } },
  );
  if (!response.ok) throw new Error(`Price API responded ${response.status}`);
  return response.json();
}

export function usePrices() {
  const cached = readJson(CACHE_KEY, null);
  const [prices, setPrices] = useState(() => normalizePrices(cached?.prices));
  const [updatedAt, setUpdatedAt] = useState(cached?.updatedAt || null);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState('');
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 9000);
    setLoading(true);
    try {
      const data = await fetchPrices(controller.signal);
      const next = normalizePrices(data);
      if (mounted.current && (next.solana.usd || next.ethereum.usd)) {
        setPrices(next);
        const stamp = new Date().toISOString();
        setUpdatedAt(stamp);
        writeJson(CACHE_KEY, { prices: next, updatedAt: stamp });
        setError('');
      }
    } catch {
      if (mounted.current) setError('Live prices unavailable');
    } finally {
      window.clearTimeout(timer);
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, REFRESH_MS);
    return () => window.clearInterval(interval);
  }, [refresh]);

  return { prices, loading, error, updatedAt, refresh };
}
