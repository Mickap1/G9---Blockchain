'use client';

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { contracts } from '@/lib/contracts';
import FungibleTokenABI from '@/lib/abis/FungibleAssetToken.json';
import { parseEther } from 'viem';
import { Header } from '@/components/Header';

export default function CreateTokenPage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [loading, setLoading] = useState(false);
  const [mintAddress, setMintAddress] = useState('');
  const [mintAmount, setMintAmount] = useState('');

  // Token info state
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);

  // Load token info
  const loadTokenInfo = async () => {
    if (!publicClient) return;

    setLoadingInfo(true);
    try {
      const [name, symbol, totalSupply, maxSupply, decimals, metadata, remaining] = await Promise.all([
        publicClient.readContract({
          address: contracts.fungibleToken.address,
          abi: FungibleTokenABI,
          functionName: 'name',
        }),
        publicClient.readContract({
          address: contracts.fungibleToken.address,
          abi: FungibleTokenABI,
          functionName: 'symbol',
        }),
        publicClient.readContract({
          address: contracts.fungibleToken.address,
          abi: FungibleTokenABI,
          functionName: 'totalSupply',
        }),
        publicClient.readContract({
          address: contracts.fungibleToken.address,
          abi: FungibleTokenABI,
          functionName: 'MAX_SUPPLY',
        }),
        publicClient.readContract({
          address: contracts.fungibleToken.address,
          abi: FungibleTokenABI,
          functionName: 'decimals',
        }),
        publicClient.readContract({
          address: contracts.fungibleToken.address,
          abi: FungibleTokenABI,
          functionName: 'getAssetMetadata',
        }),
        publicClient.readContract({
          address: contracts.fungibleToken.address,
          abi: FungibleTokenABI,
          functionName: 'remainingSupply',
        }),
      ]);

      setTokenInfo({
        name,
        symbol,
        totalSupply,
        maxSupply,
        decimals,
        metadata,
        remaining,
      });
    } catch (error) {
      console.error('Error loading token info:', error);
    } finally {
      setLoadingInfo(false);
    }
  };

  // Load info on mount
  useEffect(() => {
    if (publicClient) {
      loadTokenInfo();
    }
  }, [publicClient]);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletClient || !mintAddress || !mintAmount) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const amount = parseEther(mintAmount);

      const hash = await walletClient.writeContract({
        address: contracts.fungibleToken.address,
        abi: FungibleTokenABI,
        functionName: 'mint',
        args: [mintAddress, amount],
      });

      alert(`✅ Tokens mintés avec succès!\nTransaction: ${hash}`);
      
      // Reload info
      await loadTokenInfo();
      
      // Reset form
      setMintAddress('');
      setMintAmount('');
    } catch (error: any) {
      console.error('Error minting tokens:', error);
      alert(`❌ Erreur: ${error.message || 'Échec du mint'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-xl p-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Créer des Tokens Fungibles</h1>
              <p className="text-gray-600">Veuillez connecter votre portefeuille pour continuer.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Tokens Fungibles (ERC-20)</h1>
            <p className="text-gray-600 mb-8">Minter des tokens représentant des actifs fractionnés</p>

          {/* Token Information */}
          <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>📊</span> Informations du Token
            </h2>
            
            {loadingInfo ? (
              <p className="text-gray-600">Chargement...</p>
            ) : tokenInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nom</p>
                  <p className="font-semibold text-lg">{tokenInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Symbole</p>
                  <p className="font-semibold text-lg">{tokenInfo.symbol}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Supply Total</p>
                  <p className="font-semibold">
                    {(Number(tokenInfo.totalSupply) / 10**Number(tokenInfo.decimals)).toLocaleString()} / {(Number(tokenInfo.maxSupply) / 10**Number(tokenInfo.decimals)).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Supply Restant</p>
                  <p className="font-semibold text-green-600">
                    {(Number(tokenInfo.remaining) / 10**Number(tokenInfo.decimals)).toLocaleString()}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Actif Sous-jacent</p>
                  <p className="font-semibold">{tokenInfo.metadata.assetName}</p>
                  <p className="text-sm text-gray-500">{tokenInfo.metadata.assetType} - {tokenInfo.metadata.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valeur Totale</p>
                  <p className="font-semibold">{(Number(tokenInfo.metadata.totalValue) / 100).toLocaleString()} EUR</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date de Tokenisation</p>
                  <p className="font-semibold">
                    {new Date(Number(tokenInfo.metadata.tokenizationDate) * 1000).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Adresse du Contrat</p>
                  <p className="font-mono text-xs break-all">{contracts.fungibleToken.address}</p>
                </div>
              </div>
            ) : (
              <button
                onClick={loadTokenInfo}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Charger les informations
              </button>
            )}
          </div>

          {/* Mint Form */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>🪙</span> Minter des Tokens
            </h2>

            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ Important:</strong> Le destinataire doit avoir un KYC approuvé pour recevoir des tokens.
              </p>
            </div>

            <form onSubmit={handleMint} className="space-y-4">
              <div>
                <label htmlFor="mintAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse du destinataire
                </label>
                <input
                  type="text"
                  id="mintAddress"
                  value={mintAddress}
                  onChange={(e) => setMintAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="mintAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité de tokens
                </label>
                <input
                  type="number"
                  id="mintAmount"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  placeholder="100"
                  step="0.000000000000000001"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                />
                {tokenInfo && (
                  <p className="mt-1 text-sm text-gray-500">
                    Maximum disponible: {(Number(tokenInfo.remaining) / 10**Number(tokenInfo.decimals)).toLocaleString()} {tokenInfo.symbol}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !mintAddress || !mintAmount}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                  loading || !mintAddress || !mintAmount
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {loading ? 'Minting en cours...' : '🪙 Minter des Tokens'}
              </button>
            </form>
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">À propos des Tokens Fungibles</h3>
            <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
              <li>Les tokens ERC-20 représentent des parts fractionnées d'un actif réel</li>
              <li>Le supply maximum est fixé à la création du contrat</li>
              <li>Tous les transferts nécessitent une vérification KYC approuvée</li>
              <li>Vous devez avoir le rôle MINTER pour créer de nouveaux tokens</li>
              <li>Les tokens peuvent être tradés sur le DEX une fois mintés</li>
            </ul>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
