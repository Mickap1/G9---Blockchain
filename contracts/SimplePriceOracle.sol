// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title SimplePriceOracle
 * @dev Oracle pour gérer les prix des actifs tokenisés
 * @notice Permet de mettre à jour et récupérer les prix des tokens (NFT et fungible)
 * @author Epitech Project - Tokenized Asset Platform
 */
contract SimplePriceOracle is AccessControl, Pausable {
    // ========== ROLES ==========
    bytes32 public constant ORACLE_ADMIN_ROLE = keccak256("ORACLE_ADMIN_ROLE");
    bytes32 public constant PRICE_UPDATER_ROLE = keccak256("PRICE_UPDATER_ROLE");
    
    // ========== STRUCTURES ==========
    
    struct PriceData {
        uint256 price;           // Prix en wei (ou unité de base)
        uint256 lastUpdate;      // Timestamp de la dernière mise à jour
        uint256 updateCount;     // Nombre de mises à jour
        bool isActive;           // Prix actif ou non
    }
    
    struct PriceHistory {
        uint256 price;
        uint256 timestamp;
    }
    
    // ========== STATE VARIABLES ==========
    
    // Mapping: tokenAddress => PriceData
    mapping(address => PriceData) public prices;
    
    // Mapping: tokenAddress => tokenId => PriceData (pour les NFTs)
    mapping(address => mapping(uint256 => PriceData)) public nftPrices;
    
    // Historique des prix (max 100 derniers prix par token)
    mapping(address => PriceHistory[]) public priceHistory;
    mapping(address => mapping(uint256 => PriceHistory[])) public nftPriceHistory;
    
    uint256 public constant MAX_HISTORY_LENGTH = 100;
    
    // ========== EVENTS ==========
    
    event PriceUpdated(
        address indexed tokenAddress,
        uint256 indexed tokenId,
        uint256 oldPrice,
        uint256 newPrice,
        uint256 timestamp
    );
    
    event PriceActivated(address indexed tokenAddress, uint256 indexed tokenId);
    event PriceDeactivated(address indexed tokenAddress, uint256 indexed tokenId);
    
    // ========== ERRORS ==========
    
    error PriceNotActive();
    error InvalidPrice();
    error TokenNotFound();
    
    // ========== CONSTRUCTOR ==========
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_ADMIN_ROLE, msg.sender);
        _grantRole(PRICE_UPDATER_ROLE, msg.sender);
    }
    
    // ========== PRICE UPDATE FUNCTIONS ==========
    
    /**
     * @notice Mettre à jour le prix d'un token fungible ou NFT collection
     * @param tokenAddress Adresse du contrat token
     * @param newPrice Nouveau prix en wei
     */
    function updatePrice(address tokenAddress, uint256 newPrice) 
        external 
        onlyRole(PRICE_UPDATER_ROLE) 
        whenNotPaused 
    {
        if (newPrice == 0) revert InvalidPrice();
        
        PriceData storage data = prices[tokenAddress];
        uint256 oldPrice = data.price;
        
        // Mettre à jour les données
        data.price = newPrice;
        data.lastUpdate = block.timestamp;
        data.updateCount++;
        data.isActive = true;
        
        // Ajouter à l'historique
        _addToHistory(tokenAddress, newPrice);
        
        emit PriceUpdated(tokenAddress, 0, oldPrice, newPrice, block.timestamp);
    }
    
    /**
     * @notice Mettre à jour le prix d'un NFT spécifique
     * @param tokenAddress Adresse du contrat NFT
     * @param tokenId ID du token
     * @param newPrice Nouveau prix en wei
     */
    function updateNFTPrice(
        address tokenAddress, 
        uint256 tokenId, 
        uint256 newPrice
    ) 
        external 
        onlyRole(PRICE_UPDATER_ROLE) 
        whenNotPaused 
    {
        if (newPrice == 0) revert InvalidPrice();
        
        PriceData storage data = nftPrices[tokenAddress][tokenId];
        uint256 oldPrice = data.price;
        
        // Mettre à jour les données
        data.price = newPrice;
        data.lastUpdate = block.timestamp;
        data.updateCount++;
        data.isActive = true;
        
        // Ajouter à l'historique
        _addToNFTHistory(tokenAddress, tokenId, newPrice);
        
        emit PriceUpdated(tokenAddress, tokenId, oldPrice, newPrice, block.timestamp);
    }
    
    /**
     * @notice Mettre à jour plusieurs prix en batch
     * @param tokenAddresses Liste des adresses de tokens
     * @param newPrices Liste des nouveaux prix
     */
    function batchUpdatePrices(
        address[] calldata tokenAddresses,
        uint256[] calldata newPrices
    ) 
        external 
        onlyRole(PRICE_UPDATER_ROLE) 
        whenNotPaused 
    {
        require(tokenAddresses.length == newPrices.length, "Length mismatch");
        
        for (uint256 i = 0; i < tokenAddresses.length; i++) {
            if (newPrices[i] == 0) revert InvalidPrice();
            
            PriceData storage data = prices[tokenAddresses[i]];
            uint256 oldPrice = data.price;
            
            data.price = newPrices[i];
            data.lastUpdate = block.timestamp;
            data.updateCount++;
            data.isActive = true;
            
            _addToHistory(tokenAddresses[i], newPrices[i]);
            
            emit PriceUpdated(tokenAddresses[i], 0, oldPrice, newPrices[i], block.timestamp);
        }
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @notice Récupérer le prix actuel d'un token
     * @param tokenAddress Adresse du token
     * @return Prix actuel en wei
     */
    function getPrice(address tokenAddress) external view returns (uint256) {
        PriceData memory data = prices[tokenAddress];
        if (!data.isActive) revert PriceNotActive();
        return data.price;
    }
    
    /**
     * @notice Récupérer le prix d'un NFT spécifique
     * @param tokenAddress Adresse du contrat NFT
     * @param tokenId ID du token
     * @return Prix actuel en wei
     */
    function getNFTPrice(address tokenAddress, uint256 tokenId) 
        external 
        view 
        returns (uint256) 
    {
        PriceData memory data = nftPrices[tokenAddress][tokenId];
        if (!data.isActive) revert PriceNotActive();
        return data.price;
    }
    
    /**
     * @notice Récupérer toutes les données de prix d'un token
     * @param tokenAddress Adresse du token
     * @return PriceData structure complète
     */
    function getPriceData(address tokenAddress) 
        external 
        view 
        returns (PriceData memory) 
    {
        return prices[tokenAddress];
    }
    
    /**
     * @notice Récupérer l'historique des prix d'un token
     * @param tokenAddress Adresse du token
     * @return Tableau de l'historique des prix
     */
    function getPriceHistory(address tokenAddress) 
        external 
        view 
        returns (PriceHistory[] memory) 
    {
        return priceHistory[tokenAddress];
    }
    
    /**
     * @notice Récupérer l'historique des prix d'un NFT
     * @param tokenAddress Adresse du contrat NFT
     * @param tokenId ID du token
     * @return Tableau de l'historique des prix
     */
    function getNFTPriceHistory(address tokenAddress, uint256 tokenId) 
        external 
        view 
        returns (PriceHistory[] memory) 
    {
        return nftPriceHistory[tokenAddress][tokenId];
    }
    
    /**
     * @notice Vérifier si un prix est actif
     * @param tokenAddress Adresse du token
     * @return true si actif, false sinon
     */
    function isPriceActive(address tokenAddress) external view returns (bool) {
        return prices[tokenAddress].isActive;
    }
    
    /**
     * @notice Calculer la variation de prix en pourcentage
     * @param tokenAddress Adresse du token
     * @return Variation en basis points (1% = 100 bp)
     */
    function getPriceChange(address tokenAddress) 
        external 
        view 
        returns (int256) 
    {
        PriceHistory[] memory history = priceHistory[tokenAddress];
        if (history.length < 2) return 0;
        
        uint256 latestPrice = history[history.length - 1].price;
        uint256 previousPrice = history[history.length - 2].price;
        
        if (previousPrice == 0) return 0;
        
        // Calculer changement en basis points (10000 bp = 100%)
        int256 change = int256((latestPrice * 10000) / previousPrice) - 10000;
        return change;
    }
    
    // ========== ADMIN FUNCTIONS ==========
    
    /**
     * @notice Activer/désactiver un prix
     * @param tokenAddress Adresse du token
     * @param active true pour activer, false pour désactiver
     */
    function setPriceActive(address tokenAddress, bool active) 
        external 
        onlyRole(ORACLE_ADMIN_ROLE) 
    {
        prices[tokenAddress].isActive = active;
        
        if (active) {
            emit PriceActivated(tokenAddress, 0);
        } else {
            emit PriceDeactivated(tokenAddress, 0);
        }
    }
    
    /**
     * @notice Mettre en pause l'oracle
     */
    function pause() external onlyRole(ORACLE_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @notice Reprendre l'oracle
     */
    function unpause() external onlyRole(ORACLE_ADMIN_ROLE) {
        _unpause();
    }
    
    // ========== INTERNAL FUNCTIONS ==========
    
    /**
     * @dev Ajouter un prix à l'historique (max 100 entrées)
     */
    function _addToHistory(address tokenAddress, uint256 price) internal {
        PriceHistory[] storage history = priceHistory[tokenAddress];
        
        // Limiter la taille de l'historique
        if (history.length >= MAX_HISTORY_LENGTH) {
            // Décaler tous les éléments vers la gauche
            for (uint256 i = 0; i < history.length - 1; i++) {
                history[i] = history[i + 1];
            }
            history.pop();
        }
        
        history.push(PriceHistory({
            price: price,
            timestamp: block.timestamp
        }));
    }
    
    /**
     * @dev Ajouter un prix NFT à l'historique
     */
    function _addToNFTHistory(
        address tokenAddress, 
        uint256 tokenId, 
        uint256 price
    ) internal {
        PriceHistory[] storage history = nftPriceHistory[tokenAddress][tokenId];
        
        if (history.length >= MAX_HISTORY_LENGTH) {
            for (uint256 i = 0; i < history.length - 1; i++) {
                history[i] = history[i + 1];
            }
            history.pop();
        }
        
        history.push(PriceHistory({
            price: price,
            timestamp: block.timestamp
        }));
    }
}
