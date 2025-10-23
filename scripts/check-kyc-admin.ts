import hre from "hardhat";

async function main() {
  console.log("🔍 Checking KYC Admin Roles...\n");

  const KYC_REGISTRY_ADDRESS = "0x8E4312166Ed927C331B5950e5B8ac636841f06Eb";
  const DEPLOYER_ADDRESS = "0x41B6b59a9365a58B00a68c597c49dB5Fa8C72116";
  
  console.log("Contract Address:", KYC_REGISTRY_ADDRESS);
  console.log("Checking address:", DEPLOYER_ADDRESS);
  console.log("");

  // Get contract instance using ethers v6 syntax
  const KYCRegistry = await hre.ethers.getContractAt("KYCRegistry", KYC_REGISTRY_ADDRESS);

  // Calculate role hashes
  const KYC_ADMIN_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("KYC_ADMIN_ROLE"));
  const DEFAULT_ADMIN_ROLE = hre.ethers.ZeroHash;

  console.log("KYC_ADMIN_ROLE hash:", KYC_ADMIN_ROLE);
  console.log("DEFAULT_ADMIN_ROLE hash:", DEFAULT_ADMIN_ROLE);
  console.log("");

  try {
    // Check roles
    const hasKYCAdminRole = await KYCRegistry.hasRole(KYC_ADMIN_ROLE, DEPLOYER_ADDRESS);
    const hasDefaultAdminRole = await KYCRegistry.hasRole(DEFAULT_ADMIN_ROLE, DEPLOYER_ADDRESS);

    console.log("Results:");
    console.log("--------");
    console.log(`Has KYC_ADMIN_ROLE: ${hasKYCAdminRole ? '✅ YES' : '❌ NO'}`);
    console.log(`Has DEFAULT_ADMIN_ROLE: ${hasDefaultAdminRole ? '✅ YES' : '❌ NO'}`);
    console.log("");

    if (!hasKYCAdminRole && !hasDefaultAdminRole) {
      console.log("⚠️  WARNING: Address has NO admin roles!");
      console.log("You need to grant the role using:");
      console.log(`   await kycRegistry.grantRole(KYC_ADMIN_ROLE, "${DEPLOYER_ADDRESS}")`);
    } else {
      console.log("✅ Success! Address has admin privileges.");
    }

  } catch (error) {
    console.error("❌ Error checking roles:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
