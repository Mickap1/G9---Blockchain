/**
 * Script Node.js simple pour vérifier les NFTs
 * Usage: node scripts/check-nft-simple.js
 */

const NFT_ADDRESS = "0xfD543B8E77B49b959fB6612c0A4EB58a3877Aa0c";
const ACCOUNT_TO_CHECK = "0x41B6b59a9365a58B00a68c597c49dB5Fa8C72116"; // Remplacez par votre adresse

console.log("\n🔍 Checking NFTs for account:", ACCOUNT_TO_CHECK);
console.log("NFT Contract:", NFT_ADDRESS);
console.log("\n📋 Go to Etherscan to verify:");
console.log(`https://sepolia.etherscan.io/address/${ACCOUNT_TO_CHECK}#tokentxnsErc721\n`);
console.log("🌐 Or check the contract directly:");
console.log(`https://sepolia.etherscan.io/address/${NFT_ADDRESS}#readContract\n`);
console.log("Then use 'balanceOf' function with your address to see how many NFTs you own.\n");
