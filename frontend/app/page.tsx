import { Header } from '@/components/Header';
import Link from 'next/link';
import { Coins, FileCheck, PlusSquare, TrendingUp, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Tokenize Real World Assets
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create, trade, and manage tokenized assets on the blockchain.
          </p>
        </div>
        
        {/* Section Tokenisation */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Créer des Actifs
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            <Link href="/create/token" className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition border-2 border-transparent hover:border-green-500">
              <PlusSquare className="w-16 h-16 text-green-600 mb-4 mx-auto" />
              <h3 className="text-2xl font-semibold mb-3 text-center">Créer des Tokens</h3>
              <p className="text-gray-600 text-center mb-4">
                Créer des tokens fongibles (ERC-20) pour représenter des parts d'actifs
              </p>
              <div className="bg-gray-50 p-3 rounded text-sm text-gray-800">
                <p className="font-semibold">Exemples:</p>
                <ul className="list-disc list-inside mt-1">
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
                <ul className="list-disc list-inside mt-1">
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Échanger des Actifs
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Link href="/kyc" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <FileCheck className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">KYC Verification</h3>
              <p className="text-gray-600">Obtenir la vérification pour accéder aux fonctionnalités</p>
            </Link>
            
            <Link href="/marketplace" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <Coins className="w-12 h-12 text-pink-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Marketplace</h3>
              <p className="text-gray-600">Parcourir et échanger des actifs tokenisés</p>
            </Link>
            
            <Link href="/dex" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <TrendingUp className="w-12 h-12 text-orange-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">DEX Trading</h3>
              <p className="text-gray-600">Échanger des tokens avec prix en temps réel</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
