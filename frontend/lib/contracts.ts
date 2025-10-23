export const contracts = {
  kycRegistry: {
    address: (process.env.NEXT_PUBLIC_KYC_REGISTRY_ADDRESS || '') as `0x${string}`,
  },
  fungibleToken: {
    address: (process.env.NEXT_PUBLIC_FUNGIBLE_TOKEN_ADDRESS || '') as `0x${string}`,
  },
  nftToken: {
    address: (process.env.NEXT_PUBLIC_NFT_TOKEN_ADDRESS || '') as `0x${string}`,
  },
  dex: {
    address: (process.env.NEXT_PUBLIC_DEX_ADDRESS || '') as `0x${string}`,
  },
  oracle: {
    address: (process.env.NEXT_PUBLIC_ORACLE_ADDRESS || '') as `0x${string}`,
  },
} as const;

// Admin address (à mettre à jour avec ton adresse)
export const ADMIN_ADDRESS = '' as `0x${string}`;
