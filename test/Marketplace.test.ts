import { expect } from "chai";
import { ethers } from "hardhat";
import { Marketplace, KYCRegistry, NFTAssetToken, FungibleAssetToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Marketplace", function () {
  let marketplace: Marketplace;
  let kycRegistry: KYCRegistry;
  let nftToken: NFTAssetToken;
  let fungibleToken: FungibleAssetToken;
  let admin: SignerWithAddress;
  let seller: SignerWithAddress;
  let buyer: SignerWithAddress;
  let feeRecipient: SignerWithAddress;

  const NFT_PRICE = ethers.parseEther("1"); // 1 ETH
  const TOKEN_PRICE_PER_UNIT = ethers.parseEther("0.001"); // 0.001 ETH per token
  const TOKEN_AMOUNT = ethers.parseEther("100"); // 100 tokens
  const MAX_SUPPLY = ethers.parseEther("1000000");

  beforeEach(async function () {
    [admin, seller, buyer, feeRecipient] = await ethers.getSigners();

    // Deploy KYC Registry
    const KYCRegistry = await ethers.getContractFactory("KYCRegistry");
    kycRegistry = await KYCRegistry.deploy();

    // Deploy Marketplace
    const Marketplace = await ethers.getContractFactory("Marketplace");
    marketplace = await Marketplace.deploy(
      await kycRegistry.getAddress(),
      feeRecipient.address
    );

    // Deploy NFT Token
    const NFTToken = await ethers.getContractFactory("NFTAssetToken");
    nftToken = await NFTToken.deploy(
      "Test NFT",
      "TNFT",
      await kycRegistry.getAddress(),
      "Test Asset",
      "Test NFT Collection for Marketplace"
    );

    // Deploy Fungible Token
    const FungibleToken = await ethers.getContractFactory("FungibleAssetToken");
    fungibleToken = await FungibleToken.deploy(
      "Test Token",
      "TT",
      MAX_SUPPLY,
      await kycRegistry.getAddress(),
      "Test Asset",
      "Real Estate",
      "Test Location",
      ethers.parseEther("1000000"),
      "ipfs://test-docs"
    );

    // Whitelist users (submit + approve KYC)
    const KYC_ADMIN_ROLE = await kycRegistry.KYC_ADMIN_ROLE();
    await kycRegistry.grantRole(KYC_ADMIN_ROLE, admin.address);
    
    const expiryDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 1 year
    
    await kycRegistry.connect(seller).submitKYC("seller-kyc-data");
    await kycRegistry.approveKYC(seller.address, expiryDate);
    
    await kycRegistry.connect(buyer).submitKYC("buyer-kyc-data");
    await kycRegistry.approveKYC(buyer.address, expiryDate);
    
    await kycRegistry.connect(admin).submitKYC("admin-kyc-data");
    await kycRegistry.approveKYC(admin.address, expiryDate);

    // Mint NFT to seller
    const MINTER_ROLE_NFT = await nftToken.MINTER_ROLE();
    await nftToken.grantRole(MINTER_ROLE_NFT, admin.address);
    
    const metadata = JSON.stringify({
      name: "Test NFT #1",
      description: "Test NFT for marketplace",
      image: "ipfs://test",
      valuation: "1000000"
    });
    const dataURI = `data:application/json,${encodeURIComponent(metadata)}`;
    await nftToken.mintAsset(
      seller.address,
      "Test NFT #1",
      ethers.parseEther("1000000"),
      dataURI,
      "ipfs://certificate"
    );

    // Mint tokens to seller
    const MINTER_ROLE = await fungibleToken.MINTER_ROLE();
    await fungibleToken.grantRole(MINTER_ROLE, admin.address);
    await fungibleToken.mint(seller.address, TOKEN_AMOUNT);
  });

  describe("Deployment", function () {
    it("Should set the correct KYC registry", async function () {
      expect(await marketplace.kycRegistry()).to.equal(await kycRegistry.getAddress());
    });

    it("Should set the correct fee recipient", async function () {
      expect(await marketplace.feeRecipient()).to.equal(feeRecipient.address);
    });

    it("Should set default fee to 2.5%", async function () {
      expect(await marketplace.feePercentage()).to.equal(250); // 2.5% = 250/10000
    });

    it("Should grant admin role to deployer", async function () {
      const ADMIN_ROLE = await marketplace.ADMIN_ROLE();
      expect(await marketplace.hasRole(ADMIN_ROLE, admin.address)).to.be.true;
    });
  });

  describe("NFT Listings", function () {
    it("Should allow whitelisted user to list an NFT", async function () {
      // Approve marketplace
      await nftToken.connect(seller).approve(await marketplace.getAddress(), 0);

      // List NFT
      await expect(
        marketplace.connect(seller).listNFT(
          await nftToken.getAddress(),
          0,
          NFT_PRICE
        )
      )
        .to.emit(marketplace, "NFTListed")
        .withArgs(1, seller.address, await nftToken.getAddress(), 0, NFT_PRICE, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

      const listing = await marketplace.getNFTListing(1);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.price).to.equal(NFT_PRICE);
      expect(listing.active).to.be.true;
    });

    it("Should revert if user not whitelisted", async function () {
      const [, , , nonWhitelisted] = await ethers.getSigners();
      
      await expect(
        marketplace.connect(nonWhitelisted).listNFT(
          await nftToken.getAddress(),
          0,
          NFT_PRICE
        )
      ).to.be.revertedWithCustomError(marketplace, "NotWhitelisted");
    });

    it("Should revert if NFT not approved", async function () {
      await expect(
        marketplace.connect(seller).listNFT(
          await nftToken.getAddress(),
          0,
          NFT_PRICE
        )
      ).to.be.revertedWithCustomError(marketplace, "NotApproved");
    });

    it("Should revert if not NFT owner", async function () {
      await nftToken.connect(seller).approve(await marketplace.getAddress(), 0);

      await expect(
        marketplace.connect(buyer).listNFT(
          await nftToken.getAddress(),
          0,
          NFT_PRICE
        )
      ).to.be.revertedWithCustomError(marketplace, "NotNFTOwner");
    });

    it("Should allow seller to cancel listing", async function () {
      await nftToken.connect(seller).approve(await marketplace.getAddress(), 0);
      await marketplace.connect(seller).listNFT(
        await nftToken.getAddress(),
        0,
        NFT_PRICE
      );

      await expect(marketplace.connect(seller).cancelNFTListing(1))
        .to.emit(marketplace, "NFTListingCancelled")
        .withArgs(1, seller.address, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

      const listing = await marketplace.getNFTListing(1);
      expect(listing.active).to.be.false;
    });

    it("Should allow seller to update price", async function () {
      await nftToken.connect(seller).approve(await marketplace.getAddress(), 0);
      await marketplace.connect(seller).listNFT(
        await nftToken.getAddress(),
        0,
        NFT_PRICE
      );

      const newPrice = ethers.parseEther("2");
      await expect(marketplace.connect(seller).updateNFTPrice(1, newPrice))
        .to.emit(marketplace, "NFTListingUpdated")
        .withArgs(1, NFT_PRICE, newPrice, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

      const listing = await marketplace.getNFTListing(1);
      expect(listing.price).to.equal(newPrice);
    });
  });

  describe("NFT Purchase", function () {
    beforeEach(async function () {
      // List NFT
      await nftToken.connect(seller).approve(await marketplace.getAddress(), 0);
      await marketplace.connect(seller).listNFT(
        await nftToken.getAddress(),
        0,
        NFT_PRICE
      );
    });

    it("Should allow buyer to purchase NFT", async function () {
      const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);
      const feeRecipientBalanceBefore = await ethers.provider.getBalance(feeRecipient.address);

      await expect(
        marketplace.connect(buyer).buyNFT(1, { value: NFT_PRICE })
      )
        .to.emit(marketplace, "NFTSold")
        .to.emit(nftToken, "Transfer");

      // Check NFT ownership
      expect(await nftToken.ownerOf(0)).to.equal(buyer.address);

      // Check listing deactivated
      const listing = await marketplace.getNFTListing(1);
      expect(listing.active).to.be.false;

      // Check payments
      const fee = (NFT_PRICE * 250n) / 10000n; // 2.5%
      const sellerAmount = NFT_PRICE - fee;

      const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
      const feeRecipientBalanceAfter = await ethers.provider.getBalance(feeRecipient.address);

      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(sellerAmount);
      expect(feeRecipientBalanceAfter - feeRecipientBalanceBefore).to.equal(fee);
    });

    it("Should refund excess payment", async function () {
      const buyerBalanceBefore = await ethers.provider.getBalance(buyer.address);
      const excessPayment = ethers.parseEther("2");

      const tx = await marketplace.connect(buyer).buyNFT(1, { value: excessPayment });
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);
      
      // Buyer should pay NFT_PRICE + gas, excess should be refunded
      expect(buyerBalanceBefore - buyerBalanceAfter).to.be.closeTo(
        NFT_PRICE + gasUsed,
        ethers.parseEther("0.001") // Small tolerance for gas estimation
      );
    });

    it("Should revert if payment insufficient", async function () {
      await expect(
        marketplace.connect(buyer).buyNFT(1, { value: ethers.parseEther("0.5") })
      ).to.be.revertedWithCustomError(marketplace, "InsufficientPayment");
    });

    it("Should revert if listing inactive", async function () {
      await marketplace.connect(seller).cancelNFTListing(1);

      await expect(
        marketplace.connect(buyer).buyNFT(1, { value: NFT_PRICE })
      ).to.be.revertedWithCustomError(marketplace, "ListingNotActive");
    });
  });

  describe("Token Listings", function () {
    it("Should allow whitelisted user to list tokens", async function () {
      // Approve marketplace
      await fungibleToken.connect(seller).approve(await marketplace.getAddress(), TOKEN_AMOUNT);

      // List tokens
      await expect(
        marketplace.connect(seller).listTokens(
          await fungibleToken.getAddress(),
          TOKEN_AMOUNT,
          TOKEN_PRICE_PER_UNIT
        )
      )
        .to.emit(marketplace, "TokenListed")
        .withArgs(
          1,
          seller.address,
          await fungibleToken.getAddress(),
          TOKEN_AMOUNT,
          TOKEN_PRICE_PER_UNIT,
          await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1)
        );

      const listing = await marketplace.getTokenListing(1);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.amount).to.equal(TOKEN_AMOUNT);
      expect(listing.pricePerToken).to.equal(TOKEN_PRICE_PER_UNIT);
      expect(listing.active).to.be.true;
    });

    it("Should allow buyer to purchase tokens", async function () {
      await fungibleToken.connect(seller).approve(await marketplace.getAddress(), TOKEN_AMOUNT);
      await marketplace.connect(seller).listTokens(
        await fungibleToken.getAddress(),
        TOKEN_AMOUNT,
        TOKEN_PRICE_PER_UNIT
      );

      const buyAmount = ethers.parseEther("50");
      // totalPrice = (buyAmount * pricePerToken) / 1e18 (contract does this)
      // 50 tokens * 0.001 ETH / 1e18 = 0.05 ETH
      const totalPrice = ethers.parseEther("0.05");

      await expect(
        marketplace.connect(buyer).buyTokens(1, buyAmount, { value: totalPrice })
      )
        .to.emit(marketplace, "TokensSold")
        .to.emit(fungibleToken, "Transfer");

      // Check token balance
      expect(await fungibleToken.balanceOf(buyer.address)).to.equal(buyAmount);

      // Check listing updated
      const listing = await marketplace.getTokenListing(1);
      expect(listing.amount).to.equal(TOKEN_AMOUNT - buyAmount);
      expect(listing.active).to.be.true; // Still active with remaining tokens
    });

    it("Should deactivate listing when all tokens sold", async function () {
      await fungibleToken.connect(seller).approve(await marketplace.getAddress(), TOKEN_AMOUNT);
      await marketplace.connect(seller).listTokens(
        await fungibleToken.getAddress(),
        TOKEN_AMOUNT,
        TOKEN_PRICE_PER_UNIT
      );

      // totalPrice = (100 tokens * 0.001 ETH) / 1e18 = 0.1 ETH
      const totalPrice = ethers.parseEther("0.1");

      await marketplace.connect(buyer).buyTokens(1, TOKEN_AMOUNT, { value: totalPrice });

      const listing = await marketplace.getTokenListing(1);
      expect(listing.active).to.be.false;
    });
  });

  describe("Admin Functions", function () {
    it("Should allow admin to update fee percentage", async function () {
      const newFee = 500; // 5%

      await expect(marketplace.setFeePercentage(newFee))
        .to.emit(marketplace, "FeePercentageUpdated")
        .withArgs(250, newFee);

      expect(await marketplace.feePercentage()).to.equal(newFee);
    });

    it("Should revert if fee > 10%", async function () {
      await expect(
        marketplace.setFeePercentage(1001)
      ).to.be.revertedWithCustomError(marketplace, "InvalidFeePercentage");
    });

    it("Should allow admin to update fee recipient", async function () {
      const [, , , , newRecipient] = await ethers.getSigners();

      await expect(marketplace.setFeeRecipient(newRecipient.address))
        .to.emit(marketplace, "FeeRecipientUpdated")
        .withArgs(feeRecipient.address, newRecipient.address);

      expect(await marketplace.feeRecipient()).to.equal(newRecipient.address);
    });

    it("Should allow admin to pause marketplace", async function () {
      await marketplace.pause();
      
      await nftToken.connect(seller).approve(await marketplace.getAddress(), 0);
      
      await expect(
        marketplace.connect(seller).listNFT(
          await nftToken.getAddress(),
          0,
          NFT_PRICE
        )
      ).to.be.revertedWithCustomError(marketplace, "EnforcedPause");
    });
  });

  describe("View Functions", function () {
    it("Should return seller listings", async function () {
      await nftToken.connect(seller).approve(await marketplace.getAddress(), 0);
      await marketplace.connect(seller).listNFT(
        await nftToken.getAddress(),
        0,
        NFT_PRICE
      );

      const listings = await marketplace.getSellerNFTListings(seller.address);
      expect(listings.length).to.equal(1);
      expect(listings[0]).to.equal(1);
    });

    it("Should return active listings count", async function () {
      await nftToken.connect(seller).approve(await marketplace.getAddress(), 0);
      await marketplace.connect(seller).listNFT(
        await nftToken.getAddress(),
        0,
        NFT_PRICE
      );

      await fungibleToken.connect(seller).approve(await marketplace.getAddress(), TOKEN_AMOUNT);
      await marketplace.connect(seller).listTokens(
        await fungibleToken.getAddress(),
        TOKEN_AMOUNT,
        TOKEN_PRICE_PER_UNIT
      );

      const [nftCount, tokenCount] = await marketplace.getActiveListingsCounts();
      expect(nftCount).to.equal(1);
      expect(tokenCount).to.equal(1);
    });

    it("Should check if NFT is listed", async function () {
      await nftToken.connect(seller).approve(await marketplace.getAddress(), 0);
      await marketplace.connect(seller).listNFT(
        await nftToken.getAddress(),
        0,
        NFT_PRICE
      );

      const listingId = await marketplace.isNFTListed(
        await nftToken.getAddress(),
        0
      );
      expect(listingId).to.equal(1);
    });
  });
});
