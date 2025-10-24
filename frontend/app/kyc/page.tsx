'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useKYC } from '@/lib/hooks/useKYC';
import { Header } from '@/components/Header';

export default function KYCPage() {
  const { address, isConnected } = useAccount();
  const { kycStatus, kycData, submitKYC, isLoading } = useKYC(address);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!address) {
      alert('Veuillez connecter votre portefeuille');
      return;
    }

    try {
      setSubmitting(true);
      // Use a default URI with the user's address
      const defaultURI = `kyc-request-${address}-${Date.now()}`;
      await submitKYC(defaultURI);
      alert('Demande de vérification KYC soumise avec succès!');
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-xl p-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Vérification KYC</h1>
              <p className="text-gray-600">
                Veuillez connecter votre portefeuille pour soumettre une demande KYC.
              </p>
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
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-3">📋 Demande de vérification</h3>
                <p className="text-sm text-blue-800 mb-4">
                  Cliquez sur le bouton ci-dessous pour soumettre une demande de vérification KYC pour votre adresse.
                </p>
                <div className="bg-white rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-500">Votre adresse :</p>
                  <p className="font-mono text-sm text-gray-900 break-all">{address}</p>
                </div>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>La vérification sera effectuée pour l'adresse connectée</li>
                  <li>La révision peut prendre quelques heures à quelques jours</li>
                  <li>Vous serez notifié une fois la demande traitée</li>
                </ul>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-colors ${
                  submitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Soumission en cours...
                  </span>
                ) : (
                  '✅ Soumettre une demande de vérification KYC'
                )}
              </button>
            </div>
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
    </div>
  );
}
