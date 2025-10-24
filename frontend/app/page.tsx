import { Header } from '@/components/Header';
import Link from 'next/link';
import { Coins, FileCheck, PlusSquare, TrendingUp, Zap, LayoutDashboard, Hammer, Database } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header />
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🏢 Tokenize Real World Assets
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Créez, échangez et gérez des actifs tokenisés sur la blockchain.
          </p>
        </div>

        {/* Dashboard Card - Featured */}
        <div className="max-w-4xl mx-auto mb-12">
          <Link href="/dashboard" className="block bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <LayoutDashboard className="w-16 h-16" />
                <div>
                  <h2 className="text-3xl font-bold mb-2">Mon Dashboard</h2>
                  <p className="text-blue-100 text-lg">
                    Vue d'ensemble de votre portefeuille, tokens, NFTs et positions de liquidité
                  </p>
                </div>
              </div>
              <div className="text-4xl">→</div>
            </div>
          </Link>
        </div>
        
        {/* Section Tokenisation */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            📊 Créer des Actifs
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            <Link href="/mint/tokens" className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition border-2 border-transparent hover:border-green-500">
              <Hammer className="w-16 h-16 text-green-600 mb-4 mx-auto" />
              <h3 className="text-2xl font-semibold mb-3 text-center">Minter des Tokens</h3>
              <p className="text-gray-600 text-center mb-4">
                Émettre des tokens fongibles (ERC-20) représentant des parts d'actifs
              </p>
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm text-gray-800 mb-3">
                <p className="font-semibold text-yellow-800">⚠️ Accès Admin requis</p>
                <p className="text-xs text-yellow-700 mt-1">Rôle MINTER_ROLE nécessaire</p>
              </div>
              <div className="bg-gray-50 p-3 rounded text-sm text-gray-800">
                <p className="font-semibold">Exemples:</p>
                <ul className="list-disc list-inside mt-1 text-xs">
                  <li>Parts de biens immobiliers</li>
                  <li>Actions fractionnées</li>
                  <li>Parts de fonds d'investissement</li>
                </ul>
              </div>
            </Link>
            
            <Link href="/create/nft" className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition border-2 border-transparent hover:border-purple-500">
              <Zap className="w-16 h-16 text-purple-600 mb-4 mx-auto" />
              <h3 className="text-2xl font-semibold mb-3 text-center">Créer des NFTs</h3>
              <p className="text-gray-600 text-center mb-4">
                Créer des NFTs (ERC-721) pour représenter des actifs uniques
              </p>
              <div className="bg-purple-50 p-3 rounded text-sm text-gray-800">
                <p className="font-semibold">Exemples:</p>
                <ul className="list-disc list-inside mt-1 text-xs">
                  <li>Œuvres d'art numériques</li>
                  <li>Biens immobiliers uniques</li>
                  <li>Certificats de propriété</li>
                  <li>Objets de collection</li>
                </ul>
              </div>
            </Link>
          </div>
        </div>

        {/* Section Trading */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            💱 Échanger des Actifs
          </h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Link href="/kyc" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105">
              <FileCheck className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">KYC</h3>
              <p className="text-gray-600 text-sm">Vérification pour accéder aux fonctionnalités</p>
            </Link>
            
            <Link href="/marketplace" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105">
              <Coins className="w-12 h-12 text-pink-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Marketplace</h3>
              <p className="text-gray-600 text-sm">Acheter et vendre des NFTs en P2P</p>
            </Link>
            
            <Link href="/dex" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105">
              <TrendingUp className="w-12 h-12 text-orange-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">DEX</h3>
              <p className="text-gray-600 text-sm">Échanger des tokens et fournir liquidité</p>
            </Link>

            <Link href="/oracle" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105">
              <Database className="w-12 h-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Oracle</h3>
              <p className="text-gray-600 text-sm">Prix en temps réel des actifs</p>
            </Link>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-16 max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            💡 Comment ça marche ?
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">1️⃣</span>
                <div>
                  <p className="font-semibold text-gray-900">Vérification KYC</p>
                  <p className="text-sm text-gray-600">Soumettez votre demande de vérification</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">2️⃣</span>
                <div>
                  <p className="font-semibold text-gray-900">Tokens & NFTs</p>
                  <p className="text-sm text-gray-600">Créez ou recevez des actifs tokenisés</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">3️⃣</span>
                <div>
                  <p className="font-semibold text-gray-900">Trading</p>
                  <p className="text-sm text-gray-600">Échangez sur le Marketplace ou le DEX</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
              <p className="font-semibold text-gray-900 mb-2">✨ Avantages</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✓ Propriété fractionnée d'actifs réels</li>
                <li>✓ Trading 24/7 sur la blockchain</li>
                <li>✓ Liquidité via le DEX AMM</li>
                <li>✓ Transparence totale des transactions</li>
                <li>✓ Sécurité via smart contracts</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
