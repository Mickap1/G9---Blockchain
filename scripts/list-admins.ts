import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("📋 Listing KYC Admins...\n");

  // Get deployed KYCRegistry address
  const KYC_REGISTRY_ADDRESS = "0x8E4312166Ed927C331B5950e5B8ac636841f06Eb";
  
  // Get contract instance
  const kycRegistry = await ethers.getContractAt("KYCRegistry", KYC_REGISTRY_ADDRESS);

  // Get KYC Admin Role
  const KYC_ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("KYC_ADMIN_ROLE"));
  const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;

  console.log("Contract Address:", KYC_REGISTRY_ADDRESS);
  console.log("KYC_ADMIN_ROLE:", KYC_ADMIN_ROLE);
  console.log("DEFAULT_ADMIN_ROLE:", DEFAULT_ADMIN_ROLE);
  console.log("\n");

  // Get signers
  const signers = await ethers.getSigners();
  const deployer = signers[0];

  console.log("Checking for deployer:", deployer.address);

  // Check if deployer has KYC Admin role
  const hasKYCAdminRole = await kycRegistry.hasRole(KYC_ADMIN_ROLE, deployer.address);
  const hasDefaultAdminRole = await kycRegistry.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);

  console.log(`\n✅ Deployer ${deployer.address}:`);
  console.log(`   - Has KYC_ADMIN_ROLE: ${hasKYCAdminRole}`);
  console.log(`   - Has DEFAULT_ADMIN_ROLE: ${hasDefaultAdminRole}`);

  // Check other accounts if any
  for (let i = 1; i < Math.min(signers.length, 5); i++) {
    const hasKYC = await kycRegistry.hasRole(KYC_ADMIN_ROLE, signers[i].address);
    const hasDefault = await kycRegistry.hasRole(DEFAULT_ADMIN_ROLE, signers[i].address);
    
    if (hasKYC || hasDefault) {
      console.log(`\n✅ Account ${i} ${signers[i].address}:`);
      console.log(`   - Has KYC_ADMIN_ROLE: ${hasKYC}`);
      console.log(`   - Has DEFAULT_ADMIN_ROLE: ${hasDefault}`);
    }
  }

  console.log("\n✨ Done!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
