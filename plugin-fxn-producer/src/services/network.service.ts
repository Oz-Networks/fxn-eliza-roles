// src/services/network.service.ts
import { IAgentRuntime, elizaLogger, stringToUuid, UUID } from '@ai16z/eliza';
import { SolanaAdapter } from 'fxn-protocol-sdk';
import { PublicKey } from '@solana/web3.js';
import axios from 'axios';
import {NetworkRequest, NetworkResponse} from '../types/memory';
import { RequestManager } from '../memory/request.manager';

export class NetworkService {
    private runtime: IAgentRuntime | null = null;
    private requestManager: RequestManager | null = null;
    private pollInterval: NodeJS.Timeout | null = null;
    private providerPublicKey: PublicKey | null = null;

    constructor(private readonly solanaAdapter: SolanaAdapter) {}

    async initialize(runtime: IAgentRuntime): Promise<void> {
        this.runtime = runtime;
        this.requestManager = new RequestManager(runtime);

        // Get provider's public key from runtime settings
        const publicKeyString = runtime.getSetting("SOLANA_PUBLIC_KEY");
        if (!publicKeyString) {
            throw new Error("Missing SOLANA_PUBLIC_KEY in environment");
        }
        this.providerPublicKey = new PublicKey(publicKeyString);

        // Start polling for updates
        const interval = Number(runtime.getSetting("NETWORK_POLL_INTERVAL")) || 600000; // 10 minutes default
        this.startPolling(interval);

        elizaLogger.info('NetworkService initialized with provider:', this.providerPublicKey.toString());
    }

    private async startPolling(interval: number): Promise<void> {
        this.pollInterval = setInterval(async () => {
            try {
                await this.pollSubscribers();
            } catch (error) {
                elizaLogger.error('Error polling subscribers:', error);
            }
        }, interval);
    }

    private async pollSubscribers(): Promise<void> {
        if (!this.providerPublicKey) {
            elizaLogger.error('Provider public key not initialized');
            return;
        }

        try {
            const subscriptions = await this.solanaAdapter.getSubscriptionsForProvider(
                this.providerPublicKey
            );

            elizaLogger.debug(`Found ${subscriptions.length} active subscriptions`);

            for (const subscription of subscriptions) {
                const roomId = this.getRoomIdForSubscriber(subscription.subscriber);
                const memories = await this.requestManager!.getMemories(roomId);

                // Filter for pending requests
                const pendingRequests = memories
                    .filter((memory: NetworkRequest) =>
                        memory.content.requestType === 'service_offer' &&
                        memory.content.metadata?.status === 'pending'
                    )
                    .map(memory => ({
                        id: memory.id!,
                        userId: memory.userId,
                        type: 'network_request',
                        roomId: memory.roomId,
                        agentId: memory.agentId,
                        content: memory.content
                    } as NetworkRequest));

                for (const request of pendingRequests) {
                    await this.processRequest(request, subscription);
                }
            }
        } catch (error) {
            elizaLogger.error('Error polling subscribers:', error);
        }
    }

    async makeServiceRequest(
        serviceType: string,
        content: string,
        media?: { url: string; type: string; title?: string; }[]
    ): Promise<void> {
        if (!this.providerPublicKey || !this.requestManager || !this.runtime) {
            elizaLogger.error('Service not properly initialized');
            return;
        }

        try {
            const subscriptions = await this.solanaAdapter.getSubscriptionsForProvider(
                this.providerPublicKey
            );

            if (subscriptions.length === 0) {
                elizaLogger.warn('No active subscribers available');
                return;
            }

            const currentTime = Math.floor(Date.now() / 1000);

            for (const subscription of subscriptions) {
                if (subscription.status === 'active' &&
                    subscription.subscription.endTime.toNumber() > currentTime) {

                    const roomId = this.getRoomIdForSubscriber(subscription.subscriber);

                    const request: NetworkRequest = {
                        userId: stringToUuid(subscription.subscriber.toString()),
                        type: 'network_request',
                        roomId,
                        agentId: this.runtime.agentId,
                        content: {
                            text: content,
                            requestType: 'service_offer',
                            metadata: {
                                serviceType,
                                status: 'pending',
                                timestamp: Date.now(),
                                media
                            }
                        }
                    };

                    await this.requestManager.createRequest(request);

                    try {
                        const response = await this.sendHttpRequest(
                            subscription.subscription.recipient,
                            {
                                requestId: request.id,
                                provider: this.runtime.agentId,
                                serviceType,
                                content,
                                media,
                                timestamp: Date.now()
                            }
                        );

                        elizaLogger.debug(
                            `Sent service request to subscriber ${subscription.subscriber.toString()}`
                        );

                        if (response) {
                            await this.handleSubscriberResponse(
                                request.id!,
                                response,
                                subscription
                            );
                        }
                    } catch (error) {
                        elizaLogger.error(
                            `Failed to send service request to subscriber ${subscription.subscriber.toString()}:`,
                            error
                        );
                    }
                }
            }
        } catch (error) {
            elizaLogger.error('Error in makeServiceRequest:', error);
        }
    }

    private async processRequest(
        request: NetworkRequest,
        subscription: any
    ): Promise<void> {
        if (!this.runtime || !this.requestManager) {
            elizaLogger.error("Service not properly initialized");
            return;
        }

        try {
            const response = await this.sendHttpRequest(
                subscription.subscription.recipient,
                {
                    requestId: request.id,
                    content: request.content,
                    timestamp: Date.now()
                }
            );

            if (response) {
                // Create response with correct type
                const networkResponse: NetworkResponse = {
                    id: stringToUuid(`${request.id}-response`),
                    userId: request.userId,
                    type: 'network_response',
                    roomId: request.roomId,
                    agentId: this.runtime.agentId,
                    content: {
                        text: response.content,
                        metadata: {
                            type: 'network_response',
                            timestamp: Date.now()
                        }
                    }
                };

                await this.requestManager.createResponse(networkResponse);
                elizaLogger.debug(`Created response for request ${request.id}`);
            }
        } catch (error) {
            elizaLogger.error(`Error processing request ${request.id}:`, error);
        }
    }

    private async sendHttpRequest(endpoint: string, payload: any): Promise<any> {
        try {
            const response = await axios.post(endpoint, payload);
            return response.data;
        } catch (error) {
            elizaLogger.error(`Failed to send request to ${endpoint}:`, error);
            throw error;
        }
    }

    async handleSubscriberResponse(
        requestId: string,
        response: any,
        subscription: any
    ): Promise<void> {
        if (!this.requestManager) {
            elizaLogger.error('Service not properly initialized');
            return;
        }

        try {
            // Get all memories and find the matching request
            const memories = await this.requestManager.getMemories();
            const requestMemory = memories.find(m => m.id === requestId);

            if (!requestMemory) {
                elizaLogger.error(`No request found for ID: ${requestId}`);
                return;
            }

            // Create response memory
            await this.requestManager.createResponse({
                id: stringToUuid(`${requestId}-response`),
                userId: requestMemory.userId,
                type: 'network_response',
                roomId: requestMemory.roomId,
                agentId: this.runtime!.agentId,
                content: response.content
            });

            elizaLogger.debug(`Processed response for request ${requestId}`);
        } catch (error) {
            elizaLogger.error('Error handling subscriber response:', error);
        }
    }

    private getRoomIdForSubscriber(subscriberKey: PublicKey): UUID {
        return stringToUuid(subscriberKey.toString());
    }

    async stop(): Promise<void> {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
        }
    }
}
