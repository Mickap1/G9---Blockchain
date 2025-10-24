import { useState, useEffect } from 'react';
import { getSwaps, getTransfers, getNFTs, getStats, getHealth, type Swap, type TokenTransfer, type NFT, type Stats } from '@/lib/api';

export function useIndexerHealth() {
  const [isHealthy, setIsHealthy] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await getHealth();
        setIsHealthy(true);
      } catch (error) {
        console.warn('Indexer not available, falling back to direct blockchain reads');
        setIsHealthy(false);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
    // Re-check every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return { isHealthy, loading };
}

export function useIndexerSwaps(limit = 50, skip = 0) {
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSwaps = async () => {
      try {
        setLoading(true);
        const data = await getSwaps(limit, skip);
        setSwaps(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching swaps from indexer:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSwaps();
    // Refresh every 60 seconds
    const interval = setInterval(fetchSwaps, 60000);
    return () => clearInterval(interval);
  }, [limit, skip]);

  return { swaps, loading, error };
}

export function useIndexerTransfers(limit = 50, skip = 0) {
  const [transfers, setTransfers] = useState<TokenTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        setLoading(true);
        const data = await getTransfers(limit, skip);
        setTransfers(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching transfers from indexer:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransfers();
    // Refresh every 60 seconds
    const interval = setInterval(fetchTransfers, 60000);
    return () => clearInterval(interval);
  }, [limit, skip]);

  return { transfers, loading, error };
}

export function useIndexerNFTs(owner?: string) {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        setLoading(true);
        const data = await getNFTs(owner);
        setNfts(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching NFTs from indexer:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
    // Refresh every 60 seconds
    const interval = setInterval(fetchNFTs, 60000);
    return () => clearInterval(interval);
  }, [owner]);

  return { nfts, loading, error };
}

export function useIndexerStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getStats();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching stats from indexer:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh every 60 seconds
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  return { stats, loading, error };
}
