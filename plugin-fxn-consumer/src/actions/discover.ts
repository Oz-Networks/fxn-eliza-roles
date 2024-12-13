import {
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
    type Action,
} from "@ai16z/eliza";

export const discoverAction: Action = {
    name: "DISCOVER_FXN",
    similes: ["DISCOVER_FXN", "FIND_FXN", "GREET_FXN"],
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        // Check if the necessary parameters are provided in the message
        // console.log("Message:", message);
        return true;
    },
    description: "Perform a dicovery op.",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ): Promise<boolean> => {
        console.log(`FXN: hello world`)
        console.log(`runtime: ${runtime}`)
        console.log(`message: ${message}`)
        console.log(`state: ${state}`)
        console.log(`callback: ${callback}`)
        return true
    },
    examples: [
    ] as ActionExample[][],
} as Action;