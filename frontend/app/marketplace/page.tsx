'use client';

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Header } from '@/components/Header';
import NFTTokenABI from '@/lib/abis/NFTAssetTokenV2.json';
import FungibleTokenABI from '@/lib/abis/FungibleAssetToken.json';
import MarketplaceABI from '@/lib/abis/Marketplace.json';
import Image from 'next/image';

const NFT_ADDRESS = '0x75499Fc469f8d224C7bF619Ada37ea8f3cD8c36E' as `0x${string}`;
const TOKEN_ADDRESS = '0xfA451d9C32d15a637Ab376732303c36C34C9979f' as `0x${string}`;
const MARKETPLACE_ADDRESS = '0x9F057E253D69f6d362C63A3DB0bdff66eE8013dd' as `0x${string}`;

interface Listing {
  listingId: number;
  tokenId: number;
  owner: string;
  price: string;
  metadata: any;
  imageUrl: string;
  name: string;
  description: string;
  valuation: string;
}

interface TokenListing {
  seller: string;
  amount: string;
  pricePerToken: string;
  totalPrice: string;
  listingId: number;
}

export default function MarketplacePage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [activeTab, setActiveTab] = useState<'nft' | 'tokens'>('nft');
  const [nftListings, setNftListings] = useState<Listing[]>([]);
  const [tokenListings, setTokenListings] = useState<TokenListing[]>([]);
  const [myNFTs, setMyNFTs] = useState<any[]>([]);
  const [myTokenBalance, setMyTokenBalance] = useState('0');
  
  // Formulaires
  const [nftToList, setNftToList] = useState('');
  const [nftPrice, setNftPrice] = useState('');
  const [tokensToList, setTokensToList] = useState('');
  const [tokenPrice, setTokenPrice] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [showListingForm, setShowListingForm] = useState(false);

  // Handler pour la sélection du NFT (pré-remplit le prix avec la valuation)
  const handleNFTSelection = (tokenId: string) => {
    setNftToList(tokenId);
    if (tokenId) {
      const selectedNFT = myNFTs.find(nft => nft.tokenId.toString() === tokenId);
      if (selectedNFT && selectedNFT.valuation && parseFloat(selectedNFT.valuation) > 0) {
        setNftPrice(selectedNFT.valuation);
      }
    } else {
      setNftPrice('');
    }
  };

  // Charger tous les listings NFT actifs depuis le Marketplace
  const loadNFTListings = async () => {
    if (!publicClient) return;

    console.log('🔍 Loading NFT listings from Marketplace...');

    try {
      // Récupérer le nombre total de listings
      const nextListingId = await publicClient.readContract({
        address: MARKETPLACE_ADDRESS,
        abi: MarketplaceABI,
        functionName: 'nextNFTListingId',
      }) as bigint;

      console.log(`   Total listings created: ${nextListingId.toString()}`);

      const listings: Listing[] = [];
      
      // Parcourir tous les listings
      for (let listingId = 1; listingId <= Number(nextListingId); listingId++) {
        try {
          // Récupérer les détails du listing
          const listing = await publicClient.readContract({
            address: MARKETPLACE_ADDRESS,
            abi: MarketplaceABI,
            functionName: 'getNFTListing',
            args: [BigInt(listingId)],
          }) as any;

          console.log(`   Listing ${listingId}:`, listing);

          // Ne garder que les listings actifs
          if (!listing.active) {
            console.log(`   ⏩ Listing ${listingId} is not active, skipping`);
            continue;
          }

          // FILTRE IMPORTANT: Ne garder que les NFT de notre contrat
          if (listing.nftContract.toLowerCase() !== NFT_ADDRESS.toLowerCase()) {
            console.log(`   ⏩ Listing ${listingId} is from another NFT contract (${listing.nftContract}), skipping`);
            continue;
          }

          // Ne pas afficher nos propres listings
          if (address && listing.seller.toLowerCase() === address.toLowerCase()) {
            console.log(`   ⏩ Listing ${listingId} is yours, skipping`);
            continue;
          }

          // Récupérer les métadonnées du NFT
          const [tokenizationDate, isActive, uri] = await publicClient.readContract({
            address: listing.nftContract as `0x${string}`,
            abi: NFTTokenABI,
            functionName: 'getAssetData',
            args: [listing.tokenId],
          }) as [bigint, boolean, string];

          let name = `NFT #${listing.tokenId}`;
          let imageUrl = '/placeholder-nft.png';
          let description = '';
          let valuation = formatEther(listing.price);

          // Parser les métadonnées
          if (uri && uri.startsWith('data:application/json')) {
            try {
              const jsonPart = uri.replace('data:application/json,', '');
              const decoded = decodeURIComponent(jsonPart);
              const metadata = JSON.parse(decoded);
              
              name = metadata.name || name;
              imageUrl = metadata.image || imageUrl;
              description = metadata.description || '';
            } catch (e) {
              console.log(`   Could not parse metadata for token ${listing.tokenId}`);
            }
          } else if (uri && uri.startsWith('ipfs://')) {
            try {
              const httpUrl = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
              const response = await fetch(httpUrl);
              const metadata = await response.json();
              
              name = metadata.name || name;
              imageUrl = metadata.image?.replace('ipfs://', 'https://ipfs.io/ipfs/') || imageUrl;
              description = metadata.description || '';
            } catch (e) {
              console.log(`   Could not fetch IPFS metadata for token ${listing.tokenId}`);
            }
          }

          listings.push({
            listingId: listingId,
            tokenId: Number(listing.tokenId),
            owner: listing.seller,
            price: valuation,
            metadata: { name, description },
            imageUrl,
            name,
            description,
            valuation,
          });

          console.log(`   ✅ Added listing ${listingId} to list`);
        } catch (e: any) {
          console.log(`   ⚠️ Error loading listing ${listingId}:`, e.message);
        }
      }

      console.log(`✅ Loaded ${listings.length} active NFT listings`);
      setNftListings(listings);
    } catch (error) {
      console.error('Error loading NFT listings:', error);
    }
  };

  // Charger mes NFTs
  const loadMyNFTs = async () => {
    if (!publicClient || !address) {
      console.log('❌ Cannot load NFTs: publicClient or address missing', { publicClient: !!publicClient, address });
      return;
    }

    console.log('🔍 Starting to load NFTs for address:', address);
    console.log('📋 NFT Contract Address:', NFT_ADDRESS);

    try {
      // Utiliser tokensOfOwner pour obtenir tous les tokens de l'utilisateur (NFTAssetTokenV2)
      const tokenIds = await publicClient.readContract({
        address: NFT_ADDRESS,
        abi: NFTTokenABI,
        functionName: 'tokensOfOwner',
        args: [address],
      }) as bigint[];

      console.log('💎 NFT Token IDs:', tokenIds.map(id => id.toString()));

      const myNFTsList = [];
      
      // Charger les données de chaque NFT
      for (const tokenId of tokenIds) {
        try {
          console.log(`   Loading NFT #${tokenId}...`);
          
          // Récupérer les données de l'asset depuis le contrat (V2)
          const [tokenizationDate, isActive, uri] = await publicClient.readContract({
            address: NFT_ADDRESS,
            abi: NFTTokenABI,
            functionName: 'getAssetData',
            args: [tokenId],
          }) as [bigint, boolean, string];

          console.log(`   Token ${tokenId} - Active: ${isActive}, URI:`, uri);

          let name = `NFT #${tokenId}`;
          let imageUrl = '/placeholder-nft.png';
          let description = '';
          let valuation = '0';

          // Parser les métadonnées
          if (uri && uri.startsWith('data:application/json')) {
            try {
              const jsonPart = uri.replace('data:application/json,', '');
              const decoded = decodeURIComponent(jsonPart);
              const metadata = JSON.parse(decoded);
              
              name = metadata.name || name;
              imageUrl = metadata.image || imageUrl;
              description = metadata.description || '';
              valuation = metadata.valuation || '0';
              
              console.log(`   📝 Name: ${name}, Valuation: ${valuation} ETH`);
            } catch (e) {
              console.log(`   Could not parse metadata for token ${tokenId}`);
            }
          } else if (uri && uri.startsWith('ipfs://')) {
            try {
              const httpUrl = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
              const response = await fetch(httpUrl);
              const metadata = await response.json();
              
              name = metadata.name || name;
              imageUrl = metadata.image?.replace('ipfs://', 'https://ipfs.io/ipfs/') || imageUrl;
              description = metadata.description || '';
              valuation = metadata.valuation || '0';
            } catch (e) {
              console.log(`   Could not fetch IPFS metadata for token ${tokenId}`);
            }
          }

          myNFTsList.push({ 
            tokenId: Number(tokenId), 
            name, 
            imageUrl, 
            description,
            valuation,
            isActive 
          });
          
          console.log(`   ✅ Added NFT #${tokenId} to list:`, { name, valuation });
        } catch (e: any) {
          console.log(`   ⚠️ Error loading token ${tokenId}:`, e.message);
        }
      }

      console.log('✅ My NFTs loaded:', myNFTsList);
      console.log(`📊 Total NFTs found: ${myNFTsList.length}`);
      setMyNFTs(myNFTsList);
    } catch (error) {
      console.error('Error loading my NFTs:', error);
    }
  };

  // Charger balance de tokens
  const loadTokenBalance = async () => {
    if (!publicClient || !address) return;

    try {
      const balance = await publicClient.readContract({
        address: TOKEN_ADDRESS,
        abi: FungibleTokenABI,
        functionName: 'balanceOf',
        args: [address],
      }) as bigint;

      setMyTokenBalance(formatEther(balance));
    } catch (error) {
      console.error('Error loading token balance:', error);
    }
  };

  useEffect(() => {
    loadNFTListings();
    loadMyNFTs();
    loadTokenBalance();
  }, [publicClient, address]);

  // Acheter un NFT
  // Acheter un NFT
  const handleBuyNFT = async (listing: Listing) => {
    if (!walletClient || !address) {
      alert('Veuillez connecter votre wallet');
      return;
    }

    const priceInEth = parseFloat(listing.price);
    const feePercentage = 2.5; // 2.5% de frais
    const totalPrice = priceInEth;
    const fee = (priceInEth * feePercentage) / 100;
    const sellerAmount = priceInEth - fee;

    if (!confirm(
      `🛒 Acheter ce NFT ?\n\n` +
      `NFT: ${listing.name}\n` +
      `Token ID: ${listing.tokenId}\n` +
      `Vendeur: ${listing.owner.slice(0, 6)}...${listing.owner.slice(-4)}\n\n` +
      `💰 Prix: ${priceInEth} ETH\n` +
      `📊 Frais (2.5%): ${fee.toFixed(4)} ETH\n` +
      `💵 Le vendeur reçoit: ${sellerAmount.toFixed(4)} ETH\n\n` +
      `Confirmer l'achat ?`
    )) {
      return;
    }

    setLoading(true);
    
    try {
      console.log('🛒 Starting NFT purchase...');
      console.log('   Listing ID:', listing.listingId);
      console.log('   Token ID:', listing.tokenId);
      console.log('   Price:', priceInEth, 'ETH');
      console.log('   Marketplace:', MARKETPLACE_ADDRESS);

      // Acheter le NFT via le contrat Marketplace
      console.log('   💳 Sending purchase transaction...');
      
      const buyTx = await walletClient.writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: MarketplaceABI,
        functionName: 'buyNFT',
        args: [BigInt(listing.listingId)],
        value: parseEther(priceInEth.toString()), // Envoyer le prix en ETH
      });

      console.log('   ⏳ Waiting for purchase transaction:', buyTx);
      
      const receipt = await publicClient?.waitForTransactionReceipt({ hash: buyTx });
      
      console.log('   ✅ Purchase successful!', receipt);

      alert(
        `✅ Achat réussi !\n\n` +
        `Vous êtes maintenant propriétaire de "${listing.name}" (Token #${listing.tokenId})\n\n` +
        `Prix payé: ${priceInEth} ETH\n` +
        `Transaction: ${buyTx}\n\n` +
        `Le NFT a été transféré dans votre wallet !`
      );
      
      // Recharger les listings et les NFTs
      loadNFTListings();
      loadMyNFTs();
      
    } catch (error: any) {
      console.error('❌ Purchase error:', error);
      
      // Messages d'erreur plus explicites
      let errorMessage = 'Une erreur est survenue lors de l\'achat';
      
      if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction annulée par l\'utilisateur';
      } else if (error.message?.includes('NotWhitelisted')) {
        errorMessage = 'Vous devez être whitelisté (KYC validé) pour acheter sur le marketplace';
      } else if (error.message?.includes('ListingNotActive')) {
        errorMessage = 'Ce listing n\'est plus actif (déjà vendu ou annulé)';
      } else if (error.message?.includes('InsufficientPayment')) {
        errorMessage = 'Le montant envoyé est insuffisant';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = `Fonds insuffisants. Vous avez besoin de ${priceInEth} ETH + frais de gas`;
      } else {
        errorMessage = error.message || 'Erreur inconnue';
      }
      
      alert(`❌ Erreur lors de l'achat:\n\n${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Lister un NFT
  const handleListNFT = async () => {
    if (!walletClient || !address) {
      alert('Veuillez connecter votre wallet');
      return;
    }

    if (!nftToList || !nftPrice) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const priceValue = parseFloat(nftPrice);
    if (priceValue <= 0) {
      alert('Le prix doit être supérieur à 0');
      return;
    }

    setLoading(true);
    
    try {
      console.log('🚀 Starting NFT listing process...');
      console.log('   NFT Contract:', NFT_ADDRESS);
      console.log('   Token ID:', nftToList);
      console.log('   Price:', priceValue, 'ETH');
      console.log('   Marketplace:', MARKETPLACE_ADDRESS);

      // Étape 1: Vérifier si le marketplace est déjà approuvé
      const isApprovedForAll = await publicClient?.readContract({
        address: NFT_ADDRESS,
        abi: NFTTokenABI,
        functionName: 'isApprovedForAll',
        args: [address, MARKETPLACE_ADDRESS],
      }) as boolean;

      console.log('   Is approved for all:', isApprovedForAll);

      // Étape 2: Si pas approuvé, demander l'approbation
      if (!isApprovedForAll) {
        console.log('   📝 Requesting approval...');
        
        const approveTx = await walletClient.writeContract({
          address: NFT_ADDRESS,
          abi: NFTTokenABI,
          functionName: 'setApprovalForAll',
          args: [MARKETPLACE_ADDRESS, true],
        });

        console.log('   ⏳ Waiting for approval transaction:', approveTx);
        
        await publicClient?.waitForTransactionReceipt({ hash: approveTx });
        
        console.log('   ✅ Approval confirmed!');
      }

      // Étape 3: Lister le NFT sur le marketplace
      console.log('   📋 Creating listing...');
      
      const listTx = await walletClient.writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: MarketplaceABI,
        functionName: 'listNFT',
        args: [
          NFT_ADDRESS,
          BigInt(nftToList),
          parseEther(priceValue.toString())
        ],
      });

      console.log('   ⏳ Waiting for listing transaction:', listTx);
      
      const receipt = await publicClient?.waitForTransactionReceipt({ hash: listTx });
      
      console.log('   ✅ Listing created successfully!', receipt);

      alert(`✅ NFT listé avec succès!\n\nVotre NFT #${nftToList} est maintenant en vente pour ${priceValue} ETH.\n\nTransaction: ${listTx}`);
      
      // Réinitialiser le formulaire
      setShowListingForm(false);
      setNftToList('');
      setNftPrice('');
      
      // Recharger les listings
      loadNFTListings();
      
    } catch (error: any) {
      console.error('❌ Listing error:', error);
      
      // Messages d'erreur plus explicites
      let errorMessage = 'Une erreur est survenue';
      
      if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction annulée par l\'utilisateur';
      } else if (error.message?.includes('NotWhitelisted')) {
        errorMessage = 'Vous devez être whitelisté (KYC validé) pour utiliser le marketplace';
      } else if (error.message?.includes('NFTAlreadyListed')) {
        errorMessage = 'Ce NFT est déjà listé sur le marketplace';
      } else if (error.message?.includes('NotApproved')) {
        errorMessage = 'Le marketplace doit être approuvé pour gérer vos NFTs';
      } else {
        errorMessage = error.message || 'Erreur inconnue';
      }
      
      alert(`❌ Erreur lors du listing:\n\n${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              🛒 Marketplace P2P
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Achetez et vendez des NFTs et tokens directement entre particuliers
            </p>
          </div>

          {/* Stats */}
          {isConnected && (
            <div className="bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">💼 Votre inventaire</h3>
                <button
                  onClick={() => {
                    loadMyNFTs();
                    loadTokenBalance();
                  }}
                  className="px-4 py-2 text-sm bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-all"
                >
                  🔄 Actualiser
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">NFTs possédés</div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {myNFTs.length}
                  </div>
                  {myNFTs.length > 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {myNFTs.map(nft => `#${nft.tokenId}`).join(', ')}
                    </div>
                  )}
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Tokens disponibles</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {parseFloat(myTokenBalance).toFixed(2)}
                  </div>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                  <button
                    onClick={() => setShowListingForm(!showListingForm)}
                    disabled={myNFTs.length === 0}
                    className="w-full py-2 px-4 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
                    title={myNFTs.length === 0 ? "Vous devez posséder au moins un NFT" : ""}
                  >
                    + Créer une annonce
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Formulaire de listing */}
          {showListingForm && isConnected && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Créer une annonce
              </h2>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  ℹ️ Comment ça marche ?
                </h3>
                <ol className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-decimal list-inside">
                  <li>Sélectionnez le NFT que vous souhaitez vendre</li>
                  <li>Définissez le prix en ETH</li>
                  <li>Vous devrez approuver le contrat Marketplace (1ère fois uniquement)</li>
                  <li>Le NFT reste dans votre wallet jusqu'à la vente</li>
                  <li>Des frais de 2.5% s'appliquent lors de la vente</li>
                </ol>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type d'annonce
                  </label>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 px-4 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg font-medium">
                      NFT
                    </button>
                    <button className="flex-1 py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg">
                      Tokens
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    NFT à vendre
                  </label>
                  <select
                    value={nftToList}
                    onChange={(e) => handleNFTSelection(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Sélectionnez un NFT</option>
                    {myNFTs.length === 0 ? (
                      <option disabled>Aucun NFT disponible</option>
                    ) : (
                      myNFTs.map((nft) => (
                        <option key={nft.tokenId} value={nft.tokenId}>
                          {nft.name} (ID: {nft.tokenId}) - Valuation: {parseFloat(nft.valuation).toFixed(4)} ETH
                        </option>
                      ))
                    )}
                  </select>
                  {myNFTs.length === 0 && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      💡 Vous devez posséder au moins un NFT pour créer une annonce
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prix (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={nftPrice}
                    onChange={(e) => setNftPrice(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0.0"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleListNFT}
                    disabled={loading || !nftToList || !nftPrice}
                    className="flex-1 py-3 px-6 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400 text-white font-bold rounded-lg transition-all disabled:cursor-not-allowed"
                  >
                    {loading ? '⏳ Traitement en cours...' : '🚀 Publier l\'annonce'}
                  </button>
                  <button
                    onClick={() => setShowListingForm(false)}
                    disabled={loading}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('nft')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                activeTab === 'nft'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              🖼️ NFTs ({nftListings.length})
            </button>
            <button
              onClick={() => setActiveTab('tokens')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                activeTab === 'tokens'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              🪙 Tokens ({tokenListings.length})
            </button>
          </div>

          {/* NFT Listings */}
          {activeTab === 'nft' && (
            <div>
              {nftListings.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                  <div className="text-6xl mb-4">🏜️</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Aucun NFT en vente
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Soyez le premier à lister un NFT sur le marketplace !
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nftListings.map((listing) => (
                    <div
                      key={listing.tokenId}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all"
                    >
                      <div className="relative h-64 bg-gray-200 dark:bg-gray-700">
                        {listing.imageUrl && (
                          <Image
                            src={listing.imageUrl}
                            alt={listing.name}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-nft.png';
                            }}
                          />
                        )}
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {listing.name}
                        </h3>
                        
                        {listing.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                            {listing.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Prix</div>
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {parseFloat(listing.price).toFixed(4)} ETH
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              + frais 2.5%
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Token ID</div>
                            <div className="text-lg font-bold text-gray-700 dark:text-gray-300">
                              #{listing.tokenId}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {listing.owner.slice(0, 6)}...{listing.owner.slice(-4)}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleBuyNFT(listing)}
                          disabled={loading || !isConnected}
                          className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-lg transition-all disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                          {loading ? '⏳ Traitement...' : '🛒 Acheter maintenant'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Token Listings */}
          {activeTab === 'tokens' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Marketplace de Tokens en construction
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Pour acheter des tokens, utilisez le DEX pour le moment !
              </p>
              <a
                href="/dex"
                className="inline-block py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all"
              >
                Aller sur le DEX →
              </a>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-8 bg-pink-50 dark:bg-pink-900/20 rounded-xl p-6">
            <h3 className="font-semibold text-pink-900 dark:text-pink-300 mb-3">
              📖 Comment fonctionne le Marketplace ?
            </h3>
            <ul className="space-y-2 text-sm text-pink-800 dark:text-pink-400">
              <li>• <strong>Peer-to-Peer (P2P)</strong> : Achetez directement auprès d'autres utilisateurs</li>
              <li>• <strong>Prix fixes</strong> : Chaque vendeur définit son propre prix</li>
              <li>• <strong>NFTs uniques</strong> : Parfait pour les biens rares et uniques</li>
              <li>• <strong>Annonces</strong> : Les vendeurs créent des listings qui restent actifs jusqu'à la vente</li>
              <li>• <strong>Pas de slippage</strong> : Le prix que vous voyez est le prix que vous payez</li>
            </ul>
          </div>

          {/* DEX vs Marketplace comparison */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6">
              <h4 className="font-bold text-orange-900 dark:text-orange-300 mb-3 flex items-center gap-2">
                <span className="text-2xl">🔄</span> DEX
              </h4>
              <ul className="space-y-1 text-sm text-orange-800 dark:text-orange-400">
                <li>✅ Prix dynamique (AMM)</li>
                <li>✅ Liquidité instantanée</li>
                <li>✅ Trading actif</li>
                <li>❌ Slippage sur gros volumes</li>
              </ul>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6">
              <h4 className="font-bold text-purple-900 dark:text-purple-300 mb-3 flex items-center gap-2">
                <span className="text-2xl">🛒</span> Marketplace
              </h4>
              <ul className="space-y-1 text-sm text-purple-800 dark:text-purple-400">
                <li>✅ Prix fixe garanti</li>
                <li>✅ Parfait pour NFTs</li>
                <li>✅ Pas de slippage</li>
                <li>❌ Attendre un vendeur</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
