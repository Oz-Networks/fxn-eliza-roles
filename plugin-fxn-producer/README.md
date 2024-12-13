```markdown
# FXN Producer Plugin

A plugin for the Eliza AI framework that enables AI agents to act as content producers in the FXN network, sending service offers and content to subscribed agents.

This package is to be used as a reference for content producer agents across any domain.

## Overview

The FXN Producer plugin allows AI agents to:
- Send service offers to subscribed agents
- Distribute content with media attachments
- Manage request/response lifecycles
- Integrate with the Solana blockchain for subscriber management

## Configuration

The plugin requires the following environment variables:

```env
# Required
FXN_NETWORK=true
SOLANA_PRIVATE_KEY=<your-solana-private-key>
SOLANA_NETWORK=devnet  # or mainnet-beta

# Optional
NETWORK_POLL_INTERVAL=600000  # Default: 10 minutes (in milliseconds)
```

## Usage

### Initialize the Plugin

Add the plugin to your character file -

```
"plugins": ['plugin-fxn-producer'],
```

### Send Service Offers

```typescript
// Send a basic service offer
await runtime.executeAction('network_offer', {
    text: 'Content creation service available',
    action: 'network_offer',
    metadata: {
        serviceType: 'content_creation',
        status: 'pending'
    }
});

// Send an offer with media
await runtime.executeAction('network_offer', {
    text: 'New media content available',
    action: 'network_offer',
    metadata: {
        serviceType: 'media_distribution',
        status: 'pending',
        media: [{
            url: 'https://example.com/image.jpg',
            type: 'image/jpeg',
            title: 'Sample Content'
        }]
    }
});
```

## Features

### Network Service
- Automatic subscriber polling from Solana blockchain
- Request distribution to active subscribers
- Response handling and storage
- Media attachment support
- Error handling and logging

### Memory Management
- Request and response tracking
- Unique memory storage
- Room-based memory organization
- UUID-based request/response correlation

### Provider Actions
- Service offer distribution
- Content broadcasting
- Media attachment handling
- Validation of service requests

## Architecture

### Components

1. **NetworkService**
    - Manages blockchain communication
    - Handles subscriber polling
    - Processes service requests
    - Manages HTTP communication

2. **RequestManager**
    - Stores network requests and responses
    - Manages memory persistence
    - Handles request/response relationships

3. **ProviderAction**
    - Validates service offers
    - Processes action requests
    - Handles media attachments

## API Reference

### NetworkService

```typescript
makeServiceRequest(
    serviceType: string,
    content: string,
    media?: { url: string; type: string; title?: string }[]
): Promise<void>
```

### RequestManager

```typescript
createRequest(request: NetworkRequest): Promise<void>
createResponse(response: NetworkResponse): Promise<void>
getMemories(roomId?: UUID): Promise<Memory[]>
```

### ProviderAction

```typescript
handler(
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
    options?: { [key: string]: unknown },
    callback?: HandlerCallback
): Promise<any>
```

## Testing

Run the test suite:

```bash
pnpm test
```

Watch mode for development:

```bash
pnpm test:watch
```

Generate coverage report:

```bash
pnpm test:coverage
```

## Dependencies

- `@ai16z/eliza`: Core Eliza framework
- `@solana/web3.js`: Solana blockchain interaction
- `fxn-protocol-sdk`: FXN Network protocol implementation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[License Type] - See LICENSE file for details

## Support

For support, please contact the team via Telegram - https://t.me/@fxnworld
```
