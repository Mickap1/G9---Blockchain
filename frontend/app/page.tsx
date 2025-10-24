import { Header } from '@/components/Header';
import Link from 'next/link';
import { Coins, FileCheck, PlusSquare, TrendingUp, Zap, LayoutDashboard, Hammer, Database } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            🏢 Tokenize Real World Assets
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
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
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            📊 Créer des Actifs
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            <Link href="/mint/tokens" className="bg-gradient-to-br from-green-900/40 via-emerald-900/30 to-green-800/40 backdrop-blur-md p-8 rounded-lg border border-green-500/20 hover:border-green-500/50 transition-all transform hover:scale-105">
              <Hammer className="w-16 h-16 text-green-400 mb-4 mx-auto" />
              <h3 className="text-2xl font-semibold mb-3 text-center text-white">Minter des Tokens</h3>
              <p className="text-gray-300 text-center mb-4">
                Émettre des tokens fongibles (ERC-20) représentant des parts d'actifs
              </p>
              <div className="bg-yellow-500/20 border border-yellow-500/30 p-3 rounded text-sm mb-3">
                <p className="font-semibold text-yellow-300">⚠️ Accès Admin requis</p>
                <p className="text-xs text-yellow-200 mt-1">Rôle MINTER_ROLE nécessaire</p>
              </div>
              <div className="bg-white/5 p-3 rounded text-sm border border-white/10">
                <p className="font-semibold text-white">Exemples:</p>
                <ul className="list-disc list-inside mt-1 text-xs text-gray-300">
                  <li>Parts de biens immobiliers</li>
                  <li>Actions fractionnées</li>
                  <li>Parts de fonds d'investissement</li>
                </ul>
              </div>
            </Link>
            
            <Link href="/create/nft" className="bg-gradient-to-br from-purple-900/40 via-pink-900/30 to-purple-800/40 backdrop-blur-md p-8 rounded-lg border border-purple-500/20 hover:border-purple-500/50 transition-all transform hover:scale-105">
              <Zap className="w-16 h-16 text-purple-400 mb-4 mx-auto" />
              <h3 className="text-2xl font-semibold mb-3 text-center text-white">Créer des NFTs</h3>
              <p className="text-gray-300 text-center mb-4">
                Créer des NFTs (ERC-721) pour représenter des actifs uniques
              </p>
              <div className="bg-white/5 p-3 rounded text-sm border border-white/10">
                <p className="font-semibold text-white">Exemples:</p>
                <ul className="list-disc list-inside mt-1 text-xs text-gray-300">
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
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            💱 Échanger des Actifs
          </h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Link href="/kyc" className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20 hover:border-blue-500/50 transition-all transform hover:scale-105">
              <FileCheck className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">KYC</h3>
              <p className="text-gray-300 text-sm">Vérification pour accéder aux fonctionnalités</p>
            </Link>
            
            <Link href="/marketplace" className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20 hover:border-pink-500/50 transition-all transform hover:scale-105">
              <Coins className="w-12 h-12 text-pink-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">Marketplace</h3>
              <p className="text-gray-300 text-sm">Acheter et vendre des NFTs en P2P</p>
            </Link>
            
            <Link href="/dex" className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20 hover:border-orange-500/50 transition-all transform hover:scale-105">
              <TrendingUp className="w-12 h-12 text-orange-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">DEX</h3>
              <p className="text-gray-300 text-sm">Échanger des tokens et fournir liquidité</p>
            </Link>

            <Link href="/oracle" className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20 hover:border-indigo-500/50 transition-all transform hover:scale-105">
              <Database className="w-12 h-12 text-indigo-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">Oracle</h3>
              <p className="text-gray-300 text-sm">Prix en temps réel des actifs</p>
            </Link>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-16 max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-8">
          <h3 className="text-2xl font-bold text-white mb-4 text-center">
            💡 Comment ça marche ?
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">1️⃣</span>
                <div>
                  <p className="font-semibold text-white">Vérification KYC</p>
                  <p className="text-sm text-gray-300">Soumettez votre demande de vérification</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">2️⃣</span>
                <div>
                  <p className="font-semibold text-white">Tokens & NFTs</p>
                  <p className="text-sm text-gray-300">Créez ou recevez des actifs tokenisés</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">3️⃣</span>
                <div>
                  <p className="font-semibold text-white">Trading</p>
                  <p className="text-sm text-gray-300">Échangez sur le Marketplace ou le DEX</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-4 rounded-lg border border-blue-500/30">
              <p className="font-semibold text-white mb-2">✨ Avantages</p>
              <ul className="text-sm text-gray-300 space-y-1">
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
