'use client';

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { contracts } from '@/lib/contracts';
import FungibleTokenABI from '@/lib/abis/FungibleAssetToken.json';
import { parseEther } from 'viem';
import { Header } from '@/components/Header';

export default function MintTokensPage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [loading, setLoading] = useState(false);
  const [mintAddress, setMintAddress] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [hasAdminRole, setHasAdminRole] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  // Token info state
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);

  // Check if user has MINTER_ROLE
  const checkMinterRole = async () => {
    if (!publicClient || !address) {
      setCheckingRole(false);
      return;
    }

    setCheckingRole(true);
    try {
      // MINTER_ROLE = keccak256("MINTER_ROLE")
      const MINTER_ROLE = '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6';
      
      const hasRole = await publicClient.readContract({
        address: contracts.fungibleToken.address,
        abi: FungibleTokenABI,
        functionName: 'hasRole',
        args: [MINTER_ROLE, address],
      });

      setHasAdminRole(hasRole as boolean);
    } catch (error) {
      console.error('Error checking role:', error);
      setHasAdminRole(false);
    } finally {
      setCheckingRole(false);
    }
  };

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
    if (publicClient && address) {
      checkMinterRole();
      loadTokenInfo();
    }
  }, [publicClient, address]);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletClient || !mintAddress || !mintAmount) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    if (!hasAdminRole) {
      alert('❌ Vous n\'avez pas les permissions pour minter des tokens.\nSeul un administrateur avec le rôle MINTER_ROLE peut effectuer cette action.');
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

      alert(`✅ Tokens mintés avec succès!\n\nQuantité: ${mintAmount} tokens\nDestinataire: ${mintAddress}\n\nTransaction: ${hash}`);
      
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-xl p-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">🪙 Minter des Tokens</h1>
              <p className="text-gray-600">Veuillez connecter votre portefeuille pour continuer.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span>🪙</span> Minter des Tokens Fungibles
            </h1>
            <p className="text-gray-600 mb-8">
              Émission de nouveaux tokens représentant des parts d'actifs fractionnés
            </p>

            {/* Admin Permission Warning */}
            {checkingRole ? (
              <div className="mb-6 p-4 bg-gray-100 border border-gray-300 rounded-lg">
                <p className="text-gray-600">🔍 Vérification des permissions...</p>
              </div>
            ) : !hasAdminRole ? (
              <div className="mb-6 p-6 bg-red-50 border-2 border-red-300 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">🔒</span>
                  <div>
                    <h3 className="text-lg font-bold text-red-800 mb-2">
                      Accès Réservé aux Administrateurs
                    </h3>
                    <p className="text-red-700 mb-3">
                      Vous n'avez pas les permissions nécessaires pour minter des tokens.
                    </p>
                    <div className="bg-red-100 p-3 rounded border border-red-200">
                      <p className="text-sm text-red-800 font-semibold mb-1">
                        ⚠️ Permissions requises :
                      </p>
                      <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                        <li>Vous devez avoir le rôle <code className="bg-red-200 px-1 rounded">MINTER_ROLE</code></li>
                        <li>Seuls les administrateurs autorisés peuvent créer de nouveaux tokens</li>
                        <li>Cette restriction protège l'intégrité du supply total des tokens</li>
                      </ul>
                    </div>
                    <p className="text-sm text-red-600 mt-3">
                      💡 Contactez un administrateur du système pour obtenir les permissions nécessaires.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="font-semibold text-green-800">
                      Vous avez les permissions administrateur
                    </p>
                    <p className="text-sm text-green-700">
                      Rôle MINTER_ROLE détecté - Vous pouvez minter des tokens
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                    <p className="font-semibold">{Number(tokenInfo.metadata.totalValue).toLocaleString()} EUR</p>
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
            <div className={`bg-gray-50 p-6 rounded-lg border ${hasAdminRole ? 'border-gray-200' : 'border-gray-300 opacity-60'}`}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>🔨</span> Formulaire de Mint
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
                    disabled={loading || !hasAdminRole}
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
                    disabled={loading || !hasAdminRole}
                  />
                  {tokenInfo && (
                    <p className="mt-1 text-sm text-gray-500">
                      Maximum disponible: {(Number(tokenInfo.remaining) / 10**Number(tokenInfo.decimals)).toLocaleString()} {tokenInfo.symbol}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !mintAddress || !mintAmount || !hasAdminRole}
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                    loading || !mintAddress || !mintAmount || !hasAdminRole
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {loading ? 'Minting en cours...' : !hasAdminRole ? '🔒 Accès Réservé aux Admins' : '🪙 Minter des Tokens'}
                </button>
              </form>
            </div>

            {/* Additional Info */}
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>📚</span> À propos du Minting
              </h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Tokens Fungibles ERC-20 :</strong> Représentent des parts fractionnées d'un actif réel</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Supply Limité :</strong> Le nombre maximum de tokens est fixé à la création du contrat</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>KYC Obligatoire :</strong> Tous les transferts nécessitent une vérification KYC approuvée</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">⚠</span>
                  <span><strong>Permissions Admin :</strong> Seuls les comptes avec le rôle MINTER_ROLE peuvent créer de nouveaux tokens</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Trading :</strong> Les tokens peuvent être échangés sur le DEX une fois mintés</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Propriété :</strong> Posséder X% des tokens = posséder X% de l'actif sous-jacent</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
