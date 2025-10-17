import { ethers } from "ethers";
import { kycContract, tokenContract, dexContract, oracleContract } from "../config/contracts";
import { db } from "../db/sqlite";

export async function startEventListeners(fromBlock: number) {
  console.log(`🎧 Starting event listeners from block ${fromBlock}...`);

  // 1. KYC Events
  kycContract.on("KYCApproved", async (user, expiryDate, timestamp, event) => {
    console.log(`✅ KYC Approved: ${user}`);
    
    db.prepare(`
      INSERT INTO kyc_events (event_type, user_address, data, block_number, transaction_hash, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      "KYCApproved",
      user,
      JSON.stringify({ expiryDate: expiryDate.toString() }),
      event.log.blockNumber,
      event.log.transactionHash,
      Number(timestamp)
    );
  });

  kycContract.on("AddressBlacklisted", async (user, reason, timestamp, event) => {
    console.log(`🚫 Address Blacklisted: ${user}`);
    
    db.prepare(`
      INSERT INTO kyc_events (event_type, user_address, data, block_number, transaction_hash, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      "AddressBlacklisted",
      user,
      JSON.stringify({ reason }),
      event.log.blockNumber,
      event.log.transactionHash,
      Number(timestamp)
    );
  });

  // 2. Token Transfer Events
  tokenContract.on("Transfer", async (from, to, value, event) => {
    // Ignorer mint/burn (from/to = address(0))
    if (from === ethers.ZeroAddress || to === ethers.ZeroAddress) return;
    
    console.log(`💸 Transfer: ${ethers.formatEther(value)} tokens from ${from} to ${to}`);
    
    db.prepare(`
      INSERT INTO token_transfers (from_address, to_address, amount, block_number, transaction_hash, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      from,
      to,
      value.toString(),
      event.log.blockNumber,
      event.log.transactionHash,
      Math.floor(Date.now() / 1000)
    );
  });

  // 3. DEX Trade Events
  dexContract.on("TokensPurchased", async (buyer, ethIn, tokensOut, timestamp, event) => {
    console.log(`🔵 Buy: ${buyer} spent ${ethers.formatEther(ethIn)} ETH for ${ethers.formatEther(tokensOut)} tokens`);
    
    db.prepare(`
      INSERT INTO dex_trades (trade_type, user_address, token_amount, eth_amount, block_number, transaction_hash, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      "BUY",
      buyer,
      tokensOut.toString(),
      ethIn.toString(),
      event.log.blockNumber,
      event.log.transactionHash,
      Number(timestamp)
    );
  });

  dexContract.on("TokensSold", async (seller, tokensIn, ethOut, timestamp, event) => {
    console.log(`🔴 Sell: ${seller} sold ${ethers.formatEther(tokensIn)} tokens for ${ethers.formatEther(ethOut)} ETH`);
    
    db.prepare(`
      INSERT INTO dex_trades (trade_type, user_address, token_amount, eth_amount, block_number, transaction_hash, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      "SELL",
      seller,
      tokensIn.toString(),
      ethOut.toString(),
      event.log.blockNumber,
      event.log.transactionHash,
      Number(timestamp)
    );
  });

  // 4. Oracle Price Updates
  oracleContract.on("PriceUpdated", async (tokenAddress, tokenId, oldPrice, newPrice, timestamp, event) => {
    console.log(`💎 Price Update: ${tokenAddress} Token ${tokenId} → ${ethers.formatEther(newPrice)} EUR`);
    
    db.prepare(`
      INSERT INTO oracle_prices (token_address, token_id, old_price, new_price, block_number, transaction_hash, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      tokenAddress,
      Number(tokenId),
      oldPrice.toString(),
      newPrice.toString(),
      event.log.blockNumber,
      event.log.transactionHash,
      Number(timestamp)
    );
  });

  console.log("✅ All event listeners started");
}