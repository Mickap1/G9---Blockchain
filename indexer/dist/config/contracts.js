"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contracts = exports.provider = exports.ABIS = exports.CONTRACTS = void 0;
const ethers_1 = require("ethers");
// Adresses des contrats déployés sur Sepolia
exports.CONTRACTS = {
    dex: "0x28B2c6b3C1C9F09ca86e6B7cc8d0b9f0Bd7CE7F4",
    fungibleToken: "0x6B2a38Ef30420B0AF041F014a092BEDB39F2Eb81",
    nftToken: "0xcC1fA977E3c47D3758117De61218208c1282362c",
    oracle: "0x602571F05745181fF237b81dAb8F67148e9475C7",
    kycRegistry: "0x8E4312166Ed927C331B5950e5B8ac636841f06Eb",
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