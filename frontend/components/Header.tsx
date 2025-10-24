'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet, Home, FileText, Coins, Zap, LayoutDashboard, Store, ArrowLeftRight, Database, Activity } from 'lucide-react';
import { useIndexerHealth } from '@/lib/hooks/useIndexer';

export function Header() {
  const { isHealthy, loading } = useIndexerHealth();
  return (
    <header className="border-b border-white/10 bg-slate-900/95 backdrop-blur-md shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-purple-400 hover:text-purple-300 transition">
            <Wallet className="w-6 h-6" />
            <span>RWA Marketplace</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-1 text-gray-300 hover:text-white transition">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <Link href="/dashboard" className="flex items-center space-x-1 text-gray-300 hover:text-blue-400 transition">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link href="/marketplace" className="flex items-center space-x-1 text-gray-300 hover:text-pink-400 transition">
              <Store className="w-4 h-4" />
              <span>Marketplace</span>
            </Link>
            <Link href="/dex" className="flex items-center space-x-1 text-gray-300 hover:text-orange-400 transition">
              <ArrowLeftRight className="w-4 h-4" />
              <span>DEX</span>
            </Link>
            <Link href="/oracle" className="flex items-center space-x-1 text-gray-300 hover:text-indigo-400 transition">
              <Database className="w-4 h-4" />
              <span>Oracle</span>
            </Link>
            <Link href="/kyc" className="flex items-center space-x-1 text-gray-300 hover:text-cyan-400 transition">
              <FileText className="w-4 h-4" />
              <span>KYC</span>
            </Link>
            <Link href="/mint/tokens" className="flex items-center space-x-1 text-gray-300 hover:text-green-400 transition">
              <Coins className="w-4 h-4" />
              <span>Mint Tokens</span>
            </Link>
            <Link href="/create/nft" className="flex items-center space-x-1 text-gray-300 hover:text-purple-400 transition">
              <Zap className="w-4 h-4" />
              <span>Create NFT</span>
            </Link>
          </nav>

          {/* Indexer Status */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <Activity className={`w-4 h-4 ${loading ? 'text-yellow-400 animate-pulse' : isHealthy ? 'text-green-400' : 'text-red-400'}`} />
            <span className="text-xs text-gray-300">
              {loading ? 'Checking...' : isHealthy ? 'Indexer Live' : 'Direct Mode'}
            </span>
          </div>

          {/* Connect Wallet Button */}
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
