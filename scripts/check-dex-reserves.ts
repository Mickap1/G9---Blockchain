import { createPublicClient, http, formatEther } from 'viem';
import { sepolia } from 'viem/chains';
import * as dotenv from 'dotenv';
import SimpleDEXABI from '../artifacts/contracts/DEX.sol/SimpleDEX.json';

dotenv.config();

const DEX_ADDRESS = '0x28B2c6b3C1C9F09ca86e6B7cc8d0b9f0Bd7CE7F4';

async function checkDEXReserves() {
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(process.env.SEPOLIA_RPC_URL),
  });

  console.log('\n📊 DEX RESERVES CHECK');
  console.log('='.repeat(60));
  console.log(`DEX Contract: ${DEX_ADDRESS}`);
  console.log('='.repeat(60));

  try {
    // Lire les réserves du contrat DEX
    const [reserveToken, reserveETH, tokenAddress] = await Promise.all([
      publicClient.readContract({
        address: DEX_ADDRESS as `0x${string}`,
        abi: SimpleDEXABI.abi,
        functionName: 'reserveToken',
      }) as Promise<bigint>,
      publicClient.readContract({
        address: DEX_ADDRESS as `0x${string}`,
        abi: SimpleDEXABI.abi,
        functionName: 'reserveETH',
      }) as Promise<bigint>,
      publicClient.readContract({
        address: DEX_ADDRESS as `0x${string}`,
        abi: SimpleDEXABI.abi,
        functionName: 'token',
      }) as Promise<string>,
    ]);

    console.log('\n✅ DEX State Variables:');
    console.log(`- reserveToken: ${formatEther(reserveToken)} tokens`);
    console.log(`- reserveETH: ${formatEther(reserveETH)} ETH`);
    console.log(`- token address: ${tokenAddress}`);

    // Vérifier le vrai solde ETH du contrat
    const actualETHBalance = await publicClient.getBalance({ 
      address: DEX_ADDRESS as `0x${string}` 
    });

    console.log('\n📊 Actual Contract Balances:');
    console.log(`- ETH Balance: ${formatEther(actualETHBalance)} ETH`);

    if (reserveETH !== actualETHBalance) {
      console.log('\n⚠️  WARNING: reserveETH does not match actual ETH balance!');
      console.log(`   Reserve: ${formatEther(reserveETH)} ETH`);
      console.log(`   Actual:  ${formatEther(actualETHBalance)} ETH`);
    }

    // Calculer le prix si les réserves existent
    if (reserveToken > 0n && reserveETH > 0n) {
      const price = Number(formatEther(reserveETH)) / Number(formatEther(reserveToken));
      console.log(`\n💰 Current Price: ${price.toFixed(10)} ETH/token`);
    } else {
      console.log('\n⚠️  Pool has no liquidity!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkDEXReserves();
