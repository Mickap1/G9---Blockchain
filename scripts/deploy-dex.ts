import { ethers, run } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Script to deploy SimpleDEX and add initial liquidity
 * 
 * Prerequisites:
 * 1. KYCRegistry must be deployed
 * 2. FungibleAssetToken must be deployed
 * 3. Deployer must be whitelisted in KYC
 * 4. Deployer must have tokens to add liquidity
 * 
 * Usage:
 * npx hardhat run scripts/deploy-dex.ts --network sepolia
 */

interface DeploymentAddresses {
  kycRegistry?: string;
  fungibleToken?: string;
  token?: string;  // Fallback for older deployments
  dex?: string;
}

async function main() {
  console.log("\n🚀 Starting SimpleDEX Deployment...\n");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // Load existing deployments
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;
  const deploymentsPath = path.join(__dirname, "..", "deployments", `${networkName}-addresses.json`);
  
  let addresses: DeploymentAddresses = {};
  
  if (fs.existsSync(deploymentsPath)) {
    addresses = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
    console.log("✅ Loaded existing deployments:");
    console.log("   KYC Registry:", addresses.kycRegistry || "NOT FOUND");
    console.log("   Fungible Token:", addresses.fungibleToken || addresses.token || "NOT FOUND");
  } else {
    console.log("⚠️  No existing deployments found. Please deploy KYC and Token first!");
    process.exit(1);
  }

  // Verify required contracts are deployed
  const fungibleToken = addresses.fungibleToken || addresses.token;
  if (!addresses.kycRegistry || !fungibleToken) {
    console.log("\n❌ Error: KYCRegistry and FungibleAssetToken must be deployed first!");
    console.log("   Run: npx hardhat run scripts/deploy-all.ts --network", networkName);
    process.exit(1);
  }

  // Deploy SimpleDEX
  console.log("\n📦 Deploying SimpleDEX...");
  
  const SimpleDEX = await ethers.getContractFactory("SimpleDEX");
  const dex = await SimpleDEX.deploy(
    fungibleToken,
    addresses.kycRegistry
  );
  
  await dex.waitForDeployment();
  const dexAddress = await dex.getAddress();
  
  console.log("✅ SimpleDEX deployed to:", dexAddress);

  // Verify contract on Etherscan (if not local network)
  if (networkName !== "localhost" && networkName !== "hardhat") {
    console.log("\n⏳ Waiting 30 seconds before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    console.log("🔍 Verifying SimpleDEX on Etherscan...");
    try {
      await run("verify:verify", {
        address: dexAddress,
        constructorArguments: [fungibleToken, addresses.kycRegistry],
      });
      console.log("✅ SimpleDEX verified on Etherscan!");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("ℹ️  Contract already verified on Etherscan");
      } else {
        console.log("⚠️  Verification failed:", error.message);
        console.log("   You can verify manually later with:");
        console.log(`   npx hardhat verify --network ${networkName} ${dexAddress} ${fungibleToken} ${addresses.kycRegistry}`);
      }
    }
  }

  // Save deployment address
  addresses.dex = dexAddress;
  
  if (!fs.existsSync(path.dirname(deploymentsPath))) {
    fs.mkdirSync(path.dirname(deploymentsPath), { recursive: true });
  }
  
  fs.writeFileSync(
    deploymentsPath,
    JSON.stringify(addresses, null, 2)
  );
  
  console.log("💾 Deployment addresses saved to:", deploymentsPath);

  // Add initial liquidity (optional but recommended)
  console.log("\n💧 Adding initial liquidity...");
  
  const token = await ethers.getContractAt("FungibleAssetToken", fungibleToken);
  const kycRegistry = await ethers.getContractAt("KYCRegistry", addresses.kycRegistry);
  
  // Check if deployer is whitelisted
  const isWhitelisted = await kycRegistry.isWhitelisted(deployer.address);
  
  if (!isWhitelisted) {
    console.log("⚠️  Deployer is not whitelisted. Skipping liquidity addition.");
    console.log("   Please whitelist the deployer and run: npx hardhat run scripts/add-liquidity.ts");
  } else {
    // Mint tokens to deployer if they don't have enough
    const deployerBalance = await token.balanceOf(deployer.address);
    const liquidityTokenAmount = ethers.parseEther("1000"); // 1000 tokens
    const liquidityETHAmount = ethers.parseEther("0.1");     // 0.1 ETH
    
    console.log("   Current token balance:", ethers.formatEther(deployerBalance));
    
    if (deployerBalance < liquidityTokenAmount) {
      console.log("   Minting additional tokens...");
      const mintTx = await token.mint(deployer.address, liquidityTokenAmount - deployerBalance);
      await mintTx.wait();
      console.log("   ✅ Tokens minted");
    }
    
    // Approve DEX to spend tokens
    console.log("   Approving DEX to spend tokens...");
    const approveTx = await token.approve(dexAddress, liquidityTokenAmount);
    await approveTx.wait();
    console.log("   ✅ Approval granted");
    
    // Add liquidity
    console.log("   Adding liquidity:");
    console.log("     - Tokens:", ethers.formatEther(liquidityTokenAmount));
    console.log("     - ETH:", ethers.formatEther(liquidityETHAmount));
    
    const addLiquidityTx = await dex.addLiquidity(liquidityTokenAmount, {
      value: liquidityETHAmount
    });
    
    const receipt = await addLiquidityTx.wait();
    console.log("   ✅ Liquidity added!");
    console.log("   Transaction hash:", receipt?.hash);
    
    // Display pool info
    const poolInfo = await dex.getPoolInfo();
    console.log("\n📊 Pool Information:");
    console.log("   Token Reserve:", ethers.formatEther(poolInfo._reserveToken));
    console.log("   ETH Reserve:", ethers.formatEther(poolInfo._reserveETH));
    console.log("   Total Liquidity:", ethers.formatEther(poolInfo._totalLiquidity));
    console.log("   Token Price:", ethers.formatEther(poolInfo._tokenPrice), "ETH per token");
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("✅ DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));
  console.log("\n📋 Contract Addresses:");
  console.log("   SimpleDEX:", dexAddress);
  console.log("   FungibleAssetToken:", fungibleToken);
  console.log("   KYCRegistry:", addresses.kycRegistry);
  
  const explorerUrl = networkName === "sepolia" 
    ? "https://sepolia.etherscan.io"
    : networkName === "amoy"
    ? "https://amoy.polygonscan.com"
    : "http://localhost";
  
  console.log("\n🔗 View on Explorer:");
  console.log("   SimpleDEX:", `${explorerUrl}/address/${dexAddress}`);
  console.log("   Read/Write Contract:", `${explorerUrl}/address/${dexAddress}#code`);
  
  console.log("\n📖 Next steps:");
  console.log("   1. ✅ Contract verified - Read/Write tabs available on Etherscan");
  console.log("   2. Test swapping tokens on the DEX");
  console.log("   3. Add more liquidity if needed");
  console.log("   4. Build frontend integration");
  
  console.log("\n💡 Useful commands:");
  console.log("   - Test swap: npx hardhat run scripts/test-swap.ts --network", networkName);
  console.log("   - Add liquidity: npx hardhat run scripts/add-liquidity.ts --network", networkName);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
