import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

// Adresses des contrats déployés
export const CONTRACTS = {
  kycRegistry: "0x8E4312166Ed927C331B5950e5B8ac636841f06Eb",
  token: "0x6B2a38Ef30420B0AF041F014a092BEDB39F2Eb81",
  dex: "0x28B2c6b3C1C9F09ca86e6B7cc8d0b9f0Bd7CE7F4",
  oracle: "0x602571F05745181fF237b81dAb8F67148e9475C7",
};

// Provider
export const provider = new ethers.JsonRpcProvider(
  process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com"
);

// ABIs simplifiés (events seulement)
export const KYC_ABI = [
  "event KYCSubmitted(address indexed user, string dataURI, uint256 timestamp)",
  "event KYCApproved(address indexed user, uint256 expiryDate, uint256 timestamp)",
  "event KYCRejected(address indexed user, string reason, uint256 timestamp)",
  "event AddressBlacklisted(address indexed user, string reason, uint256 timestamp)",
  "event KYCRevoked(address indexed user, string reason, uint256 timestamp)",
];

export const TOKEN_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event TokensMinted(address indexed to, uint256 amount, uint256 timestamp)",
  "event TokensBurned(address indexed from, uint256 amount, uint256 timestamp)",
];

export const DEX_ABI = [
  "event TokensPurchased(address indexed buyer, uint256 ethIn, uint256 tokensOut, uint256 timestamp)",
  "event TokensSold(address indexed seller, uint256 tokensIn, uint256 ethOut, uint256 timestamp)",
  "event LiquidityAdded(address indexed provider, uint256 tokenAmount, uint256 ethAmount, uint256 liquidityMinted, uint256 timestamp)",
  "event LiquidityRemoved(address indexed provider, uint256 tokenAmount, uint256 ethAmount, uint256 liquidityBurned, uint256 timestamp)",
];

export const ORACLE_ABI = [
  "event PriceUpdated(address indexed tokenAddress, uint256 indexed tokenId, uint256 oldPrice, uint256 newPrice, uint256 timestamp)",
];

// Instances des contrats
export const kycContract = new ethers.Contract(CONTRACTS.kycRegistry, KYC_ABI, provider);
export const tokenContract = new ethers.Contract(CONTRACTS.token, TOKEN_ABI, provider);
export const dexContract = new ethers.Contract(CONTRACTS.dex, DEX_ABI, provider);
export const oracleContract = new ethers.Contract(CONTRACTS.oracle, ORACLE_ABI, provider);