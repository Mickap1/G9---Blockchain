'use client';

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { contracts } from '@/lib/contracts';
import KYCRegistryABI from '@/lib/abis/KYCRegistry.json';

interface KYCRequest {
  address: string;
  status: number;
  approvalDate: bigint;
  expiryDate: bigint;
  dataURI: string;
}

interface KYCEvent {
  address: string;
  dataURI?: string;
  timestamp: string;
  blockNumber: bigint;
}

export default function AdminKYCPage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  const [pendingRequests, setPendingRequests] = useState<KYCEvent[]>([]);
  const [approvedAddresses, setApprovedAddresses] = useState<KYCRequest[]>([]);
  const [rejectedAddresses, setRejectedAddresses] = useState<KYCRequest[]>([]);
  const [blacklistedAddresses, setBlacklistedAddresses] = useState<KYCRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'blacklisted'>('pending');
  const [processing, setProcessing] = useState<string | null>(null);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!address || !publicClient) return;
      
      try {
        // Correct keccak256 hash of "KYC_ADMIN_ROLE"
        const KYC_ADMIN_ROLE = '0x811427a0fa4932aef534bba16bc34e9b7b2d7d2a79c475fca1765f6cc1faebea';
        const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
        
        // Check both KYC Admin and Default Admin roles
        const hasKYCRole = await publicClient.readContract({
          address: contracts.kycRegistry.address,
          abi: KYCRegistryABI,
          functionName: 'hasRole',
          args: [KYC_ADMIN_ROLE, address],
        }) as boolean;
        
        const hasDefaultRole = await publicClient.readContract({
          address: contracts.kycRegistry.address,
          abi: KYCRegistryABI,
          functionName: 'hasRole',
          args: [DEFAULT_ADMIN_ROLE, address],
        }) as boolean;
        
        console.log('Admin check for', address);
        console.log('Has KYC_ADMIN_ROLE:', hasKYCRole);
        console.log('Has DEFAULT_ADMIN_ROLE:', hasDefaultRole);
        
        setIsAdmin(hasKYCRole || hasDefaultRole);
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [address, publicClient]);

  // Load KYC events
  useEffect(() => {
    const loadKYCData = async () => {
      if (!publicClient) return;
      
      setIsLoading(true);
      try {
        // Use the new smart contract functions to get addresses by status
        console.log('Loading KYC data using new contract functions...');
        
        // Get statistics
        const stats = await publicClient.readContract({
          address: contracts.kycRegistry.address,
          abi: KYCRegistryABI,
          functionName: 'getStatistics',
          args: [],
        }) as any;
        
        console.log('Statistics:', {
          pending: Number(stats.pending),
          approved: Number(stats.approved),
          rejected: Number(stats.rejected),
          blacklisted: Number(stats.blacklisted),
          total: Number(stats.total)
        });

        // Get addresses by status using the new functions
        const pendingAddrs = await publicClient.readContract({
          address: contracts.kycRegistry.address,
          abi: KYCRegistryABI,
          functionName: 'getAllAddressesByStatus',
          args: [1], // Pending = 1
        }) as string[];

        const approvedAddrs = await publicClient.readContract({
          address: contracts.kycRegistry.address,
          abi: KYCRegistryABI,
          functionName: 'getAllAddressesByStatus',
          args: [2], // Approved = 2
        }) as string[];

        const rejectedAddrs = await publicClient.readContract({
          address: contracts.kycRegistry.address,
          abi: KYCRegistryABI,
          functionName: 'getAllAddressesByStatus',
          args: [3], // Rejected = 3
        }) as string[];

        const blacklistedAddrs = await publicClient.readContract({
          address: contracts.kycRegistry.address,
          abi: KYCRegistryABI,
          functionName: 'getAllAddressesByStatus',
          args: [4], // Blacklisted = 4
        }) as string[];

        console.log('Addresses loaded:', {
          pending: pendingAddrs.length,
          approved: approvedAddrs.length,
          rejected: rejectedAddrs.length,
          blacklisted: blacklistedAddrs.length
        });

        // Get batch KYC data for each category
        const pending: KYCEvent[] = [];
        const approved: KYCRequest[] = [];
        const rejected: KYCRequest[] = [];
        const blacklisted: KYCRequest[] = [];

        // Process pending addresses
        if (pendingAddrs.length > 0) {
          const pendingData = await publicClient.readContract({
            address: contracts.kycRegistry.address,
            abi: KYCRegistryABI,
            functionName: 'getBatchKYCData',
            args: [pendingAddrs],
          }) as any[];

          for (let i = 0; i < pendingAddrs.length; i++) {
            pending.push({
              address: pendingAddrs[i],
              dataURI: pendingData[i].dataURI,
              timestamp: new Date().toISOString(),
              blockNumber: BigInt(0)
            });
          }
        }

        // Process approved addresses
        if (approvedAddrs.length > 0) {
          const approvedData = await publicClient.readContract({
            address: contracts.kycRegistry.address,
            abi: KYCRegistryABI,
            functionName: 'getBatchKYCData',
            args: [approvedAddrs],
          }) as any[];

          for (let i = 0; i < approvedAddrs.length; i++) {
            approved.push({
              address: approvedAddrs[i],
              status: 2,
              approvalDate: approvedData[i].approvalDate,
              expiryDate: approvedData[i].expiryDate,
              dataURI: approvedData[i].dataURI,
            });
          }
        }

        // Process rejected addresses
        if (rejectedAddrs.length > 0) {
          const rejectedData = await publicClient.readContract({
            address: contracts.kycRegistry.address,
            abi: KYCRegistryABI,
            functionName: 'getBatchKYCData',
            args: [rejectedAddrs],
          }) as any[];

          for (let i = 0; i < rejectedAddrs.length; i++) {
            rejected.push({
              address: rejectedAddrs[i],
              status: 3,
              approvalDate: rejectedData[i].approvalDate,
              expiryDate: rejectedData[i].expiryDate,
              dataURI: rejectedData[i].dataURI,
            });
          }
        }

        // Process blacklisted addresses
        if (blacklistedAddrs.length > 0) {
          const blacklistedData = await publicClient.readContract({
            address: contracts.kycRegistry.address,
            abi: KYCRegistryABI,
            functionName: 'getBatchKYCData',
            args: [blacklistedAddrs],
          }) as any[];

          for (let i = 0; i < blacklistedAddrs.length; i++) {
            blacklisted.push({
              address: blacklistedAddrs[i],
              status: 4,
              approvalDate: blacklistedData[i].approvalDate,
              expiryDate: blacklistedData[i].expiryDate,
              dataURI: blacklistedData[i].dataURI,
            });
          }
        }

        setPendingRequests(pending);
        setApprovedAddresses(approved);
        setRejectedAddresses(rejected);
        setBlacklistedAddresses(blacklisted);
        
        console.log('KYC data loaded successfully');
      } catch (error) {
        console.error('Error loading KYC data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAdmin) {
      loadKYCData();
    }
  }, [publicClient, isAdmin]);

  const approveKYC = async (userAddress: string) => {
    if (!walletClient) return;
    
    setProcessing(userAddress);
    try {
      const expiryDate = BigInt(0); // No expiry
      const hash = await walletClient.writeContract({
        address: contracts.kycRegistry.address,
        abi: KYCRegistryABI,
        functionName: 'approveKYC',
        args: [userAddress, expiryDate],
      });

      alert(`KYC approuvé! Transaction: ${hash}`);
      
      // Reload data
      window.location.reload();
    } catch (error: any) {
      console.error('Error approving KYC:', error);
      alert(`Erreur: ${error.message || 'Échec de l\'approbation'}`);
    } finally {
      setProcessing(null);
    }
  };

  const rejectKYC = async (userAddress: string) => {
    if (!walletClient) return;
    
    const reason = prompt('Raison du rejet:');
    if (!reason) return;
    
    setProcessing(userAddress);
    try {
      const hash = await walletClient.writeContract({
        address: contracts.kycRegistry.address,
        abi: KYCRegistryABI,
        functionName: 'rejectKYC',
        args: [userAddress, reason],
      });

      alert(`KYC rejeté! Transaction: ${hash}`);
      
      // Reload data
      window.location.reload();
    } catch (error: any) {
      console.error('Error rejecting KYC:', error);
      alert(`Erreur: ${error.message || 'Échec du rejet'}`);
    } finally {
      setProcessing(null);
    }
  };

  const blacklistAddress = async (userAddress: string) => {
    if (!walletClient) return;
    
    const reason = prompt('Raison de la mise sur liste noire:');
    if (!reason) return;
    
    setProcessing(userAddress);
    try {
      const hash = await walletClient.writeContract({
        address: contracts.kycRegistry.address,
        abi: KYCRegistryABI,
        functionName: 'blacklistAddress',
        args: [userAddress, reason],
      });

      alert(`Adresse mise sur liste noire! Transaction: ${hash}`);
      
      // Reload data
      window.location.reload();
    } catch (error: any) {
      console.error('Error blacklisting address:', error);
      alert(`Erreur: ${error.message || 'Échec de la mise sur liste noire'}`);
    } finally {
      setProcessing(null);
    }
  };

  const revokeKYC = async (userAddress: string) => {
    if (!walletClient) return;
    
    const reason = prompt('Raison de la révocation:');
    if (!reason) return;
    
    setProcessing(userAddress);
    try {
      const hash = await walletClient.writeContract({
        address: contracts.kycRegistry.address,
        abi: KYCRegistryABI,
        functionName: 'revokeKYC',
        args: [userAddress, reason],
      });

      alert(`KYC révoqué! Transaction: ${hash}`);
      
      // Reload data
      window.location.reload();
    } catch (error: any) {
      console.error('Error revoking KYC:', error);
      alert(`Erreur: ${error.message || 'Échec de la révocation'}`);
    } finally {
      setProcessing(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Administration KYC</h1>
            <p className="text-gray-600">Veuillez connecter votre portefeuille admin.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Administration KYC</h1>
            <p className="text-red-600">❌ Vous n'avez pas les droits d'administrateur KYC.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Administration KYC</h1>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-yellow-800 font-semibold">En attente</h3>
              <p className="text-3xl font-bold text-yellow-900">{pendingRequests.length}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-green-800 font-semibold">Approuvés</h3>
              <p className="text-3xl font-bold text-green-900">{approvedAddresses.length}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-red-800 font-semibold">Rejetés</h3>
              <p className="text-3xl font-bold text-red-900">{rejectedAddresses.length}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-gray-800 font-semibold">Liste noire</h3>
              <p className="text-3xl font-bold text-gray-900">{blacklistedAddresses.length}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {['pending', 'approved', 'rejected', 'blacklisted'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'pending' && '⏳ En attente'}
                  {tab === 'approved' && '✅ Approuvés'}
                  {tab === 'rejected' && '❌ Rejetés'}
                  {tab === 'blacklisted' && '🚫 Liste noire'}
                </button>
              ))}
            </nav>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Chargement des données KYC...</p>
            </div>
          ) : (
            <>
              {/* Pending Requests */}
              {activeTab === 'pending' && (
                <div className="space-y-4">
                  {pendingRequests.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">Aucune demande en attente</p>
                  ) : (
                    pendingRequests.map((request, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6 bg-yellow-50">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-mono text-sm text-gray-900 mb-2">{request.address}</p>
                            <p className="text-sm text-gray-600">URI: {request.dataURI || 'N/A'}</p>
                          </div>
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                            En attente
                          </span>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => approveKYC(request.address)}
                            disabled={processing === request.address}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                          >
                            {processing === request.address ? 'En cours...' : '✓ Approuver'}
                          </button>
                          <button
                            onClick={() => rejectKYC(request.address)}
                            disabled={processing === request.address}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                          >
                            ✗ Rejeter
                          </button>
                          <button
                            onClick={() => blacklistAddress(request.address)}
                            disabled={processing === request.address}
                            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:bg-gray-400"
                          >
                            🚫 Liste noire
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Approved Addresses */}
              {activeTab === 'approved' && (
                <div className="space-y-4">
                  {approvedAddresses.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">Aucune adresse approuvée</p>
                  ) : (
                    approvedAddresses.map((request, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6 bg-green-50">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-mono text-sm text-gray-900 mb-2">{request.address}</p>
                            <p className="text-sm text-gray-600">
                              Approuvé le: {request.approvalDate > BigInt(0)
                                ? new Date(Number(request.approvalDate) * 1000).toLocaleDateString('fr-FR')
                                : 'N/A'}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            Approuvé
                          </span>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => revokeKYC(request.address)}
                            disabled={processing === request.address}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400"
                          >
                            {processing === request.address ? 'En cours...' : '⚠ Révoquer'}
                          </button>
                          <button
                            onClick={() => blacklistAddress(request.address)}
                            disabled={processing === request.address}
                            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:bg-gray-400"
                          >
                            🚫 Liste noire
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Rejected Addresses */}
              {activeTab === 'rejected' && (
                <div className="space-y-4">
                  {rejectedAddresses.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">Aucune adresse rejetée</p>
                  ) : (
                    rejectedAddresses.map((request, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6 bg-red-50">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-mono text-sm text-gray-900 mb-2">{request.address}</p>
                            <p className="text-sm text-gray-600">URI: {request.dataURI || 'N/A'}</p>
                          </div>
                          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                            Rejeté
                          </span>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => approveKYC(request.address)}
                            disabled={processing === request.address}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                          >
                            {processing === request.address ? 'En cours...' : '✓ Approuver'}
                          </button>
                          <button
                            onClick={() => blacklistAddress(request.address)}
                            disabled={processing === request.address}
                            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:bg-gray-400"
                          >
                            🚫 Liste noire
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Blacklisted Addresses */}
              {activeTab === 'blacklisted' && (
                <div className="space-y-4">
                  {blacklistedAddresses.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">Aucune adresse sur liste noire</p>
                  ) : (
                    blacklistedAddresses.map((request, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-mono text-sm text-gray-900">{request.address}</p>
                          </div>
                          <span className="px-3 py-1 bg-gray-200 text-gray-900 rounded-full text-sm font-medium">
                            Liste noire
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
