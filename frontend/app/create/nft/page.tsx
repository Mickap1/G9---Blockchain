'use client';

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import NFTTokenV2ABI from '@/lib/abis/NFTAssetTokenV2.json';
import { Header } from '@/components/Header';

const NFT_V2_ADDRESS = '0xf16b0641A9C56C6db30E052E90DB9358b6D2C946';

export default function CreateNFTPage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [loading, setLoading] = useState(false);
  
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
    if (publicClient) {
      loadCollectionInfo();
    }
  }, [publicClient]);

  const handleMintNFT = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletClient || !mintTo) {
      alert('Veuillez remplir l\'adresse du destinataire');
      return;
    }

    let finalMetadataURI = metadataURI;
    
    if (metadataMode === 'manual') {
      if (!assetName || !description) {
        alert('Veuillez remplir au minimum le nom et la description');
        return;
      }
      
      // For testing: Use a minimal test URI to avoid gas issues
      // In production, this would upload to IPFS
      finalMetadataURI = `ipfs://test-${Date.now()}`;
      
      // Show what would be uploaded
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
      
      console.log('Metadata qui devrait être uploadé sur IPFS:', metadata);
      console.log('Test URI utilisée:', finalMetadataURI);
      
      const confirmMint = confirm(
        '🧪 MODE TEST\n\n' +
        `URI de test: ${finalMetadataURI}\n\n` +
        'Métadonnées:\n' + JSON.stringify(metadata, null, 2) + '\n\n' +
        '⚠️ En production, uploadez sur IPFS!\n\n' +
        'Continuer le mint avec URI de test?'
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
      const hash = await walletClient.writeContract({
        address: NFT_V2_ADDRESS,
        abi: NFTTokenV2ABI,
        functionName: 'mintAsset',
        args: [mintTo, finalMetadataURI],
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-xl p-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Créer des NFTs</h1>
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
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Créer des NFTs</h1>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                🚀 Optimisé
              </span>
            </div>
          <p className="text-gray-600 mb-8">Mint direct ou avec IPFS pour métadonnées volumineuses</p>

          {/* Collection Information */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>🎨</span> Collection
            </h2>
            
            {loadingInfo ? (
              <p className="text-gray-600">Chargement...</p>
            ) : collectionInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nom</p>
                  <p className="font-semibold text-lg">{collectionInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">NFTs Créés</p>
                  <p className="font-semibold text-green-600">{collectionInfo.totalSupply}</p>
                </div>
              </div>
            ) : (
              <button onClick={loadCollectionInfo} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Charger
              </button>
            )}
          </div>

          {/* Mint Form */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">✨ Minter un NFT</h2>

            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>ℹ️</strong> Le destinataire doit avoir un KYC approuvé.
              </p>
            </div>

            <form onSubmit={handleMintNFT} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse du destinataire *
                </label>
                <input
                  type="text"
                  value={mintTo}
                  onChange={(e) => setMintTo(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                  required
                />
              </div>

              {/* Mode Toggle */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Mode *
                </label>
                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setMetadataMode('manual')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      metadataMode === 'manual'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    disabled={loading}
                  >
                    🔗 URI IPFS
                  </button>
                </div>
              </div>

              {/* Manual Mode */}
              {metadataMode === 'manual' && (
                <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                    <p className="text-sm text-yellow-800 font-semibold">💡 Mint Direct</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Champs obligatoires: nom + description. Image optionnelle.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de l'actif *
                    </label>
                    <input
                      type="text"
                      value={assetName}
                      onChange={(e) => setAssetName(e.target.value)}
                      placeholder="Diamond 2.5ct D IF"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Description de l'actif..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valorisation EUR (optionnel)
                    </label>
                    <input
                      type="number"
                      value={valuation}
                      onChange={(e) => setValuation(e.target.value)}
                      placeholder="50000"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URI (optionnel)
                    </label>
                    <input
                      type="text"
                      value={imageURI}
                      onChange={(e) => setImageURI(e.target.value)}
                      placeholder="ipfs://... ou https://..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certificat URI (optionnel)
                    </label>
                    <input
                      type="text"
                      value={certificateURI}
                      onChange={(e) => setCertificateURI(e.target.value)}
                      placeholder="ipfs://..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            disabled={loading}
                          />
                          <input
                            type="text"
                            value={attr.value}
                            onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                            placeholder="Valeur"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            disabled={loading}
                          />
                          {attributes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeAttribute(index)}
                              className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm"
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
                        className="w-full py-2 px-4 border-2 border-dashed border-green-300 text-green-600 rounded-lg hover:bg-green-50 text-sm font-medium"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URI IPFS *
                  </label>
                  <input
                    type="text"
                    value={metadataURI}
                    onChange={(e) => setMetadataURI(e.target.value)}
                    placeholder="ipfs://..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    disabled={loading}
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !mintTo ||
                  (metadataMode === 'manual' && (!assetName || !description)) ||
                  (metadataMode === 'uri' && !metadataURI)}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                  loading || !mintTo ||
                  (metadataMode === 'manual' && (!assetName || !description)) ||
                  (metadataMode === 'uri' && !metadataURI)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {loading ? 'Minting...' : '✨ Minter le NFT'}
              </button>
            </form>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
