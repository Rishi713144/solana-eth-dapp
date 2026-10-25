import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useNetwork } from '@/components/providers/NetworkProvider';
import { withTimeout } from '@/lib/rpc';

export function useSplTokens(ownerAddress) {
  const { config } = useNetwork();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    setTokens([]);
  }, [ownerAddress, config.endpoint]);

  const refresh = useCallback(async () => {
    if (!ownerAddress) {
      setTokens([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const connection = new Connection(config.endpoint, 'confirmed');
      const owner = new PublicKey(ownerAddress);
      const groups = await Promise.allSettled(
        [TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID].map(programId =>
          withTimeout(
            connection.getParsedTokenAccountsByOwner(owner, { programId }),
            12000,
            'Token accounts',
          ),
        ),
      );

      const found = [];
      groups.forEach(group => {
        if (group.status !== 'fulfilled') return;
        group.value.value.forEach(({ account, pubkey }) => {
          const info = account.data?.parsed?.info;
          const amount = Number(info?.tokenAmount?.uiAmount || 0);
          if (!info?.mint || amount <= 0) return;
          found.push({
            mint: info.mint,
            amount,
            decimals: info.tokenAmount?.decimals || 0,
            address: pubkey.toBase58(),
          });
        });
      });

      if (mounted.current) setTokens(found.slice(0, 12));
    } catch {
      if (mounted.current) setTokens([]);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [ownerAddress, config.endpoint]);

  useEffect(() => {
    refresh();
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, 60000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const total = useMemo(() => tokens.reduce((sum, token) => sum + token.amount, 0), [tokens]);
  return { tokens, loading, refresh, total };
}
