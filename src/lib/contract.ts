// Contract utilities for Encrypted Potion Leaderboard
// This file contains all blockchain interaction logic

export interface LeaderboardEntry {
  rank: number;
  address: string;
  username: string;
  score: number;
  lastUpdated: Date;
}

export interface UserStats {
  address: string;
  highestScore: number;
  currentRank: number;
  totalGames: number;
}

export interface PotionData {
  id: number;
  name: string;
  image: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  value: number; // Hidden from user, used for scoring
}

// Mock data for development
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    address: '0x742d35Cc6634C0532925a3b8A045c7f4B2E3a8F5',
    username: 'AlchemyMaster',
    score: 2450,
    lastUpdated: new Date('2024-01-15'),
  },
  {
    rank: 2,
    address: '0x8ba1f109551bD432803012645Hac136c10138F',
    username: 'PotionWizard',
    score: 2380,
    lastUpdated: new Date('2024-01-14'),
  },
  {
    rank: 3,
    address: '0x9f4E7B8A2D5C3E1F6A8B9C0D1E2F3A4B5C6D7E8F',
    username: 'BrewMaster99',
    score: 2150,
    lastUpdated: new Date('2024-01-13'),
  },
  {
    rank: 4,
    address: '0x1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T',
    username: 'MysticBrewer',
    score: 1980,
    lastUpdated: new Date('2024-01-12'),
  },
  {
    rank: 5,
    address: '0x5F6E7D8C9B0A1F2E3D4C5B6A7F8E9D0C1B2A3F4E',
    username: 'CryptoAlchemist',
    score: 1850,
    lastUpdated: new Date('2024-01-11'),
  },
];

/**
 * Get contract instance (placeholder for future implementation)
 * TODO: Implement actual contract connection
 */
export const connectContract = async () => {
  console.log('TODO: Implement contract connection');
  // return contract instance
  return null;
};

/**
 * Submit potion combination for scoring
 * TODO: Integrate with Zama encryption and contract call
 */
export const submitPotion = async (potions: number[]): Promise<{ success: boolean; score?: number; error?: string }> => {
  try {
    console.log('TODO: Implement Zama encryption for potions:', potions);
    
    // Mock scoring logic (will be replaced with encrypted contract call)
    const mockScore = potions.reduce((sum, potionId) => sum + (potionId * 100), 0) + 
                     Math.floor(Math.random() * 500); // Add some randomness
                     
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      score: mockScore,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit potion',
    };
  }
};

/**
 * Get current leaderboard data
 * TODO: Replace with actual contract call
 */
export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return MOCK_LEADERBOARD;
};

/**
 * Get user statistics
 * TODO: Replace with actual contract call
 */
export const getUserStats = async (address: string): Promise<UserStats> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Find user in mock leaderboard or create default stats
  const userEntry = MOCK_LEADERBOARD.find(entry => 
    entry.address.toLowerCase() === address.toLowerCase()
  );
  
  return {
    address,
    highestScore: userEntry?.score || Math.floor(Math.random() * 1000) + 500,
    currentRank: userEntry?.rank || Math.floor(Math.random() * 50) + 6,
    totalGames: Math.floor(Math.random() * 25) + 5,
  };
};

/**
 * Format address for display
 */
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Generate username from address (placeholder)
 * TODO: Implement ENS resolution or user profile system
 */
export const getUsername = (address: string): string => {
  const entry = MOCK_LEADERBOARD.find(e => 
    e.address.toLowerCase() === address.toLowerCase()
  );
  return entry?.username || formatAddress(address);
};