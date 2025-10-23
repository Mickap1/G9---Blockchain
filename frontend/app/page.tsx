import { Header } from '@/components/Header';
import Link from 'next/link';
import { Coins, FileCheck, PlusSquare, TrendingUp } from 'lucide-react';

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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Link href="/kyc" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <FileCheck className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">KYC Verification</h3>
            <p className="text-gray-600">Get verified to access features</p>
          </Link>
          <Link href="/create/token" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <PlusSquare className="w-12 h-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Create Tokens</h3>
            <p className="text-gray-600">Mint tokens or NFTs</p>
          </Link>
          <Link href="/marketplace" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <Coins className="w-12 h-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Marketplace</h3>
            <p className="text-gray-600">Browse and trade assets</p>
          </Link>
          <Link href="/dex" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <TrendingUp className="w-12 h-12 text-orange-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">DEX Trading</h3>
            <p className="text-gray-600">Swap tokens with real-time pricing</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
