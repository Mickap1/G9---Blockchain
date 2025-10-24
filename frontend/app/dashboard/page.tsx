'use client';

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useBalance } from 'wagmi';
import { formatUnits, formatEther } from 'viem';
import FungibleTokenABI from '@/lib/abis/FungibleAssetToken.json';
import NFTTokenV2ABI from '@/lib/abis/NFTAssetTokenV2.json';
import SimpleDEXABI from '@/lib/abis/SimpleDEX.json';
import SimplePriceOracleABI from '@/lib/abis/SimplePriceOracle.json';
import { Header } from '@/components/Header';

const FUNGIBLE_TOKEN_ADDRESS = '0xfA451d9C32d15a637Ab376732303c36C34C9979f';
const NFT_TOKEN_ADDRESS = '0xf16b0641A9C56C6db30E052E90DB9358b6D2C946';
const DEX_ADDRESS = '0x2Cf848B370C0Ce0255C4743d70648b096D3fAa98';
const ORACLE_ADDRESS = '0x602571F05745181fF237b81dAb8F67148e9475C7';

interface NFTData {
  tokenId: number;
  tokenizationDate: bigint;
  isActive: boolean;
  uri: string;
  metadata?: any;
  oraclePrice?: bigint; // Prix de l'Oracle
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
  const [oraclePrice, setOraclePrice] = useState<bigint | null>(null);
  const [oraclePriceActive, setOraclePriceActive] = useState(false);

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

