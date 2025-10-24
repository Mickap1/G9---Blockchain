const fs = require('fs');
const path = require('path');

const artifacts = [
  { name: 'KYCRegistry', path: 'contracts/KYCregistry.sol/KYCRegistry.json' },
  { name: 'FungibleAssetToken', path: 'contracts/FungibleAssetToken.sol/FungibleAssetToken.json' },
  { name: 'NFTAssetToken', path: 'contracts/NFTAssetToken.sol/NFTAssetToken.json' },
  { name: 'NFTAssetTokenV2', path: 'contracts/NFTAssetTokenV2.sol/NFTAssetTokenV2.json' },
  { name: 'SimpleDEX', path: 'contracts/DEX.sol/SimpleDEX.json' },
  { name: 'SimplePriceOracle', path: 'contracts/Oracle.sol/SimplePriceOracle.json' },
  { name: 'Marketplace', path: 'contracts/Marketplace.sol/Marketplace.json' },
];

const outputDir = path.join(__dirname, '../frontend/lib/abis');

// Créer le dossier si nécessaire
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

artifacts.forEach(({ name, path: artifactPath }) => {
  const fullPath = path.join(__dirname, '../artifacts', artifactPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  ${name} artifact not found at ${artifactPath}`);
    return;
  }

  const artifact = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  const outputPath = path.join(outputDir, `${name}.json`);
  
  fs.writeFileSync(outputPath, JSON.stringify(artifact.abi, null, 2));
  console.log(`✅ Extracted ${name} ABI to ${outputPath}`);
});

console.log('\n✨ All ABIs extracted successfully!');
