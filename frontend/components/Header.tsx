'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet, Home, FileText, Coins, Zap, LayoutDashboard, Store, ArrowLeftRight, Database } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-blue-600">
            <Wallet className="w-6 h-6" />
            <span>RWA Marketplace</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <Link href="/dashboard" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link href="/marketplace" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition">
              <Store className="w-4 h-4" />
              <span>Marketplace</span>
            </Link>
            <Link href="/dex" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition">
              <ArrowLeftRight className="w-4 h-4" />
              <span>DEX</span>
            </Link>
            <Link href="/oracle" className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 transition">
              <Database className="w-4 h-4" />
              <span>Oracle</span>
            </Link>
            <Link href="/kyc" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition">
              <FileText className="w-4 h-4" />
              <span>KYC</span>
            </Link>
            <Link href="/mint/tokens" className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition">
              <Coins className="w-4 h-4" />
              <span>Mint Tokens</span>
            </Link>
            <Link href="/create/nft" className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 transition">
              <Zap className="w-4 h-4" />
              <span>Create NFT</span>
            </Link>
          </nav>

          {/* Connect Wallet Button */}
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
