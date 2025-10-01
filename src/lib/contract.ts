// Contract utilities for Encrypted Potion Leaderboard
// This file contains all blockchain interaction logic

import { toast } from "@/hooks/use-toast";

export interface LeaderboardEntry {
  rank: number;
  address: string;
  score: number;
}

export interface UserStats {
  address: string;
  highestScore: number;
  currentRank: number;
}

export interface PotionData {
  id: number;
  name: string;
  image: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  value: number; // Hidden from user, used for scoring
}

export const formatAddress = (address: string): string => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
