import { ethers } from "hardhat";
import * as fs from 'fs';

/**
 * Script pour vérifier les informations de l'actif sous-jacent
 * Affiche toutes les métadonnées de l'immeuble tokenisé
 */
async function main() {
  console.log("\n🏢 VÉRIFICATION DES INFORMATIONS DE L'ACTIF");
  console.log("═".repeat(70));

  // Charger l'adresse du contrat depuis sepolia-addresses.json
  const addressesPath = "./deployments/sepolia-addresses.json";
  if (!fs.existsSync(addressesPath)) {
    throw new Error("Addresses file not found.");
  }

  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  const tokenAddress = addresses.fungibleToken;

  console.log("\n📍 Adresse du contrat:", tokenAddress);
  console.log("━".repeat(70));

  // Obtenir le contrat
  const token = await ethers.getContractAt("FungibleAssetToken", tokenAddress);

  // Récupérer les informations de base
  const [name, symbol, decimals, maxSupply] = await Promise.all([
    token.name(),
    token.symbol(),
    token.decimals(),
    token.MAX_SUPPLY()
  ]);

  console.log("\n📊 INFORMATIONS DU TOKEN");
  console.log("━".repeat(70));
  console.log("Nom:              ", name);
  console.log("Symbole:          ", symbol);
  console.log("Décimales:        ", decimals);
  console.log("Supply Maximum:   ", ethers.formatUnits(maxSupply, decimals), symbol);

  // Récupérer les métadonnées de l'actif
  const metadata = await token.assetMetadata();
  
  console.log("\n🏢 MÉTADONNÉES DE L'ACTIF");
  console.log("━".repeat(70));
  console.log("Nom de l'actif:   ", metadata.assetName);
  console.log("Type d'actif:     ", metadata.assetType);
  console.log("Localisation:     ", metadata.location);
  console.log("Valeur totale:    ", metadata.totalValue.toString(), "EUR");
  console.log("URI des documents:", metadata.documentURI);
  console.log("Date de tokenisation:", new Date(Number(metadata.tokenizationDate) * 1000).toLocaleString('fr-FR'));

  // Calculer la valeur par token
  const totalValueEUR = Number(metadata.totalValue);
  const totalSupply = Number(ethers.formatUnits(maxSupply, decimals));
  const valuePerToken = totalValueEUR / totalSupply;

  console.log("\n💰 CALCULS DE VALEUR");
  console.log("━".repeat(70));
  console.log("Valeur totale de l'actif:     ", totalValueEUR.toLocaleString('fr-FR'), "EUR");
  console.log("Nombre total de tokens:       ", totalSupply.toLocaleString('fr-FR'));
  console.log("Valeur par token:             ", valuePerToken.toFixed(2), "EUR");

  // Exemple : Si quelqu'un possède 10% des tokens
  const examplePercent = 10;
  const exampleTokens = (totalSupply * examplePercent) / 100;
  const exampleValue = (totalValueEUR * examplePercent) / 100;

  console.log("\n📈 EXEMPLE DE PROPRIÉTÉ");
  console.log("━".repeat(70));
  console.log("Si vous possédez:             ", examplePercent, "% des tokens");
  console.log("Cela représente:              ", exampleTokens.toLocaleString('fr-FR'), symbol);
  console.log("Valeur équivalente:           ", exampleValue.toLocaleString('fr-FR'), "EUR");
  console.log("C'est comme posséder:         ", examplePercent, "% de l'immeuble");

  // Vérifier votre balance actuelle
  const [signer] = await ethers.getSigners();
  const yourBalance = await token.balanceOf(signer.address);
  const yourBalanceFormatted = Number(ethers.formatUnits(yourBalance, decimals));
  const yourPercent = (yourBalanceFormatted / totalSupply) * 100;
  const yourValue = (totalValueEUR * yourPercent) / 100;

  console.log("\n👤 VOTRE PARTICIPATION ACTUELLE");
  console.log("━".repeat(70));
  console.log("Votre adresse:                ", signer.address);
  console.log("Vos tokens:                   ", yourBalanceFormatted.toLocaleString('fr-FR'), symbol);
  console.log("Votre part:                   ", yourPercent.toFixed(4), "%");
  console.log("Valeur de vos tokens:         ", yourValue.toLocaleString('fr-FR'), "EUR");
  console.log("Équivalent immobilier:        Vous possédez", yourPercent.toFixed(4), "% de l'immeuble");

  console.log("\n✅ Vérification terminée!");
  console.log("═".repeat(70));
  console.log("\n💡 EXPLICATIONS:");
  console.log("━".repeat(70));
  console.log("• Chaque token représente une fraction de propriété de l'actif");
  console.log("• Si vous avez 10% des tokens, c'est comme avoir 10% de l'immeuble");
  console.log("• La valeur de vos tokens dépend de la valeur totale de l'actif");
  console.log("• Vous pouvez vendre vos tokens sur le DEX ou le Marketplace");
  console.log("• Les revenus futurs (loyers, etc.) pourraient être distribués proportionnellement");
  console.log("═".repeat(70));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
