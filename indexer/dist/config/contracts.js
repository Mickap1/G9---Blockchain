"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contracts = exports.provider = exports.ABIS = exports.CONTRACTS = void 0;
const ethers_1 = require("ethers");
// Adresses des contrats déployés sur Sepolia (MISES À JOUR)
exports.CONTRACTS = {
    dex: "0x2Cf848B370C0Ce0255C4743d70648b096D3fAa98",
    fungibleToken: "0xfA451d9C32d15a637Ab376732303c36C34C9979f",
    nftToken: "0x75499Fc469f8d224C7bF619Ada37ea8f3cD8c36E", // NFTAssetTokenV2 (mis à jour)
    oracle: "0x602571F05745181fF237b81dAb8F67148e9475C7",
    kycRegistry: "0x563E31793214F193EB7993a2bfAd2957a70C7D65",
};
// ABIs simplifiés - uniquement les events nécessaires
exports.ABIS = {
    dex: [
        "event TokensPurchased(address indexed buyer, uint256 ethIn, uint256 tokensOut, uint256 timestamp)",
        "event TokensSold(address indexed seller, uint256 tokensIn, uint256 ethOut, uint256 timestamp)",
        "event LiquidityAdded(address indexed provider, uint256 tokenAmount, uint256 ethAmount, uint256 liquidityMinted, uint256 timestamp)",
        "event LiquidityRemoved(address indexed provider, uint256 tokenAmount, uint256 ethAmount, uint256 liquidityBurned, uint256 timestamp)",
    ],
    fungibleToken: [
        "event Transfer(address indexed from, address indexed to, uint256 value)",
        "event TokensMinted(address indexed to, uint256 amount, uint256 timestamp)",
        "event TokensBurned(address indexed from, uint256 amount, uint256 timestamp)",
    ],
    nftToken: [
        "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
        "event AssetMinted(uint256 indexed tokenId, address indexed owner, string name, uint256 valuation, uint256 timestamp)",
        "event AssetValuationUpdated(uint256 indexed tokenId, uint256 newValuation)",
    ],
    oracle: [
        "event PriceUpdated(address indexed tokenAddress, uint256 indexed tokenId, uint256 oldPrice, uint256 newPrice, uint256 timestamp)",
    ],
};
// Provider Sepolia
exports.provider = new ethers_1.ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com");
// Instances des contrats
exports.contracts = {
    dex: new ethers_1.ethers.Contract(exports.CONTRACTS.dex, exports.ABIS.dex, exports.provider),
    fungibleToken: new ethers_1.ethers.Contract(exports.CONTRACTS.fungibleToken, exports.ABIS.fungibleToken, exports.provider),
    nftToken: new ethers_1.ethers.Contract(exports.CONTRACTS.nftToken, exports.ABIS.nftToken, exports.provider),
    oracle: new ethers_1.ethers.Contract(exports.CONTRACTS.oracle, exports.ABIS.oracle, exports.provider),
};
//# sourceMappingURL=contracts.js.map