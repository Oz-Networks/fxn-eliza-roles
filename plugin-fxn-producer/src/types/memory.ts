// src/types/memory.ts
import { UUID } from '@ai16z/eliza';

export interface NetworkRequest {
    id?: UUID;
    userId: UUID;
    type: 'network_request';
    roomId: UUID;
    agentId: UUID;
    content: {
        text: string;
        requestType: 'service_offer';
        metadata?: {
            serviceType: string;
            status: 'pending' | 'completed';
            timestamp: number;
            media?: {
                url: string;
                type: string;
                title?: string;
            }[];
        };
    };
}

export interface NetworkResponse {
    id: UUID;
    userId: UUID;
    type: 'network_response';
    roomId: UUID;
    agentId: UUID;
    content: {
        text: string;
        metadata?: {
            type: 'network_response';
            timestamp: number;
        };
    };
}
