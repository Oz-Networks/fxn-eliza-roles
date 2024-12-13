import { ServiceType } from "@ai16z/eliza";
import { AnchorProvider } from "@coral-xyz/anchor";
import {NetworkResponse} from "@/types/memory.ts";

export const FXN_NETWORK_SERVICE = "FXN_NETWORK" as ServiceType;

export interface NetworkServiceConfig {
    pollInterval: number;
    solanaNetwork: string;
    wallet: AnchorProvider['wallet'];
}

export interface NetworkServiceEvents {
    "network:request:accepted": {
        requestId: string;
        responses: NetworkResponse[];
    };
    "network:request:completed": {
        requestId: string;
        status: "completed" | "failed";
        result: string;
    };
}
