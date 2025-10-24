import { createPublicClient, http, formatEther } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import * as dotenv from 'dotenv';
import FungibleTokenABI from '../artifacts/contracts/FungibleAssetToken.sol/FungibleAssetToken.json';

dotenv.config();

const TOKEN_ADDRESS = '0xfA451d9C32d15a637Ab376732303c36C34C9979f';
const DEX_ADDRESS = '0x28B2c6b3C1C9F09ca86e6B7cc8d0b9f0Bd7CE7F4';

async function checkBalances() {
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(process.env.SEPOLIA_RPC_URL),
  });

  // Get account from private key
  if (!process.env.PRIVATE_KEY) {
    console.error('❌ PRIVATE_KEY not found in .env');
    return;
  }

  const privateKey = process.env.PRIVATE_KEY.startsWith('0x') 
    ? process.env.PRIVATE_KEY 
    : `0x${process.env.PRIVATE_KEY}`;
  
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const accountAddress = account.address;

  console.log('\n📊 TOKEN BALANCE CHECK');
  console.log('='.repeat(60));
  console.log(`Account: ${accountAddress}`);
  console.log(`Token Contract: ${TOKEN_ADDRESS}`);
  console.log(`DEX Contract: ${DEX_ADDRESS}`);
  console.log('='.repeat(60));

  try {
    // Vérifier le solde du compte
    const accountBalance = await publicClient.readContract({
      address: TOKEN_ADDRESS as `0x${string}`,
      abi: FungibleTokenABI.abi,
      functionName: 'balanceOf',
      args: [accountAddress],
    }) as bigint;

    console.log(`\n✅ Account Balance: ${formatEther(accountBalance)} tokens`);

    // Vérifier le solde du DEX
    const dexBalance = await publicClient.readContract({
      address: TOKEN_ADDRESS as `0x${string}`,
      abi: FungibleTokenABI.abi,
      functionName: 'balanceOf',
      args: [DEX_ADDRESS],
    }) as bigint;

    console.log(`✅ DEX Balance: ${formatEther(dexBalance)} tokens`);

    // Vérifier le total supply
    const totalSupply = await publicClient.readContract({
      address: TOKEN_ADDRESS as `0x${string}`,
      abi: FungibleTokenABI.abi,
      functionName: 'totalSupply',
    }) as bigint;

    console.log(`✅ Total Supply: ${formatEther(totalSupply)} tokens`);

    // Vérifier les réserves du DEX
    const dexReserveETH = await publicClient.getBalance({ 
      address: DEX_ADDRESS as `0x${string}` 
    });

    console.log('\n📈 DEX RESERVES:');
    console.log(`- ETH: ${formatEther(dexReserveETH)} ETH`);
    console.log(`- Tokens: ${formatEther(dexBalance)} tokens`);
    console.log(`- Price: ${Number(formatEther(dexReserveETH)) / Number(formatEther(dexBalance))} ETH/token`);

    // Calculer ce qui devrait rester à l'account
    const accountShouldHave = totalSupply - dexBalance;
    console.log('\n🧮 CALCULATION:');
    console.log(`Total Supply - DEX Balance = Account Balance`);
    console.log(`${formatEther(totalSupply)} - ${formatEther(dexBalance)} = ${formatEther(accountShouldHave)}`);
    console.log(`Expected: ${formatEther(accountShouldHave)} tokens`);
    console.log(`Actual: ${formatEther(accountBalance)} tokens`);
    
    if (accountBalance === accountShouldHave) {
      console.log('✅ Balance is CORRECT!');
    } else {
      console.log('❌ Balance MISMATCH!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkBalances();
