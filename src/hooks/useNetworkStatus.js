import { useCallback, useEffect, useRef, useState } from 'react';
import { Connection } from '@solana/web3.js';
import { useNetwork } from '@/components/providers/NetworkProvider';
import { withTimeout } from '@/lib/rpc';

export function useNetworkStatus() {
  const { config } = useNetwork();
  const [status, setStatus] = useState({ epoch: null, slot: null, blockHeight: null });
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    try {
      const connection = new Connection(config.endpoint, 'confirmed');
      const [epochInfo, blockHeight] = await Promise.all([
        withTimeout(connection.getEpochInfo(), 10000, 'Network status'),
        withTimeout(connection.getBlockHeight(), 10000, 'Network status'),
      ]);
      if (mounted.current) {
        setStatus({
          epoch: epochInfo.epoch,
          slot: epochInfo.absoluteSlot,
          blockHeight,
        });
        setOnline(true);
      }
    } catch {
      if (mounted.current) setOnline(false);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [config.endpoint]);

  useEffect(() => {
    setLoading(true);
    refresh();
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, 30000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  return { ...status, loading, online, refresh };
}
