import fs from 'fs';
import path from 'path';

async function updateConfig() {
  console.log('🔄 Updating configuration files with new KYCRegistry address...\n');

  const NEW_KYC_ADDRESS = '0x563E31793214F193EB7993a2bfAd2957a70C7D65';
  const OLD_KYC_ADDRESS = '0x8E4312166Ed927C331B5950e5B8ac636841f06Eb';

  // Update frontend .env.local
  const envPath = path.join(__dirname, '..', 'frontend', '.env.local');
  
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf-8');
    const oldContent = envContent;
    
    // Replace old address with new one
    envContent = envContent.replace(
      /NEXT_PUBLIC_KYC_REGISTRY_ADDRESS=.*/,
      `NEXT_PUBLIC_KYC_REGISTRY_ADDRESS=${NEW_KYC_ADDRESS}`
    );
    
    if (oldContent !== envContent) {
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Updated frontend/.env.local');
      console.log(`   Old: ${OLD_KYC_ADDRESS}`);
      console.log(`   New: ${NEW_KYC_ADDRESS}`);
    } else {
      console.log('ℹ️  frontend/.env.local already up to date');
    }
  } else {
    console.log('⚠️  frontend/.env.local not found');
  }

  // Update deployments/sepolia-addresses.json
  const addressesPath = path.join(__dirname, '..', 'deployments', 'sepolia-addresses.json');
  
  if (fs.existsSync(addressesPath)) {
    const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf-8'));
    
    if (addresses.kycRegistry !== NEW_KYC_ADDRESS) {
      addresses.kycRegistryOld = addresses.kycRegistry;
      addresses.kycRegistry = NEW_KYC_ADDRESS;
      addresses.lastUpdated = new Date().toISOString();
      
      fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
      console.log('\n✅ Updated deployments/sepolia-addresses.json');
      console.log(`   Old: ${addresses.kycRegistryOld}`);
      console.log(`   New: ${NEW_KYC_ADDRESS}`);
    } else {
      console.log('\nℹ️  deployments/sepolia-addresses.json already up to date');
    }
  } else {
    console.log('\n⚠️  deployments/sepolia-addresses.json not found');
  }

  console.log('\n📋 Summary:');
  console.log('   Contract Address: ' + NEW_KYC_ADDRESS);
  console.log('   Network: Sepolia');
  console.log('   Etherscan: https://sepolia.etherscan.io/address/' + NEW_KYC_ADDRESS + '#code');
  console.log('\n✨ Configuration updated successfully!');
  console.log('\n💡 Next steps:');
  console.log('   1. Restart the frontend dev server if running');
  console.log('   2. Test the admin panel at /admin/kyc');
  console.log('   3. Submit test KYC requests');
}

updateConfig()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
