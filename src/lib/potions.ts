// Potion data and utilities
import potionHealth from '@/assets/potion-health.png';
import potionMana from '@/assets/potion-mana.png';
import potionStrength from '@/assets/potion-strength.png';
import potionPoison from '@/assets/potion-poison.png';
import potionInvisibility from '@/assets/potion-invisibility.png';
import potionSpeed from '@/assets/potion-speed.png';
import potionFrost from '@/assets/potion-frost.png';
import potionFire from '@/assets/potion-fire.png';

export interface Potion {
  id: number;
  name: string;
  image: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  // Hidden value used for scoring (not shown to user)
  value: number;
}

export const POTIONS: Potion[] = [
  {
    id: 1,
    name: 'Health Elixir',
    image: potionHealth,
    rarity: 'common',
    description: 'Restores vitality and heals wounds',
    value: 100,
  },
  {
    id: 2,
    name: 'Mana Draught',
    image: potionMana,
    rarity: 'common',
    description: 'Replenishes magical energy',
    value: 120,
  },
  {
    id: 3,
    name: 'Strength Brew',
    image: potionStrength,
    rarity: 'rare',
    description: 'Enhances physical power temporarily',
    value: 180,
  },
  {
    id: 4,
    name: 'Toxic Vial',
    image: potionPoison,
    rarity: 'rare',
    description: 'Deadly poison for coating weapons',
    value: 200,
  },
  {
    id: 5,
    name: 'Phantom Essence',
    image: potionInvisibility,
    rarity: 'epic',
    description: 'Grants temporary invisibility',
    value: 300,
  },
  {
    id: 6,
    name: 'Lightning Serum',
    image: potionSpeed,
    rarity: 'epic',
    description: 'Dramatically increases movement speed',
    value: 280,
  },
  {
    id: 7,
    name: 'Frost Tincture',
    image: potionFrost,
    rarity: 'legendary',
    description: 'Freezes enemies in their tracks',
    value: 400,
  },
  {
    id: 8,
    name: 'Inferno Catalyst',
    image: potionFire,
    rarity: 'legendary',
    description: 'Unleashes devastating fire magic',
    value: 450,
  },
];

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export const shufflePotions = (potions: Potion[]): Potion[] => {
  const shuffled = [...potions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Get rarity color for styling
 */
export const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'common':
      return 'text-gray-400';
    case 'rare':
      return 'text-blue-400';
    case 'epic':
      return 'text-purple-400';
    case 'legendary':
      return 'text-magic-gold';
    default:
      return 'text-gray-400';
  }
};

/**
 * Get rarity border color for styling
 */
export const getRarityBorder = (rarity: string): string => {
  switch (rarity) {
    case 'common':
      return 'border-gray-400/30';
    case 'rare':
      return 'border-blue-400/50';
    case 'epic':
      return 'border-purple-400/60';
    case 'legendary':
      return 'border-magic-gold/70';
    default:
      return 'border-gray-400/30';
  }
};