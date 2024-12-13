// src/providers/network.provider.ts
import {Provider, IAgentRuntime, elizaLogger, Memory, State} from '@ai16z/eliza';
import { NetworkService } from '../services/network.service';
import { SolanaAdapter } from 'fxn-protocol-sdk';
import {AnchorProvider, Wallet} from '@coral-xyz/anchor';
import {Connection, Keypair, Transaction, VersionedTransaction} from '@solana/web3.js';
import bs58 from 'bs58';
import {loadNetworkConfig} from "@/config/environment.ts";

interface NetworkRequestContent {
    text: string;
    metadata?: {
        serviceType: string;
        status: string;
        media?: Array<{
            url: string;
            type: string;
            title?: string;
        }>;
    };
}

export class NetworkProvider implements Provider {
    private service: NetworkService | null = null;
    private solanaAdapter: SolanaAdapter | null = null;

    /**
     * Initializes the provider with necessary services
     * @param runtime Agent runtime instance
     */
    async initialize(runtime: IAgentRuntime): Promise<void> {
        const config = loadNetworkConfig();

        if (!config['FXN_NETWORK']) {
            return;
        }

        try {
            // Get wallet credentials from runtime settings
            const privateKeyString = runtime.getSetting("SOLANA_PRIVATE_KEY");
            const publicKeyString = runtime.getSetting("SOLANA_PUBLIC_KEY");

            if (!privateKeyString || !publicKeyString) {
                throw new Error("Missing Solana wallet credentials in environment");
            }

            // Create Keypair from private key
            const privateKeyBytes = bs58.decode(privateKeyString);
            const keypair = Keypair.fromSecretKey(privateKeyBytes);

            // Verify public key matches
            if (keypair.publicKey.toString() !== publicKeyString) {
                throw new Error("Public key mismatch with derived keypair");
            }

            // Create AnchorProvider with properly typed wallet
            const connection = new Connection(config['SOLANA_RPC_URL'], 'confirmed');
            const wallet: Wallet = {
                publicKey: keypair.publicKey,
                payer: keypair,
                signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => {
                    if (tx instanceof Transaction) {
                        tx.partialSign(keypair);
                    } else {
                        tx.sign([keypair]);
                    }
                    return tx;
                },
                signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => {
                    return txs.map(tx => {
                        if (tx instanceof Transaction) {
                            tx.partialSign(keypair);
                        } else {
                            tx.sign([keypair]);
                        }
                        return tx;
                    });
                }
            };

            const provider = new AnchorProvider(
                connection,
                wallet,
                { commitment: 'confirmed' }
            );

            this.solanaAdapter = new SolanaAdapter(provider);
            this.service = new NetworkService(this.solanaAdapter);
            await this.service.initialize(runtime);

            elizaLogger.info('NetworkProvider initialized successfully with wallet:',
                keypair.publicKey.toString());
        } catch (error) {
            elizaLogger.error('Failed to initialize NetworkProvider:', error);
            throw error;
        }
    }


    /**
     * Implementation of Provider interface get method
     * @param runtime Agent runtime instance
     * @param message Memory object containing the request
     * @param state Optional state object
     * @returns Promise resolving to the network response
     */
    async get(
        runtime: IAgentRuntime,
        message: Memory,
        state?: State
    ): Promise<any> {
        if (!this.service) {
            throw new Error('NetworkProvider not properly initialized');
        }

        try {
            // Type assertion for the content structure we expect
            const content = message.content as NetworkRequestContent;

            if (!content.metadata?.serviceType) {
                throw new Error('Missing serviceType in request');
            }

            // Handle media attachments if present
            const media = content.metadata.media || [];

            // Make service request through network service
            await this.service.makeServiceRequest(
                content.metadata.serviceType,
                content.text,
                media
            );

            // Return the request status
            return {
                status: 'pending',
                message: 'Service request sent to network',
                requestId: message.id,
                timestamp: Date.now()
            };
        } catch (error) {
            elizaLogger.error('Error in NetworkProvider get:', error);
            throw error;
        }
    }

    getService(): NetworkService | null {
        return this.service;
    }

    async stop(): Promise<void> {
        if (this.service) {
            await this.service.stop();
        }
    }
}
