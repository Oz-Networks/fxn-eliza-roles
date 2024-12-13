// src/actions/index.ts
import { IAgentRuntime } from '@ai16z/eliza';
import { NetworkService } from '../services/network.service';
import { ProviderAction } from './provider.action';

export function createActions(service: NetworkService, runtime: IAgentRuntime) {
    return {
        provider: new ProviderAction(service, runtime)
    };
}

export type Actions = ReturnType<typeof createActions>;
