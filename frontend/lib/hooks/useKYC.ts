import { useState, useEffect } from 'react';
import { usePublicClient, useWalletClient } from 'wagmi';
import { contracts } from '@/lib/contracts';
import KYCRegistryABI from '@/lib/abis/KYCRegistry.json';

export interface KYCData {
  status: number;
  approvalDate: bigint;
  expiryDate: bigint;
  dataURI: string;
}

export const useKYC = (address?: `0x${string}`) => {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  const [kycStatus, setKycStatus] = useState<number>(0);
  const [kycData, setKycData] = useState<KYCData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [isBlacklisted, setIsBlacklisted] = useState(false);

  // Load KYC data
  useEffect(() => {
    const loadKYCData = async () => {
      if (!address || !publicClient) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Get KYC status
        const status = await publicClient.readContract({
          address: contracts.kycRegistry.address,
          abi: KYCRegistryABI,
          functionName: 'getKYCStatus',
          args: [address],
        }) as number;

        // Get full KYC data
        const data = await publicClient.readContract({
          address: contracts.kycRegistry.address,
          abi: KYCRegistryABI,
          functionName: 'getKYCData',
          args: [address],
        }) as any;

        // Check whitelist status
        const whitelisted = await publicClient.readContract({
          address: contracts.kycRegistry.address,
          abi: KYCRegistryABI,
          functionName: 'isWhitelisted',
          args: [address],
        }) as boolean;

        // Check blacklist status
        const blacklisted = await publicClient.readContract({
          address: contracts.kycRegistry.address,
          abi: KYCRegistryABI,
          functionName: 'isBlacklisted',
          args: [address],
        }) as boolean;

        setKycStatus(status);
        setKycData({
          status: Number(data.status),
          approvalDate: data.approvalDate,
          expiryDate: data.expiryDate,
          dataURI: data.dataURI,
        });
        setIsWhitelisted(whitelisted);
        setIsBlacklisted(blacklisted);
      } catch (error) {
        console.error('Error loading KYC data:', error);
        setKycStatus(0);
        setKycData(null);
        setIsWhitelisted(false);
        setIsBlacklisted(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadKYCData();
  }, [address, publicClient]);

  // Submit KYC
  const submitKYC = async (dataURI: string) => {
    if (!walletClient) {
      throw new Error('Wallet not connected');
    }

    try {
      const hash = await walletClient.writeContract({
        address: contracts.kycRegistry.address,
        abi: KYCRegistryABI,
        functionName: 'submitKYC',
        args: [dataURI],
      });

      // Wait for transaction
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      // Reload data
      if (address && publicClient) {
        const status = await publicClient.readContract({
          address: contracts.kycRegistry.address,
          abi: KYCRegistryABI,
          functionName: 'getKYCStatus',
          args: [address],
        }) as number;

        const data = await publicClient.readContract({
          address: contracts.kycRegistry.address,
          abi: KYCRegistryABI,
          functionName: 'getKYCData',
          args: [address],
        }) as any;

        setKycStatus(status);
        setKycData({
          status: Number(data.status),
          approvalDate: data.approvalDate,
          expiryDate: data.expiryDate,
          dataURI: data.dataURI,
        });
      }

      return hash;
    } catch (error) {
      console.error('Error submitting KYC:', error);
      throw error;
    }
  };

  // Get status display text
  const getStatusText = () => {
    const statuses = ['Aucun', 'En attente', 'Approuvé', 'Rejeté', 'Liste noire'];
    return statuses[kycStatus] || 'Inconnu';
  };

  return {
    kycStatus,
    kycData,
    isWhitelisted,
    isBlacklisted,
    isLoading,
    submitKYC,
    getStatusText,
  };
};
