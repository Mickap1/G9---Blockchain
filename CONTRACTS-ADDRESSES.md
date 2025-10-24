# 🔗 Adresses des Smart Contracts

## Réseau : Sepolia Testnet
**Chain ID :** 11155111  
**Deployer :** `0x41B6b59a9365a58B00a68c597c49dB5Fa8C72116`

---

## 📋 Contrats Déployés

### 🔐 KYC & Compliance
| Contrat | Adresse | Etherscan |
|---------|---------|-----------|
| **KYCRegistry** | `0x563E31793214F193EB7993a2bfAd2957a70C7D65` | [🔍 Voir](https://sepolia.etherscan.io/address/0x563E31793214F193EB7993a2bfAd2957a70C7D65) |

### 🪙 Tokens
| Contrat | Symbole | Adresse | Etherscan |
|---------|---------|---------|-----------|
| **FungibleAssetToken** | RWAT | `0xfA451d9C32d15a637Ab376732303c36C34C9979f` | [🔍 Voir](https://sepolia.etherscan.io/address/0xfA451d9C32d15a637Ab376732303c36C34C9979f) |
| **NFTAssetTokenV2** | RWAV2 | `0xf16b0641A9C56C6db30E052E90DB9358b6D2C946` | [🔍 Voir](https://sepolia.etherscan.io/address/0xf16b0641A9C56C6db30E052E90DB9358b6D2C946) |

### 💱 Trading
| Contrat | Adresse | Etherscan |
|---------|---------|-----------|
| **SimpleDEX** | `0x2Cf848B370C0Ce0255C4743d70648b096D3fAa98` | [🔍 Voir](https://sepolia.etherscan.io/address/0x2Cf848B370C0Ce0255C4743d70648b096D3fAa98) |
| **Marketplace** | `0x9F057E253D69f6d362C63A3DB0bdff66eE8013dd` | [🔍 Voir](https://sepolia.etherscan.io/address/0x9F057E253D69f6d362C63A3DB0bdff66eE8013dd) |

### 📊 Oracles
| Contrat | Adresse | Etherscan |
|---------|---------|-----------|
| **SimplePriceOracle** | `0x602571F05745181fF237b81dAb8F67148e9475C7` | [🔍 Voir](https://sepolia.etherscan.io/address/0x602571F05745181fF237b81dAb8F67148e9475C7) |

---

## 🔧 Configuration Variables d'Environnement

Pour le frontend (`frontend/.env.local`) :
```env
NEXT_PUBLIC_KYC_REGISTRY_ADDRESS=0x563E31793214F193EB7993a2bfAd2957a70C7D65
NEXT_PUBLIC_FUNGIBLE_TOKEN_ADDRESS=0xfA451d9C32d15a637Ab376732303c36C34C9979f
NEXT_PUBLIC_NFT_TOKEN_ADDRESS=0xf16b0641A9C56C6db30E052E90DB9358b6D2C946
NEXT_PUBLIC_DEX_ADDRESS=0x2Cf848B370C0Ce0255C4743d70648b096D3fAa98
NEXT_PUBLIC_ORACLE_ADDRESS=0x602571F05745181fF237b81dAb8F67148e9475C7
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x9F057E253D69f6d362C63A3DB0bdff66eE8013dd
NEXT_PUBLIC_CHAIN_ID=11155111
```

Pour l'indexer (`src/config/contracts.ts`) :
```typescript
export const CONTRACTS = {
  KYC_REGISTRY: '0x563E31793214F193EB7993a2bfAd2957a70C7D65',
  FUNGIBLE_TOKEN: '0xfA451d9C32d15a637Ab376732303c36C34C9979f',
  NFT_TOKEN: '0xf16b0641A9C56C6db30E052E90DB9358b6D2C946',
  DEX: '0x2Cf848B370C0Ce0255C4743d70648b096D3fAa98',
  ORACLE: '0x602571F05745181fF237b81dAb8F67148e9475C7',
  MARKETPLACE: '0x9F057E253D69f6d362C63A3DB0bdff66eE8013dd',
} as const;
```

---

## 📊 Statistiques

| Métrique | Valeur |
|----------|--------|
| **Nombre de contrats** | 6 |
| **Total lignes de code** | ~2,070 |
| **Total fonctions** | 103+ |
| **Tests unitaires** | 212 |
| **Statut** | ✅ Tous vérifiés sur Etherscan |

---

## 🔄 Interactions entre Contrats

```
KYCRegistry (Gate)
    ↓
    ├─→ FungibleAssetToken (vérifie KYC avant transfer)
    ├─→ NFTAssetTokenV2 (vérifie KYC avant transfer)
    ├─→ SimpleDEX (vérifie KYC avant trade)
    └─→ Marketplace (vérifie KYC avant buy/sell)

SimplePriceOracle
    ↓
    └─→ SimpleDEX (obtient les prix)
```

---

## 🌐 Liens Utiles

- **Sepolia Faucet :** [sepoliafaucet.com](https://sepoliafaucet.com/)
- **Sepolia Explorer :** [sepolia.etherscan.io](https://sepolia.etherscan.io/)
- **Alchemy Sepolia RPC :** `https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`

---

## 📝 Notes Importantes

1. **NFTAssetToken.sol** (V1) existe dans le repo mais n'est plus déployé
2. **NFTAssetTokenV2.sol** est la version production avec optimisations gas
3. Tous les contrats utilisent OpenZeppelin 5.0.0
4. Tous les contrats sont pausables en cas d'urgence
5. Le système KYC protège tous les transferts et trades

---

**Dernière mise à jour :** Octobre 2025  
**Réseau :** Sepolia Testnet  
**Statut :** ✅ Production Ready
