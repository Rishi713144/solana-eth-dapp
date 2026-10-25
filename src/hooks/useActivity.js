import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { useNetwork } from '@/components/providers/NetworkProvider';
import { withTimeout } from '@/lib/rpc';

export function useActivity(solAccounts) {
  const { network, config } = useNetwork();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    setTransactions([]);
  }, [config.endpoint]);

  const addressKey = useMemo(
    () => (solAccounts || []).map(account => account.address).join(','),
    [solAccounts],
  );

  const refresh = useCallback(async () => {
    if (!addressKey) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const connection = new Connection(config.endpoint, 'confirmed');
      const accounts = addressKey.split(',');
      const signatureGroups = await Promise.allSettled(
        accounts.map(address =>
          withTimeout(
            connection.getSignaturesForAddress(new PublicKey(address), { limit: 8 }),
            12000,
            'Activity',
          ),
        ),
      );

      const signatures = [];
      signatureGroups.forEach(group => {
        if (group.status === 'fulfilled') {
          group.value.forEach(item => signatures.push(item));
        }
      });

      const unique = Array.from(new Map(signatures.map(item => [item.signature, item])).values())
        .sort((a, b) => (b.blockTime || 0) - (a.blockTime || 0))
        .slice(0, 14);

      if (unique.length === 0) {
        if (mounted.current) setTransactions([]);
        return;
      }

      const parsed = await withTimeout(
        connection.getParsedTransactions(
          unique.map(item => item.signature),
          { maxSupportedTransactionVersion: 0 },
        ),
        20000,
        'Activity details',
      );

      const addressSet = new Set(accounts);
      const items = unique.map((signatureInfo, index) => {
        const tx = parsed[index];
        let type = 'interaction';
        let amount = 0;
        let counterparty = '';

        if (tx?.meta) {
          tx.transaction.message.accountKeys.forEach((key, keyIndex) => {
            const address = typeof key === 'string' ? key : key.pubkey.toBase58();
            if (!addressSet.has(address)) return;
            const delta = (tx.meta.postBalances[keyIndex] || 0) - (tx.meta.preBalances[keyIndex] || 0);
            if (delta > 0) {
              type = 'received';
              amount = delta / LAMPORTS_PER_SOL;
            } else if (delta < 0 && !signatureInfo.err) {
              type = 'sent';
              amount = Math.abs(delta) / LAMPORTS_PER_SOL;
            }
          });

          const instructions = tx.transaction.message.instructions || [];
          const transfer = instructions.find((instruction) => instruction.program === 'system' && instruction.parsed?.type === 'transfer');
          if (transfer?.parsed?.info) {
            counterparty = type === 'received' ? transfer.parsed.info.source : transfer.parsed.info.destination;
          }
        }

        return {
          signature: signatureInfo.signature,
          blockTime: signatureInfo.blockTime,
          slot: signatureInfo.slot,
          status: signatureInfo.err ? 'failed' : 'success',
          memo: signatureInfo.memo || '',
          type,
          amount,
          counterparty,
        };
      });

      if (mounted.current) setTransactions(items);
    } catch {
      if (mounted.current) setError('Unable to load on-chain activity');
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [addressKey, config.endpoint]);

  useEffect(() => {
    refresh();
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, 60000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  return { transactions, loading, error, refresh, network };
}
