import { ethers } from "hardhat";

/**
 * Script rapide pour vérifier les NFTs d'une adresse
 * Usage: npx hardhat run scripts/quick-check-nfts.ts --network sepolia
 */

async function main() {
  // Adresse du contrat NFT déployé
  const NFT_ADDRESS = "0xfD543B8E77B49b959fB6612c0A4EB58a3877Aa0c";
  
  // Récupérer les signers
  const [owner, account1, account2] = await ethers.getSigners();
  
  console.log("\n🔍 Checking NFT ownership...\n");
  console.log("NFT Contract:", NFT_ADDRESS);
  console.log("\nAccounts:");
  console.log("- Owner:", owner.address);
  console.log("- Account1:", account1.address);
  console.log("- Account2:", account2.address);
  console.log("\n" + "=".repeat(80) + "\n");

  // Connecter au contrat
  const NFTContract = await ethers.getContractAt("NFTAssetToken", NFT_ADDRESS);

  // Vérifier pour chaque compte
  const accounts = [
    { name: "Owner", addr: owner.address },
    { name: "Account1", addr: account1.address },
    { name: "Account2", addr: account2.address }
  ];

  for (const account of accounts) {
    try {
      const balance = await NFTContract.balanceOf(account.addr);
      console.log(`\n👤 ${account.name} (${account.addr})`);
      console.log(`   Balance: ${balance.toString()} NFT(s)`);
      
      if (balance > 0n) {
        // Trouver les tokens
        for (let tokenId = 0; tokenId < 100; tokenId++) {
          try {
            const tokenOwner = await NFTContract.ownerOf(tokenId);
            if (tokenOwner.toLowerCase() === account.addr.toLowerCase()) {
              const assetData = await NFTContract.assetData(tokenId);
              console.log(`\n   🎨 Token #${tokenId}:`);
              console.log(`      Name: ${assetData.name}`);
              console.log(`      Valuation: ${ethers.formatEther(assetData.valuation)} ETH`);
              console.log(`      Active: ${assetData.isActive}`);
              console.log(`      Cert URI: ${assetData.certificateURI}`);
            }
          } catch (e) {
            // Token n'existe pas
          }
        }
      }
    } catch (error: any) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  console.log("\n" + "=".repeat(80) + "\n");
  console.log("✅ Check complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
