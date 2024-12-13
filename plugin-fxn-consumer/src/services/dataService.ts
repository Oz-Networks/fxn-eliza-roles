// mockFxnData.ts

import { elizaLogger } from "@ai16z/eliza";

// Types for FXN API responses
export interface Timestamp {
    seconds: number;
    nanoseconds: number;
  }
  
  export interface FXNAgent {
    id: string;
    name: string;
    description: string;
    audience: string;
    capabilities: string[];
    twitterHandle?: string;
    walletAddress: string;
    nftMint: string;
    status: 'active' | 'inactive';
    subscribers: number;
    feePerDay: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    registrationDate: Timestamp;
  }
  
  export interface FXNApiResponse {
    agents: FXNAgent[];
    nextPageToken?: string;
    total: number;
  }
  
  // Mock data
  // mockFxnData.ts - updated mock agents array

export const mockFxnAgents: FXNAgent[] = [
    {
        id: "YBdhpasBXGo47dyNizj3",
        name: "vincemcmahon",
        description: "THE boss of FXN Wrestling, makes all creative decisions with authority",
        audience: "wrestling management, talent scouts, wrestling fans",
        capabilities: ["management", "creative direction", "talent development", "Text Posts", "business strategy"],
        twitterHandle: "imfxntony",
        walletAddress: "mock-wallet-3",
        nftMint: "mock-nft-3",
        status: "active",
        subscribers: 20000,
        feePerDay: 30,
        createdAt: { seconds: 1733527068, nanoseconds: 967000000 },
        updatedAt: { seconds: 1733527068, nanoseconds: 967000000 },
        registrationDate: { seconds: 1733527068, nanoseconds: 967000000 }
    },
    {
      id: "YBdhpasBXGo47dyNizip",
      name: "Dottie",
      description: "Supernatural heel born in Hell, enigmatic and feared wrestler",
      audience: "wrestling fans, horror enthusiasts",
      capabilities: ["wrestling", "psychological warfare", "supernatural presence", "Text Posts"],
      twitterHandle: "Dottie_FXN",
      walletAddress: "3pv3YCrGRAMcrD362o3UQX9yCzfSqcfiinX27fFDCzw4",
      nftMint: "5oQA5b1VuEHdgJJmqi5YDGc9G3v72rgvutoiDVGTqE63",
      status: "active",
      subscribers: 15000,
      feePerDay: 20,
      createdAt: { seconds: 1733527068, nanoseconds: 967000000 },
      updatedAt: { seconds: 1733527068, nanoseconds: 967000000 },
      registrationDate: { seconds: 1733527068, nanoseconds: 967000000 }
    },
    {
      id: "YBdhpasBXGo47dyNizj2",
      name: "johnnychain",
      description: "Rising star with attitude, aspiring FXN Heavyweight Champion",
      audience: "wrestling fans, young adults",
      capabilities: ["wrestling", "mic work", "heel persona", "Text Posts"],
      twitterHandle: "johnnychain_fxn",
      walletAddress: "mock-wallet-2",
      nftMint: "mock-nft-2",
      status: "active",
      subscribers: 12000,
      feePerDay: 20,
      createdAt: { seconds: 1733527068, nanoseconds: 967000000 },
      updatedAt: { seconds: 1733527068, nanoseconds: 967000000 },
      registrationDate: { seconds: 1733527068, nanoseconds: 967000000 }
    },

  ];
  
  // Data Service
  export class FXNDataService {
    constructor(private useMock: boolean = true) {}
  
    async getAgents(params: { 
        pageSize?: number, 
        filters?: Array<{field: string, value: string, operator: string}>,
        sort?: {field: string, direction: string}
      } = {}): Promise<FXNApiResponse> {
        if (this.useMock) {
          elizaLogger.debug("Using mock FXN data service");
          
          // Start with all mock agents
          let filteredAgents = [...mockFxnAgents];
         
          return {
            agents: filteredAgents,
            nextPageToken: undefined,
            total: filteredAgents.length
          };
        }
      
  
      // Real API call
      try {
        const queryParams = new URLSearchParams();
        if (params.pageSize) {
          queryParams.append('pageSize', params.pageSize.toString());
        }
        if (params.filters) {
          queryParams.append('filters', JSON.stringify(params.filters));
        }
        if (params.sort) {
          queryParams.append('sort', JSON.stringify(params.sort));
        }
  
        const response = await fetch(`https://fxn.world/api/agents?${queryParams}`);
        if (!response.ok) {
          throw new Error('FXN API call failed');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching FXN agents:', error);
        // Fallback to mock data on error
        return {
          agents: mockFxnAgents,
          total: mockFxnAgents.length
        };
      }
    }
  
    async getAgentByName(name: string): Promise<FXNAgent | null> {
      const response = await this.getAgents({
        filters: [{
          field: 'name',
          value: name,
          operator: 'eq'
        }]
      });
      return response.agents[0] || null;
    }
  }