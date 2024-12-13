import { FXNDataService, FXNAgent, mockFxnAgents } from './mockFxnData';

// Mock the fetch function
global.fetch = jest.fn();

describe('FXNDataService', () => {
  let service: FXNDataService;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('with mock data (useMock=true)', () => {
    beforeEach(() => {
      service = new FXNDataService(true);
    });

    it('should return all mock agents when no filters are provided', async () => {
      const result = await service.getAgents();
      expect(result.agents).toEqual(mockFxnAgents);
      expect(result.total).toBe(mockFxnAgents.length);
      expect(result.nextPageToken).toBeUndefined();
    });

    it('should find an agent by name', async () => {
      const result = await service.getAgentByName('Dottie');
      expect(result).toBeTruthy();
      expect(result?.name).toBe('Dottie');
      expect(result?.walletAddress).toBe('3pv3YCrGRAMcrD362o3UQX9yCzfSqcfiinX27fFDCzw4');
    });

    it('should return null for non-existent agent name', async () => {
      const result = await service.getAgentByName('NonExistentAgent');
      expect(result).toBeNull();
    });
  });

  describe('with real API (useMock=false)', () => {
    beforeEach(() => {
      service = new FXNDataService(false);
    });

    it('should make API call with correct parameters', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ agents: [], total: 0 })
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const params = {
        pageSize: 10,
        filters: [{ field: 'status', value: 'active', operator: 'eq' }],
        sort: { field: 'name', direction: 'asc' }
      };

      await service.getAgents(params);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      const fetchUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
      
      // Verify URL parameters
      expect(fetchUrl).toContain('pageSize=10');
      expect(fetchUrl).toContain(encodeURIComponent(JSON.stringify(params.filters)));
      expect(fetchUrl).toContain(encodeURIComponent(JSON.stringify(params.sort)));
    });

    it('should handle API errors by falling back to mock data', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      const result = await service.getAgents();
      
      expect(result.agents).toEqual(mockFxnAgents);
      expect(result.total).toBe(mockFxnAgents.length);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle non-ok API responses by falling back to mock data', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await service.getAgents();
      
      expect(result.agents).toEqual(mockFxnAgents);
      expect(result.total).toBe(mockFxnAgents.length);
    });
  });
});