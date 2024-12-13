import {
    Plugin,
} from "@ai16z/eliza";

import { discoverAction } from "./actions/discover";

export const fxnConsumerPlugin: Plugin = {
    name: "fxn consumer",
    description: "FXN Plugin for agent discovery",
    actions: [discoverAction]
};

export default fxnConsumerPlugin;
