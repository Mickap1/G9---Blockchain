import { ethers, run } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Script to deploy SimplePriceOracle
 * 
 * Usage:
 * npx hardhat run scripts/deploy-oracle.ts --network sepolia
 */

async function main() {
  console.log("\n🔮 Deploying SimplePriceOracle...\n");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // Deploy SimplePriceOracle
  console.log("📦 Deploying SimplePriceOracle...");
  
  const SimplePriceOracle = await ethers.getContractFactory("SimplePriceOracle");
  const oracle = await SimplePriceOracle.deploy();
  
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  
  console.log("✅ SimplePriceOracle deployed to:", oracleAddress);

  // Get network info
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;

  // Verify contract on Etherscan (if not local network)
  if (networkName !== "localhost" && networkName !== "hardhat") {
    console.log("\n⏳ Waiting 30 seconds before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    console.log("🔍 Verifying SimplePriceOracle on Etherscan...");
    try {
      await run("verify:verify", {
        address: oracleAddress,
        constructorArguments: [],
      });
      console.log("✅ SimplePriceOracle verified on Etherscan!");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("ℹ️  Contract already verified on Etherscan");
      } else {
        console.log("⚠️  Verification failed:", error.message);
        console.log("   You can verify manually later with:");
        console.log(`   npx hardhat verify --network ${networkName} ${oracleAddress}`);
      }
    }
  }

  // Save deployment address
  const deploymentsPath = path.join(__dirname, "..", "deployments", `${networkName}-addresses.json`);
  
  let addresses: any = {};
  if (fs.existsSync(deploymentsPath)) {
    addresses = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  }
  
  addresses.oracle = oracleAddress;
  
  if (!fs.existsSync(path.dirname(deploymentsPath))) {
    fs.mkdirSync(path.dirname(deploymentsPath), { recursive: true });
  }
  
  fs.writeFileSync(deploymentsPath, JSON.stringify(addresses, null, 2));
  console.log("💾 Deployment address saved to:", deploymentsPath);

  // Check roles (getting contract with ABI)
  const oracleContract = await ethers.getContractAt("SimplePriceOracle", oracleAddress);
  
  console.log("\n" + "=".repeat(60));
  console.log("🔐 ROLES CONFIGURATION");
  console.log("=".repeat(60));
  
  console.log("✅ Deployer has all roles (DEFAULT_ADMIN, ORACLE_ADMIN, PRICE_UPDATER)");
  console.log("   Deployer address:", deployer.address);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("✅ DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));
  console.log("\n📋 Contract Address:");
  console.log("   SimplePriceOracle:", oracleAddress);
  
  const explorerUrl = networkName === "sepolia" 
    ? "https://sepolia.etherscan.io"
    : networkName === "amoy"
    ? "https://amoy.polygonscan.com"
    : "http://localhost";
  
  console.log("\n🔗 View on Explorer:");
  console.log("   SimplePriceOracle:", `${explorerUrl}/address/${oracleAddress}`);
  console.log("   Read/Write Contract:", `${explorerUrl}/address/${oracleAddress}#code`);
  
  console.log("\n📖 Next steps:");
  console.log("   1. ✅ Oracle deployed and verified");
  console.log("   2. Set initial prices for your tokens");
  console.log("   3. Run auto-update-price.ts to start automatic updates");
  console.log("   4. (Optional) Grant PRICE_UPDATER_ROLE to other addresses");
  
  console.log("\n💡 Useful commands:");
  console.log("   - Set NFT price: npx hardhat run scripts/set-nft-price.ts --network", networkName);
  console.log("   - Start auto-update: npx hardhat run scripts/auto-update-price.ts --network", networkName);
  console.log("   - Check prices: npx hardhat run scripts/check-prices.ts --network", networkName);
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
