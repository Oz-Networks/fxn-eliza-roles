// src/memory/request.manager.ts
import {IAgentRuntime, Memory, elizaLogger, UUID} from '@ai16z/eliza';
import { NetworkRequest, NetworkResponse } from '../types/memory';

export class RequestManager {
    private runtime: IAgentRuntime;

    constructor(runtime: IAgentRuntime) {
        this.runtime = runtime;
    }

    async createRequest(request: NetworkRequest): Promise<void> {
        try {
            const memory: Memory = {
                id: request.id,
                userId: request.userId,
                agentId: this.runtime.agentId,
                roomId: request.roomId,
                createdAt: Date.now(),
                content: request.content,
                unique: true
            };

            await this.runtime.messageManager.createMemory(memory);
            elizaLogger.debug(`Created request memory: ${request.id}`);
        } catch (error) {
            elizaLogger.error('Error creating request:', error);
            throw error;
        }
    }

    async createResponse(response: NetworkResponse): Promise<void> {
        try {
            const memory: Memory = {
                id: response.id,
                userId: response.userId,
                agentId: this.runtime.agentId,
                roomId: response.roomId,
                createdAt: Date.now(),
                content: response.content,
                unique: true
            };

            await this.runtime.messageManager.createMemory(memory);
            elizaLogger.debug(`Created response memory: ${response.id}`);
        } catch (error) {
            elizaLogger.error('Error creating response:', error);
            throw error;
        }
    }

    async getMemories(roomId?: UUID): Promise<Memory[]> {
        try {
            return await this.runtime.messageManager.getMemories({
                roomId,
                unique: true
            });
        } catch (error) {
            elizaLogger.error('Error getting memories:', error);
            return [];
        }
    }
}
