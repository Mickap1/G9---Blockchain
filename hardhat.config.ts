import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const isValidPrivateKey = PRIVATE_KEY && PRIVATE_KEY.length === 64;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    ...(isValidPrivateKey && {
      sepolia: {
        url: process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
        accounts: [PRIVATE_KEY],
        chainId: 11155111,
      },
      amoy: {
        url: process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology",
        accounts: [PRIVATE_KEY],
        chainId: 80002,
      },
    }),
  },
  etherscan: {
    // Use single API key (Etherscan API V2)
    apiKey: process.env.ETHERSCAN_API_KEY || "",
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
  },
};

export default config;
