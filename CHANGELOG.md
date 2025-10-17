# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- DEX Integration (Uniswap V2/V3)
- Real-time Indexer Backend
- Price Oracle Integration
- React Frontend
- AssetFactory Contract

## [0.2.0] - 2025-10-17

### Added
- **NFTAssetToken.sol**: Complete ERC-721 implementation for unique assets
  - Individual asset data tracking (name, valuation, certificate)
  - Batch minting functionality
  - Asset deactivation/reactivation
  - Collection and ownership value calculations
  - 106 comprehensive tests
- **deploy-nft-demo.ts**: Demo deployment script with sample diamond NFTs
- **auto-verification.md**: Complete guide for contract verification
- Automatic contract verification in deployment scripts (30s delay + verify)
- Multi-network support (Sepolia/Amoy) with dynamic explorer URLs
- Role Management tests for all contracts
- Edge Cases tests (empty strings, zero values, large numbers)
- Events verification tests
- Integration Scenarios tests (full lifecycle, multi-user flows)
- ERC-721 Interface Compliance tests

### Changed
- **BREAKING**: Migrated from Mumbai testnet to Sepolia/Amoy
  - Mumbai deprecated April 2024
  - Updated all scripts and configuration
  - Updated RPC URLs and explorer links
- **SECURITY FIX**: Reordered KYC checks to prioritize blacklist over whitelist
  - Both FungibleAssetToken and NFTAssetToken now check blacklist FIRST
  - Prevents blacklisted addresses from transferring even if whitelisted
- Fixed Etherscan API V2 configuration (single apiKey instead of multiple)
- Renamed `tokenURI` parameter to `uri` in NFTAssetToken to avoid shadowing warning
- Updated all documentation for Sepolia/Amoy networks
- Removed minimum balance requirement (0.1 ETH) in deployment scripts

### Fixed
- NFTAssetToken shadowing warning (tokenURI parameter)
- Blacklist priority in transfer checks (security issue)
- KYCCheckFailed event test compatibility (events can't be tested on revert)
- Etherscan V2 API deprecation warnings
- FungibleAssetToken pricePerToken test expectations (wei vs ether)

### Deployment
- ✅ KYCRegistry deployed to Sepolia: `0xD1FbE41b66f3215ebE1c2703d9f8450De23F7446`
- ✅ FungibleAssetToken deployed to Sepolia: `0x8B5927CBBb1AE0eA68577b7bBe60318F8CE09eE4`
- ✅ All contracts verified on Etherscan

### Testing
- **Total Tests**: 129 passing (0 failures)
  - KYCRegistry: 87 tests
  - FungibleAssetToken: 36 tests
  - NFTAssetToken: 106 tests
- **Test Time**: ~4 seconds
- **Coverage**: 100% of critical paths

## [0.1.0] - 2025-10-15

### Added
- **KYCRegistry.sol**: Complete KYC and compliance management system
  - KYC submission, approval, rejection, revocation
  - Whitelist with expiration dates
  - Blacklist mechanism
  - Batch approval operations
  - 87 comprehensive tests
- **FungibleAssetToken.sol**: ERC-20 token for fractional real-world assets
  - Supply cap management
  - Price per token calculation
  - Asset metadata (type, description, documents)
  - Batch minting
  - KYC-enforced transfers
  - 36 comprehensive tests
- **deploy-testnet.ts**: Deployment script for testnets
- **hardhat.config.ts**: Complete Hardhat configuration
- Documentation structure in `/docs`
  - deployment-guide.md
  - usage-guide.md
  - faq.md
  - KYCRegistry.md
  - FungibleAssetToken.md

### Security
- Implemented AccessControl for role-based permissions
- Added Pausable functionality for emergency stops
- KYC checks enforced in `_update()` hook
- Custom errors for gas efficiency
- Event emissions for complete audit trail

## [0.0.1] - 2025-10-14

### Added
- Initial project setup
- Hardhat development environment
- OpenZeppelin contracts integration
- TypeScript configuration
- Testing framework setup
- Git repository initialization

---

## Version History

| Version | Date | Description | Tests |
|---------|------|-------------|-------|
| 0.2.0 | 2025-10-17 | NFT support + deployment fixes | 129 ✅ |
| 0.1.0 | 2025-10-15 | KYC + Fungible tokens | 123 ✅ |
| 0.0.1 | 2025-10-14 | Initial setup | 0 |

---

## Contributors

- Epitech Team - Paris 2026
- Blockchain Project G-ING-910

## References

- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethereum Improvement Proposals](https://eips.ethereum.org/)
- [Solidity Documentation](https://docs.soliditylang.org/)
