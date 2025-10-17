// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./KYCregistry.sol";

/**
 * @title SimpleDEX
 * @dev Decentralized Exchange for FungibleAssetToken with KYC compliance
 * @notice Simple AMM (Automated Market Maker) using constant product formula: x * y = k
 * @author Epitech Project - Tokenized Asset Platform
 * 
 * Features:
 * - Token/ETH liquidity pool
 * - KYC-compliant trading (only whitelisted users)
 * - Liquidity provider tokens (LP tokens)
 * - 0.3% trading fee for liquidity providers
 * - Pausable for emergencies
 */
contract SimpleDEX is AccessControl, Pausable, ReentrancyGuard {
    // ========== ROLES ==========
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    // ========== STATE VARIABLES ==========
    IERC20 public immutable token;           // The tokenized asset (e.g., FungibleAssetToken)
    KYCRegistry public immutable kycRegistry; // KYC verification contract
    
    uint256 public reserveToken;              // Token reserves in the pool
    uint256 public reserveETH;                // ETH reserves in the pool
    
    uint256 public totalLiquidity;            // Total LP tokens issued
    mapping(address => uint256) public liquidity; // LP tokens per address
    
    uint256 public constant FEE_PERCENT = 3;  // 0.3% fee (3/1000)
    uint256 public constant FEE_DENOMINATOR = 1000;
    
    // ========== EVENTS ==========
    event LiquidityAdded(
        address indexed provider,
        uint256 tokenAmount,
        uint256 ethAmount,
        uint256 liquidityMinted,
        uint256 timestamp
    );
    
    event LiquidityRemoved(
        address indexed provider,
        uint256 tokenAmount,
        uint256 ethAmount,
        uint256 liquidityBurned,
        uint256 timestamp
    );
    
    event TokensPurchased(
        address indexed buyer,
        uint256 ethIn,
        uint256 tokensOut,
        uint256 timestamp
    );
    
    event TokensSold(
        address indexed seller,
        uint256 tokensIn,
        uint256 ethOut,
        uint256 timestamp
    );
    
    event FeesCollected(uint256 tokenFees, uint256 ethFees);
    
    // ========== ERRORS ==========
    error ZeroAddress();
    error ZeroAmount();
    error InsufficientLiquidity();
    error InsufficientOutputAmount();
    error SlippageExceeded();
    error NotWhitelisted();
    error Blacklisted();
    error InsufficientTokenBalance();
    error InsufficientETHBalance();
    error TransferFailed();
    error NoLiquidityToRemove();
    error PoolNotInitialized();
    
    /**
     * @dev Constructor
     * @param token_ Address of the ERC-20 token to trade
     * @param kycRegistry_ Address of the KYC registry contract
     */
    constructor(address token_, address kycRegistry_) {
        if (token_ == address(0)) revert ZeroAddress();
        if (kycRegistry_ == address(0)) revert ZeroAddress();
        
        token = IERC20(token_);
        kycRegistry = KYCRegistry(kycRegistry_);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }
    
    // ========== MODIFIERS ==========
    
    /**
     * @dev Check if address is KYC verified and not blacklisted
     */
    modifier onlyKYCVerified() {
        if (kycRegistry.isBlacklisted(msg.sender)) revert Blacklisted();
        if (!kycRegistry.isWhitelisted(msg.sender)) revert NotWhitelisted();
        _;
    }
    
    // ========== LIQUIDITY FUNCTIONS ==========
    
    /**
     * @notice Add liquidity to the pool
     * @param tokenAmount Amount of tokens to add
     * @dev ETH amount is sent via msg.value
     * @return liquidityMinted Amount of LP tokens minted
     */
    function addLiquidity(uint256 tokenAmount) 
        external 
        payable 
        onlyKYCVerified
        whenNotPaused
        nonReentrant
        returns (uint256 liquidityMinted)
    {
        if (tokenAmount == 0) revert ZeroAmount();
        if (msg.value == 0) revert ZeroAmount();
        
        if (totalLiquidity == 0) {
            // First liquidity provider sets the initial ratio
            liquidityMinted = sqrt(msg.value * tokenAmount);
            if (liquidityMinted == 0) revert InsufficientLiquidity();
            
            totalLiquidity = liquidityMinted;
            liquidity[msg.sender] = liquidityMinted;
            
            reserveETH = msg.value;
            reserveToken = tokenAmount;
            
        } else {
            // Subsequent providers must maintain the current ratio
            uint256 ethAmount = msg.value;
            uint256 tokenReserve = reserveToken;
            uint256 ethReserve = reserveETH;
            
            // Calculate optimal token amount based on ETH sent
            uint256 optimalTokenAmount = (ethAmount * tokenReserve) / ethReserve;
            
            if (tokenAmount < optimalTokenAmount) {
                // User didn't send enough tokens, recalculate ETH needed
                ethAmount = (tokenAmount * ethReserve) / tokenReserve;
                
                // Refund excess ETH
                if (msg.value > ethAmount) {
                    uint256 refund = msg.value - ethAmount;
                    (bool success, ) = msg.sender.call{value: refund}("");
                    if (!success) revert TransferFailed();
                }
            } else {
                tokenAmount = optimalTokenAmount;
            }
            
            // Mint LP tokens proportional to the share of the pool
            liquidityMinted = (ethAmount * totalLiquidity) / ethReserve;
            
            totalLiquidity += liquidityMinted;
            liquidity[msg.sender] += liquidityMinted;
            
            reserveETH += ethAmount;
            reserveToken += tokenAmount;
        }
        
        // Transfer tokens from user to contract
        bool success = token.transferFrom(msg.sender, address(this), tokenAmount);
        if (!success) revert TransferFailed();
        
        emit LiquidityAdded(msg.sender, tokenAmount, msg.value, liquidityMinted, block.timestamp);
        
        return liquidityMinted;
    }
    
    /**
     * @notice Remove liquidity from the pool
     * @param liquidityAmount Amount of LP tokens to burn
     * @return tokenAmount Amount of tokens returned
     * @return ethAmount Amount of ETH returned
     */
    function removeLiquidity(uint256 liquidityAmount)
        external
        onlyKYCVerified
        nonReentrant
        returns (uint256 tokenAmount, uint256 ethAmount)
    {
        if (liquidityAmount == 0) revert ZeroAmount();
        if (liquidity[msg.sender] < liquidityAmount) revert NoLiquidityToRemove();
        
        uint256 totalLiq = totalLiquidity;
        
        // Calculate share of the pool
        ethAmount = (liquidityAmount * reserveETH) / totalLiq;
        tokenAmount = (liquidityAmount * reserveToken) / totalLiq;
        
        if (ethAmount == 0 || tokenAmount == 0) revert InsufficientLiquidity();
        
        // Update state
        liquidity[msg.sender] -= liquidityAmount;
        totalLiquidity -= liquidityAmount;
        reserveETH -= ethAmount;
        reserveToken -= tokenAmount;
        
        // Transfer tokens and ETH back to user
        bool success = token.transfer(msg.sender, tokenAmount);
        if (!success) revert TransferFailed();
        
        (bool ethSuccess, ) = msg.sender.call{value: ethAmount}("");
        if (!ethSuccess) revert TransferFailed();
        
        emit LiquidityRemoved(msg.sender, tokenAmount, ethAmount, liquidityAmount, block.timestamp);
        
        return (tokenAmount, ethAmount);
    }
    
    // ========== SWAP FUNCTIONS ==========
    
    /**
     * @notice Swap ETH for tokens
     * @param minTokens Minimum tokens to receive (slippage protection)
     * @return tokenAmount Amount of tokens received
     */
    function swapETHForTokens(uint256 minTokens)
        external
        payable
        onlyKYCVerified
        whenNotPaused
        nonReentrant
        returns (uint256 tokenAmount)
    {
        if (msg.value == 0) revert ZeroAmount();
        if (reserveToken == 0 || reserveETH == 0) revert PoolNotInitialized();
        
        // Calculate output with 0.3% fee
        uint256 ethWithFee = (msg.value * (FEE_DENOMINATOR - FEE_PERCENT)) / FEE_DENOMINATOR;
        
        // Constant product formula: (x + Δx) * (y - Δy) = x * y
        // Δy = (y * Δx) / (x + Δx)
        tokenAmount = (reserveToken * ethWithFee) / (reserveETH + ethWithFee);
        
        if (tokenAmount < minTokens) revert SlippageExceeded();
        if (tokenAmount >= reserveToken) revert InsufficientLiquidity();
        
        // Update reserves
        reserveETH += msg.value;
        reserveToken -= tokenAmount;
        
        // Transfer tokens to buyer
        bool success = token.transfer(msg.sender, tokenAmount);
        if (!success) revert TransferFailed();
        
        emit TokensPurchased(msg.sender, msg.value, tokenAmount, block.timestamp);
        
        return tokenAmount;
    }
    
    /**
     * @notice Swap tokens for ETH
     * @param tokenAmount Amount of tokens to sell
     * @param minETH Minimum ETH to receive (slippage protection)
     * @return ethAmount Amount of ETH received
     */
    function swapTokensForETH(uint256 tokenAmount, uint256 minETH)
        external
        onlyKYCVerified
        whenNotPaused
        nonReentrant
        returns (uint256 ethAmount)
    {
        if (tokenAmount == 0) revert ZeroAmount();
        if (reserveToken == 0 || reserveETH == 0) revert PoolNotInitialized();
        
        // Calculate output with 0.3% fee
        uint256 tokensWithFee = (tokenAmount * (FEE_DENOMINATOR - FEE_PERCENT)) / FEE_DENOMINATOR;
        
        // Constant product formula
        ethAmount = (reserveETH * tokensWithFee) / (reserveToken + tokensWithFee);
        
        if (ethAmount < minETH) revert SlippageExceeded();
        if (ethAmount >= reserveETH) revert InsufficientLiquidity();
        
        // Transfer tokens from seller
        bool success = token.transferFrom(msg.sender, address(this), tokenAmount);
        if (!success) revert TransferFailed();
        
        // Update reserves
        reserveToken += tokenAmount;
        reserveETH -= ethAmount;
        
        // Transfer ETH to seller
        (bool ethSuccess, ) = msg.sender.call{value: ethAmount}("");
        if (!ethSuccess) revert TransferFailed();
        
        emit TokensSold(msg.sender, tokenAmount, ethAmount, block.timestamp);
        
        return ethAmount;
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @notice Get quote for buying tokens with ETH
     * @param ethAmount Amount of ETH to spend
     * @return tokenAmount Amount of tokens that would be received
     */
    function getTokenQuote(uint256 ethAmount) external view returns (uint256 tokenAmount) {
        if (reserveToken == 0 || reserveETH == 0) return 0;
        
        uint256 ethWithFee = (ethAmount * (FEE_DENOMINATOR - FEE_PERCENT)) / FEE_DENOMINATOR;
        tokenAmount = (reserveToken * ethWithFee) / (reserveETH + ethWithFee);
        
        return tokenAmount;
    }
    
    /**
     * @notice Get quote for selling tokens for ETH
     * @param tokenAmount Amount of tokens to sell
     * @return ethAmount Amount of ETH that would be received
     */
    function getETHQuote(uint256 tokenAmount) external view returns (uint256 ethAmount) {
        if (reserveToken == 0 || reserveETH == 0) return 0;
        
        uint256 tokensWithFee = (tokenAmount * (FEE_DENOMINATOR - FEE_PERCENT)) / FEE_DENOMINATOR;
        ethAmount = (reserveETH * tokensWithFee) / (reserveToken + tokensWithFee);
        
        return ethAmount;
    }
    
    /**
     * @notice Get current token price in ETH (per 1 token with 18 decimals)
     * @return price Price in wei per token
     */
    function getTokenPrice() external view returns (uint256 price) {
        if (reserveToken == 0) return 0;
        return (reserveETH * 1e18) / reserveToken;
    }
    
    /**
     * @notice Get pool information
     * @return _reserveToken Token reserves
     * @return _reserveETH ETH reserves
     * @return _totalLiquidity Total LP tokens
     * @return _tokenPrice Current token price in ETH
     */
    function getPoolInfo() 
        external 
        view 
        returns (
            uint256 _reserveToken,
            uint256 _reserveETH,
            uint256 _totalLiquidity,
            uint256 _tokenPrice
        ) 
    {
        _reserveToken = reserveToken;
        _reserveETH = reserveETH;
        _totalLiquidity = totalLiquidity;
        _tokenPrice = reserveToken > 0 ? (reserveETH * 1e18) / reserveToken : 0;
    }
    
    /**
     * @notice Get user's liquidity information
     * @param user Address to check
     * @return userLiquidity LP tokens owned
     * @return sharePercent Share of pool (in basis points, 10000 = 100%)
     * @return tokenShare Token amount claimable
     * @return ethShare ETH amount claimable
     */
    function getUserLiquidity(address user)
        external
        view
        returns (
            uint256 userLiquidity,
            uint256 sharePercent,
            uint256 tokenShare,
            uint256 ethShare
        )
    {
        userLiquidity = liquidity[user];
        
        if (totalLiquidity > 0 && userLiquidity > 0) {
            sharePercent = (userLiquidity * 10000) / totalLiquidity;
            tokenShare = (userLiquidity * reserveToken) / totalLiquidity;
            ethShare = (userLiquidity * reserveETH) / totalLiquidity;
        }
    }
    
    // ========== ADMIN FUNCTIONS ==========
    
    /**
     * @notice Pause trading and liquidity operations
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @notice Unpause trading and liquidity operations
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    // ========== UTILITY FUNCTIONS ==========
    
    /**
     * @dev Babylonian square root method
     */
    function sqrt(uint256 x) private pure returns (uint256 y) {
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
    
    /**
     * @dev Receive ETH (for liquidity removal and swaps)
     */
    receive() external payable {}
}
