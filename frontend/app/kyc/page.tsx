'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useKYC } from '@/lib/hooks/useKYC';

export default function KYCPage() {
  const { address, isConnected } = useAccount();
  const { kycStatus, kycData, submitKYC, isLoading } = useKYC(address);
  const [dataURI, setDataURI] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataURI.trim()) {
      alert('Veuillez entrer une URI de données KYC');
      return;
    }

    try {
      setSubmitting(true);
      await submitKYC(dataURI);
      alert('Demande KYC soumise avec succès!');
      setDataURI('');
    } catch (error: any) {
      console.error('Erreur lors de la soumission KYC:', error);
      alert(`Erreur: ${error.message || 'Échec de la soumission'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusDisplay = (status: number) => {
    const statuses = ['Aucun', 'En attente', 'Approuvé', 'Rejeté', 'Liste noire'];
    return statuses[status] || 'Inconnu';
  };

  const getStatusColor = (status: number) => {
    const colors = [
      'bg-gray-100 text-gray-800',
      'bg-yellow-100 text-yellow-800',
      'bg-green-100 text-green-800',
      'bg-red-100 text-red-800',
      'bg-red-200 text-red-900'
    ];
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Vérification KYC</h1>
            <p className="text-gray-600">
              Veuillez connecter votre portefeuille pour soumettre une demande KYC.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Vérification KYC</h1>
          
          {/* Current Status */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Statut actuel</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Adresse:</span>
                <span className="font-mono text-sm">{address}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Statut KYC:</span>
                {isLoading ? (
                  <span className="text-gray-500">Chargement...</span>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(kycStatus)}`}>
                    {getStatusDisplay(kycStatus)}
                  </span>
                )}
              </div>
              {kycData && kycData.approvalDate > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Date d'approbation:</span>
                  <span className="text-gray-900">
                    {new Date(Number(kycData.approvalDate) * 1000).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
              {kycData && kycData.expiryDate > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Date d'expiration:</span>
                  <span className="text-gray-900">
                    {new Date(Number(kycData.expiryDate) * 1000).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
              {kycData && kycData.dataURI && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">URI de données:</span>
                  <span className="font-mono text-sm text-blue-600 truncate max-w-xs">
                    {kycData.dataURI}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Status Messages */}
          {kycStatus === 1 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                ⏳ Votre demande KYC est en cours de révision. Vous serez notifié une fois qu'elle sera traitée.
              </p>
            </div>
          )}
          {kycStatus === 2 && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">
                ✅ Votre KYC est approuvé! Vous pouvez maintenant utiliser tous les services de la plateforme.
              </p>
            </div>
          )}
          {kycStatus === 3 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">
                ❌ Votre demande KYC a été rejetée. Vous pouvez soumettre une nouvelle demande avec des informations mises à jour.
              </p>
            </div>
          )}
          {kycStatus === 4 && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-900">
                🚫 Votre adresse est sur liste noire. Veuillez contacter l'administrateur.
              </p>
            </div>
          )}

          {/* Submit Form */}
          {(kycStatus === 0 || kycStatus === 3) && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="dataURI" className="block text-sm font-medium text-gray-700 mb-2">
                  URI de données KYC
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Entrez l'URI de vos documents KYC (hash IPFS, lien vers documents chiffrés, etc.)
                </p>
                <input
                  type="text"
                  id="dataURI"
                  value={dataURI}
                  onChange={(e) => setDataURI(e.target.value)}
                  placeholder="ipfs://... ou https://..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={submitting}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Informations importantes</h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Vos documents KYC doivent être stockés de manière sécurisée</li>
                  <li>L'URI doit pointer vers des documents valides et accessibles</li>
                  <li>La révision peut prendre quelques heures à quelques jours</li>
                  <li>Assurez-vous que toutes les informations sont correctes avant de soumettre</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={submitting || !dataURI.trim()}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                  submitting || !dataURI.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {submitting ? 'Soumission en cours...' : 'Soumettre la demande KYC'}
              </button>
            </form>
          )}

          {/* Info Section */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Qu'est-ce que le KYC?</h3>
            <p className="text-gray-600 text-sm mb-3">
              Le KYC (Know Your Customer) est un processus de vérification d'identité requis pour utiliser
              les smart contracts et les fonctionnalités de trading sur notre plateforme.
            </p>
            <p className="text-gray-600 text-sm">
              Une fois votre KYC approuvé, vous pourrez créer des tokens, trader sur le DEX, et accéder
              à toutes les fonctionnalités de la plateforme.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