          // Charger le prix depuis l'Oracle
          let oraclePrice = BigInt(0);
          try {
            const priceData = await publicClient.readContract({
              address: ORACLE_ADDRESS as `0x${string}`,
              abi: SimplePriceOracleABI,
              functionName: 'nftPrices',
              args: [NFT_TOKEN_ADDRESS, tokenId],
            }) as { price: bigint; lastUpdate: bigint; updateCount: bigint; isActive: boolean };

            if (priceData.isActive && priceData.price > BigInt(0)) {
              oraclePrice = priceData.price;
              console.log(`NFT #${Number(tokenId)} - Prix Oracle: ${formatEther(oraclePrice)} EUR`);
            }
          } catch (error) {
            console.log(`NFT #${Number(tokenId)} - Aucun prix Oracle défini`);
          }

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
            oraclePrice, // Ajout du prix Oracle
          };
        } catch (error) {
          console.error(`Error loading NFT ${tokenId}:`, error);
          return null;
        }
      });

      const nftData = (await Promise.all(nftDataPromises)).filter(nft => nft !== null) as NFTData[];
      setNfts(nftData);

      // Calculate total NFT value from Oracle prices
      const nftTotalValue = nftData.reduce((sum, nft) => {
        const oraclePriceInEur = nft.oraclePrice ? parseFloat(formatEther(nft.oraclePrice)) : 0;
        console.log(`NFT #${nft.tokenId} valeur Oracle:`, oraclePriceInEur, 'EUR');
        return sum + oraclePriceInEur;
      }, 0);

      console.log('Valeur totale des NFTs (Oracle):', nftTotalValue, 'EUR');
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
      loadOraclePrice(),
    ]);
    setLoading(false);
  };

  // Load Oracle Price
  const loadOraclePrice = async () => {
    if (!publicClient) return;

    try {
      const priceData = await publicClient.readContract({
        address: ORACLE_ADDRESS as `0x${string}`,
        abi: SimplePriceOracleABI,
        functionName: 'getPriceData',
        args: [FUNGIBLE_TOKEN_ADDRESS],
      }) as { price: bigint; lastUpdate: bigint; updateCount: bigint; isActive: boolean };

      if (priceData.isActive && priceData.price > BigInt(0)) {
        setOraclePrice(priceData.price);
        setOraclePriceActive(true);
      } else {
        setOraclePrice(null);
        setOraclePriceActive(false);
      }
    } catch (error) {
      console.log('Oracle price not available:', error);
      setOraclePrice(null);
      setOraclePriceActive(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">💼 Mon Dashboard</h1>
          <p className="text-gray-300">Vue d'ensemble de votre portefeuille d'actifs tokenisés</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-gray-300">Chargement de votre portefeuille...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 📊 RÉSUMÉ FINANCIER */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                📊 Résumé Financier
              </h2>
              
              {/* Valeur totale */}
              <div className="mb-6">
                <p className="text-sm opacity-80 mb-2">Valeur Totale du Portefeuille</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-6xl font-bold">
                    {(
                      totalValue + 
                      (oraclePriceActive && oraclePrice 
                        ? parseFloat(fungibleBalance) * parseFloat(formatEther(oraclePrice))
                        : (fungibleTokenInfo && fungibleTokenInfo.maxSupply > 0)
                          ? parseFloat(fungibleBalance) * (fungibleTokenInfo.totalValue / fungibleTokenInfo.maxSupply)
                          : 0
                      ) +
                      (ethBalance ? parseFloat(formatUnits(ethBalance.value, 18)) * ethPriceEUR : 0)
                    ).toLocaleString('fr-FR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                  <span className="text-3xl opacity-90">EUR</span>
                </div>
                {ethPriceEUR > 0 && (
                  <p className="text-sm opacity-75 mt-2">Prix ETH: {ethPriceEUR.toLocaleString('fr-FR')} €</p>
                )}
              </div>

              {/* Répartition */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* ETH */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">💎</span>
                    <p className="text-sm font-medium opacity-90">ETH Sepolia</p>
                  </div>
                  <p className="text-3xl font-bold mb-2">
                    {ethBalance ? parseFloat(formatUnits(ethBalance.value, 18)).toFixed(4) : '0'}
                  </p>
                  <p className="text-sm opacity-75">
                    ≈ {(ethBalance ? parseFloat(formatUnits(ethBalance.value, 18)) * ethPriceEUR : 0).toLocaleString('fr-FR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })} EUR
                  </p>
                </div>

                {/* Tokens RWAT */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🪙</span>
                    <p className="text-sm font-medium opacity-90">Tokens {fungibleTokenInfo?.symbol || 'RWAT'}</p>
                  </div>
                  <p className="text-3xl font-bold mb-2">
                    {parseFloat(fungibleBalance).toLocaleString('fr-FR', { maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm opacity-75">
                    ≈ {(oraclePriceActive && oraclePrice 
                      ? parseFloat(fungibleBalance) * parseFloat(formatEther(oraclePrice))
                      : (fungibleTokenInfo && fungibleTokenInfo.maxSupply > 0)
                        ? parseFloat(fungibleBalance) * (fungibleTokenInfo.totalValue / fungibleTokenInfo.maxSupply)
                        : 0
                    ).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
                  </p>
                </div>

                {/* NFTs */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🎨</span>
                    <p className="text-sm font-medium opacity-90">NFTs ({nfts.length})</p>
                  </div>
                  <p className="text-3xl font-bold mb-2">
                    {nfts.length}
                  </p>
                  <p className="text-sm opacity-75">
                    ≈ {totalValue.toLocaleString('fr-FR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })} EUR
                  </p>
                </div>
              </div>
            </div>

            {/* 🪙 TOKENS RWAT */}
            {fungibleTokenInfo && fungibleTokenInfo.maxSupply > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  🪙 Mes Tokens {fungibleTokenInfo.symbol}
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Balance */}
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <p className="text-gray-400 text-sm mb-2">Votre Balance</p>
                    <p className="text-4xl font-bold text-white mb-1">
                      {parseFloat(fungibleBalance).toLocaleString('fr-FR', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </p>
                    <p className="text-gray-400 text-sm">
                      tokens {fungibleTokenInfo.symbol}
                    </p>
                  </div>

                  {/* Valeur */}
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <p className="text-gray-400 text-sm mb-2">
                      Valeur {oraclePriceActive ? '(Prix Oracle)' : '(Prix initial)'}
                    </p>
                    <p className="text-4xl font-bold text-white mb-1">
                      {(oraclePriceActive && oraclePrice 
                        ? parseFloat(fungibleBalance) * parseFloat(formatEther(oraclePrice))
                        : parseFloat(fungibleBalance) * (fungibleTokenInfo.totalValue / fungibleTokenInfo.maxSupply)
                      ).toLocaleString('fr-FR', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })} <span className="text-2xl text-gray-400">EUR</span>
                    </p>
                    <p className="text-gray-400 text-sm">
                      Prix unitaire: {oraclePriceActive && oraclePrice 
                        ? parseFloat(formatEther(oraclePrice)).toFixed(4)
                        : (fungibleTokenInfo.totalValue / fungibleTokenInfo.maxSupply).toFixed(4)
                      } EUR
                    </p>
                  </div>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-gray-400 text-xs mb-1">Part de propriété</p>
                    <p className="text-2xl font-bold text-white">
                      {((parseFloat(fungibleBalance) / fungibleTokenInfo.maxSupply) * 100).toFixed(2)}%
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-gray-400 text-xs mb-1">Supply Total</p>
                    <p className="text-2xl font-bold text-white">
                      {fungibleTokenInfo.maxSupply.toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-gray-400 text-xs mb-1">Valeur Actif</p>
                    <p className="text-2xl font-bold text-white">
                      {fungibleTokenInfo.totalValue.toLocaleString('fr-FR')} €
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-gray-400 text-xs mb-1">Type</p>
                    <p className="text-lg font-bold text-white">
                      {fungibleTokenInfo.assetType}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 💧 POSITION DE LIQUIDITÉ DEX */}
            {liquidityPosition && parseFloat(liquidityPosition.lpTokens) > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  💧 Ma Position de Liquidité
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <p className="text-gray-400 text-xs mb-2">LP Tokens</p>
                    <p className="text-3xl font-bold text-white">
                      {parseFloat(liquidityPosition.lpTokens).toFixed(4)}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <p className="text-gray-400 text-xs mb-2">Part du Pool</p>
                    <p className="text-3xl font-bold text-white">
                      {liquidityPosition.sharePercent.toFixed(2)}%
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <p className="text-gray-400 text-xs mb-2">Tokens Disponibles</p>
                    <p className="text-3xl font-bold text-white">
                      {parseFloat(liquidityPosition.tokenValue).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <p className="text-gray-400 text-xs mb-2">ETH Disponibles</p>
                    <p className="text-3xl font-bold text-white">
                      {parseFloat(liquidityPosition.ethValue).toFixed(4)}
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-6 border border-white/10 mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Valeur Totale Estimée</p>
                    <p className="text-4xl font-bold text-white mb-1">
                      {parseFloat(liquidityPosition.totalValueETH).toFixed(4)} <span className="text-2xl text-gray-400">ETH</span>
                    </p>
                    <p className="text-gray-400 text-sm">
                      ≈ {(parseFloat(liquidityPosition.totalValueETH) * ethPriceEUR).toLocaleString('fr-FR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })} EUR
                    </p>
                  </div>
                  <a 
                    href="/dex"
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Gérer la Liquidité →
                  </a>
                </div>
              </div>
            )}

            {/* 🎨 MES NFTs */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
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

                        {/* Valorisation Oracle */}
                        {nft.oraclePrice && nft.oraclePrice > BigInt(0) ? (
                          <div className="mb-3 p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
                            <p className="text-xs text-purple-300">
                              📊 Prix Oracle (dynamique)
                            </p>
                            <p className="text-xl font-bold text-purple-400">
                              {parseFloat(formatEther(nft.oraclePrice)).toLocaleString('fr-FR', { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                              })} EUR
                            </p>
                          </div>
                        ) : (
                          <div className="mb-3 p-3 bg-white/5 rounded-lg border border-white/10">
                            <p className="text-xs text-gray-400">Prix Oracle</p>
                            <p className="text-sm text-gray-500">En attente...</p>
                          </div>
                        )}

                        {/* Attributes */}
                        {nft.metadata?.attributes && nft.metadata.attributes.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-400 mb-2">Attributs</p>
                            <div className="flex flex-wrap gap-2">
                              {nft.metadata.attributes.slice(0, 3).map((attr: any, idx: number) => (
                                <span key={idx} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                                  {attr.trait_type}: {attr.value}
                                </span>
                              ))}
                              {nft.metadata.attributes.length > 3 && (
                                <span className="px-2 py-1 bg-white/10 text-gray-400 text-xs rounded">
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
          </div>
        )}
      </div>
    </div>
  );
}
