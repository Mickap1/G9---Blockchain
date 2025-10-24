'use client';

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import NFTTokenV2ABI from '@/lib/abis/NFTAssetTokenV2.json';
import KYCRegistryABI from '@/lib/abis/KYCRegistry.json';
import { contracts } from '@/lib/contracts';
import { Header } from '@/components/Header';

const NFT_V2_ADDRESS = '0x75499Fc469f8d224C7bF619Ada37ea8f3cD8c36E';

export default function CreateNFTPage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [loading, setLoading] = useState(false);
  const [isKYCApproved, setIsKYCApproved] = useState<boolean>(false);
  const [checkingKYC, setCheckingKYC] = useState<boolean>(true);
  
  // Metadata mode: 'uri' or 'manual'
  const [metadataMode, setMetadataMode] = useState<'uri' | 'manual'>('manual');
  
  // Mint form state
  const [mintTo, setMintTo] = useState('');
  const [assetName, setAssetName] = useState('');
  const [valuation, setValuation] = useState('');
  const [metadataURI, setMetadataURI] = useState('');
  const [certificateURI, setCertificateURI] = useState('');
  
  // Manual metadata fields
  const [description, setDescription] = useState('');
  const [imageURI, setImageURI] = useState('');
  const [attributes, setAttributes] = useState<Array<{trait_type: string, value: string}>>([
    { trait_type: '', value: '' }
  ]);

  // Collection info state
  const [collectionInfo, setCollectionInfo] = useState<any>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);

  // Vérifier le statut KYC de l'utilisateur
  const checkKYCStatus = async () => {
    if (!publicClient || !address) {
      setCheckingKYC(false);
      return;
    }

    try {
      setCheckingKYC(true);
      
      // Récupérer l'adresse du KYC Registry depuis le contrat NFT
      const kycRegistryAddress = await publicClient.readContract({
        address: NFT_V2_ADDRESS,
        abi: NFTTokenV2ABI,
        functionName: 'kycRegistry',
      }) as `0x${string}`;

      console.log('KYC Registry Address:', kycRegistryAddress);

      // Vérifier si l'utilisateur est whitelisté
      const isWhitelisted = await publicClient.readContract({
        address: kycRegistryAddress,
        abi: KYCRegistryABI,
        functionName: 'isWhitelisted',
        args: [address],
      }) as boolean;

      console.log('User KYC Status:', isWhitelisted);
      setIsKYCApproved(isWhitelisted);
    } catch (error) {
      console.error('Error checking KYC status:', error);
      setIsKYCApproved(false);
    } finally {
      setCheckingKYC(false);
    }
  };

  // Load collection info
  const loadCollectionInfo = async () => {
    if (!publicClient) return;

    setLoadingInfo(true);
    try {
      const [name, symbol, assetType, description, totalSupply] = await Promise.all([
        publicClient.readContract({
          address: NFT_V2_ADDRESS,
          abi: NFTTokenV2ABI,
          functionName: 'name',
        }),
        publicClient.readContract({
          address: NFT_V2_ADDRESS,
          abi: NFTTokenV2ABI,
          functionName: 'symbol',
        }),
        publicClient.readContract({
          address: NFT_V2_ADDRESS,
          abi: NFTTokenV2ABI,
          functionName: 'assetType',
        }),
        publicClient.readContract({
          address: NFT_V2_ADDRESS,
          abi: NFTTokenV2ABI,
          functionName: 'collectionDescription',
        }),
        publicClient.readContract({
          address: NFT_V2_ADDRESS,
          abi: NFTTokenV2ABI,
          functionName: 'totalSupply',
        }),
      ]);

      setCollectionInfo({
        name,
        symbol,
        assetType,
        description,
        totalSupply: Number(totalSupply),
      });
    } catch (error) {
      console.error('Error loading collection info:', error);
    } finally {
      setLoadingInfo(false);
    }
  };

  // Load info on mount
  useEffect(() => {
    if (publicClient && address) {
      loadCollectionInfo();
      checkKYCStatus();
      // Initialiser mintTo avec l'adresse de l'utilisateur par défaut
      if (!mintTo) {
        setMintTo(address);
      }
    }
  }, [publicClient, address]);

  const handleMintNFT = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletClient || !mintTo) {
      alert('Veuillez remplir l\'adresse du destinataire');
      return;
    }

    let finalMetadataURI = metadataURI;
    
    if (metadataMode === 'manual') {
      // Validation des champs obligatoires
      if (!assetName || !description) {
        alert('⚠️ Veuillez remplir le nom et la description');
        return;
      }
      
      if (!imageURI) {
        alert('⚠️ L\'image est obligatoire\n\nVeuillez fournir une URL d\'image (ex: https://i.imgur.com/xxx.png ou ipfs://xxx)');
        return;
      }
      
      if (!valuation || parseFloat(valuation) <= 0) {
        alert('⚠️ Le prix/valuation est obligatoire\n\nVeuillez entrer un montant supérieur à 0');
        return;
      }
      
      // Build metadata object
      const metadata: any = {
        name: assetName,
        description: description,
      };
      
      if (imageURI) metadata.image = imageURI;
      if (valuation) {
        metadata.valuation = parseFloat(valuation);
        metadata.valuationCurrency = "EUR";
      }
      if (certificateURI) metadata.certificateURI = certificateURI;
      
      const filteredAttributes = attributes.filter(attr => attr.trait_type && attr.value);
      if (filteredAttributes.length > 0) {
        metadata.attributes = filteredAttributes;
      }
      
      // Create a proper data URI with the metadata
      const metadataJSON = JSON.stringify(metadata);
      const encodedMetadata = encodeURIComponent(metadataJSON);
      finalMetadataURI = `data:application/json,${encodedMetadata}`;
      
      console.log('Metadata object:', metadata);
      console.log('Metadata JSON:', metadataJSON);
      console.log('Data URI:', finalMetadataURI);
      
      // Show preview to user
      const confirmMint = confirm(
        '📝 Vérification des métadonnées\n\n' +
        'Nom: ' + metadata.name + '\n' +
        'Description: ' + metadata.description + '\n' +
        (metadata.valuation ? 'Valuation: ' + metadata.valuation + ' EUR\n' : '') +
        (metadata.image ? 'Image: ✓\n' : 'Image: ✗\n') +
        (filteredAttributes.length > 0 ? 'Attributs: ' + filteredAttributes.length + '\n' : '') +
        '\n✅ Les métadonnées seront stockées on-chain (data URI)\n' +
        '\nContinuer le mint?'
      );
      
      if (!confirmMint) return;
      
    } else {
      if (!metadataURI) {
        alert('Veuillez fournir une URI de métadonnées');
        return;
      }
      finalMetadataURI = metadataURI;
    }

    setLoading(true);
    try {
      // Utiliser mintAssetPublic si l'utilisateur mint pour lui-même
      // Utiliser mintAsset (admin) s'il mint pour quelqu'un d'autre
      const isMintingForSelf = mintTo.toLowerCase() === address?.toLowerCase();
      
      const hash = await walletClient.writeContract({
        address: NFT_V2_ADDRESS,
        abi: NFTTokenV2ABI,
        functionName: isMintingForSelf ? 'mintAssetPublic' : 'mintAsset',
        args: isMintingForSelf ? [finalMetadataURI] : [mintTo, finalMetadataURI],
      });

      alert(`✅ NFT minté avec succès!\nTransaction: ${hash}\n\nURI: ${finalMetadataURI}`);
      
      await loadCollectionInfo();
      
      // Reset form
      setMintTo('');
      setAssetName('');
      setValuation('');
      setMetadataURI('');
      setCertificateURI('');
      setDescription('');
      setImageURI('');
      setAttributes([{ trait_type: '', value: '' }]);
    } catch (error: any) {
      console.error('Error minting NFT:', error);
      
      let errorMessage = 'Échec du mint';
      if (error.message) {
        if (error.message.includes('gas') || error.message.includes('limit')) {
          errorMessage = 'Erreur de gas. Vérifiez que vous avez assez de Sepolia ETH.';
        } else if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction annulée';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(`❌ Erreur: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const addAttribute = () => {
    setAttributes([...attributes, { trait_type: '', value: '' }]);
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const updateAttribute = (index: number, field: 'trait_type' | 'value', value: string) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-8 text-center">
              <h1 className="text-3xl font-bold text-white mb-4">Créer des NFTs</h1>
              <p className="text-gray-300">Veuillez connecter votre portefeuille pour continuer.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-purple-900/40 via-pink-900/30 to-purple-800/40 backdrop-blur-md rounded-lg border border-purple-500/20 p-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">Créer des NFTs</h1>
              <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-semibold border border-green-500/30">
                🚀 Optimisé
              </span>
            </div>
          <p className="text-gray-300 mb-8">Mint direct ou avec IPFS pour métadonnées volumineuses</p>

          {/* Collection Information */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-lg border border-blue-500/30">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
              <span>🎨</span> Collection
            </h2>
            
            {loadingInfo ? (
              <p className="text-gray-300">Chargement...</p>
            ) : collectionInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Nom</p>
                  <p className="font-semibold text-lg text-white">{collectionInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">NFTs Créés</p>
                  <p className="font-semibold text-green-400">{collectionInfo.totalSupply}</p>
                </div>
              </div>
            ) : (
              <button onClick={loadCollectionInfo} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Charger
              </button>
            )}
          </div>

          {/* Vérification du statut KYC */}
          {checkingKYC ? (
            <div className="mb-8 p-6 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-200 flex items-center gap-2">
                <span className="animate-spin">⏳</span> Vérification du statut KYC...
              </p>
            </div>
          ) : !isKYCApproved ? (
            <div className="mb-8 p-6 bg-red-500/20 border border-red-500/30 rounded-lg">
              <h3 className="text-xl font-bold text-red-300 mb-2 flex items-center gap-2">
                <span>⛔</span> KYC Non Approuvé
              </h3>
              <p className="text-red-200 mb-4">
                Votre compte n'est pas encore approuvé par le système KYC. Vous devez obtenir l'approbation KYC avant de pouvoir créer des NFT.
              </p>
              <div className="flex gap-3">
                <a
                  href="/kyc"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  📝 Soumettre une demande KYC
                </a>
                <button
                  onClick={checkKYCStatus}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  🔄 Revérifier
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-8 p-6 bg-green-500/20 border border-green-500/30 rounded-lg">
              <p className="text-green-200 flex items-center gap-2">
                <span>✅</span> Votre KYC est approuvé - Vous pouvez créer des NFT
              </p>
            </div>
          )}

          {/* Mint Form */}
          <div className="bg-white/5 p-6 rounded-lg border border-white/10">
            <h2 className="text-xl font-semibold mb-4 text-white">✨ Minter un NFT</h2>

            <div className="mb-4 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-200">
                <strong>ℹ️</strong> Avec KYC approuvé, vous pouvez créer des NFT pour vous-même ou pour d'autres adresses approuvées.
              </p>
            </div>

            <form onSubmit={handleMintNFT} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Destinataire *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={mintTo}
                    onChange={(e) => setMintTo(e.target.value)}
                    placeholder={address || "0x..."}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMintTo(address || '')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium whitespace-nowrap"
                    disabled={loading}
                  >
                    Moi-même
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {mintTo.toLowerCase() === address?.toLowerCase() 
                    ? '✓ Vous créez un NFT pour vous-même' 
                    : 'Le destinataire doit avoir un KYC approuvé'}
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="border-t border-white/10 pt-4">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Mode *
                </label>
                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setMetadataMode('manual')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      metadataMode === 'manual'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                    disabled={loading}
                  >
                    📝 Mint Direct
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetadataMode('uri')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      metadataMode === 'uri'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                    disabled={loading}
                  >
                    🔗 URI IPFS
                  </button>
                </div>
              </div>

              {/* Manual Mode */}
              {metadataMode === 'manual' && (
                <div className="space-y-4 p-4 bg-purple-500/20 rounded-lg border border-purple-500/30">
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-sm text-blue-300 font-semibold">💡 Mint Direct</p>
                    <p className="text-xs text-blue-200 mt-1">
                      ✅ Champs obligatoires: <strong>Nom, Description, Image, Prix</strong>
                    </p>
                    <p className="text-xs text-blue-200 mt-1">
                      Optionnel: Certificat, Attributs
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nom de l'actif <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={assetName}
                      onChange={(e) => setAssetName(e.target.value)}
                      placeholder="Diamond 2.5ct D IF"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Description de l'actif..."
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Valorisation EUR <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={valuation}
                      onChange={(e) => setValuation(e.target.value)}
                      placeholder="50000"
                      step="0.01"
                      min="0.01"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Image URL <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={imageURI}
                      onChange={(e) => setImageURI(e.target.value)}
                      placeholder="ipfs://... ou https://i.imgur.com/xxx.png"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
                      disabled={loading}
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      💡 Utilisez une URL publique (Imgur, IPFS, etc.)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Certificat URI (optionnel)
                    </label>
                    <input
                      type="text"
                      value={certificateURI}
                      onChange={(e) => setCertificateURI(e.target.value)}
                      placeholder="ipfs://..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Attributs (optionnel)
                    </label>
                    <div className="space-y-2">
                      {attributes.map((attr, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={attr.trait_type}
                            onChange={(e) => updateAttribute(index, 'trait_type', e.target.value)}
                            placeholder="Type"
                            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500"
                            disabled={loading}
                          />
                          <input
                            type="text"
                            value={attr.value}
                            onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                            placeholder="Valeur"
                            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500"
                            disabled={loading}
                          />
                          {attributes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeAttribute(index)}
                              className="px-3 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 text-sm"
                              disabled={loading}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addAttribute}
                        className="w-full py-2 px-4 border-2 border-dashed border-purple-500/30 text-purple-300 rounded-lg hover:bg-purple-500/10 text-sm font-medium"
                        disabled={loading}
                      >
                        + Ajouter
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* URI Mode */}
              {metadataMode === 'uri' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    URI IPFS *
                  </label>
                  <input
                    type="text"
                    value={metadataURI}
                    onChange={(e) => setMetadataURI(e.target.value)}
                    placeholder="ipfs://..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
                    disabled={loading}
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !isKYCApproved || !mintTo ||
                  (metadataMode === 'manual' && (!assetName || !description)) ||
                  (metadataMode === 'uri' && !metadataURI)}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                  loading || !isKYCApproved || !mintTo ||
                  (metadataMode === 'manual' && (!assetName || !description)) ||
                  (metadataMode === 'uri' && !metadataURI)
                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {loading ? 'Minting...' : !isKYCApproved ? '🔒 KYC Requis' : '✨ Minter le NFT'}
              </button>
            </form>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
