// src/actions/provider.action.ts
import { Action, IAgentRuntime, elizaLogger, Memory, State, HandlerCallback, ActionExample } from '@ai16z/eliza';
import { NetworkService } from '../services/network.service';

export class ProviderAction implements Action {
    // Similar action descriptions for pattern matching
    similes = [
        "send a service offer to subscribers",
        "publish content to the network",
        "broadcast service availability",
        "distribute content to subscribers"
    ];

    // Detailed description of what the action does
    description = "Sends service offers and content to subscribed network participants";

    // Example usages of the action
    examples: ActionExample[][] = [
        [{
            user: "agent",
            content: {
                text: "Send content offer to network",
                action: "network_offer",
                source: "agent",
                metadata: {
                    serviceType: "content_creation",
                    status: "pending"
                }
            }
        }],
        [{
            user: "agent",
            content: {
                text: "Distribute media to subscribers",
                action: "network_offer",
                source: "agent",
                metadata: {
                    serviceType: "media_distribution",
                    status: "pending",
                    media: [{
                        url: "https://example.com/image.jpg",
                        type: "image/jpeg",
                        title: "Sample Content"
                    }]
                }
            }
        }]
    ];

    // Action name for identification
    name = "network_offer";

    constructor(
        private service: NetworkService,
        private runtime: IAgentRuntime
    ) {}

    /**
     * Handler implementation for the action
     */
    async handler(
        runtime: IAgentRuntime,
        message: Memory,
        state?: State,
        options?: { [key: string]: unknown },
        callback?: HandlerCallback
    ): Promise<any> {
        try {
            const content: any = message.content;

            if (!content.metadata?.serviceType) {
                throw new Error('Service type is required');
            }

            await this.service.makeServiceRequest(
                content.metadata.serviceType,
                content.text,
                content.metadata.media
            );

            const response = {
                text: `Service offer sent: ${content.metadata.serviceType}`,
                action: this.name,
                source: "network_provider",
                metadata: {
                    status: "sent",
                    timestamp: Date.now()
                }
            };

            // If callback is provided, use it to create response memory
            if (callback) {
                await callback(response);
            }

            return response;
        } catch (error) {
            elizaLogger.error('Error in network_offer handler:', error);
            throw error;
        }
    }

    /**
     * Validates whether this action should handle the message
     */
    async validate(
        runtime: IAgentRuntime,
        message: any,
        state?: State
    ): Promise<boolean> {
        try {
            // Check if this is a network offer request
            if (!message.content.action || message.content.action !== this.name) {
                return false;
            }

            // Verify required fields
            if (!message.content.metadata?.serviceType) {
                return false;
            }

            // Check if there's valid content
            if (!message.content.text || message.content.text.trim().length === 0) {
                return false;
            }

            // If media is present, validate media items
            if (message.content.metadata.media) {
                const mediaValid = message.content.metadata.media.every(item =>
                    item.url && item.type &&
                    item.url.startsWith('http') &&
                    item.type.includes('/')
                );
                if (!mediaValid) {
                    return false;
                }
            }

            return true;
        } catch (error) {
            elizaLogger.error('Error validating network_offer:', error);
            return false;
        }
    }
}
