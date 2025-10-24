'use client';

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useBalance } from 'wagmi';
import { formatUnits, formatEther } from 'viem';
import FungibleTokenABI from '@/lib/abis/FungibleAssetToken.json';
import NFTTokenV2ABI from '@/lib/abis/NFTAssetTokenV2.json';
import SimpleDEXABI from '@/lib/abis/SimpleDEX.json';
import { Header } from '@/components/Header';

const FUNGIBLE_TOKEN_ADDRESS = '0xfA451d9C32d15a637Ab376732303c36C34C9979f';
const NFT_TOKEN_ADDRESS = '0xf16b0641A9C56C6db30E052E90DB9358b6D2C946';
const DEX_ADDRESS = '0x2Cf848B370C0Ce0255C4743d70648b096D3fAa98';

interface NFTData {
  tokenId: number;
  tokenizationDate: bigint;
  isActive: boolean;
  uri: string;
  metadata?: any;
}

interface FungibleTokenInfo {
  name: any;
  symbol: any;
  assetType: string;
  totalValue: number;
  assetName: string;
  location: string;
  documentURI: string;
  tokenizationDate: number;
  maxSupply: number;
}

interface LiquidityPosition {
  lpTokens: string;
  sharePercent: number;
  tokenValue: string;
  ethValue: string;
  totalValueETH: string;
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  
  // Get ETH Balance
  const { data: ethBalance } = useBalance({
    address: address,
  });

  const [loading, setLoading] = useState(true);
  const [fungibleBalance, setFungibleBalance] = useState('0');
  const [fungibleTokenInfo, setFungibleTokenInfo] = useState<FungibleTokenInfo | null>(null);
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [ethPriceEUR, setEthPriceEUR] = useState(0);
  const [liquidityPosition, setLiquidityPosition] = useState<LiquidityPosition | null>(null);

