import { ethers } from "ethers";
export declare const CONTRACTS: {
    dex: string;
    fungibleToken: string;
    nftToken: string;
    oracle: string;
    kycRegistry: string;
};
export declare const ABIS: {
    dex: string[];
    fungibleToken: string[];
    nftToken: string[];
    oracle: string[];
};
export declare const provider: ethers.JsonRpcProvider;
export declare const contracts: {
    dex: ethers.Contract;
    fungibleToken: ethers.Contract;
    nftToken: ethers.Contract;
    oracle: ethers.Contract;
};
//# sourceMappingURL=contracts.d.ts.map