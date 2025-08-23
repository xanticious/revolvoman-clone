import { Level } from '../types/game';

export const campaignLevels: Level[] = [
  {
    id: 1,
    playerStart: { x: 7, y: 13 }, // Center bottom, with room to fall to ground
    coins: [
      { x: 9, y: 13 }, // Just to the right, simple first level
    ],
    blocks: [
      // Ground blocks
      { x: 6, y: 14 },
      { x: 7, y: 14 },
      { x: 8, y: 14 },
      { x: 9, y: 14 },
      { x: 10, y: 14 },
    ],
  },
  // More levels will be added later
];

export function getLevel(levelId: number): Level | null {
  return campaignLevels.find((level) => level.id === levelId) || null;
}
