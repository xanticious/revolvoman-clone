import { Level, Position, GRID_SIZE } from '../types/game';
import { SeededRandom } from './SeededRandom';

/**
 * Generate a random endless level using a seeded random number generator
 */
export function generateEndlessLevel(seed: string): Level {
  const random = new SeededRandom(seed);

  // Generate random counts
  const numBlocks = random.integer(5, 40);
  const numCoins = random.integer(1, 30);

  // Track occupied positions to avoid overlaps
  const occupiedPositions = new Set<string>();

  // Helper function to check if position is valid and unoccupied
  const isValidPosition = (pos: Position): boolean => {
    const key = `${pos.x},${pos.y}`;
    return (
      pos.x >= 0 &&
      pos.x < GRID_SIZE &&
      pos.y >= 0 &&
      pos.y < GRID_SIZE &&
      !occupiedPositions.has(key)
    );
  };

  // Helper function to mark position as occupied
  const occupyPosition = (pos: Position): void => {
    occupiedPositions.add(`${pos.x},${pos.y}`);
  };

  // Generate random positions with retry logic
  const generateRandomPosition = (
    maxAttempts: number = 100
  ): Position | null => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const pos: Position = {
        x: random.integer(0, GRID_SIZE - 1),
        y: random.integer(0, GRID_SIZE - 1),
      };

      if (isValidPosition(pos)) {
        return pos;
      }
    }
    return null; // Failed to find valid position
  };

  // Generate blocks
  const blocks: Position[] = [];
  for (let i = 0; i < numBlocks; i++) {
    const pos = generateRandomPosition();
    if (pos) {
      blocks.push(pos);
      occupyPosition(pos);
    }
  }

  // Generate coins
  const coins: Position[] = [];
  for (let i = 0; i < numCoins; i++) {
    const pos = generateRandomPosition();
    if (pos) {
      coins.push(pos);
      occupyPosition(pos);
    }
  }

  // Generate player start position - should be on the ground or on a block
  let playerStart: Position | null = null;

  // First, try to place player on top of existing blocks
  const groundPositions: Position[] = [];
  for (const block of blocks) {
    const aboveBlock: Position = { x: block.x, y: block.y - 1 };
    if (isValidPosition(aboveBlock)) {
      groundPositions.push(aboveBlock);
    }
  }

  // Also add positions on the ground (bottom row)
  for (let x = 0; x < GRID_SIZE; x++) {
    const groundPos: Position = { x, y: GRID_SIZE - 1 };
    if (isValidPosition(groundPos)) {
      groundPositions.push(groundPos);
    }
  }

  // Choose random ground position
  if (groundPositions.length > 0) {
    const randomIndex = random.integer(0, groundPositions.length - 1);
    playerStart = groundPositions[randomIndex];
  }

  // Fallback: if we can't find a good ground position, just place anywhere
  if (!playerStart) {
    playerStart = generateRandomPosition() || { x: 7, y: 7 }; // Ultimate fallback to center
  }

  // Create level with a unique ID based on the seed hash
  const levelId = Math.abs(
    new SeededRandom(seed).integer(-2147483648, 2147483647)
  );

  return {
    id: levelId,
    playerStart,
    coins,
    blocks,
  };
}

/**
 * Generate a new random seed for endless mode
 */
export function generateRandomEndlessSeed(): string {
  return SeededRandom.generateRandomSeed(16);
}
