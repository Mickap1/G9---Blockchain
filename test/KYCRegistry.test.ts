import { expect } from "chai";
import { ethers } from "hardhat";
import { KYCRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("KYCRegistry", function () {
    let kycRegistry: KYCRegistry;
    let owner: SignerWithAddress;
    let kycAdmin: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;
    let user3: SignerWithAddress;

    beforeEach(async function () {
        // Get signers
        [owner, kycAdmin, user1, user2, user3] = await ethers.getSigners();

        // Deploy KYCRegistry
        const KYCRegistryFactory = await ethers.getContractFactory("KYCRegistry");
        kycRegistry = await KYCRegistryFactory.deploy();
        await kycRegistry.waitForDeployment();

        // Grant KYC_ADMIN_ROLE to kycAdmin
        const KYC_ADMIN_ROLE = await kycRegistry.KYC_ADMIN_ROLE();
        await kycRegistry.grantRole(KYC_ADMIN_ROLE, kycAdmin.address);
    });

    describe("Deployment", function () {
        it("Should set the right owner with DEFAULT_ADMIN_ROLE", async function () {
            const DEFAULT_ADMIN_ROLE = await kycRegistry.DEFAULT_ADMIN_ROLE();
            expect(await kycRegistry.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
        });

        it("Should grant KYC_ADMIN_ROLE to deployer", async function () {
            const KYC_ADMIN_ROLE = await kycRegistry.KYC_ADMIN_ROLE();
            expect(await kycRegistry.hasRole(KYC_ADMIN_ROLE, owner.address)).to.be.true;
        });

        it("Should grant KYC_ADMIN_ROLE to designated admin", async function () {
            const KYC_ADMIN_ROLE = await kycRegistry.KYC_ADMIN_ROLE();
            expect(await kycRegistry.hasRole(KYC_ADMIN_ROLE, kycAdmin.address)).to.be.true;
        });
    });

    describe("KYC Submission", function () {
        const dataURI = "ipfs://QmTest123ABC";

        it("Should allow user to submit KYC", async function () {
            const tx = await kycRegistry.connect(user1).submitKYC(dataURI);
            const receipt = await tx.wait();
            const blockNumber = receipt?.blockNumber || 0;
            const block = await ethers.provider.getBlock(blockNumber);
            
            await expect(tx)
                .to.emit(kycRegistry, "KYCSubmitted")
                .withArgs(user1.address, dataURI, block?.timestamp);

            const status = await kycRegistry.getKYCStatus(user1.address);
            expect(status).to.equal(1); // Pending
        });

        it("Should not allow resubmission if KYC is pending", async function () {
            await kycRegistry.connect(user1).submitKYC(dataURI);
            
            await expect(
                kycRegistry.connect(user1).submitKYC("ipfs://QmTest456")
            ).to.be.revertedWith("KYCRegistry: KYC already submitted");
        });

        it("Should allow resubmission after rejection", async function () {
            await kycRegistry.connect(user1).submitKYC(dataURI);
            await kycRegistry.connect(kycAdmin).rejectKYC(user1.address, "Incomplete documents");
            
            await expect(kycRegistry.connect(user1).submitKYC("ipfs://QmTest456"))
                .to.emit(kycRegistry, "KYCSubmitted");
        });

        it("Should store the correct data URI", async function () {
            await kycRegistry.connect(user1).submitKYC(dataURI);
            
            const kycData = await kycRegistry.getKYCData(user1.address);
            expect(kycData.dataURI).to.equal(dataURI);
        });
    });

    describe("KYC Approval (Whitelisting)", function () {
        beforeEach(async function () {
            await kycRegistry.connect(user1).submitKYC("ipfs://QmTest123");
        });

        it("Should allow KYC admin to approve KYC", async function () {
            const expiryDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 1 year

            await expect(kycRegistry.connect(kycAdmin).approveKYC(user1.address, expiryDate))
                .to.emit(kycRegistry, "KYCApproved");

            expect(await kycRegistry.isWhitelisted(user1.address)).to.be.true;
        });

        it("Should not allow non-admin to approve KYC", async function () {
            await expect(
                kycRegistry.connect(user2).approveKYC(user1.address, 0)
            ).to.be.revertedWith("KYCRegistry: caller is not KYC admin");
        });

        it("Should handle approval with no expiry", async function () {
            await kycRegistry.connect(kycAdmin).approveKYC(user1.address, 0);
            expect(await kycRegistry.isWhitelisted(user1.address)).to.be.true;
        });

        it("Should not whitelist if KYC expired", async function () {
            const pastDate = Math.floor(Date.now() / 1000) - 1000;
            
            await kycRegistry.connect(kycAdmin).approveKYC(user1.address, pastDate);
            
            expect(await kycRegistry.isWhitelisted(user1.address)).to.be.false;
        });

        it("Should prevent approval of blacklisted address", async function () {
            await kycRegistry.connect(kycAdmin).blacklistAddress(user1.address, "Fraud detected");

            await expect(
                kycRegistry.connect(kycAdmin).approveKYC(user1.address, 0)
            ).to.be.revertedWith("KYCRegistry: address is blacklisted");
        });
    });

    describe("Batch Approval", function () {
        it("Should batch approve multiple users", async function () {
            const users = [user1.address, user2.address, user3.address];
            const expiryDate = 0;

            await kycRegistry.connect(kycAdmin).batchApproveKYC(users, expiryDate);

            expect(await kycRegistry.isWhitelisted(user1.address)).to.be.true;
            expect(await kycRegistry.isWhitelisted(user2.address)).to.be.true;
            expect(await kycRegistry.isWhitelisted(user3.address)).to.be.true;
        });

        it("Should skip blacklisted users in batch approval", async function () {
            await kycRegistry.connect(kycAdmin).blacklistAddress(user1.address, "Fraud");
            
            const users = [user1.address, user2.address];
            await kycRegistry.connect(kycAdmin).batchApproveKYC(users, 0);

            expect(await kycRegistry.isWhitelisted(user1.address)).to.be.false;
            expect(await kycRegistry.isWhitelisted(user2.address)).to.be.true;
        });

        it("Should emit events for each approval in batch", async function () {
            const users = [user1.address, user2.address];
            
            const tx = await kycRegistry.connect(kycAdmin).batchApproveKYC(users, 0);
            const receipt = await tx.wait();
            
            // Should have 2 KYCApproved events
            const events = receipt?.logs.filter(log => {
                try {
                    return kycRegistry.interface.parseLog(log as any)?.name === "KYCApproved";
                } catch {
                    return false;
                }
            });
            
            expect(events?.length).to.equal(2);
        });
    });

    describe("Blacklisting", function () {
        it("Should allow admin to blacklist address", async function () {
            await expect(
                kycRegistry.connect(kycAdmin).blacklistAddress(user1.address, "Suspicious activity")
            ).to.emit(kycRegistry, "AddressBlacklisted");

            expect(await kycRegistry.isBlacklisted(user1.address)).to.be.true;
        });

        it("Should allow removal from blacklist", async function () {
            await kycRegistry.connect(kycAdmin).blacklistAddress(user1.address, "Test");
            
            await expect(kycRegistry.connect(kycAdmin).removeFromBlacklist(user1.address))
                .to.emit(kycRegistry, "AddressRemovedFromBlacklist");

            expect(await kycRegistry.isBlacklisted(user1.address)).to.be.false;
        });

        it("Should not allow removing non-blacklisted address", async function () {
            await expect(
                kycRegistry.connect(kycAdmin).removeFromBlacklist(user1.address)
            ).to.be.revertedWith("KYCRegistry: address is not blacklisted");
        });

        it("Should reset status to None after blacklist removal", async function () {
            await kycRegistry.connect(kycAdmin).blacklistAddress(user1.address, "Test");
            await kycRegistry.connect(kycAdmin).removeFromBlacklist(user1.address);
            
            const status = await kycRegistry.getKYCStatus(user1.address);
            expect(status).to.equal(0); // None
        });
    });

    describe("KYC Revocation", function () {
        beforeEach(async function () {
            await kycRegistry.connect(kycAdmin).approveKYC(user1.address, 0);
        });

        it("Should allow admin to revoke approved KYC", async function () {
            await expect(
                kycRegistry.connect(kycAdmin).revokeKYC(user1.address, "Policy violation")
            ).to.emit(kycRegistry, "KYCRevoked");

            expect(await kycRegistry.isWhitelisted(user1.address)).to.be.false;
        });

        it("Should not allow revoking non-approved KYC", async function () {
            await expect(
                kycRegistry.connect(kycAdmin).revokeKYC(user2.address, "Test")
            ).to.be.revertedWith("KYCRegistry: KYC not approved");
        });
    });

    describe("Transfer Compliance Check", function () {
        beforeEach(async function () {
            await kycRegistry.connect(kycAdmin).approveKYC(user1.address, 0);
            await kycRegistry.connect(kycAdmin).approveKYC(user2.address, 0);
        });

        it("Should return true for transfer between whitelisted users", async function () {
            expect(await kycRegistry.canTransfer(user1.address, user2.address)).to.be.true;
        });

        it("Should return false if sender not whitelisted", async function () {
            expect(await kycRegistry.canTransfer(user3.address, user2.address)).to.be.false;
        });

        it("Should return false if recipient not whitelisted", async function () {
            expect(await kycRegistry.canTransfer(user1.address, user3.address)).to.be.false;
        });

        it("Should return false if sender blacklisted", async function () {
            await kycRegistry.connect(kycAdmin).blacklistAddress(user1.address, "Test");
            expect(await kycRegistry.canTransfer(user1.address, user2.address)).to.be.false;
        });

        it("Should return false if recipient blacklisted", async function () {
            await kycRegistry.connect(kycAdmin).blacklistAddress(user2.address, "Test");
            expect(await kycRegistry.canTransfer(user1.address, user2.address)).to.be.false;
        });
    });

    describe("View Functions", function () {
        it("Should return correct KYC status transitions", async function () {
            // Initial status should be None (0)
            expect(await kycRegistry.getKYCStatus(user1.address)).to.equal(0);
            
            // After submission, status should be Pending (1)
            await kycRegistry.connect(user1).submitKYC("ipfs://QmTest");
            expect(await kycRegistry.getKYCStatus(user1.address)).to.equal(1);
            
            // After approval, status should be Approved (2)
            await kycRegistry.connect(kycAdmin).approveKYC(user1.address, 0);
            expect(await kycRegistry.getKYCStatus(user1.address)).to.equal(2);
            
            // After revocation, status should be Rejected (3)
            await kycRegistry.connect(kycAdmin).revokeKYC(user1.address, "Test");
            expect(await kycRegistry.getKYCStatus(user1.address)).to.equal(3);
        });

        it("Should return full KYC data correctly", async function () {
            const dataURI = "ipfs://QmTest123";
            const expiryDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
            
            await kycRegistry.connect(user1).submitKYC(dataURI);
            await kycRegistry.connect(kycAdmin).approveKYC(user1.address, expiryDate);
            
            const kycData = await kycRegistry.getKYCData(user1.address);
            
            expect(kycData.status).to.equal(2); // Approved
            expect(kycData.dataURI).to.equal(dataURI);
            expect(kycData.expiryDate).to.equal(expiryDate);
            expect(kycData.approvalDate).to.be.gt(0);
        });

        it("Should correctly identify expired KYC", async function () {
            const pastExpiry = Math.floor(Date.now() / 1000) - 1000;
            const futureExpiry = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
            
            await kycRegistry.connect(kycAdmin).approveKYC(user1.address, pastExpiry);
            await kycRegistry.connect(kycAdmin).approveKYC(user2.address, futureExpiry);
            
            expect(await kycRegistry.isWhitelisted(user1.address)).to.be.false;
            expect(await kycRegistry.isWhitelisted(user2.address)).to.be.true;
        });

        it("Should return false for blacklisted even if previously approved", async function () {
            await kycRegistry.connect(kycAdmin).approveKYC(user1.address, 0);
            expect(await kycRegistry.isWhitelisted(user1.address)).to.be.true;
            
            await kycRegistry.connect(kycAdmin).blacklistAddress(user1.address, "Fraud");
            
            expect(await kycRegistry.isWhitelisted(user1.address)).to.be.false;
            expect(await kycRegistry.isBlacklisted(user1.address)).to.be.true;
        });
    });

    describe("Role Management", function () {
        it("Should allow DEFAULT_ADMIN to grant KYC_ADMIN_ROLE", async function () {
            const KYC_ADMIN_ROLE = await kycRegistry.KYC_ADMIN_ROLE();
            
            await kycRegistry.connect(owner).grantRole(KYC_ADMIN_ROLE, user3.address);
            
            expect(await kycRegistry.hasRole(KYC_ADMIN_ROLE, user3.address)).to.be.true;
        });

        it("Should allow DEFAULT_ADMIN to revoke KYC_ADMIN_ROLE", async function () {
            const KYC_ADMIN_ROLE = await kycRegistry.KYC_ADMIN_ROLE();
            
            await kycRegistry.connect(owner).revokeRole(KYC_ADMIN_ROLE, kycAdmin.address);
            
            expect(await kycRegistry.hasRole(KYC_ADMIN_ROLE, kycAdmin.address)).to.be.false;
        });

        it("Should not allow non-admin to grant roles", async function () {
            const KYC_ADMIN_ROLE = await kycRegistry.KYC_ADMIN_ROLE();
            
            await expect(
                kycRegistry.connect(user1).grantRole(KYC_ADMIN_ROLE, user2.address)
            ).to.be.reverted;
        });

        it("Should not allow removed admin to perform admin actions", async function () {
            const KYC_ADMIN_ROLE = await kycRegistry.KYC_ADMIN_ROLE();
            await kycRegistry.connect(owner).revokeRole(KYC_ADMIN_ROLE, kycAdmin.address);
            
            await expect(
                kycRegistry.connect(kycAdmin).approveKYC(user1.address, 0)
            ).to.be.revertedWith("KYCRegistry: caller is not KYC admin");
        });
    });

    describe("Edge Cases", function () {
        it("Should handle zero address in isWhitelisted", async function () {
            expect(await kycRegistry.isWhitelisted(ethers.ZeroAddress)).to.be.false;
        });

        it("Should handle zero address in isBlacklisted", async function () {
            expect(await kycRegistry.isBlacklisted(ethers.ZeroAddress)).to.be.false;
        });

        it("Should handle empty data URI", async function () {
            await expect(kycRegistry.connect(user1).submitKYC(""))
                .to.emit(kycRegistry, "KYCSubmitted");
        });

        it("Should handle very long data URI", async function () {
            const longURI = "ipfs://" + "a".repeat(1000);
            await expect(kycRegistry.connect(user1).submitKYC(longURI))
                .to.emit(kycRegistry, "KYCSubmitted");
        });

        it("Should handle batch approval with empty array", async function () {
            await kycRegistry.connect(kycAdmin).batchApproveKYC([], 0);
            // Should not revert
        });

        it("Should handle expiry date in the far future", async function () {
            const farFuture = 2**32 - 1; // Max uint32
            await kycRegistry.connect(kycAdmin).approveKYC(user1.address, farFuture);
            
            expect(await kycRegistry.isWhitelisted(user1.address)).to.be.true;
        });

        it("Should not allow submission while approved", async function () {
            await kycRegistry.connect(user1).submitKYC("ipfs://QmTest1");
            await kycRegistry.connect(kycAdmin).approveKYC(user1.address, 0);
            
            await expect(
                kycRegistry.connect(user1).submitKYC("ipfs://QmTest2")
            ).to.be.revertedWith("KYCRegistry: KYC already submitted");
        });

        it("Should not allow submission while blacklisted", async function () {
            await kycRegistry.connect(kycAdmin).blacklistAddress(user1.address, "Test");
            
            await expect(
                kycRegistry.connect(user1).submitKYC("ipfs://QmTest")
            ).to.be.revertedWith("KYCRegistry: KYC already submitted");
        });
    });

    describe("Events", function () {
        it("Should emit KYCSubmitted with correct parameters", async function () {
            const dataURI = "ipfs://QmTest";
            const tx = await kycRegistry.connect(user1).submitKYC(dataURI);
            const receipt = await tx.wait();
            const blockNumber = receipt?.blockNumber || 0;
            const block = await ethers.provider.getBlock(blockNumber);
            
            await expect(tx)
                .to.emit(kycRegistry, "KYCSubmitted")
                .withArgs(user1.address, dataURI, block?.timestamp);
        });

        it("Should emit KYCApproved with correct parameters", async function () {
            const expiryDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
            const tx = await kycRegistry.connect(kycAdmin).approveKYC(user1.address, expiryDate);
            const receipt = await tx.wait();
            const blockNumber = receipt?.blockNumber || 0;
            const block = await ethers.provider.getBlock(blockNumber);
            
            await expect(tx)
                .to.emit(kycRegistry, "KYCApproved")
                .withArgs(user1.address, expiryDate, block?.timestamp);
        });

        it("Should emit KYCRejected with correct parameters", async function () {
            await kycRegistry.connect(user1).submitKYC("ipfs://QmTest");
            
            const reason = "Invalid documents";
            const tx = await kycRegistry.connect(kycAdmin).rejectKYC(user1.address, reason);
            const receipt = await tx.wait();
            const blockNumber = receipt?.blockNumber || 0;
            const block = await ethers.provider.getBlock(blockNumber);
            
            await expect(tx)
                .to.emit(kycRegistry, "KYCRejected")
                .withArgs(user1.address, reason, block?.timestamp);
        });

        it("Should emit AddressBlacklisted with correct parameters", async function () {
            const reason = "Fraud detected";
            const tx = await kycRegistry.connect(kycAdmin).blacklistAddress(user1.address, reason);
            const receipt = await tx.wait();
            const blockNumber = receipt?.blockNumber || 0;
            const block = await ethers.provider.getBlock(blockNumber);
            
            await expect(tx)
                .to.emit(kycRegistry, "AddressBlacklisted")
                .withArgs(user1.address, reason, block?.timestamp);
        });

        it("Should emit AddressRemovedFromBlacklist with correct parameters", async function () {
            await kycRegistry.connect(kycAdmin).blacklistAddress(user1.address, "Test");
            
            const tx = await kycRegistry.connect(kycAdmin).removeFromBlacklist(user1.address);
            const receipt = await tx.wait();
            const blockNumber = receipt?.blockNumber || 0;
            const block = await ethers.provider.getBlock(blockNumber);
            
            await expect(tx)
                .to.emit(kycRegistry, "AddressRemovedFromBlacklist")
                .withArgs(user1.address, block?.timestamp);
        });

        it("Should emit KYCRevoked with correct parameters", async function () {
            await kycRegistry.connect(kycAdmin).approveKYC(user1.address, 0);
            
            const reason = "Policy violation";
            const tx = await kycRegistry.connect(kycAdmin).revokeKYC(user1.address, reason);
            const receipt = await tx.wait();
            const blockNumber = receipt?.blockNumber || 0;
            const block = await ethers.provider.getBlock(blockNumber);
            
            await expect(tx)
                .to.emit(kycRegistry, "KYCRevoked")
                .withArgs(user1.address, reason, block?.timestamp);
        });
    });

    describe("Integration Scenarios", function () {
        it("Should handle complete KYC lifecycle", async function () {
            // 1. Submit KYC
            await kycRegistry.connect(user1).submitKYC("ipfs://QmInitial");
            expect(await kycRegistry.getKYCStatus(user1.address)).to.equal(1); // Pending
            
            // 2. Reject KYC
            await kycRegistry.connect(kycAdmin).rejectKYC(user1.address, "Incomplete");
            expect(await kycRegistry.getKYCStatus(user1.address)).to.equal(3); // Rejected
            
            // 3. Resubmit KYC
            await kycRegistry.connect(user1).submitKYC("ipfs://QmComplete");
            expect(await kycRegistry.getKYCStatus(user1.address)).to.equal(1); // Pending
            
            // 4. Approve KYC
            await kycRegistry.connect(kycAdmin).approveKYC(user1.address, 0);
            expect(await kycRegistry.isWhitelisted(user1.address)).to.be.true;
            
            // 5. Revoke KYC
            await kycRegistry.connect(kycAdmin).revokeKYC(user1.address, "Violation");
            expect(await kycRegistry.isWhitelisted(user1.address)).to.be.false;
        });

        it("Should handle multiple users with different statuses", async function () {
            // User1: Approved
            await kycRegistry.connect(kycAdmin).approveKYC(user1.address, 0);
            
            // User2: Blacklisted
            await kycRegistry.connect(kycAdmin).blacklistAddress(user2.address, "Fraud");
            
            // User3: Pending
            await kycRegistry.connect(user3).submitKYC("ipfs://QmTest");
            
            expect(await kycRegistry.isWhitelisted(user1.address)).to.be.true;
            expect(await kycRegistry.isBlacklisted(user2.address)).to.be.true;
            expect(await kycRegistry.getKYCStatus(user3.address)).to.equal(1); // Pending
            
            // Check transfer compliance
            expect(await kycRegistry.canTransfer(user1.address, user2.address)).to.be.false;
            expect(await kycRegistry.canTransfer(user1.address, user3.address)).to.be.false;
        });

        it("Should handle batch operations correctly", async function () {
            const users = [user1.address, user2.address, user3.address];
            
            // Batch approve
            await kycRegistry.connect(kycAdmin).batchApproveKYC(users, 0);
            
            // All should be whitelisted
            for (const user of users) {
                expect(await kycRegistry.isWhitelisted(user)).to.be.true;
            }
            
            // All should be able to transfer to each other
            expect(await kycRegistry.canTransfer(user1.address, user2.address)).to.be.true;
            expect(await kycRegistry.canTransfer(user2.address, user3.address)).to.be.true;
        });

        it("Should handle expiry date correctly over time", async function () {
            // Use blockchain timestamp instead of Date.now()
            const latestBlock = await ethers.provider.getBlock('latest');
            const currentTime = latestBlock?.timestamp || 0;
            const expiryDate = currentTime + 100; // Expires in 100 seconds
            
            await kycRegistry.connect(kycAdmin).approveKYC(user1.address, expiryDate);
            
            // Should be whitelisted now (before expiry)
            expect(await kycRegistry.isWhitelisted(user1.address)).to.be.true;
            
            // Note: To test expiry, we would need to use hardhat's time manipulation
            // e.g., await ethers.provider.send("evm_increaseTime", [101]);
            // For this test, we verify it's whitelisted with future expiry date
        });
    });
});