  // Fetch ETH price in EUR
  const fetchEthPrice = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=eur');
      const data = await response.json();
      setEthPriceEUR(data.ethereum.eur);
    } catch (error) {
      console.error('Error fetching ETH price:', error);
      // Fallback price if API fails
      setEthPriceEUR(2500); // Approximate fallback
    }
  };

  // Load Fungible Token Info
  const loadFungibleTokenInfo = async () => {
    if (!publicClient || !address) return;

    try {
      const [name, symbol, balance, decimals] = await Promise.all([
        publicClient.readContract({
          address: FUNGIBLE_TOKEN_ADDRESS,
          abi: FungibleTokenABI,
          functionName: 'name',
        }),
        publicClient.readContract({
          address: FUNGIBLE_TOKEN_ADDRESS,
          abi: FungibleTokenABI,
          functionName: 'symbol',
        }),
        publicClient.readContract({
          address: FUNGIBLE_TOKEN_ADDRESS,
          abi: FungibleTokenABI,
          functionName: 'balanceOf',
          args: [address],
        }),
        publicClient.readContract({
          address: FUNGIBLE_TOKEN_ADDRESS,
          abi: FungibleTokenABI,
          functionName: 'decimals',
        }),
      ]);

      // Try to get asset metadata (struct) and max supply
      let assetMetadata: any = null;
      let totalValue = 0;
      let maxSupply = 0;
      try {
        const [metadata, supply] = await Promise.all([
          publicClient.readContract({
            address: FUNGIBLE_TOKEN_ADDRESS,
            abi: FungibleTokenABI,
            functionName: 'assetMetadata',
          }),
          publicClient.readContract({
            address: FUNGIBLE_TOKEN_ADDRESS,
            abi: FungibleTokenABI,
            functionName: 'MAX_SUPPLY',
          }),
        ]);
        
        assetMetadata = metadata as any;
        maxSupply = Number(formatUnits(supply as bigint, decimals as number));
        
        if (assetMetadata && assetMetadata.totalValue) {
          totalValue = Number(assetMetadata.totalValue);
        }
      } catch (e) {
        console.log('Could not load assetMetadata, using default values');
      }

      const balanceFormatted = formatUnits(balance as bigint, decimals as number);
      setFungibleBalance(balanceFormatted);
      
      const tokenInfo = {
        name,
        symbol,
        assetType: assetMetadata?.assetType || 'Token',
        totalValue: totalValue,
        assetName: assetMetadata?.assetName || '',
        location: assetMetadata?.location || '',
        documentURI: assetMetadata?.documentURI || '',
        tokenizationDate: assetMetadata?.tokenizationDate ? Number(assetMetadata.tokenizationDate) : 0,
        maxSupply: maxSupply,
      };
      
      console.log('📊 Fungible Token Info:', tokenInfo);
      console.log('📦 Asset Metadata:', assetMetadata);
      
      setFungibleTokenInfo(tokenInfo);
    } catch (error) {
      console.error('Error loading fungible token:', error);
    }
  };

  // Load NFTs
  const loadNFTs = async () => {
    if (!publicClient || !address) return;

    try {
      const tokenIds = await publicClient.readContract({
        address: NFT_TOKEN_ADDRESS,
        abi: NFTTokenV2ABI,
        functionName: 'tokensOfOwner',
        args: [address],
      }) as bigint[];

      const nftDataPromises = tokenIds.map(async (tokenId) => {
        try {
          const [tokenizationDate, isActive, uri] = await publicClient.readContract({
            address: NFT_TOKEN_ADDRESS,
            abi: NFTTokenV2ABI,
            functionName: 'getAssetData',
            args: [tokenId],
          }) as [bigint, boolean, string];

          // Try to fetch metadata
          let metadata = null;
          if (uri) {
            try {
              console.log(`NFT #${Number(tokenId)} - URI:`, uri);
              if (uri.startsWith('data:application/json')) {
                const jsonPart = uri.replace('data:application/json,', '');
                const decoded = decodeURIComponent(jsonPart);
                console.log(`NFT #${Number(tokenId)} - Decoded JSON:`, decoded);
                metadata = JSON.parse(decoded);
                console.log(`NFT #${Number(tokenId)} - Parsed metadata:`, metadata);
              } else if (uri.startsWith('ipfs://')) {
                // Convert IPFS to HTTP gateway
                const httpUrl = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
                console.log(`NFT #${Number(tokenId)} - Fetching from IPFS:`, httpUrl);
                try {
                  const response = await fetch(httpUrl, { 
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                  });
                  console.log(`NFT #${Number(tokenId)} - Response status:`, response.status, response.statusText);
                  console.log(`NFT #${Number(tokenId)} - Content-Type:`, response.headers.get('content-type'));
                  
                  if (response.ok) {
                    const text = await response.text();
                    console.log(`NFT #${Number(tokenId)} - Response text (first 200 chars):`, text.substring(0, 200));
                    metadata = JSON.parse(text);
                    console.log(`NFT #${Number(tokenId)} - Parsed metadata:`, metadata);
                  } else {
                    console.error(`NFT #${Number(tokenId)} - Failed to fetch: ${response.status}`);
                  }
                } catch (fetchError) {
                  console.error(`NFT #${Number(tokenId)} - Fetch error:`, fetchError);
                }
              } else if (uri.startsWith('http')) {
                // Fetch from HTTP/HTTPS
                console.log(`NFT #${Number(tokenId)} - Fetching from HTTP:`, uri);
                try {
                  const response = await fetch(uri, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                  });
                  console.log(`NFT #${Number(tokenId)} - Response status:`, response.status, response.statusText);
                  console.log(`NFT #${Number(tokenId)} - Content-Type:`, response.headers.get('content-type'));
                  
                  if (response.ok) {
                    const text = await response.text();
                    console.log(`NFT #${Number(tokenId)} - Response text (first 200 chars):`, text.substring(0, 200));
                    metadata = JSON.parse(text);
                    console.log(`NFT #${Number(tokenId)} - Parsed metadata:`, metadata);
                  } else {
                    console.error(`NFT #${Number(tokenId)} - Failed to fetch: ${response.status}`);
                  }
                } catch (fetchError) {
                  console.error(`NFT #${Number(tokenId)} - Fetch error:`, fetchError);
                }
              }
            } catch (e) {
              console.error(`Error parsing metadata for NFT #${Number(tokenId)}:`, e, 'URI:', uri);
            }
          } else {
            console.log(`NFT #${Number(tokenId)} - No URI found`);
          }

          return {
            tokenId: Number(tokenId),
            tokenizationDate,
            isActive,
            uri,
            metadata,
          };
        } catch (error) {
          console.error(`Error loading NFT ${tokenId}:`, error);
          return null;
        }
      });

      const nftData = (await Promise.all(nftDataPromises)).filter(nft => nft !== null) as NFTData[];
      setNfts(nftData);

      // Calculate total NFT value - check multiple possible field names
      const nftTotalValue = nftData.reduce((sum, nft) => {
        const val = parseFloat(nft.metadata?.valuation?.toString() || nft.metadata?.value?.toString() || '0');
        console.log(`NFT #${nft.tokenId} valuation:`, val, nft.metadata);
        return sum + val;
      }, 0);

      setTotalValue(nftTotalValue);
    } catch (error) {
      console.error('Error loading NFTs:', error);
    }
  };

  // Load Liquidity Position
  const loadLiquidityPosition = async () => {
    if (!publicClient || !address) return;

    try {
      // Get user's LP tokens
      const lpTokens = await publicClient.readContract({
        address: DEX_ADDRESS as `0x${string}`,
        abi: SimpleDEXABI,
        functionName: 'liquidity',
        args: [address],
      }) as bigint;

      // Get pool info - retourne [reserveToken, reserveETH, totalLiquidity]
      const poolInfo = await publicClient.readContract({
        address: DEX_ADDRESS as `0x${string}`,
        abi: SimpleDEXABI,
        functionName: 'getPoolInfo',
      }) as [bigint, bigint, bigint];

      const lpBalance = parseFloat(formatEther(lpTokens));
      const reserveToken = parseFloat(formatEther(poolInfo[0]));
      const reserveETH = parseFloat(formatEther(poolInfo[1]));
      const totalLiquidity = parseFloat(formatEther(poolInfo[2]));

      if (lpBalance > 0 && totalLiquidity > 0) {
        const sharePercent = (lpBalance / totalLiquidity) * 100;
        const tokenValue = (reserveToken * sharePercent) / 100;
        const ethValue = (reserveETH * sharePercent) / 100;
        const totalValueETH = ethValue * 2; // Approximation de la valeur totale

        setLiquidityPosition({
          lpTokens: lpBalance.toFixed(6),
          sharePercent: sharePercent,
          tokenValue: tokenValue.toFixed(2),
          ethValue: ethValue.toFixed(6),
          totalValueETH: totalValueETH.toFixed(6),
        });
      } else {
        setLiquidityPosition(null);
      }
    } catch (error) {
      console.error('Error loading liquidity position:', error);
      setLiquidityPosition(null);
    }
  };

  // Load all data
  const loadDashboard = async () => {
    setLoading(true);
    await Promise.all([
      fetchEthPrice(),
      loadFungibleTokenInfo(),
      loadNFTs(),
      loadLiquidityPosition(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    if (isConnected && publicClient && address) {
      loadDashboard();
    }
  }, [isConnected, publicClient, address]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
            <p className="text-gray-600">Veuillez connecter votre portefeuille pour voir votre dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mon Dashboard</h1>
          <p className="text-gray-600">Vue d'ensemble de votre portefeuille d'actifs tokenisés</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Chargement de votre portefeuille...</p>
          </div>
        ) : (
          <>
            {/* Valeur du Portefeuille */}
            <div className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-xl p-8 text-white">
              <h2 className="text-xl font-semibold mb-4">💰 Valeur Totale du Portefeuille</h2>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-5xl font-bold">
                  {(
                    totalValue + 
                    (fungibleTokenInfo?.totalValue || 0) * parseFloat(fungibleBalance) +
                    (ethBalance ? parseFloat(formatUnits(ethBalance.value, 18)) * ethPriceEUR : 0)
                  ).toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
                <span className="text-2xl">EUR</span>
              </div>
              {ethPriceEUR > 0 && (
                <p className="text-sm opacity-75 mb-4">1 ETH = {ethPriceEUR.toLocaleString('fr-FR')} €</p>
              )}
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-white/20 rounded-lg p-4">
                  <p className="text-sm opacity-90">ETH Sepolia</p>
                  <p className="text-2xl font-bold">
                    {ethBalance ? parseFloat(formatUnits(ethBalance.value, 18)).toFixed(4) : '0'} ETH
                  </p>
                  <p className="text-xs opacity-75 mt-1">
                    ≈ {(ethBalance ? parseFloat(formatUnits(ethBalance.value, 18)) * ethPriceEUR : 0).toLocaleString('fr-FR')} €
                  </p>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <p className="text-sm opacity-90">Tokens Fongibles</p>
                  <p className="text-2xl font-bold">
                    {((fungibleTokenInfo?.totalValue || 0) * parseFloat(fungibleBalance)).toLocaleString('fr-FR')} €
                  </p>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <p className="text-sm opacity-90">NFTs</p>
                  <p className="text-2xl font-bold">{totalValue.toLocaleString('fr-FR')} €</p>
                </div>
              </div>
            </div>

            {/* Informations sur l'Actif Sous-Jacent */}
            {fungibleTokenInfo && fungibleTokenInfo.maxSupply > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🏢</span> Actif Sous-Jacent
                </h2>
                <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-xl shadow-lg p-8 text-white">
                  {/* En-tête de l'actif */}
                  <div className="border-b border-white/30 pb-6 mb-6">
                    <h3 className="text-3xl font-bold mb-2">
                      {fungibleTokenInfo.assetName || fungibleTokenInfo.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm opacity-90">
                      <span className="flex items-center gap-2">
                        📍 {fungibleTokenInfo.location || 'Localisation non spécifiée'}
                      </span>
                      <span className="flex items-center gap-2">
                        🏷️ {fungibleTokenInfo.assetType}
                      </span>
                    </div>
                  </div>

                  {/* Statistiques de l'actif */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-5">
                      <p className="text-sm opacity-80 mb-2">Valeur Totale de l'Actif</p>
                      <p className="text-3xl font-bold mb-1">
                        {fungibleTokenInfo.totalValue.toLocaleString('fr-FR')} €
                      </p>
                      <p className="text-xs opacity-70">
                        Évaluation professionnelle
                      </p>
                    </div>

                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-5">
                      <p className="text-sm opacity-80 mb-2">Tokens Totaux Émis</p>
                      <p className="text-3xl font-bold mb-1">
                        {fungibleTokenInfo.maxSupply.toLocaleString('fr-FR')}
                      </p>
                      <p className="text-xs opacity-70">
                        {fungibleTokenInfo.symbol}
                      </p>
                    </div>

                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-5">
                      <p className="text-sm opacity-80 mb-2">Valeur par Token</p>
                      <p className="text-3xl font-bold mb-1">
                        {(fungibleTokenInfo.totalValue / fungibleTokenInfo.maxSupply).toFixed(2)} €
                      </p>
                      <p className="text-xs opacity-70">
                        Prix unitaire
                      </p>
                    </div>
                  </div>

                  {/* Votre participation */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-lg font-semibold mb-1">Votre Participation</p>
                        <p className="text-sm opacity-80">
                          Vous possédez <span className="font-bold">{parseFloat(fungibleBalance).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> tokens
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm opacity-80 mb-1">Part de propriété</p>
                        <p className="text-4xl font-bold">
                          {((parseFloat(fungibleBalance) / fungibleTokenInfo.maxSupply) * 100).toFixed(4)}%
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-white/10 rounded-lg p-4">
                        <p className="text-xs opacity-70 mb-1">Valeur de vos tokens</p>
                        <p className="text-2xl font-bold">
                          {(parseFloat(fungibleBalance) * (fungibleTokenInfo.totalValue / fungibleTokenInfo.maxSupply)).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                        </p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-4">
                        <p className="text-xs opacity-70 mb-1">Équivalent immobilier</p>
                        <p className="text-lg font-bold">
                          Comme si vous possédiez {((parseFloat(fungibleBalance) / fungibleTokenInfo.maxSupply) * 100).toFixed(2)}% de l'immeuble
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Informations complémentaires */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <p className="text-xs opacity-70 mb-1">Date de Tokenisation</p>
                      <p className="text-sm font-semibold">
                        {fungibleTokenInfo.tokenizationDate > 0 
                          ? new Date(fungibleTokenInfo.tokenizationDate * 1000).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })
                          : 'N/A'}
                      </p>
                    </div>
                    {fungibleTokenInfo.documentURI && fungibleTokenInfo.documentURI !== 'ipfs://QmExampleDocumentHash' && (
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <p className="text-xs opacity-70 mb-1">Documents</p>
                        <a 
                          href={fungibleTokenInfo.documentURI.startsWith('ipfs://') 
                            ? `https://ipfs.io/ipfs/${fungibleTokenInfo.documentURI.replace('ipfs://', '')}` 
                            : fungibleTokenInfo.documentURI}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold hover:underline flex items-center gap-1"
                        >
                          📄 Voir les documents →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Liquidity Position */}
            {liquidityPosition && parseFloat(liquidityPosition.lpTokens) > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>💧</span> Ma Position de Liquidité
                </h2>
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-white/20 rounded-lg p-4">
                      <p className="text-sm opacity-90">LP Tokens</p>
                      <p className="text-2xl font-bold">
                        {parseFloat(liquidityPosition.lpTokens).toFixed(4)}
                      </p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4">
                      <p className="text-sm opacity-90">Part du Pool</p>
                      <p className="text-2xl font-bold">
                        {liquidityPosition.sharePercent.toFixed(2)}%
                      </p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4">
                      <p className="text-sm opacity-90">Tokens Disponibles</p>
                      <p className="text-2xl font-bold">
                        {parseFloat(liquidityPosition.tokenValue).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4">
                      <p className="text-sm opacity-90">ETH Disponibles</p>
                      <p className="text-2xl font-bold">
                        {parseFloat(liquidityPosition.ethValue).toFixed(4)} ETH
                      </p>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Valeur Totale</p>
                      <p className="text-3xl font-bold">
                        {parseFloat(liquidityPosition.totalValueETH).toFixed(4)} ETH
                      </p>
                      <p className="text-sm opacity-75 mt-1">
                        ≈ {(parseFloat(liquidityPosition.totalValueETH) * ethPriceEUR).toLocaleString('fr-FR')} €
                      </p>
                    </div>
                    <a 
                      href="/dex"
                      className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                    >
                      Gérer la Liquidité →
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Tokens Fongibles */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🪙</span> Mes Tokens Fongibles
              </h2>
              <div className="bg-white rounded-lg shadow-md p-6">
                {fungibleTokenInfo ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                          {fungibleTokenInfo.symbol?.substring(0, 2)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{fungibleTokenInfo.name}</h3>
                          <p className="text-sm text-gray-600">{fungibleTokenInfo.symbol}</p>
                          <p className="text-xs text-gray-500 mt-1">Type: {fungibleTokenInfo.assetType}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-green-600">
                          {parseFloat(fungibleBalance).toLocaleString('fr-FR', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2
                          })}
                        </p>
                        <p className="text-sm text-gray-600">{fungibleTokenInfo.symbol}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Valeur unitaire: {fungibleTokenInfo.totalValue?.toLocaleString('fr-FR')} €
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Balance</p>
                        <p className="text-xl font-bold text-gray-900">
                          {parseFloat(fungibleBalance).toFixed(2)} {fungibleTokenInfo.symbol}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Valeur Totale</p>
                        <p className="text-xl font-bold text-gray-900">
                          {((fungibleTokenInfo.totalValue || 0) * parseFloat(fungibleBalance)).toLocaleString('fr-FR')} €
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Contrat</p>
                        <a 
                          href={`https://sepolia.etherscan.io/address/${FUNGIBLE_TOKEN_ADDRESS}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline font-mono"
                        >
                          {FUNGIBLE_TOKEN_ADDRESS.substring(0, 10)}...
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">Vous ne possédez pas de tokens fongibles</p>
                )}
              </div>
            </div>

            {/* Galerie de NFTs */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🎨</span> Ma Galerie de NFTs
                <span className="text-lg font-normal text-gray-600">({nfts.length})</span>
              </h2>
              
              {nfts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nfts.map((nft) => {
                    // Convert IPFS URL to HTTP gateway if needed
                    const getImageUrl = (imageUrl: string | undefined) => {
                      if (!imageUrl) {
                        console.log(`NFT #${nft.tokenId} - No image URL found`);
                        return null;
                      }
                      console.log(`NFT #${nft.tokenId} - Original image URL:`, imageUrl);
                      
                      // Handle IPFS
                      if (imageUrl.startsWith('ipfs://')) {
                        const hash = imageUrl.replace('ipfs://', '');
                        // Try multiple IPFS gateways for reliability
                        const converted = `https://gateway.pinata.cloud/ipfs/${hash}`;
                        console.log(`NFT #${nft.tokenId} - Converted to:`, converted);
                        return converted;
                      }
                      
                      // Handle Wikia/Fandom images (they often block direct access)
                      if (imageUrl.includes('wikia.nocookie.net') || imageUrl.includes('fandom.com')) {
                        console.log(`NFT #${nft.tokenId} - Wikia image detected, may not load due to CORS`);
                      }
                      
                      return imageUrl;
                    };

                    // Try multiple possible image field names
                    const rawImageUrl = nft.metadata?.image || nft.metadata?.imageURI || nft.metadata?.imageUrl || nft.metadata?.img;
                    const imageUrl = getImageUrl(rawImageUrl);
                    
                    console.log(`NFT #${nft.tokenId} - Final image URL:`, imageUrl);
                    console.log(`NFT #${nft.tokenId} - Full metadata:`, nft.metadata);

                    return (
                      <div key={nft.tokenId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                        {/* NFT Image */}
                        <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center overflow-hidden">
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={nft.metadata?.name || `NFT #${nft.tokenId}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  const fallback = document.createElement('div');
                                  fallback.className = 'text-6xl';
                                  fallback.textContent = '🎨';
                                  parent.appendChild(fallback);
                                }
                              }}
                            />
                          ) : (
                            <div className="text-6xl">🎨</div>
                          )}
                        </div>
                      
                      {/* NFT Info */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {nft.metadata?.name || `NFT #${nft.tokenId}`}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            nft.isActive 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {nft.isActive ? '✓ Actif' : 'Inactif'}
                          </span>
                        </div>
                        
                        {nft.metadata?.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {nft.metadata.description}
                          </p>
                        )}

                        {/* Valuation */}
                        {nft.metadata?.valuation && (
                          <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-xs text-gray-600">Valorisation</p>
                            <p className="text-xl font-bold text-green-600">
                              {nft.metadata.valuation.toLocaleString('fr-FR')} {nft.metadata.valuationCurrency || 'EUR'}
                            </p>
                          </div>
                        )}

                        {/* Attributes */}
                        {nft.metadata?.attributes && nft.metadata.attributes.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-600 mb-2">Attributs</p>
                            <div className="flex flex-wrap gap-2">
                              {nft.metadata.attributes.slice(0, 3).map((attr: any, idx: number) => (
                                <span key={idx} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">
                                  {attr.trait_type}: {attr.value}
                                </span>
                              ))}
                              {nft.metadata.attributes.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                  +{nft.metadata.attributes.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <span className="text-xs text-gray-500">
                            Token ID: #{nft.tokenId}
                          </span>
                          <a
                            href={`https://sepolia.etherscan.io/token/${NFT_TOKEN_ADDRESS}?a=${nft.tokenId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Voir sur Etherscan →
                          </a>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <div className="text-6xl mb-4">🎨</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun NFT</h3>
                  <p className="text-gray-600 mb-6">Vous ne possédez pas encore de NFT dans cette collection.</p>
                  <a
                    href="/create/nft"
                    className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Créer mon premier NFT
                  </a>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
