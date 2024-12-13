// src/index.ts
import { Plugin, IAgentRuntime } from '@ai16z/eliza';
import { NetworkProvider } from './providers/network.provider';
import { createActions, Actions } from './actions';
import { loadNetworkConfig } from './config/environment';

export class NetworkPlugin implements Plugin {
    private provider: NetworkProvider | null = null;
    private actions: Actions | null = null;

    async initialize(runtime: IAgentRuntime): Promise<void> {
        const config = loadNetworkConfig();

        if (!config['FXN_NETWORK']) {
            return;
        }

        this.provider = new NetworkProvider();
        await this.provider.initialize(runtime);

        const service = this.provider.getService();
        if (service) {
            this.actions = createActions(service, runtime);
        }
    }

    getProvider(): NetworkProvider | null {
        return this.provider;
    }

    getActions(): Actions | null {
        return this.actions;
    }

    async stop(): Promise<void> {
        if (this.provider) {
            await this.provider.stop();
        }
    }
}

export default NetworkPlugin;
