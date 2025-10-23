# Guide de débogage - Marketplace NFT

## Problème résolu : NFTs non trouvés

### Modifications apportées

1. **Amélioration de `loadMyNFTs()`** :
   - Récupération des données `assetData` depuis le contrat
   - Extraction de la valuation (prix d'estimation)
   - Augmentation de la plage de recherche (0-100 au lieu de 0-20)
   - Ajout de logs de debug

2. **Affichage amélioré** :
   - Liste des NFTs avec ID et valuation dans le sélecteur
   - Pré-remplissage automatique du prix avec la valuation
   - Message d'aide si aucun NFT n'est disponible
   - Affichage des IDs dans l'inventaire

3. **Bouton d'actualisation** :
   - Permet de recharger manuellement les NFTs
   - Utile après avoir minté un nouveau NFT

## Comment déboguer si les NFTs ne s'affichent toujours pas

### 1. Vérifier la console du navigateur

Ouvrez la console (F12) et regardez les logs :

```
My NFTs loaded: [...]
```

Si vous voyez `My NFTs loaded: []`, cela signifie qu'aucun NFT n'a été trouvé.

### 2. Vérifier que vous possédez des NFTs

Dans la console du navigateur, exécutez :

```javascript
// Vérifier l'adresse connectée
console.log('Mon adresse:', window.ethereum.selectedAddress);

// Vérifier le solde de NFTs
const publicClient = await window.viem.getPublicClient();
const balance = await publicClient.readContract({
  address: '0xf16b0641A9C56C6db30E052E90DB9358b6D2C946',
  abi: [...], // ABI du contrat NFT
  functionName: 'balanceOf',
  args: ['VOTRE_ADRESSE']
});
console.log('Balance NFT:', balance.toString());
```

### 3. Vérifier avec un script

Créez un script de test dans le dossier `scripts/` :

```typescript
// scripts/check-my-nfts.ts
import { ethers } from "hardhat";

async function main() {
  const [owner, account1] = await ethers.getSigners();
  
  // Adresse du contrat NFT
  const NFT_ADDRESS = "0xf16b0641A9C56C6db30E052E90DB9358b6D2C946";
  
  const NFTContract = await ethers.getContractAt("NFTAssetToken", NFT_ADDRESS);
  
  // Vérifier le solde
  const balance = await NFTContract.balanceOf(account1.address);
  console.log(`Balance de ${account1.address}: ${balance.toString()}`);
  
  // Parcourir les tokens pour trouver ceux qui appartiennent à account1
  for (let tokenId = 0; tokenId < 100; tokenId++) {
    try {
      const owner = await NFTContract.ownerOf(tokenId);
      if (owner.toLowerCase() === account1.address.toLowerCase()) {
        const assetData = await NFTContract.assetData(tokenId);
        console.log(`Token ${tokenId}:`, {
          name: assetData.name,
          valuation: ethers.formatEther(assetData.valuation),
          owner: owner
        });
      }
    } catch (e) {
      // Token n'existe pas
      break;
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

Exécutez avec :
```bash
npx hardhat run scripts/check-my-nfts.ts --network sepolia
```

### 4. Vérifier l'adresse du contrat NFT

Dans `frontend/app/marketplace/page.tsx`, vérifiez que l'adresse est correcte :

```typescript
const NFT_ADDRESS = '0xf16b0641A9C56C6db30E052E90DB9358b6D2C946' as `0x${string}`;
```

Comparez avec l'adresse dans `deployments/sepolia-nft-token.json`.

### 5. Vérifier que vous êtes sur le bon réseau

- Assurez-vous d'être connecté à Sepolia dans MetaMask
- Vérifiez que l'adresse du wallet est bien whitelistée (KYC)

### 6. Minter un NFT de test

Si vous n'avez aucun NFT, créez-en un :

```bash
npx hardhat run scripts/mint-diamond.ts --network sepolia
```

Puis cliquez sur le bouton "🔄 Actualiser" dans l'interface.

## Structure des données NFT

Chaque NFT dans `myNFTs` contient :

```typescript
{
  tokenId: number,        // ID du token
  name: string,          // Nom de l'asset
  imageUrl: string,      // URL de l'image
  description: string,   // Description
  valuation: string      // Valuation en ETH
}
```

## Fonctions principales

- `loadMyNFTs()` : Charge tous vos NFTs depuis la blockchain
- `handleNFTSelection()` : Sélectionne un NFT et pré-remplit le prix
- `loadNFTListings()` : Charge les NFTs en vente (pas les vôtres)

## Messages d'erreur courants

1. **"Aucun NFT disponible"** → Vous ne possédez aucun NFT
2. **"Token n'existe pas"** → Le token ID n'existe pas sur la blockchain
3. **"Could not fetch metadata"** → Problème de récupération des métadonnées IPFS

## Prochaines étapes

Pour un marketplace fonctionnel, il faudrait :

1. Déployer le contrat `Marketplace.sol`
2. Implémenter la fonction `handleListNFT()` pour appeler le contrat
3. Ajouter l'approbation du NFT au marketplace
4. Implémenter l'achat via le contrat marketplace

## Support

Si le problème persiste :
1. Vérifiez les logs de la console
2. Testez avec un script Hardhat
3. Vérifiez que vous avez bien minté des NFTs
