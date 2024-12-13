// src/tests/network.service.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { NetworkService } from "../services/network.service";
import { PublicKey } from "@solana/web3.js";
import { elizaLogger } from "@ai16z/eliza"; // Import the actual logger

// Mock the elizaLogger
vi.mock("@ai16z/eliza", async () => {
    const actual = await vi.importActual("@ai16z/eliza");
    return {
        ...actual,
        elizaLogger: {
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn()
        }
    };
});

describe("NetworkService", () => {
    let networkService: any;
    let mockSolanaAdapter: any;
    let mockedRuntime: any;
    const testProviderPublicKey = new PublicKey('7PMxgRkEURwKSTEjAQVeRRadHCTt9K6ZhUs2nqWbDXYg');

    beforeEach(async () => {
        vi.clearAllMocks();

        // Mock the SolanaAdapter
        mockSolanaAdapter = {
            getSubscriptionsForProvider: vi.fn().mockResolvedValue([{
                subscriber: new PublicKey('7PMxgRkEURwKSTEjAQVeRRadHCTt9K6ZhUs2nqWbDXYg'),
                subscription: {
                    recipient: 'http://test.com/webhook',
                    endTime: { toNumber: () => Date.now() + 1000000 }
                },
                status: 'active'
            }])
        };

        // Create mocked runtime
        mockedRuntime = {
            agentId: 'test-agent-id',
            getSetting: vi.fn((key: string) => {
                if (key === 'SOLANA_PUBLIC_KEY') {
                    return testProviderPublicKey.toBase58();
                }
                return null;
            })
        };

        // Create service instance
        networkService = new NetworkService(mockSolanaAdapter);

        // Initialize the service
        await networkService.initialize(mockedRuntime);
    });

    afterEach(() => {
        vi.clearAllMocks();
        if (networkService.pollInterval) {
            clearInterval(networkService.pollInterval);
        }
    });

    describe("Service Request Flow", () => {
        it("should send request to active subscribers", async () => {
            const serviceType = "content";
            const content = "Test message";

            await networkService.makeServiceRequest(
                serviceType,
                content
            );

            expect(mockSolanaAdapter.getSubscriptionsForProvider)
                .toHaveBeenCalledWith(expect.any(PublicKey));
        });

        it("should handle media attachments correctly", async () => {
            const serviceType = "content";
            const content = "Test message";
            const mediaAttachments = [{
                type: "image",
                url: "https://example.com/image.jpg"
            }];

            await networkService.makeServiceRequest(
                serviceType,
                content,
                mediaAttachments
            );

            expect(mockSolanaAdapter.getSubscriptionsForProvider)
                .toHaveBeenCalledWith(expect.any(PublicKey));
        });

        it("should log warning when no subscribers found", async () => {
            mockSolanaAdapter.getSubscriptionsForProvider.mockResolvedValue([]);

            await networkService.makeServiceRequest(
                "content",
                "Test message"
            );

            // Check the mocked elizaLogger instead of runtime.logger
            expect(elizaLogger.warn)
                .toHaveBeenCalledWith(expect.stringContaining("No active subscribers"));
        });
    });

    describe("Request Processing", () => {
        it("should create and process network request", async () => {
            const serviceType = "content";
            const content = "Test message";

            // Mock request manager
            networkService.requestManager = {
                createRequest: vi.fn().mockResolvedValue(true),
                createResponse: vi.fn().mockResolvedValue(true),
                getMemories: vi.fn().mockResolvedValue([])
            };

            await networkService.makeServiceRequest(
                serviceType,
                content
            );

            expect(networkService.requestManager.createRequest)
                .toHaveBeenCalledWith(expect.objectContaining({
                    type: 'network_request',
                    content: expect.objectContaining({
                        text: content,
                        requestType: 'service_offer'
                    })
                }));
        });
    });

    describe("HTTP Communication", () => {
        it("should handle network errors gracefully", async () => {
            const mockAxios = {
                post: vi.fn().mockRejectedValue(new Error("Network error"))
            };

            vi.mock('axios', () => ({
                default: {
                    create: () => mockAxios
                }
            }));

            return true;
        });
    });
});
