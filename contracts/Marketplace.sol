// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./KYCregistry.sol";

/**
 * @title Marketplace
 * @dev Peer-to-Peer marketplace for NFTs and Fungible Tokens with KYC compliance
 * @notice Buy and sell assets at fixed prices directly between users
 * @author Epitech Project - Tokenized Asset Platform
 * 
 * Features:
 * - NFT listings with fixed prices (ETH)
 * - Token listings with fixed prices (ETH per token)
 * - KYC-compliant trading (only whitelisted users)
 * - Seller fees (configurable)
 * - Listing management (create, cancel, update)
 * - Pausable for emergencies
 */
contract Marketplace is AccessControl, Pausable, ReentrancyGuard {
    // ========== ROLES ==========
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    // ========== STATE VARIABLES ==========
    KYCRegistry public immutable kycRegistry;
    
    uint256 public feePercentage = 250; // 2.5% fee (250/10000)
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    address public feeRecipient;
    
    uint256 public nextNFTListingId;
    uint256 public nextTokenListingId;
    
    // ========== STRUCTS ==========
    struct NFTListing {
        uint256 listingId;
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price; // Price in ETH
        bool active;
        uint256 createdAt;
    }
    
    struct TokenListing {
        uint256 listingId;
        address seller;
        address tokenContract;
        uint256 amount;
        uint256 pricePerToken; // Price per token in ETH
        bool active;
        uint256 createdAt;
    }
    
    // ========== MAPPINGS ==========
    mapping(uint256 => NFTListing) public nftListings;
    mapping(uint256 => TokenListing) public tokenListings;
    
    // Track listings by seller
    mapping(address => uint256[]) public sellerNFTListings;
    mapping(address => uint256[]) public sellerTokenListings;
    
    // Track if a specific NFT is listed
    mapping(address => mapping(uint256 => uint256)) public nftToListingId; // nftContract => tokenId => listingId
    
    // ========== EVENTS ==========
    event NFTListed(
        uint256 indexed listingId,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 price,
        uint256 timestamp
    );
    
    event NFTListingCancelled(
        uint256 indexed listingId,
        address indexed seller,
        uint256 timestamp
    );
    
    event NFTListingUpdated(
        uint256 indexed listingId,
        uint256 oldPrice,
        uint256 newPrice,
        uint256 timestamp
    );
    
    event NFTSold(
        uint256 indexed listingId,
        address indexed seller,
        address indexed buyer,
        address nftContract,
        uint256 tokenId,
        uint256 price,
        uint256 fee,
        uint256 timestamp
    );
    
    event TokenListed(
        uint256 indexed listingId,
        address indexed seller,
        address indexed tokenContract,
        uint256 amount,
        uint256 pricePerToken,
        uint256 timestamp
    );
    
    event TokenListingCancelled(
        uint256 indexed listingId,
        address indexed seller,
        uint256 timestamp
    );
    
    event TokenListingUpdated(
        uint256 indexed listingId,
        uint256 oldPricePerToken,
        uint256 newPricePerToken,
        uint256 timestamp
    );
    
    event TokensSold(
        uint256 indexed listingId,
        address indexed seller,
        address indexed buyer,
        address tokenContract,
        uint256 amount,
        uint256 totalPrice,
        uint256 fee,
        uint256 timestamp
    );
    
    event FeePercentageUpdated(uint256 oldFee, uint256 newFee);
    event FeeRecipientUpdated(address oldRecipient, address newRecipient);
    
    // ========== ERRORS ==========
    error ZeroAddress();
    error ZeroAmount();
    error ZeroPrice();
    error NotWhitelisted();
    error NotSeller();
    error ListingNotActive();
    error NFTAlreadyListed();
    error InsufficientPayment();
    error InvalidFeePercentage();
    error TransferFailed();
    error NotNFTOwner();
    error NotApproved();
    
    // ========== MODIFIERS ==========
    modifier onlyWhitelisted() {
        if (!kycRegistry.isWhitelisted(msg.sender)) {
            revert NotWhitelisted();
        }
        _;
    }
    
    // ========== CONSTRUCTOR ==========
    constructor(address _kycRegistry, address _feeRecipient) {
        if (_kycRegistry == address(0) || _feeRecipient == address(0)) {
            revert ZeroAddress();
        }
        
        kycRegistry = KYCRegistry(_kycRegistry);
        feeRecipient = _feeRecipient;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }
    
    // ========== NFT LISTING FUNCTIONS ==========
    
    /**
     * @notice List an NFT for sale
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to list
     * @param price Price in ETH (wei)
     */
    function listNFT(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external whenNotPaused onlyWhitelisted nonReentrant {
        if (nftContract == address(0)) revert ZeroAddress();
        if (price == 0) revert ZeroPrice();
        
        // Check if NFT is already listed
        uint256 existingListingId = nftToListingId[nftContract][tokenId];
        if (existingListingId != 0 && nftListings[existingListingId].active) {
            revert NFTAlreadyListed();
        }
        
        // Verify ownership
        IERC721 nft = IERC721(nftContract);
        if (nft.ownerOf(tokenId) != msg.sender) {
            revert NotNFTOwner();
        }
        
        // Verify approval
        if (!nft.isApprovedForAll(msg.sender, address(this)) && 
            nft.getApproved(tokenId) != address(this)) {
            revert NotApproved();
        }
        
        uint256 listingId = ++nextNFTListingId;
        
        nftListings[listingId] = NFTListing({
            listingId: listingId,
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            active: true,
            createdAt: block.timestamp
        });
        
        nftToListingId[nftContract][tokenId] = listingId;
        sellerNFTListings[msg.sender].push(listingId);
        
        emit NFTListed(listingId, msg.sender, nftContract, tokenId, price, block.timestamp);
    }
    
    /**
     * @notice Cancel an NFT listing
     * @param listingId ID of the listing to cancel
     */
    function cancelNFTListing(uint256 listingId) external nonReentrant {
        NFTListing storage listing = nftListings[listingId];
        
        if (listing.seller != msg.sender) revert NotSeller();
        if (!listing.active) revert ListingNotActive();
        
        listing.active = false;
        nftToListingId[listing.nftContract][listing.tokenId] = 0;
        
        emit NFTListingCancelled(listingId, msg.sender, block.timestamp);
    }
    
    /**
     * @notice Update the price of an NFT listing
     * @param listingId ID of the listing to update
     * @param newPrice New price in ETH (wei)
     */
    function updateNFTPrice(uint256 listingId, uint256 newPrice) external nonReentrant {
        if (newPrice == 0) revert ZeroPrice();
        
        NFTListing storage listing = nftListings[listingId];
        
        if (listing.seller != msg.sender) revert NotSeller();
        if (!listing.active) revert ListingNotActive();
        
        uint256 oldPrice = listing.price;
        listing.price = newPrice;
        
        emit NFTListingUpdated(listingId, oldPrice, newPrice, block.timestamp);
    }
    
    /**
     * @notice Buy an NFT
     * @param listingId ID of the listing to purchase
     */
    function buyNFT(uint256 listingId) external payable whenNotPaused onlyWhitelisted nonReentrant {
        NFTListing storage listing = nftListings[listingId];
        
        if (!listing.active) revert ListingNotActive();
        if (msg.value < listing.price) revert InsufficientPayment();
        
        // Mark as inactive
        listing.active = false;
        nftToListingId[listing.nftContract][listing.tokenId] = 0;
        
        // Calculate fee
        uint256 fee = (listing.price * feePercentage) / FEE_DENOMINATOR;
        uint256 sellerAmount = listing.price - fee;
        
        // Transfer NFT to buyer
        IERC721(listing.nftContract).safeTransferFrom(
            listing.seller,
            msg.sender,
            listing.tokenId
        );
        
        // Transfer ETH to seller
        (bool successSeller, ) = payable(listing.seller).call{value: sellerAmount}("");
        if (!successSeller) revert TransferFailed();
        
        // Transfer fee
        if (fee > 0) {
            (bool successFee, ) = payable(feeRecipient).call{value: fee}("");
            if (!successFee) revert TransferFailed();
        }
        
        // Refund excess payment
        if (msg.value > listing.price) {
            (bool successRefund, ) = payable(msg.sender).call{value: msg.value - listing.price}("");
            if (!successRefund) revert TransferFailed();
        }
        
        emit NFTSold(
            listingId,
            listing.seller,
            msg.sender,
            listing.nftContract,
            listing.tokenId,
            listing.price,
            fee,
            block.timestamp
        );
    }
    
    // ========== TOKEN LISTING FUNCTIONS ==========
    
    /**
     * @notice List tokens for sale
     * @param tokenContract Address of the token contract
     * @param amount Amount of tokens to sell
     * @param pricePerToken Price per token in ETH (wei)
     */
    function listTokens(
        address tokenContract,
        uint256 amount,
        uint256 pricePerToken
    ) external whenNotPaused onlyWhitelisted nonReentrant {
        if (tokenContract == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        if (pricePerToken == 0) revert ZeroPrice();
        
        // Verify balance
        IERC20 token = IERC20(tokenContract);
        if (token.balanceOf(msg.sender) < amount) {
            revert InsufficientPayment();
        }
        
        // Verify allowance
        if (token.allowance(msg.sender, address(this)) < amount) {
            revert NotApproved();
        }
        
        uint256 listingId = ++nextTokenListingId;
        
        tokenListings[listingId] = TokenListing({
            listingId: listingId,
            seller: msg.sender,
            tokenContract: tokenContract,
            amount: amount,
            pricePerToken: pricePerToken,
            active: true,
            createdAt: block.timestamp
        });
        
        sellerTokenListings[msg.sender].push(listingId);
        
        emit TokenListed(listingId, msg.sender, tokenContract, amount, pricePerToken, block.timestamp);
    }
    
    /**
     * @notice Cancel a token listing
     * @param listingId ID of the listing to cancel
     */
    function cancelTokenListing(uint256 listingId) external nonReentrant {
        TokenListing storage listing = tokenListings[listingId];
        
        if (listing.seller != msg.sender) revert NotSeller();
        if (!listing.active) revert ListingNotActive();
        
        listing.active = false;
        
        emit TokenListingCancelled(listingId, msg.sender, block.timestamp);
    }
    
    /**
     * @notice Update the price of a token listing
     * @param listingId ID of the listing to update
     * @param newPricePerToken New price per token in ETH (wei)
     */
    function updateTokenPrice(uint256 listingId, uint256 newPricePerToken) external nonReentrant {
        if (newPricePerToken == 0) revert ZeroPrice();
        
        TokenListing storage listing = tokenListings[listingId];
        
        if (listing.seller != msg.sender) revert NotSeller();
        if (!listing.active) revert ListingNotActive();
        
        uint256 oldPrice = listing.pricePerToken;
        listing.pricePerToken = newPricePerToken;
        
        emit TokenListingUpdated(listingId, oldPrice, newPricePerToken, block.timestamp);
    }
    
    /**
     * @notice Buy tokens from a listing
     * @param listingId ID of the listing to purchase from
     * @param amount Amount of tokens to buy
     */
    function buyTokens(uint256 listingId, uint256 amount) 
        external 
        payable 
        whenNotPaused 
        onlyWhitelisted 
        nonReentrant 
    {
        if (amount == 0) revert ZeroAmount();
        
        TokenListing storage listing = tokenListings[listingId];
        
        if (!listing.active) revert ListingNotActive();
        if (amount > listing.amount) revert InsufficientPayment();
        
        // Calculate total price: (amount * pricePerToken) / 1e18
        // This is because amount is already in wei (with 18 decimals)
        uint256 totalPrice = (amount * listing.pricePerToken) / 1e18;
        if (msg.value < totalPrice) revert InsufficientPayment();
        
        // Update or deactivate listing
        listing.amount -= amount;
        if (listing.amount == 0) {
            listing.active = false;
        }
        
        // Calculate fee
        uint256 fee = (totalPrice * feePercentage) / FEE_DENOMINATOR;
        uint256 sellerAmount = totalPrice - fee;
        
        // Transfer tokens to buyer
        IERC20(listing.tokenContract).transferFrom(
            listing.seller,
            msg.sender,
            amount
        );
        
        // Transfer ETH to seller
        (bool successSeller, ) = payable(listing.seller).call{value: sellerAmount}("");
        if (!successSeller) revert TransferFailed();
        
        // Transfer fee
        if (fee > 0) {
            (bool successFee, ) = payable(feeRecipient).call{value: fee}("");
            if (!successFee) revert TransferFailed();
        }
        
        // Refund excess payment
        if (msg.value > totalPrice) {
            (bool successRefund, ) = payable(msg.sender).call{value: msg.value - totalPrice}("");
            if (!successRefund) revert TransferFailed();
        }
        
        emit TokensSold(
            listingId,
            listing.seller,
            msg.sender,
            listing.tokenContract,
            amount,
            totalPrice,
            fee,
            block.timestamp
        );
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @notice Get details of an NFT listing
     * @param listingId ID of the listing
     * @return Listing details
     */
    function getNFTListing(uint256 listingId) external view returns (NFTListing memory) {
        return nftListings[listingId];
    }
    
    /**
     * @notice Get details of a token listing
     * @param listingId ID of the listing
     * @return Listing details
     */
    function getTokenListing(uint256 listingId) external view returns (TokenListing memory) {
        return tokenListings[listingId];
    }
    
    /**
     * @notice Get all NFT listings by a seller
     * @param seller Address of the seller
     * @return Array of listing IDs
     */
    function getSellerNFTListings(address seller) external view returns (uint256[] memory) {
        return sellerNFTListings[seller];
    }
    
    /**
     * @notice Get all token listings by a seller
     * @param seller Address of the seller
     * @return Array of listing IDs
     */
    function getSellerTokenListings(address seller) external view returns (uint256[] memory) {
        return sellerTokenListings[seller];
    }
    
    /**
     * @notice Check if a specific NFT is listed
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID
     * @return listingId (0 if not listed or inactive)
     */
    function isNFTListed(address nftContract, uint256 tokenId) external view returns (uint256) {
        uint256 listingId = nftToListingId[nftContract][tokenId];
        if (listingId != 0 && nftListings[listingId].active) {
            return listingId;
        }
        return 0;
    }
    
    /**
     * @notice Get active listings count
     * @return nftCount Active NFT listings count
     * @return tokenCount Active token listings count
     */
    function getActiveListingsCounts() external view returns (uint256 nftCount, uint256 tokenCount) {
        for (uint256 i = 1; i <= nextNFTListingId; i++) {
            if (nftListings[i].active) {
                nftCount++;
            }
        }
        
        for (uint256 i = 1; i <= nextTokenListingId; i++) {
            if (tokenListings[i].active) {
                tokenCount++;
            }
        }
    }
    
    // ========== ADMIN FUNCTIONS ==========
    
    /**
     * @notice Update the marketplace fee percentage
     * @param newFeePercentage New fee percentage (in basis points, e.g., 250 = 2.5%)
     */
    function setFeePercentage(uint256 newFeePercentage) external onlyRole(ADMIN_ROLE) {
        if (newFeePercentage > 1000) revert InvalidFeePercentage(); // Max 10%
        
        uint256 oldFee = feePercentage;
        feePercentage = newFeePercentage;
        
        emit FeePercentageUpdated(oldFee, newFeePercentage);
    }
    
    /**
     * @notice Update the fee recipient address
     * @param newFeeRecipient New fee recipient address
     */
    function setFeeRecipient(address newFeeRecipient) external onlyRole(ADMIN_ROLE) {
        if (newFeeRecipient == address(0)) revert ZeroAddress();
        
        address oldRecipient = feeRecipient;
        feeRecipient = newFeeRecipient;
        
        emit FeeRecipientUpdated(oldRecipient, newFeeRecipient);
    }
    
    /**
     * @notice Pause the marketplace
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @notice Unpause the marketplace
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    /**
     * @notice Emergency cancel of a listing (admin only)
     * @param listingId ID of the NFT listing to cancel
     */
    function emergencyCancelNFTListing(uint256 listingId) external onlyRole(ADMIN_ROLE) {
        NFTListing storage listing = nftListings[listingId];
        if (listing.active) {
            listing.active = false;
            nftToListingId[listing.nftContract][listing.tokenId] = 0;
            emit NFTListingCancelled(listingId, listing.seller, block.timestamp);
        }
    }
    
    /**
     * @notice Emergency cancel of a token listing (admin only)
     * @param listingId ID of the token listing to cancel
     */
    function emergencyCancelTokenListing(uint256 listingId) external onlyRole(ADMIN_ROLE) {
        TokenListing storage listing = tokenListings[listingId];
        if (listing.active) {
            listing.active = false;
            emit TokenListingCancelled(listingId, listing.seller, block.timestamp);
        }
    }
    
    // ========== RECEIVE FUNCTION ==========
    receive() external payable {
        revert("Direct ETH transfers not allowed");
    }
}
