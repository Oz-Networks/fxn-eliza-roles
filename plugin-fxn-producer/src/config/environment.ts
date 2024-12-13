import {Keypair, Transaction} from "@solana/web3.js";
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
export const REQUIRED_ENV_VARS = [
    "FXN_NETWORK",
    "NETWORK_POLL_INTERVAL",
    "SOLANA_PRIVATE_KEY",
    "SOLANA_NETWORK",
] as const;

export interface NetworkConfig {
    enabled: boolean;
    pollInterval: number;
    wallet: {
        publicKey: Keypair['publicKey'];
        signTransaction: Function;
        signAllTransactions: Function;
    };
    solanaNetwork: string;
}

export function loadNetworkConfig(): NetworkConfig {
    const privateKey = process.env.SOLANA_PRIVATE_KEY;
    if (!privateKey) {
        throw new Error("SOLANA_PRIVATE_KEY is required");
    }

    // Decode base58 private key
    const decodedKey = bs58.decode(privateKey);
    const keypair = Keypair.fromSecretKey(decodedKey);

    return {
        enabled: process.env.FXN_NETWORK === "true",
        pollInterval: parseInt(process.env.NETWORK_POLL_INTERVAL || "600000", 10),
        wallet: {
            publicKey: keypair.publicKey,
            signTransaction: async (tx: Transaction) => {
                tx.sign(keypair);
                return tx;
            },
            signAllTransactions: async (txs: Transaction[]) => {
                txs.forEach(tx => tx.sign(keypair));
                return txs;
            },
        },
        solanaNetwork: process.env.SOLANA_NETWORK || "devnet",
    };
}

export function validateNetworkConfig(config: NetworkConfig): void {
    if (config.enabled) {
        if (!config.wallet) {
            throw new Error("Wallet configuration is required when FXN_NETWORK is enabled");
        }
        if (config.pollInterval < 60000) {
            throw new Error("NETWORK_POLL_INTERVAL must be at least 60000 (1 minute)");
        }
    }
}
