import hre from "hardhat";

async function main() {
  console.log("🧪 Testing KYC Listing Functions...\n");

  const KYC_ADDRESS = "0x563E31793214F193EB7993a2bfAd2957a70C7D65";
  
  const kycRegistry = await hre.ethers.getContractAt("KYCRegistry", KYC_ADDRESS);
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deployer:", deployer.address);
  console.log("");

  // Submit some test KYCs (commented out - requires multiple accounts)
  console.log("📝 Note: To test KYC submissions, use multiple accounts");
  console.log("   Current implementation uses events to track submissions\n");

  console.log("\n📊 Testing statistics...");
  const stats = await kycRegistry.getStatistics();
  console.log("   Pending:", stats.pending.toString());
  console.log("   Approved:", stats.approved.toString());
  console.log("   Rejected:", stats.rejected.toString());
  console.log("   Blacklisted:", stats.blacklisted.toString());
  console.log("   Total:", stats.total.toString());

  console.log("\n📋 Getting all addresses...");
  const allAddresses = await kycRegistry.getAllAddresses();
  console.log("   Total addresses:", allAddresses.length);
  allAddresses.forEach((addr, index) => {
    console.log(`   ${index + 1}. ${addr}`);
  });

  console.log("\n⏳ Getting pending addresses...");
  const pendingAddresses = await kycRegistry.getAllAddressesByStatus(1); // Pending = 1
  console.log("   Pending addresses:", pendingAddresses.length);
  pendingAddresses.forEach((addr, index) => {
    console.log(`   ${index + 1}. ${addr}`);
  });

  console.log("\n✅ Getting approved addresses...");
  const approvedAddresses = await kycRegistry.getAllAddressesByStatus(2); // Approved = 2
  console.log("   Approved addresses:", approvedAddresses.length);
  approvedAddresses.forEach((addr, index) => {
    console.log(`   ${index + 1}. ${addr}`);
  });

  // Approve user1
  if (pendingAddresses.length > 0) {
    console.log("\n👍 Approving first pending user...");
    const tx = await kycRegistry.approveKYC(pendingAddresses[0], 0);
    await tx.wait();
    console.log(`✅ Approved ${pendingAddresses[0]}`);

    // Check updated stats
    console.log("\n📊 Updated statistics:");
    const newStats = await kycRegistry.getStatistics();
    console.log("   Pending:", newStats.pending.toString());
    console.log("   Approved:", newStats.approved.toString());
  }

  // Test batch data retrieval
  if (allAddresses.length > 0) {
    console.log("\n📦 Testing batch KYC data retrieval...");
    const batchData = await kycRegistry.getBatchKYCData(allAddresses);
    console.log(`   Retrieved ${batchData.length} KYC records`);
    batchData.forEach((data, index) => {
      const statusNames = ['None', 'Pending', 'Approved', 'Rejected', 'Blacklisted'];
      console.log(`   ${allAddresses[index]}: ${statusNames[Number(data.status)]}`);
    });
  }

  // Test pagination
  console.log("\n📄 Testing pagination...");
  const [page1, total] = await kycRegistry.getAddressesByStatus(1, 0, 2); // Get 2 pending
  console.log(`   Page 1: ${page1.length} addresses (Total: ${total})`);

  console.log("\n✨ All tests completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
