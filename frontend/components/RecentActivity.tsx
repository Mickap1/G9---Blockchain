'use client';

import { useState } from 'react';
import { formatEther } from 'viem';
import { useIndexerSwaps, useIndexerTransfers, useIndexerStats, useIndexerHealth } from '@/lib/hooks/useIndexer';
import { Activity, TrendingUp, ArrowRightLeft, Send, RefreshCw } from 'lucide-react';

interface RecentActivityProps {
  maxItems?: number;
  showTitle?: boolean;
  compact?: boolean;
}

export function RecentActivity({ maxItems = 10, showTitle = true, compact = false }: RecentActivityProps) {
  const { swaps, loading: swapsLoading } = useIndexerSwaps(maxItems, 0);
  const { transfers, loading: transfersLoading } = useIndexerTransfers(maxItems, 0);
  const { stats } = useIndexerStats();
  const { isHealthy, loading: healthLoading } = useIndexerHealth();
  const [activeTab, setActiveTab] = useState<'all' | 'swaps' | 'transfers'>('all');

  const loading = swapsLoading || transfersLoading || healthLoading;

  // Combiner et trier toutes les activités par date
  const allActivities = [
    ...swaps.map(s => ({
      type: 'swap' as const,
      timestamp: new Date(typeof s.timestamp === 'number' ? s.timestamp * 1000 : s.timestamp),
      data: s,
    })),
    ...transfers.map(t => ({
      type: 'transfer' as const,
      timestamp: new Date(typeof t.timestamp === 'number' ? t.timestamp * 1000 : t.timestamp),
      data: t,
    })),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, maxItems);

  const filteredActivities = activeTab === 'all' 
    ? allActivities 
    : allActivities.filter(a => a.type === (activeTab === 'swaps' ? 'swap' : 'transfer'));

  if (!isHealthy) {
    return (
      <div className={`${compact ? 'p-4' : 'p-6'} bg-yellow-500/10 border border-yellow-500/30 rounded-xl`}>
        <div className="flex items-center gap-3 text-yellow-400">
          <Activity className="w-5 h-5 animate-pulse" />
          <div>
            <p className="font-semibold">Indexeur hors ligne</p>
            <p className="text-sm text-yellow-300">
              Les données sont lues directement depuis la blockchain. Certaines activités externes peuvent ne pas être visibles.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/10 backdrop-blur-md rounded-xl border border-white/20 ${compact ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className={`${compact ? 'text-lg' : 'text-2xl'} font-bold text-white`}>
                Activité Blockchain en Temps Réel
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Mise à jour automatique toutes les 60 secondes • Inclut les transactions externes
              </p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full border border-green-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-green-300">Indexeur actif</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && !compact && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg p-3 border border-blue-500/30">
            <div className="flex items-center gap-2 mb-1">
              <ArrowRightLeft className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-blue-300">Total Swaps</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalSwaps}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-3 border border-purple-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Send className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-purple-300">Total Transfers</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalTransfers}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-3 border border-green-500/30">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-300">Volume Total</span>
            </div>
            <p className="text-lg font-bold text-white">
              {parseFloat(formatEther(BigInt(stats.totalVolumeETH))).toFixed(4)} ETH
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg p-3 border border-orange-500/30">
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-orange-300">Prix Oracle</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalPriceUpdates}</p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'all'
              ? 'bg-purple-500 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Tout ({allActivities.length})
        </button>
        <button
          onClick={() => setActiveTab('swaps')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'swaps'
              ? 'bg-blue-500 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Swaps ({swaps.length})
        </button>
        <button
          onClick={() => setActiveTab('transfers')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'transfers'
              ? 'bg-green-500 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Transfers ({transfers.length})
        </button>
      </div>

      {/* Activity List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">Aucune activité récente</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {filteredActivities.map((activity, index) => (
            <div
              key={index}
              className="bg-white/5 hover:bg-white/10 rounded-lg p-4 border border-white/10 transition"
            >
              {activity.type === 'swap' ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.data.type === 'buy'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      <ArrowRightLeft className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          activity.data.type === 'buy'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {activity.data.type === 'buy' ? 'Achat' : 'Vente'}
                        </span>
                        <span className="text-xs text-gray-400 font-mono truncate">
                          {(activity.data.type === 'buy' ? activity.data.buyer : activity.data.seller)?.slice(0, 6)}...
                          {(activity.data.type === 'buy' ? activity.data.buyer : activity.data.seller)?.slice(-4)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-300">
                        {activity.data.type === 'buy' ? (
                          <>
                            {activity.data.ethIn ? parseFloat(formatEther(BigInt(activity.data.ethIn))).toFixed(4) : '0'}{' '}
                            <span className="text-gray-500">ETH</span>
                            {' → '}
                            {activity.data.tokensOut ? parseFloat(formatEther(BigInt(activity.data.tokensOut))).toFixed(4) : '0'}{' '}
                            <span className="text-gray-500">RWAT</span>
                          </>
                        ) : (
                          <>
                            {activity.data.tokensIn ? parseFloat(formatEther(BigInt(activity.data.tokensIn))).toFixed(4) : '0'}{' '}
                            <span className="text-gray-500">RWAT</span>
                            {' → '}
                            {activity.data.ethOut ? parseFloat(formatEther(BigInt(activity.data.ethOut))).toFixed(4) : '0'}{' '}
                            <span className="text-gray-500">ETH</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <p className="text-xs text-gray-400 mb-1">
                      {activity.timestamp.toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${activity.data.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-400 hover:text-purple-300 underline"
                    >
                      Voir TX ↗
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Send className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-300">
                          Transfer
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-300">
                        <span className="font-mono text-xs">
                          {activity.data.from?.slice(0, 6)}...{activity.data.from?.slice(-4)}
                        </span>
                        {' → '}
                        <span className="font-mono text-xs">
                          {activity.data.to?.slice(0, 6)}...{activity.data.to?.slice(-4)}
                        </span>
                        <div className="text-white font-medium mt-1">
                          {activity.data.amount ? parseFloat(formatEther(BigInt(activity.data.amount))).toFixed(4) : '0'} RWAT
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <p className="text-xs text-gray-400 mb-1">
                      {activity.timestamp.toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${activity.data.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-400 hover:text-purple-300 underline"
                    >
                      Voir TX ↗
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-gray-400 text-center">
          💡 Cette liste inclut <strong>toutes les transactions blockchain</strong>, même celles effectuées en dehors de cette interface (MetaMask, Etherscan, etc.)
        </p>
      </div>
    </div>
  );
}
