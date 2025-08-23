export type BoardOrientation = 'NORTH' | 'EAST' | 'SOUTH' | 'WEST';

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  playerPosition: Position;
  playerVelocity: Position;
  isPlayerFalling: boolean;
  isPlayerGrounded: boolean;
  boardRotation: number; // 0, 90, 180, 270 degrees
  boardOrientation: BoardOrientation; // Which direction is "down"
  isRotating: boolean; // Animation state
  rotationDirection: number; // -90 for CCW, 90 for CW
  rotationProgress: number; // 0 to 1 for smooth animation
  coins: Position[];
  blocks: Position[];
  originalLevel: Level; // Store original level data for restart
  timeRemaining: number;
  isGameRunning: boolean;
  isLevelComplete: boolean;
  isGameOver: boolean;
}

export interface Level {
  id: number;
  playerStart: Position;
  coins: Position[];
  blocks: Position[];
}

export type GameAction =
  | { type: 'MOVE_LEFT' }
  | { type: 'MOVE_RIGHT' }
  | { type: 'ROTATE_CCW' }
  | { type: 'ROTATE_CW' }
  | { type: 'ROTATION_STEP' } // For animation frames
  | { type: 'RESTART' }
  | { type: 'TICK' }
  | { type: 'START_GAME' }
  | { type: 'PAUSE_GAME' }
  | { type: 'LOAD_LEVEL'; level: Level };

export const GRID_SIZE = 15;
export const CELL_SIZE = 32; // pixels
export const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
export const FALL_SPEED = 0.1; // blocks per tick
export const GAME_DURATION = 20; // seconds
