'use client';

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import SimplePriceOracleABI from '@/lib/abis/SimplePriceOracle.json';
import FungibleTokenABI from '@/lib/abis/FungibleAssetToken.json';
import NFTTokenV2ABI from '@/lib/abis/NFTAssetTokenV2.json';
import { Header } from '@/components/Header';
import { 
  LineChart, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  RefreshCw,
  Lock,
  Unlock,
  Edit,
  Database,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const ORACLE_ADDRESS = '0x602571F05745181fF237b81dAb8F67148e9475C7';
const FUNGIBLE_TOKEN_ADDRESS = '0xfA451d9C32d15a637Ab376732303c36C34C9979f';
const NFT_TOKEN_ADDRESS = '0xf16b0641A9C56C6db30E052E90DB9358b6D2C946'; // NFTAssetTokenV2

// Rôles
const ORACLE_ADMIN_ROLE = '0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775';
const PRICE_UPDATER_ROLE = '0x04fcf77d802b9769438bfcbfc6eae4865484c9853501897657f1d28c3f3d3068';

interface PriceData {
  price: bigint;
  lastUpdate: bigint;
  updateCount: bigint;
  isActive: boolean;
}

interface PriceHistory {
  price: bigint;
  timestamp: bigint;
}

interface UserNFT {
  tokenId: number;
  priceData: PriceData | null;
  history: PriceHistory[];
}

export default function OraclePage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // États pour les prix
  const [fungiblePriceData, setFungiblePriceData] = useState<PriceData | null>(null);
  const [fungibleHistory, setFungibleHistory] = useState<PriceHistory[]>([]);
  
  // État pour TOUS les NFTs de l'utilisateur
  const [userNFTs, setUserNFTs] = useState<UserNFT[]>([]);
  
  // État pour la navigation entre NFTs
  const [currentNFTIndex, setCurrentNFTIndex] = useState(0);
  
  // États pour l'admin
  const [isOracleAdmin, setIsOracleAdmin] = useState(false);
  const [isPriceUpdater, setIsPriceUpdater] = useState(false);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');

  // États pour les formulaires
  const [newFungiblePrice, setNewFungiblePrice] = useState('');
  const [newNftPrice, setNewNftPrice] = useState('');
  const [selectedNftId, setSelectedNftId] = useState('0');  // Charger les données
  useEffect(() => {
    if (isConnected && publicClient && address) {
      loadAllData();
      checkRoles();
    }
  }, [isConnected, publicClient, address]);

  const checkRoles = async () => {
    if (!publicClient || !address) return;

    try {
      const [adminRole, updaterRole] = await Promise.all([
        publicClient.readContract({
          address: ORACLE_ADDRESS as `0x${string}`,
          abi: SimplePriceOracleABI,
          functionName: 'hasRole',
          args: [ORACLE_ADMIN_ROLE, address],
        }),
        publicClient.readContract({
          address: ORACLE_ADDRESS as `0x${string}`,
          abi: SimplePriceOracleABI,
          functionName: 'hasRole',
          args: [PRICE_UPDATER_ROLE, address],
        }),
      ]);

      setIsOracleAdmin(adminRole as boolean);
      setIsPriceUpdater(updaterRole as boolean);
    } catch (error) {
      console.error('Erreur vérification rôles:', error);
    }
  };

  const loadAllData = async () => {
    if (!publicClient || !address) return;

    try {
      // Charger prix du token fongible
      const fungibleData = await publicClient.readContract({
        address: ORACLE_ADDRESS as `0x${string}`,
        abi: SimplePriceOracleABI,
        functionName: 'getPriceData',
        args: [FUNGIBLE_TOKEN_ADDRESS],
      }) as PriceData;

      setFungiblePriceData(fungibleData);

      // Charger historique du token fongible
      const fungibleHistoryData = await publicClient.readContract({
        address: ORACLE_ADDRESS as `0x${string}`,
        abi: SimplePriceOracleABI,
        functionName: 'getPriceHistory',
        args: [FUNGIBLE_TOKEN_ADDRESS],
      }) as PriceHistory[];

      setFungibleHistory(fungibleHistoryData);

      // Charger TOUS les NFTs de l'utilisateur
      await loadUserNFTs();
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };

  const loadUserNFTs = async () => {
    if (!publicClient || !address) return;

    try {
      // Récupérer les token IDs de l'utilisateur depuis le contrat NFT
      const tokenIds = await publicClient.readContract({
        address: NFT_TOKEN_ADDRESS as `0x${string}`,
        abi: NFTTokenV2ABI,
        functionName: 'tokensOfOwner',
        args: [address],
      }) as bigint[];

      console.log('NFTs possédés par l\'utilisateur:', tokenIds.map(id => Number(id)));

      // Charger les données Oracle pour chaque NFT
      const nftDataPromises = tokenIds.map(async (tokenId) => {
        try {
          const priceDataRaw = await publicClient.readContract({
            address: ORACLE_ADDRESS as `0x${string}`,
            abi: SimplePriceOracleABI,
            functionName: 'nftPrices',
            args: [NFT_TOKEN_ADDRESS, tokenId],
          }) as [bigint, bigint, bigint, boolean];

          const priceData: PriceData = {
            price: priceDataRaw[0],
            lastUpdate: priceDataRaw[1],
            updateCount: priceDataRaw[2],
            isActive: priceDataRaw[3],
          };

          console.log(`NFT #${Number(tokenId)} - Prix:`, formatEther(priceData.price), 'EUR, Actif:', priceData.isActive);

          const history = await publicClient.readContract({
            address: ORACLE_ADDRESS as `0x${string}`,
            abi: SimplePriceOracleABI,
            functionName: 'getNFTPriceHistory',
            args: [NFT_TOKEN_ADDRESS, tokenId],
          }) as PriceHistory[];

          return {
            tokenId: Number(tokenId),
            priceData,
            history,
          };
        } catch (error) {
          console.log('Aucun prix défini pour NFT', Number(tokenId), error);
          return {
            tokenId: Number(tokenId),
            priceData: null,
            history: [],
          };
        }
      });

      const nftData = await Promise.all(nftDataPromises);
      setUserNFTs(nftData);
    } catch (error) {
      console.error('Erreur chargement NFTs:', error);
    }
  };

  const handleUpdateFungiblePrice = async () => {
    if (!walletClient || !newFungiblePrice) return;

    setLoading(true);
    setTxHash('');

    try {
      const priceInWei = parseEther(newFungiblePrice);
      
      const hash = await walletClient.writeContract({
        address: ORACLE_ADDRESS as `0x${string}`,
        abi: SimplePriceOracleABI,
        functionName: 'updatePrice',
        args: [FUNGIBLE_TOKEN_ADDRESS, priceInWei],
      });

      setTxHash(hash);
      
      await publicClient?.waitForTransactionReceipt({ hash });
      
      alert('Prix mis à jour avec succès !');
      setNewFungiblePrice('');
      loadAllData();
    } catch (error: any) {
      console.error('Erreur:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNFTPrice = async () => {
    if (!walletClient || !newNftPrice || !selectedNftId) return;

    setLoading(true);
    setTxHash('');

    try {
      const priceInWei = parseEther(newNftPrice);
      
      const hash = await walletClient.writeContract({
        address: ORACLE_ADDRESS as `0x${string}`,
        abi: SimplePriceOracleABI,
        functionName: 'updateNFTPrice',
        args: [NFT_TOKEN_ADDRESS, BigInt(selectedNftId), priceInWei],
      });

      setTxHash(hash);
      
      await publicClient?.waitForTransactionReceipt({ hash });
      
      alert('Prix NFT mis à jour avec succès !');
      setNewNftPrice('');
      loadAllData();
    } catch (error: any) {
      console.error('Erreur:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculatePriceChange = (history: PriceHistory[]) => {
    if (history.length < 2) return { percent: 0, isPositive: true };

    const latest = Number(formatEther(history[history.length - 1].price));
    const previous = Number(formatEther(history[history.length - 2].price));

    if (previous === 0) return { percent: 0, isPositive: true };

    const change = ((latest - previous) / previous) * 100;
    return { percent: Math.abs(change), isPositive: change >= 0 };
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString('fr-FR');
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <Database className="w-20 h-20 mx-auto mb-6 text-purple-400" />
            <h1 className="text-4xl font-bold text-white mb-4">Oracle de Prix</h1>
            <p className="text-gray-300 text-lg">
              Veuillez connecter votre wallet pour accéder à l&apos;Oracle
            </p>
          </div>
        </div>
      </div>
    );
  }

  const fungibleChange = calculatePriceChange(fungibleHistory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                <Database className="inline-block mr-3 mb-1" />
                Oracle de Prix
              </h1>
              <p className="text-gray-300">
                Données de prix en temps réel pour vos actifs tokenisés
              </p>
            </div>
            <button
              onClick={loadAllData}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
          </div>

          {/* Badges de rôle */}
          <div className="mt-4 flex gap-2">
            {isOracleAdmin && (
              <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500 text-yellow-300 rounded-full text-sm flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Oracle Admin
              </span>
            )}
            {isPriceUpdater && (
              <span className="px-3 py-1 bg-green-500/20 border border-green-500 text-green-300 rounded-full text-sm flex items-center gap-1">
                <Edit className="w-3 h-3" />
                Price Updater
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Prix Token Fongible */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Token RWAT
              </h2>
              {fungiblePriceData?.isActive ? (
                <span className="px-2 py-1 bg-green-500/20 border border-green-500 text-green-300 rounded text-sm">
                  Actif
                </span>
              ) : (
                <span className="px-2 py-1 bg-red-500/20 border border-red-500 text-red-300 rounded text-sm">
                  Inactif
                </span>
              )}
            </div>

            {fungiblePriceData && fungiblePriceData.price > BigInt(0) ? (
              <>
                <div className="mb-6">
                  <div className="text-4xl font-bold text-white mb-2">
                    {parseFloat(formatEther(fungiblePriceData.price)).toFixed(4)} EUR
                  </div>
                  <div className="flex items-center gap-2">
                    {fungibleChange.isPositive ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className={fungibleChange.isPositive ? 'text-green-400' : 'text-red-400'}>
                      {fungibleChange.isPositive ? '+' : '-'}{fungibleChange.percent.toFixed(2)}%
                    </span>
                    <span className="text-gray-400 text-sm">
                      depuis la dernière mise à jour
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Dernière mise à jour</span>
                    <span className="text-white flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(fungiblePriceData.lastUpdate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nombre de mises à jour</span>
                    <span className="text-white">{fungiblePriceData.updateCount.toString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Entrées d&apos;historique</span>
                    <span className="text-white">{fungibleHistory.length}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-400">
                Aucun prix défini pour ce token
              </div>
            )}
          </div>

          {/* Historique RWAT - juste après la carte RWAT */}
          <div className="col-span-full">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <LineChart className="w-5 h-5 text-blue-400" />
                Historique du Token RWAT
              </h3>
              
              {fungibleHistory.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {[...fungibleHistory].reverse().map((entry, index) => {
                    const prevEntry = index < fungibleHistory.length - 1 
                      ? fungibleHistory[fungibleHistory.length - index - 2] 
                      : null;
                    const currentPrice = parseFloat(formatEther(entry.price));
                    const prevPrice = prevEntry ? parseFloat(formatEther(prevEntry.price)) : currentPrice;
                    const change = prevPrice > 0 ? ((currentPrice - prevPrice) / prevPrice * 100) : 0;
                    const isIncrease = change > 0;
                    
                    return (
                      <div
                        key={index}
                        className="flex justify-between items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition border border-white/10"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 text-sm font-bold">
                            {fungibleHistory.length - index}
                          </div>
                          <div>
                            <div className="text-white font-bold text-lg">
                              {currentPrice.toLocaleString('fr-FR', {
                                minimumFractionDigits: 4,
                                maximumFractionDigits: 4
                              })} EUR
                            </div>
                            <div className="text-xs text-gray-400">
                              {formatTimestamp(entry.timestamp)}
                            </div>
                          </div>
                        </div>
                        
                        {prevEntry && (
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                            isIncrease ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {isIncrease ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            <span className="font-semibold">
                              {isIncrease ? '+' : ''}{change.toFixed(2)}%
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  Aucun historique disponible
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section NFTs séparée */}
        <div className="mb-8">
          {/* Prix NFTs de l'utilisateur avec navigation */}
          <div className="col-span-full">
            {userNFTs.length > 0 ? (
              <>
                {/* En-tête avec navigation */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Activity className="w-6 h-6 text-purple-400" />
                    Mes NFTs
                  </h2>
                  
                  {userNFTs.length > 1 && (
                    <div className="flex items-center gap-4">
                      <span className="text-gray-300 text-sm">
                        {currentNFTIndex + 1} / {userNFTs.length}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentNFTIndex(prev => (prev === 0 ? userNFTs.length - 1 : prev - 1))}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition"
                        >
                          <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <button
                          onClick={() => setCurrentNFTIndex(prev => (prev === userNFTs.length - 1 ? 0 : prev + 1))}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition"
                        >
                          <ChevronRight className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* NFT actuel */}
                {(() => {
                  const currentNFT = userNFTs[currentNFTIndex];
                  const nftChange = currentNFT.history.length > 0 ? calculatePriceChange(currentNFT.history) : { percent: 0, isPositive: false };
                  
                  return (
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 mb-6">
                      {/* Header du NFT */}
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-3xl font-bold text-white mb-2">
                            💎 NFT Diamond #{currentNFT.tokenId}
                          </h3>
                          <p className="text-gray-400 text-sm">Token ID: {currentNFT.tokenId}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400 mb-1">Prix actuel</div>
                          {currentNFT.priceData && currentNFT.priceData.price > BigInt(0) ? (
                            <>
                              <div className="text-4xl font-bold text-white mb-2">
                                {parseFloat(formatEther(currentNFT.priceData.price)).toLocaleString('fr-FR', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })} <span className="text-2xl text-gray-400">EUR</span>
                              </div>
                              <div className="flex items-center justify-end gap-2">
                                {nftChange.isPositive ? (
                                  <TrendingUp className="w-5 h-5 text-green-400" />
                                ) : (
                                  <TrendingDown className="w-5 h-5 text-red-400" />
                                )}
                                <span className={`text-lg font-semibold ${nftChange.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                  {nftChange.isPositive ? '+' : ''}{nftChange.percent.toFixed(2)}%
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="text-2xl text-gray-500">Prix non défini</div>
                          )}
                        </div>
                      </div>

                      {/* Statistiques */}
                      {currentNFT.priceData && currentNFT.priceData.price > BigInt(0) && (
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <div className="bg-white/5 rounded-lg p-4">
                            <div className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Dernière mise à jour
                            </div>
                            <div className="text-white font-semibold">
                              {formatTimestamp(currentNFT.priceData.lastUpdate)}
                            </div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-4">
                            <div className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                              <RefreshCw className="w-4 h-4" />
                              Nombre de mises à jour
                            </div>
                            <div className="text-white font-semibold text-xl">
                              {currentNFT.priceData.updateCount.toString()}
                            </div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-4">
                            <div className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                              <LineChart className="w-4 h-4" />
                              Entrées d&apos;historique
                            </div>
                            <div className="text-white font-semibold text-xl">
                              {currentNFT.history.length}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Historique détaillé */}
                      <div className="border-t border-white/20 pt-6">
                        <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                          <LineChart className="w-5 h-5 text-purple-400" />
                          Historique des prix
                        </h4>
                        
                        {currentNFT.history.length > 0 ? (
                          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                            {[...currentNFT.history].reverse().map((entry, index) => {
                              const prevEntry = index < currentNFT.history.length - 1 
                                ? currentNFT.history[currentNFT.history.length - index - 2] 
                                : null;
                              const currentPrice = parseFloat(formatEther(entry.price));
                              const prevPrice = prevEntry ? parseFloat(formatEther(prevEntry.price)) : currentPrice;
                              const change = prevPrice > 0 ? ((currentPrice - prevPrice) / prevPrice * 100) : 0;
                              const isIncrease = change > 0;
                              
                              return (
                                <div
                                  key={index}
                                  className="flex justify-between items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition border border-white/10"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 text-sm font-bold">
                                      {currentNFT.history.length - index}
                                    </div>
                                    <div>
                                      <div className="text-white font-bold text-lg">
                                        {currentPrice.toLocaleString('fr-FR', {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2
                                        })} EUR
                                      </div>
                                      <div className="text-xs text-gray-400">
                                        {formatTimestamp(entry.timestamp)}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {prevEntry && (
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                                      isIncrease ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                    }`}>
                                      {isIncrease ? (
                                        <TrendingUp className="w-4 h-4" />
                                      ) : (
                                        <TrendingDown className="w-4 h-4" />
                                      )}
                                      <span className="font-semibold">
                                        {isIncrease ? '+' : ''}{change.toFixed(2)}%
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-12 text-gray-400">
                            <LineChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>Aucun historique disponible pour ce NFT</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </>
            ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-12 border border-white/20 text-center">
                <Database className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Vous ne possédez aucun NFT</p>
                <p className="text-gray-500 text-sm mt-2">Mintez un NFT pour voir ses prix ici</p>
              </div>
            )}
          </div>
        </div>

        {/* Panneau Admin */}
        {isPriceUpdater && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Edit className="w-5 h-5 text-yellow-400" />
              Panneau de Mise à Jour des Prix
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mise à jour Token Fongible */}
              <div className="space-y-4">
                <h4 className="font-semibold text-white">Token RWAT</h4>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Nouveau Prix (EUR)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newFungiblePrice}
                    onChange={(e) => setNewFungiblePrice(e.target.value)}
                    placeholder="Ex: 1.05"
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <button
                  onClick={handleUpdateFungiblePrice}
                  disabled={loading || !newFungiblePrice}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium"
                >
                  {loading ? 'Mise à jour...' : 'Mettre à jour RWAT'}
                </button>
              </div>

              {/* Mise à jour NFT */}
              <div className="space-y-4">
                <h4 className="font-semibold text-white">NFT Diamond</h4>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Sélectionner un NFT
                  </label>
                  <select
                    value={selectedNftId}
                    onChange={(e) => setSelectedNftId(e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">-- Choisir un NFT --</option>
                    {userNFTs.map((nft) => (
                      <option key={nft.tokenId} value={nft.tokenId.toString()}>
                        NFT #{nft.tokenId} - {nft.priceData ? parseFloat(formatEther(nft.priceData.price)).toFixed(2) : '0.00'} EUR
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Nouveau Prix (EUR)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newNftPrice}
                    onChange={(e) => setNewNftPrice(e.target.value)}
                    placeholder="Ex: 50000.00"
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <button
                  onClick={handleUpdateNFTPrice}
                  disabled={loading || !newNftPrice || !selectedNftId}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-medium"
                >
                  {loading ? 'Mise à jour...' : 'Mettre à jour NFT'}
                </button>
              </div>
            </div>

            {txHash && (
              <div className="mt-4 p-4 bg-green-500/20 border border-green-500 rounded-lg">
                <p className="text-green-300 text-sm">
                  ✅ Transaction envoyée !
                </p>
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline text-sm break-all"
                >
                  {txHash}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-300 mb-3">
            ℹ️ À propos de l&apos;Oracle
          </h3>
          <div className="text-gray-300 space-y-2 text-sm">
            <p>
              • L&apos;Oracle fournit des <strong>prix en temps réel</strong> pour vos actifs tokenisés
            </p>
            <p>
              • Les prix sont mis à jour par des comptes autorisés (rôle <code className="bg-white/10 px-1 rounded">PRICE_UPDATER_ROLE</code>)
            </p>
            <p>
              • L&apos;historique conserve jusqu&apos;à <strong>100 entrées</strong> par actif
            </p>
            <p>
              • Un script automatique peut mettre à jour les prix toutes les X minutes
            </p>
            <p>
              • Adresse Oracle: <code className="bg-white/10 px-1 rounded">{ORACLE_ADDRESS}</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
