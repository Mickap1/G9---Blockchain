import { expect } from "chai";
import { ethers } from "hardhat";
import { NFTAssetToken, KYCRegistry } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

// SimplePriceOracle type will be inferred
type SimplePriceOracle = any;

describe("SimplePriceOracle", function () {
  let oracle: SimplePriceOracle;
  let nft: NFTAssetToken;
  let kycRegistry: KYCRegistry;
  
  let owner: HardhatEthersSigner;
  let priceUpdater: HardhatEthersSigner;
  let user1: HardhatEthersSigner;

  const COLLECTION_NAME = "Tokenized Diamonds";
  const COLLECTION_SYMBOL = "TDMD";
  const ASSET_TYPE = "Precious Stones";
  const DESCRIPTION = "GIA certified diamonds";

  beforeEach(async function () {
    [owner, priceUpdater, user1] = await ethers.getSigners();

    // Deploy KYC Registry
    const KYCRegistry = await ethers.getContractFactory("KYCRegistry");
    kycRegistry = await KYCRegistry.deploy();
    await kycRegistry.waitForDeployment();

    // Deploy NFT
    const NFTAssetToken = await ethers.getContractFactory("NFTAssetToken");
    nft = await NFTAssetToken.deploy(
      COLLECTION_NAME,
      COLLECTION_SYMBOL,
      await kycRegistry.getAddress(),
      ASSET_TYPE,
      DESCRIPTION
    );
    await nft.waitForDeployment();

    // Deploy Oracle
    const SimplePriceOracle = await ethers.getContractFactory("SimplePriceOracle");
    oracle = await SimplePriceOracle.deploy();
    await oracle.waitForDeployment();

    // Setup roles
    const PRICE_UPDATER_ROLE = await oracle.PRICE_UPDATER_ROLE();
    await oracle.grantRole(PRICE_UPDATER_ROLE, priceUpdater.address);

    // Whitelist users in KYC (with expiry date)
    const oneYearFromNow = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
    await kycRegistry.approveKYC(owner.address, oneYearFromNow);
    await kycRegistry.approveKYC(user1.address, oneYearFromNow);
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      const DEFAULT_ADMIN_ROLE = await oracle.DEFAULT_ADMIN_ROLE();
      expect(await oracle.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
    });

    it("Should grant ORACLE_ADMIN_ROLE to deployer", async function () {
      const ORACLE_ADMIN_ROLE = await oracle.ORACLE_ADMIN_ROLE();
      expect(await oracle.hasRole(ORACLE_ADMIN_ROLE, owner.address)).to.be.true;
    });

    it("Should grant PRICE_UPDATER_ROLE to deployer", async function () {
      const PRICE_UPDATER_ROLE = await oracle.PRICE_UPDATER_ROLE();
      expect(await oracle.hasRole(PRICE_UPDATER_ROLE, owner.address)).to.be.true;
    });

    it("Should not be paused initially", async function () {
      expect(await oracle.paused()).to.be.false;
    });
  });

  describe("NFT Price Management", function () {
    const tokenId = 0;
    const initialPrice = ethers.parseUnits("150000", 0); // 150,000 EUR

    beforeEach(async function () {
      // Mint a diamond NFT
      await nft.mintAsset(
        owner.address,
        "GIA Diamond 2.5ct",
        initialPrice,
        "ipfs://diamond",
        "ipfs://cert"
      );
    });

    it("Should update NFT price", async function () {
      const newPrice = ethers.parseUnits("160000", 0);
      
      await oracle.updateNFTPrice(await nft.getAddress(), tokenId, newPrice);
      
      const price = await oracle.getNFTPrice(await nft.getAddress(), tokenId);
      expect(price).to.equal(newPrice);
    });

    it("Should only allow PRICE_UPDATER_ROLE to update price", async function () {
      const newPrice = ethers.parseUnits("160000", 0);
      
      await expect(
        oracle.connect(user1).updateNFTPrice(await nft.getAddress(), tokenId, newPrice)
      ).to.be.reverted;
    });

    it("Should reject zero price", async function () {
      await expect(
        oracle.updateNFTPrice(await nft.getAddress(), tokenId, 0)
      ).to.be.revertedWithCustomError(oracle, "InvalidPrice");
    });

    it("Should track multiple price updates", async function () {
      await oracle.updateNFTPrice(await nft.getAddress(), tokenId, ethers.parseUnits("150000", 0));
      await oracle.updateNFTPrice(await nft.getAddress(), tokenId, ethers.parseUnits("160000", 0));
      await oracle.updateNFTPrice(await nft.getAddress(), tokenId, ethers.parseUnits("155000", 0));

      const finalPrice = await oracle.getNFTPrice(await nft.getAddress(), tokenId);
      expect(finalPrice).to.equal(ethers.parseUnits("155000", 0));
    });

    it("Should emit PriceUpdated event", async function () {
      const newPrice = ethers.parseUnits("160000", 0);
      
      // The event is PriceUpdated with parameters: tokenAddress, tokenId, oldPrice, newPrice, timestamp
      await expect(oracle.updateNFTPrice(await nft.getAddress(), tokenId, newPrice))
        .to.emit(oracle, "PriceUpdated");
    });
  });

  describe("Price History", function () {
    const tokenId = 0;

    beforeEach(async function () {
      await nft.mintAsset(
        owner.address,
        "GIA Diamond",
        ethers.parseUnits("100000", 0),
        "ipfs://diamond",
        "ipfs://cert"
      );
    });

    it("Should store price history", async function () {
      await oracle.updateNFTPrice(await nft.getAddress(), tokenId, ethers.parseUnits("100000", 0));
      await oracle.updateNFTPrice(await nft.getAddress(), tokenId, ethers.parseUnits("110000", 0));
      await oracle.updateNFTPrice(await nft.getAddress(), tokenId, ethers.parseUnits("105000", 0));

      const history = await oracle.getNFTPriceHistory(await nft.getAddress(), tokenId);
      expect(history.length).to.equal(3);
      
      // Extract price values from history structs
      expect(history[0].price).to.equal(ethers.parseUnits("100000", 0));
      expect(history[1].price).to.equal(ethers.parseUnits("110000", 0));
      expect(history[2].price).to.equal(ethers.parseUnits("105000", 0));
    });

    it("Should limit history to MAX_HISTORY_LENGTH", async function () {
      // Update price 105 times
      for (let i = 1; i <= 105; i++) {
        await oracle.updateNFTPrice(
          await nft.getAddress(), 
          tokenId, 
          ethers.parseUnits((100000 + i * 1000).toString(), 0)
        );
      }

      const history = await oracle.getNFTPriceHistory(await nft.getAddress(), tokenId);
      expect(history.length).to.equal(100); // MAX_HISTORY_LENGTH
    });
  });

  describe("Batch Operations", function () {
    it("Should batch update fungible token prices", async function () {
      // Deploy 3 fungible tokens
      const FungibleToken = await ethers.getContractFactory("FungibleAssetToken");
      const tokens = [];
      
      for (let i = 0; i < 3; i++) {
        const token = await FungibleToken.deploy(
          `Token ${i}`,
          `TKN${i}`,
          ethers.parseUnits("1000000", 18),
          await kycRegistry.getAddress(),
          `Asset ${i}`,
          "Test",
          "Paris, France",
          100000,
          "ipfs://doc"
        );
        await token.waitForDeployment();
        tokens.push(await token.getAddress());
      }

      const prices = [
        ethers.parseUnits("100000", 0),
        ethers.parseUnits("150000", 0),
        ethers.parseUnits("200000", 0)
      ];

      // batchUpdatePrices only takes tokenAddresses and prices
      await oracle.batchUpdatePrices(tokens, prices);

      for (let i = 0; i < 3; i++) {
        const price = await oracle.getPrice(tokens[i]);
        expect(price).to.equal(prices[i]);
      }
    });

    it("Should reject mismatched array lengths", async function () {
      const tokens = [await nft.getAddress(), await nft.getAddress()];
      const prices = [100000, 150000, 200000];
      
      await expect(
        oracle.batchUpdatePrices(tokens, prices)
      ).to.be.revertedWith("Length mismatch");
    });

    it("Should only allow PRICE_UPDATER_ROLE for batch update", async function () {
      const tokens = [await nft.getAddress()];
      const prices = [100000];
      
      await expect(
        oracle.connect(user1).batchUpdatePrices(tokens, prices)
      ).to.be.reverted;
    });
  });

  describe("Pausable", function () {
    const tokenId = 0;
    const price = ethers.parseUnits("100000", 0);

    beforeEach(async function () {
      await nft.mintAsset(owner.address, "Diamond", price, "ipfs://d", "ipfs://c");
    });

    it("Should pause and unpause", async function () {
      await oracle.pause();
      expect(await oracle.paused()).to.be.true;

      await oracle.unpause();
      expect(await oracle.paused()).to.be.false;
    });

    it("Should prevent updates when paused", async function () {
      await oracle.pause();

      await expect(
        oracle.updateNFTPrice(await nft.getAddress(), tokenId, price)
      ).to.be.revertedWithCustomError(oracle, "EnforcedPause");
    });

    it("Should only allow ORACLE_ADMIN_ROLE to pause", async function () {
      await expect(
        oracle.connect(user1).pause()
      ).to.be.reverted;
    });

    it("Should allow updates after unpause", async function () {
      await oracle.pause();
      await oracle.unpause();

      await expect(
        oracle.updateNFTPrice(await nft.getAddress(), tokenId, price)
      ).to.not.be.reverted;
    });
  });

  describe("Access Control", function () {
    it("Should grant and revoke PRICE_UPDATER_ROLE", async function () {
      const PRICE_UPDATER_ROLE = await oracle.PRICE_UPDATER_ROLE();
      
      await oracle.grantRole(PRICE_UPDATER_ROLE, user1.address);
      expect(await oracle.hasRole(PRICE_UPDATER_ROLE, user1.address)).to.be.true;

      await oracle.revokeRole(PRICE_UPDATER_ROLE, user1.address);
      expect(await oracle.hasRole(PRICE_UPDATER_ROLE, user1.address)).to.be.false;
    });

    it("Should only allow ORACLE_ADMIN_ROLE to manage roles", async function () {
      const PRICE_UPDATER_ROLE = await oracle.PRICE_UPDATER_ROLE();
      
      await expect(
        oracle.connect(user1).grantRole(PRICE_UPDATER_ROLE, priceUpdater.address)
      ).to.be.reverted;
    });
  });

  describe("Edge Cases", function () {
    it("Should handle maximum uint256 price", async function () {
      await nft.mintAsset(owner.address, "Diamond", 1, "ipfs://d", "ipfs://c");
      
      const maxPrice = ethers.MaxUint256;
      await oracle.updateNFTPrice(await nft.getAddress(), 0, maxPrice);

      const price = await oracle.getNFTPrice(await nft.getAddress(), 0);
      expect(price).to.equal(maxPrice);
    });

    it("Should handle multiple NFT contracts", async function () {
      const NFTAssetToken = await ethers.getContractFactory("NFTAssetToken");
      const nft2 = await NFTAssetToken.deploy(
        "Diamonds 2",
        "DMD2",
        await kycRegistry.getAddress(),
        "Stones",
        "Test"
      );
      await nft2.waitForDeployment();

      const oneYearFromNow = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
      await kycRegistry.approveKYC(owner.address, oneYearFromNow);
      
      await nft.mintAsset(owner.address, "D1", 1, "ipfs://1", "ipfs://c1");
      await nft2.mintAsset(owner.address, "D2", 1, "ipfs://2", "ipfs://c2");

      await oracle.updateNFTPrice(await nft.getAddress(), 0, 100000);
      await oracle.updateNFTPrice(await nft2.getAddress(), 0, 200000);

      const price1 = await oracle.getNFTPrice(await nft.getAddress(), 0);
      const price2 = await oracle.getNFTPrice(await nft2.getAddress(), 0);

      expect(price1).to.equal(100000);
      expect(price2).to.equal(200000);
    });
  });
});
