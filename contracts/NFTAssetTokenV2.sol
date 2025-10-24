// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./KYCregistry.sol";

/**
 * @title NFTAssetTokenV2
 * @dev Optimized ERC-721 token with minimal on-chain storage
 * @notice All metadata stored in IPFS, only critical data on-chain
 * @author Epitech Project - Gas Optimized Version
 */
contract NFTAssetTokenV2 is 
    ERC721, 
    ERC721URIStorage, 
    ERC721Burnable, 
    ERC721Pausable,
    AccessControl 
{
    // ========== ROLES ==========
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    // ========== KYC ==========
    KYCRegistry public immutable kycRegistry;
    
    // ========== TOKEN ID COUNTER ==========
    uint256 private _nextTokenId;
    
    // ========== COLLECTION METADATA ==========
    string public collectionDescription;
    string public assetType;
    
    // ========== MINIMAL ASSET DATA ==========
    // Only store what's absolutely necessary on-chain
    // Everything else goes in IPFS metadata
    struct AssetData {
        uint256 tokenizationDate;  // When it was minted
        bool isActive;              // Can be deactivated
        // name, valuation, certificateURI → All in IPFS metadata
    }
    
    mapping(uint256 => AssetData) public assetData;
    
    // ========== EVENTS ==========
    event AssetMinted(
        uint256 indexed tokenId, 
        address indexed owner,
        uint256 timestamp
    );
    event AssetDeactivated(uint256 indexed tokenId);
    event AssetReactivated(uint256 indexed tokenId);
    
    // ========== ERRORS ==========
    error RecipientNotWhitelisted();
    error SenderNotWhitelisted();
    error RecipientBlacklisted();
    error SenderBlacklisted();
    error ZeroAddress();
    error TokenDoesNotExist();
    error AssetIsDeactivated();
    
    /**
     * @dev Constructor
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address kycRegistry_,
        string memory assetType_,
        string memory description_
    ) ERC721(name_, symbol_) {
        if (kycRegistry_ == address(0)) revert ZeroAddress();
        
        kycRegistry = KYCRegistry(kycRegistry_);
        assetType = assetType_;
        collectionDescription = description_;
        
        // Grant roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }
    
    // ========== MINTING FUNCTIONS ==========
    
    /**
     * @notice Mint a new NFT (Gas Optimized)
     * @dev All asset details (name, valuation, certificate) must be in the metadata URI
     * @param to Address to mint to (must be whitelisted)
     * @param uri Metadata URI containing all asset information
     * @return uint256 Token ID of minted NFT
     */
    function mintAsset(
        address to,
        string memory uri
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        if (to == address(0)) revert ZeroAddress();
        if (!kycRegistry.isWhitelisted(to)) revert RecipientNotWhitelisted();
        
        uint256 tokenId = _nextTokenId++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        // Minimal storage
        assetData[tokenId] = AssetData({
            tokenizationDate: block.timestamp,
            isActive: true
        });
        
        emit AssetMinted(tokenId, to, block.timestamp);
        
        return tokenId;
    }
    
    /**
     * @notice Public mint function for KYC-approved users
     * @dev Anyone with approved KYC can mint NFTs for themselves
     * @param uri Metadata URI containing all asset information
     * @return uint256 Token ID of minted NFT
     */
    function mintAssetPublic(
        string memory uri
    ) external returns (uint256) {
        if (!kycRegistry.isWhitelisted(msg.sender)) revert SenderNotWhitelisted();
        
        uint256 tokenId = _nextTokenId++;
        
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        
        // Minimal storage
        assetData[tokenId] = AssetData({
            tokenizationDate: block.timestamp,
            isActive: true
        });
        
        emit AssetMinted(tokenId, msg.sender, block.timestamp);
        
        return tokenId;
    }
    
    /**
     * @notice Batch mint multiple NFTs (Gas Optimized)
     * @param recipients Array of recipient addresses
     * @param uris Array of metadata URIs
     * @return uint256[] Array of minted token IDs
     */
    function batchMintAssets(
        address[] calldata recipients,
        string[] calldata uris
    ) external onlyRole(MINTER_ROLE) returns (uint256[] memory) {
        require(recipients.length == uris.length, "Arrays length mismatch");
        
        uint256[] memory tokenIds = new uint256[](recipients.length);
        
        for (uint256 i = 0; i < recipients.length; i++) {
            if (recipients[i] == address(0)) revert ZeroAddress();
            if (!kycRegistry.isWhitelisted(recipients[i])) revert RecipientNotWhitelisted();
            
            uint256 tokenId = _nextTokenId++;
            
            _safeMint(recipients[i], tokenId);
            _setTokenURI(tokenId, uris[i]);
            
            assetData[tokenId] = AssetData({
                tokenizationDate: block.timestamp,
                isActive: true
            });
            
            tokenIds[i] = tokenId;
            
            emit AssetMinted(tokenId, recipients[i], block.timestamp);
        }
        
        return tokenIds;
    }
    
    // ========== ADMIN FUNCTIONS ==========
    
    /**
     * @notice Update token URI (for metadata updates)
     */
    function updateTokenURI(uint256 tokenId, string memory newURI) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        if (ownerOf(tokenId) == address(0)) revert TokenDoesNotExist();
        _setTokenURI(tokenId, newURI);
    }
    
    /**
     * @notice Deactivate an asset
     */
    function deactivateAsset(uint256 tokenId) external onlyRole(ADMIN_ROLE) {
        if (ownerOf(tokenId) == address(0)) revert TokenDoesNotExist();
        assetData[tokenId].isActive = false;
        emit AssetDeactivated(tokenId);
    }
    
    /**
     * @notice Reactivate an asset
     */
    function reactivateAsset(uint256 tokenId) external onlyRole(ADMIN_ROLE) {
        if (ownerOf(tokenId) == address(0)) revert TokenDoesNotExist();
        assetData[tokenId].isActive = true;
        emit AssetReactivated(tokenId);
    }
    
    /**
     * @notice Pause all transfers
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @notice Unpause all transfers
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @notice Get total supply
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }
    
    /**
     * @notice Get all token IDs owned by an address
     */
    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < _nextTokenId; i++) {
            if (_ownerOf(i) == owner) {
                tokenIds[index] = i;
                index++;
            }
        }
        
        return tokenIds;
    }
    
    /**
     * @notice Get asset data for a token
     */
    function getAssetData(uint256 tokenId) external view returns (
        uint256 tokenizationDate,
        bool isActive,
        string memory uri
    ) {
        if (ownerOf(tokenId) == address(0)) revert TokenDoesNotExist();
        
        AssetData memory data = assetData[tokenId];
        return (
            data.tokenizationDate,
            data.isActive,
            tokenURI(tokenId)
        );
    }
    
    // ========== KYC CHECKS ==========
    
    /**
     * @dev Override _update to add KYC checks
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Pausable)
        returns (address)
    {
        address from = _ownerOf(tokenId);
        
        // KYC checks (skip for minting and burning)
        if (from != address(0) && to != address(0)) {
            // Check blacklist first (priority)
            if (kycRegistry.isBlacklisted(from)) revert SenderBlacklisted();
            if (kycRegistry.isBlacklisted(to)) revert RecipientBlacklisted();
            
            // Check whitelist
            if (!kycRegistry.isWhitelisted(from)) revert SenderNotWhitelisted();
            if (!kycRegistry.isWhitelisted(to)) revert RecipientNotWhitelisted();
            
            // Check if asset is active
            if (!assetData[tokenId].isActive) revert AssetIsDeactivated();
        }
        
        return super._update(to, tokenId, auth);
    }
    
    // ========== REQUIRED OVERRIDES ==========
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
