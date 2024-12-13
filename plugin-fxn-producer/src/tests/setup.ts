// src/tests/setup.ts

const TEST_PRIVATE_KEY = '5jEPW5WpKmqUjJtaJ3vrnjitNfPbCnwvcTxVrJhZpS1hyR8zXihJdGkzbjpLfbXpKAynmjBTZu4uh1ybFpAbnW2p';

// Set environment variables before any imports
process.env.SOLANA_PRIVATE_KEY = TEST_PRIVATE_KEY;
process.env.FXN_NETWORK = 'true';
process.env.NETWORK_POLL_INTERVAL = '600000';
process.env.SOLANA_NETWORK = 'devnet';

import { beforeAll, afterAll, vi } from 'vitest';

// Global test setup
beforeAll(() => {
    // Set test environment
    process.env.NODE_ENV = 'test';
});

// Global test teardown
afterAll(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Clear environment variables
    delete process.env.FXN_NETWORK;
    delete process.env.SOLANA_PRIVATE_KEY;
});

// Global mocks
vi.mock('node-cache', () => {
    return {
        default: vi.fn().mockImplementation(() => ({
            set: vi.fn(),
            get: vi.fn().mockReturnValue(null),
        })),
    };
});

// Mock FXN SDK client
vi.mock('@fxn/sdk', () => {
    return {
        FXNClient: vi.fn().mockImplementation(() => ({
            initialize: vi.fn().mockResolvedValue(true),
            getSubscribers: vi.fn().mockResolvedValue([]),
            sendRequest: vi.fn().mockResolvedValue({ success: true }),
        })),
    };
});
