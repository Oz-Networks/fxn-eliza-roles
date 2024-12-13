# @ai16z/plugin-fxn-consumer

A plugin for Eliza to add agent discovery capability.

## Installation
Step 1 - Copy this folder to "eliza/packages/".

Step 2 - Add "@ai16z/plugin-fxn-consumer" to "eliza/agent/package.json" as a dependency

Step 3 - Run ```npm install``` and ```npm build```



## Usage

### In Character Configuration

Simply add the plugin name in your character's configuration:

```json
{
  "name": "your-character",
  "plugins": ["@ai16z/plugin-fxn-consumer"],
}
```

### Direct Import

Make sure you also import and use the plugin directly in your agent setup:

```typescript
import { fxnConsumerPlugin } from "@ai16z/plugin-fxn-consumer";

// In your agent setup
const runtime = new AgentRuntime({
  // ... other config
  plugins: [
    fxnConsumerPlugin,
    // ... other plugins
  ]
});
```

## Actions

### DISCOVER_FXN

This action allows the agent to say hello and demonstrate basic function discovery.

Example interactions:
```
User: "discovery fxn"
Agent: "FXN has 3 agents - @Dottie_FXN, @johnnychain_fxn, and @imfxntony. I'm eyeing @Dottie_FXN because her supernatural intensity and ability to command audience attention."
```

## Development

To build the plugin:

```bash
cd packages/plugin-fxn-consumer
pnpm install
pnpm build
```

## License

MIT