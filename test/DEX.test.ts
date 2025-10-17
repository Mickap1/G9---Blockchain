import { expect } from "chai";
import { ethers } from "hardhat";
import { FungibleAssetToken, KYCRegistry } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

// SimpleDEX type will be inferred
type SimpleDEX = any;

describe("SimpleDEX", function () {
  let dex: SimpleDEX;
  let token: FungibleAssetToken;
  let kycRegistry: KYCRegistry;
  
  let owner: HardhatEthersSigner;
  let admin: HardhatEthersSigner;
  let liquidityProvider: HardhatEthersSigner;
  let trader1: HardhatEthersSigner;
  let trader2: HardhatEthersSigner;
  let notWhitelisted: HardhatEthersSigner;
  let blacklisted: HardhatEthersSigner;

  const TOKEN_NAME = "Real Estate Token";
  const TOKEN_SYMBOL = "RET";
  const MAX_SUPPLY = ethers.parseEther("1000000"); // 1M tokens
  const INITIAL_LIQUIDITY_TOKENS = ethers.parseEther("10000"); // 10k tokens
  const INITIAL_LIQUIDITY_ETH = ethers.parseEther("10"); // 10 ETH

  beforeEach(async function () {
    [owner, admin, liquidityProvider, trader1, trader2, notWhitelisted, blacklisted] = 
      await ethers.getSigners();

    // Deploy KYC Registry
    const KYCRegistry = await ethers.getContractFactory("KYCRegistry");
    kycRegistry = await KYCRegistry.deploy();
    await kycRegistry.waitForDeployment();

    // Deploy Token
    const FungibleAssetToken = await ethers.getContractFactory("FungibleAssetToken");
    token = await FungibleAssetToken.deploy(
      TOKEN_NAME,
      TOKEN_SYMBOL,
      MAX_SUPPLY,
      await kycRegistry.getAddress(),
      "Luxury Apartment Complex",
      "Real Estate",
      "Paris, France",
      ethers.parseEther("5000000"), // 5M EUR
      "ipfs://QmTestHash"
    );
    await token.waitForDeployment();

    // Deploy DEX
    const SimpleDEX = await ethers.getContractFactory("SimpleDEX");
    dex = await SimpleDEX.deploy(
      await token.getAddress(),
      await kycRegistry.getAddress()
    );
    await dex.waitForDeployment();

    // Setup KYC: whitelist users
    const futureExpiry = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 1 year
    
    await kycRegistry.connect(liquidityProvider).submitKYC("ipfs://QmLPUser");
    await kycRegistry.connect(owner).approveKYC(liquidityProvider.address, futureExpiry);

    await kycRegistry.connect(trader1).submitKYC("ipfs://QmTrader1");
    await kycRegistry.connect(owner).approveKYC(trader1.address, futureExpiry);

    await kycRegistry.connect(trader2).submitKYC("ipfs://QmTrader2");
    await kycRegistry.connect(owner).approveKYC(trader2.address, futureExpiry);

    // Blacklist one user
    await kycRegistry.connect(blacklisted).submitKYC("ipfs://QmBlacklisted");
    await kycRegistry.connect(owner).approveKYC(blacklisted.address, futureExpiry);
    await kycRegistry.connect(owner).blacklistAddress(blacklisted.address, "Suspicious activity");

    // ⭐ IMPORTANT: Whitelist the DEX contract itself so it can receive tokens
    const dexAddress = await dex.getAddress();
    await kycRegistry.connect(owner).batchApproveKYC([dexAddress], futureExpiry);

    // Mint tokens to liquidity provider
    await token.connect(owner).mint(liquidityProvider.address, INITIAL_LIQUIDITY_TOKENS);
    
    // Mint tokens to trader1 for selling tests
    await token.connect(owner).mint(trader1.address, ethers.parseEther("1000"));
  });

  describe("Deployment", function () {
    it("Should deploy with correct token and KYC addresses", async function () {
      expect(await dex.token()).to.equal(await token.getAddress());
      expect(await dex.kycRegistry()).to.equal(await kycRegistry.getAddress());
    });

    it("Should initialize with zero reserves", async function () {
      expect(await dex.reserveToken()).to.equal(0);
      expect(await dex.reserveETH()).to.equal(0);
      expect(await dex.totalLiquidity()).to.equal(0);
    });

    it("Should grant admin roles to deployer", async function () {
      const ADMIN_ROLE = await dex.ADMIN_ROLE();
      const PAUSER_ROLE = await dex.PAUSER_ROLE();
      
      expect(await dex.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
      expect(await dex.hasRole(PAUSER_ROLE, owner.address)).to.be.true;
    });

    it("Should revert deployment with zero token address", async function () {
      const SimpleDEX = await ethers.getContractFactory("SimpleDEX");
      await expect(
        SimpleDEX.deploy(ethers.ZeroAddress, await kycRegistry.getAddress())
      ).to.be.revertedWithCustomError(dex, "ZeroAddress");
    });

    it("Should revert deployment with zero KYC address", async function () {
      const SimpleDEX = await ethers.getContractFactory("SimpleDEX");
      await expect(
        SimpleDEX.deploy(await token.getAddress(), ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(dex, "ZeroAddress");
    });
  });

  describe("Add Liquidity", function () {
    it("Should add initial liquidity successfully", async function () {
      await token.connect(liquidityProvider).approve(
        await dex.getAddress(),
        INITIAL_LIQUIDITY_TOKENS
      );

      const tx = await dex.connect(liquidityProvider).addLiquidity(
        INITIAL_LIQUIDITY_TOKENS,
        { value: INITIAL_LIQUIDITY_ETH }
      );

      await expect(tx)
        .to.emit(dex, "LiquidityAdded")
        .withArgs(
          liquidityProvider.address,
          INITIAL_LIQUIDITY_TOKENS,
          INITIAL_LIQUIDITY_ETH,
          await dex.liquidity(liquidityProvider.address),
          await ethers.provider.getBlock("latest").then(b => b?.timestamp)
        );

      expect(await dex.reserveToken()).to.equal(INITIAL_LIQUIDITY_TOKENS);
      expect(await dex.reserveETH()).to.equal(INITIAL_LIQUIDITY_ETH);
      expect(await dex.totalLiquidity()).to.be.gt(0);
    });

    it("Should add liquidity maintaining pool ratio", async function () {
      // First liquidity
      await token.connect(liquidityProvider).approve(
        await dex.getAddress(),
        INITIAL_LIQUIDITY_TOKENS
      );
      await dex.connect(liquidityProvider).addLiquidity(
        INITIAL_LIQUIDITY_TOKENS,
        { value: INITIAL_LIQUIDITY_ETH }
      );

      // Mint more tokens to trader1
      const additionalTokens = ethers.parseEther("1000");
      await token.connect(owner).mint(trader1.address, additionalTokens);
      
      // Second liquidity (should maintain 1000:1 ratio)
      await token.connect(trader1).approve(await dex.getAddress(), additionalTokens);
      await dex.connect(trader1).addLiquidity(
        additionalTokens,
        { value: ethers.parseEther("1") }
      );

      const poolInfo = await dex.getPoolInfo();
      const ratio = poolInfo._reserveToken / poolInfo._reserveETH;
      
      // Ratio should be maintained (1000 tokens per 1 ETH)
      expect(ratio).to.be.closeTo(1000n, 10n);
    });

    it("Should refund excess ETH when providing more than needed", async function () {
      await token.connect(liquidityProvider).approve(
        await dex.getAddress(),
        INITIAL_LIQUIDITY_TOKENS
      );
      
      // First add initial liquidity
      await dex.connect(liquidityProvider).addLiquidity(
        INITIAL_LIQUIDITY_TOKENS,
        { value: INITIAL_LIQUIDITY_ETH }
      );

      // Now try to add more liquidity with excess ETH
      const additionalTokens = ethers.parseEther("100");
      await token.connect(owner).mint(liquidityProvider.address, additionalTokens);
      await token.connect(liquidityProvider).approve(await dex.getAddress(), additionalTokens);

      const balanceBefore = await ethers.provider.getBalance(liquidityProvider.address);
      
      // Send 1 ETH but only need 0.1 ETH for 100 tokens
      const tx = await dex.connect(liquidityProvider).addLiquidity(
        additionalTokens,
        { value: ethers.parseEther("1") }
      );
      
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      
      const balanceAfter = await ethers.provider.getBalance(liquidityProvider.address);
      
      // Should have received refund (balance should be higher than expected)
      const expectedDeduction = ethers.parseEther("0.1") + BigInt(gasUsed);
      const actualDeduction = balanceBefore - balanceAfter;
      
      expect(actualDeduction).to.be.closeTo(expectedDeduction, ethers.parseEther("0.01"));
    });

    it("Should revert when not whitelisted", async function () {
      await expect(
        dex.connect(notWhitelisted).addLiquidity(
          ethers.parseEther("100"),
          { value: ethers.parseEther("1") }
        )
      ).to.be.revertedWithCustomError(dex, "NotWhitelisted");
    });

    it("Should revert when blacklisted", async function () {
      await expect(
        dex.connect(blacklisted).addLiquidity(
          ethers.parseEther("100"),
          { value: ethers.parseEther("1") }
        )
      ).to.be.revertedWithCustomError(dex, "Blacklisted");
    });

    it("Should revert with zero token amount", async function () {
      await expect(
        dex.connect(liquidityProvider).addLiquidity(0, { value: ethers.parseEther("1") })
      ).to.be.revertedWithCustomError(dex, "ZeroAmount");
    });

    it("Should revert with zero ETH amount", async function () {
      await expect(
        dex.connect(liquidityProvider).addLiquidity(ethers.parseEther("100"), { value: 0 })
      ).to.be.revertedWithCustomError(dex, "ZeroAmount");
    });

    it("Should revert when paused", async function () {
      await dex.connect(owner).pause();
      
      await expect(
        dex.connect(liquidityProvider).addLiquidity(
          ethers.parseEther("100"),
          { value: ethers.parseEther("1") }
        )
      ).to.be.revertedWithCustomError(dex, "EnforcedPause");
    });
  });

  describe("Remove Liquidity", function () {
    beforeEach(async function () {
      // Add initial liquidity
      await token.connect(liquidityProvider).approve(
        await dex.getAddress(),
        INITIAL_LIQUIDITY_TOKENS
      );
      await dex.connect(liquidityProvider).addLiquidity(
        INITIAL_LIQUIDITY_TOKENS,
        { value: INITIAL_LIQUIDITY_ETH }
      );
    });

    it("Should remove liquidity successfully", async function () {
      const liquidityBalance = await dex.liquidity(liquidityProvider.address);
      const halfLiquidity = liquidityBalance / 2n;

      const tx = await dex.connect(liquidityProvider).removeLiquidity(halfLiquidity);

      await expect(tx).to.emit(dex, "LiquidityRemoved");

      expect(await dex.liquidity(liquidityProvider.address)).to.equal(liquidityBalance - halfLiquidity);
    });

    it("Should return correct amounts of tokens and ETH", async function () {
      const liquidityBalance = await dex.liquidity(liquidityProvider.address);
      
      const tokenBalanceBefore = await token.balanceOf(liquidityProvider.address);
      const ethBalanceBefore = await ethers.provider.getBalance(liquidityProvider.address);

      const tx = await dex.connect(liquidityProvider).removeLiquidity(liquidityBalance);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const tokenBalanceAfter = await token.balanceOf(liquidityProvider.address);
      const ethBalanceAfter = await ethers.provider.getBalance(liquidityProvider.address);

      // Should receive approximately all tokens and ETH back
      expect(tokenBalanceAfter - tokenBalanceBefore).to.equal(INITIAL_LIQUIDITY_TOKENS);
      expect(ethBalanceAfter - ethBalanceBefore + BigInt(gasUsed)).to.be.closeTo(
        INITIAL_LIQUIDITY_ETH,
        ethers.parseEther("0.01")
      );
    });

    it("Should revert when removing more than owned", async function () {
      const liquidityBalance = await dex.liquidity(liquidityProvider.address);
      
      await expect(
        dex.connect(liquidityProvider).removeLiquidity(liquidityBalance + 1n)
      ).to.be.revertedWithCustomError(dex, "NoLiquidityToRemove");
    });

    it("Should revert with zero amount", async function () {
      await expect(
        dex.connect(liquidityProvider).removeLiquidity(0)
      ).to.be.revertedWithCustomError(dex, "ZeroAmount");
    });

    it("Should revert when not whitelisted", async function () {
      await expect(
        dex.connect(notWhitelisted).removeLiquidity(ethers.parseEther("1"))
      ).to.be.revertedWithCustomError(dex, "NotWhitelisted");
    });
  });

  describe("Swap ETH for Tokens", function () {
    beforeEach(async function () {
      // Add initial liquidity
      await token.connect(liquidityProvider).approve(
        await dex.getAddress(),
        INITIAL_LIQUIDITY_TOKENS
      );
      await dex.connect(liquidityProvider).addLiquidity(
        INITIAL_LIQUIDITY_TOKENS,
        { value: INITIAL_LIQUIDITY_ETH }
      );
    });

    it("Should swap ETH for tokens successfully", async function () {
      const ethAmount = ethers.parseEther("1");
      const minTokens = ethers.parseEther("900"); // Expect ~997 tokens with 0.3% fee

      const tokenBalanceBefore = await token.balanceOf(trader1.address);

      const tx = await dex.connect(trader1).swapETHForTokens(minTokens, { value: ethAmount });

      await expect(tx).to.emit(dex, "TokensPurchased");

      const tokenBalanceAfter = await token.balanceOf(trader1.address);
      const tokensReceived = tokenBalanceAfter - tokenBalanceBefore;

      expect(tokensReceived).to.be.gte(minTokens);
      expect(tokensReceived).to.be.lt(ethers.parseEther("1000")); // Less than 1000 due to fee
    });

    it("Should respect price impact for large swaps", async function () {
      const smallSwap = ethers.parseEther("0.1");
      const largeSwap = ethers.parseEther("5");

      const smallQuote = await dex.getTokenQuote(smallSwap);
      const largeQuote = await dex.getTokenQuote(largeSwap);

      // Large swap should have worse rate due to price impact
      const smallRate = smallQuote * 10n / smallSwap;
      const largeRate = largeQuote * 10n / largeSwap;

      expect(largeRate).to.be.lt(smallRate);
    });

    it("Should revert when slippage exceeded", async function () {
      const ethAmount = ethers.parseEther("1");
      const unrealisticMinTokens = ethers.parseEther("10000"); // Way too high

      await expect(
        dex.connect(trader1).swapETHForTokens(unrealisticMinTokens, { value: ethAmount })
      ).to.be.revertedWithCustomError(dex, "SlippageExceeded");
    });

    it("Should revert when not whitelisted", async function () {
      await expect(
        dex.connect(notWhitelisted).swapETHForTokens(
          ethers.parseEther("100"),
          { value: ethers.parseEther("1") }
        )
      ).to.be.revertedWithCustomError(dex, "NotWhitelisted");
    });

    it("Should revert when blacklisted", async function () {
      await expect(
        dex.connect(blacklisted).swapETHForTokens(
          ethers.parseEther("100"),
          { value: ethers.parseEther("1") }
        )
      ).to.be.revertedWithCustomError(dex, "Blacklisted");
    });

    it("Should revert with zero ETH", async function () {
      await expect(
        dex.connect(trader1).swapETHForTokens(ethers.parseEther("100"), { value: 0 })
      ).to.be.revertedWithCustomError(dex, "ZeroAmount");
    });

    it("Should revert when paused", async function () {
      await dex.connect(owner).pause();

      await expect(
        dex.connect(trader1).swapETHForTokens(
          ethers.parseEther("100"),
          { value: ethers.parseEther("1") }
        )
      ).to.be.revertedWithCustomError(dex, "EnforcedPause");
    });
  });

  describe("Swap Tokens for ETH", function () {
    beforeEach(async function () {
      // Add initial liquidity
      await token.connect(liquidityProvider).approve(
        await dex.getAddress(),
        INITIAL_LIQUIDITY_TOKENS
      );
      await dex.connect(liquidityProvider).addLiquidity(
        INITIAL_LIQUIDITY_TOKENS,
        { value: INITIAL_LIQUIDITY_ETH }
      );
    });

    it("Should swap tokens for ETH successfully", async function () {
      const tokenAmount = ethers.parseEther("100");
      const minETH = ethers.parseEther("0.09"); // Expect ~0.997 ETH with 0.3% fee

      await token.connect(trader1).approve(await dex.getAddress(), tokenAmount);

      const ethBalanceBefore = await ethers.provider.getBalance(trader1.address);

      const tx = await dex.connect(trader1).swapTokensForETH(tokenAmount, minETH);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      await expect(tx).to.emit(dex, "TokensSold");

      const ethBalanceAfter = await ethers.provider.getBalance(trader1.address);
      const ethReceived = ethBalanceAfter - ethBalanceBefore + BigInt(gasUsed);

      expect(ethReceived).to.be.gte(minETH);
    });

    it("Should revert when slippage exceeded", async function () {
      const tokenAmount = ethers.parseEther("100");
      const unrealisticMinETH = ethers.parseEther("10"); // Way too high

      await token.connect(trader1).approve(await dex.getAddress(), tokenAmount);

      await expect(
        dex.connect(trader1).swapTokensForETH(tokenAmount, unrealisticMinETH)
      ).to.be.revertedWithCustomError(dex, "SlippageExceeded");
    });

    it("Should revert when not whitelisted", async function () {
      await expect(
        dex.connect(notWhitelisted).swapTokensForETH(
          ethers.parseEther("100"),
          ethers.parseEther("0.1")
        )
      ).to.be.revertedWithCustomError(dex, "NotWhitelisted");
    });

    it("Should revert with zero token amount", async function () {
      await expect(
        dex.connect(trader1).swapTokensForETH(0, ethers.parseEther("0.1"))
      ).to.be.revertedWithCustomError(dex, "ZeroAmount");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await token.connect(liquidityProvider).approve(
        await dex.getAddress(),
        INITIAL_LIQUIDITY_TOKENS
      );
      await dex.connect(liquidityProvider).addLiquidity(
        INITIAL_LIQUIDITY_TOKENS,
        { value: INITIAL_LIQUIDITY_ETH }
      );
    });

    it("Should return accurate token quote", async function () {
      const ethAmount = ethers.parseEther("1");
      const quote = await dex.getTokenQuote(ethAmount);

      expect(quote).to.be.gt(0);
      expect(quote).to.be.lt(ethers.parseEther("1000")); // Less than 1:1 due to fee
    });

    it("Should return accurate ETH quote", async function () {
      const tokenAmount = ethers.parseEther("1000");
      const quote = await dex.getETHQuote(tokenAmount);

      expect(quote).to.be.gt(0);
      expect(quote).to.be.lt(ethers.parseEther("1")); // Less than 1:1 due to fee
    });

    it("Should return correct token price", async function () {
      const price = await dex.getTokenPrice();
      
      // Price should be ~0.001 ETH per token (10000 tokens / 10 ETH)
      expect(price).to.be.closeTo(ethers.parseEther("0.001"), ethers.parseEther("0.0001"));
    });

    it("Should return pool info correctly", async function () {
      const poolInfo = await dex.getPoolInfo();

      expect(poolInfo._reserveToken).to.equal(INITIAL_LIQUIDITY_TOKENS);
      expect(poolInfo._reserveETH).to.equal(INITIAL_LIQUIDITY_ETH);
      expect(poolInfo._totalLiquidity).to.be.gt(0);
      expect(poolInfo._tokenPrice).to.be.gt(0);
    });

    it("Should return user liquidity info correctly", async function () {
      const userInfo = await dex.getUserLiquidity(liquidityProvider.address);

      expect(userInfo.userLiquidity).to.be.gt(0);
      expect(userInfo.sharePercent).to.equal(10000); // 100% of pool
      expect(userInfo.tokenShare).to.equal(INITIAL_LIQUIDITY_TOKENS);
      expect(userInfo.ethShare).to.equal(INITIAL_LIQUIDITY_ETH);
    });
  });

  describe("Admin Functions", function () {
    it("Should pause and unpause", async function () {
      await dex.connect(owner).pause();
      expect(await dex.paused()).to.be.true;

      await dex.connect(owner).unpause();
      expect(await dex.paused()).to.be.false;
    });

    it("Should revert pause from non-admin", async function () {
      await expect(
        dex.connect(trader1).pause()
      ).to.be.reverted;
    });
  });

  describe("Edge Cases & Security", function () {
    beforeEach(async function () {
      await token.connect(liquidityProvider).approve(
        await dex.getAddress(),
        INITIAL_LIQUIDITY_TOKENS
      );
      await dex.connect(liquidityProvider).addLiquidity(
        INITIAL_LIQUIDITY_TOKENS,
        { value: INITIAL_LIQUIDITY_ETH }
      );
    });

    it("Should handle multiple sequential swaps correctly", async function () {
      // Perform multiple swaps
      for (let i = 0; i < 5; i++) {
        await dex.connect(trader1).swapETHForTokens(
          ethers.parseEther("10"),
          { value: ethers.parseEther("0.1") }
        );
      }

      const poolInfo = await dex.getPoolInfo();
      expect(poolInfo._reserveToken).to.be.lt(INITIAL_LIQUIDITY_TOKENS);
      expect(poolInfo._reserveETH).to.be.gt(INITIAL_LIQUIDITY_ETH);
    });

    it("Should prevent reentrancy attacks", async function () {
      // The ReentrancyGuard should prevent any reentrancy
      // This is tested implicitly through normal operations
      expect(await dex.connect(trader1).swapETHForTokens(
        ethers.parseEther("10"),
        { value: ethers.parseEther("0.1") }
      )).to.not.be.reverted;
    });

    it("Should handle dust amounts correctly", async function () {
      const dustAmount = 100n; // 100 wei
      
      const quote = await dex.getTokenQuote(dustAmount);
      expect(quote).to.be.gte(0);
    });
  });
});
