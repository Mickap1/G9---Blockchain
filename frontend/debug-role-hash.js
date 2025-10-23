// Script de test pour vérifier le calcul du hash KYC_ADMIN_ROLE
// Utiliser dans la console du navigateur

// Méthode INCORRECTE (ce qui était utilisé avant)
const incorrectHash = '0x' + Buffer.from('KYC_ADMIN_ROLE').toString('hex');
console.log('Hash INCORRECT (Buffer):', incorrectHash);

// Méthode CORRECTE (keccak256)
const correctHash = '0x811427a0fa4932aef534bba16bc34e9b7b2d7d2a79c475fca1765f6cc1faebea';
console.log('Hash CORRECT (keccak256):', correctHash);

console.log('\nLe problème était que Buffer.from() encode en hex, mais ne fait pas de keccak256!');
console.log('Le smart contract utilise keccak256("KYC_ADMIN_ROLE") = ' + correctHash);
