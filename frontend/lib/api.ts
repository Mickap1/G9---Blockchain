import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_INDEXER_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Swap {
  transactionHash: string;
  blockNumber: number;
  timestamp: Date;
  user: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  swapType: 'buy' | 'sell';
}

export interface TokenTransfer {
  transactionHash: string;
  blockNumber: number;
  timestamp: Date;
  from: string;
  to: string;
  tokenAddress: string;
  amount: string;
}

export interface NFT {
  tokenId: string;
  owner: string;
  tokenURI: string;
  valuation: string;
  minter: string;
  mintedAt: Date;
}

export interface Stats {
  totalSwaps: number;
  totalTransfers: number;
  totalNFTs: number;
  totalPriceUpdates: number;
  totalVolumeETH: string;
}

// API calls
export const getHealth = async () => {
  const { data } = await api.get('/health');
  return data;
};

export const getSwaps = async (limit = 50, skip = 0) => {
  const { data } = await api.get<{ success: boolean; data: Swap[] }>('/swaps', {
    params: { limit, skip },
  });
  return data.data;
};

export const getTransfers = async (limit = 50, skip = 0) => {
  const { data } = await api.get<{ success: boolean; data: TokenTransfer[] }>('/transfers', {
    params: { limit, skip },
  });
  return data.data;
};

export const getNFTs = async (owner?: string) => {
  const { data } = await api.get<{ success: boolean; data: NFT[] }>('/nfts', {
    params: owner ? { owner } : {},
  });
  return data.data;
};

export const getStats = async () => {
  const { data } = await api.get<{ success: boolean; data: Stats }>('/stats');
  return data.data;
};

export default api;
