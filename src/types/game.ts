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
  isPlayerAtTerminalVelocity: boolean; // New: track if player is at max fall speed
  boardRotation: number; // 0, 90, 180, 270 degrees
  boardOrientation: BoardOrientation; // Which direction is "down"
  isRotating: boolean; // Animation state
  rotationDirection: number; // -90 for CCW, 90 for CW
  rotationProgress: number; // 0 to 1 for smooth animation
  // Smooth rotation physics
  rotationPosition: number; // Current rotation position in degrees (can be fractional)
  rotationVelocity: number; // Current rotation velocity in degrees/second
  rotationAcceleration: number; // Current rotation acceleration in degrees/second^2
  rotationStartTime: number; // When the rotation started (in milliseconds)
  coins: Position[];
  blocks: Position[];
  originalLevel: Level; // Store original level data for restart
  timeRemaining: number;
  isGameRunning: boolean;
  isLevelComplete: boolean;
  isGameOver: boolean;
  // Precision timing for best times/medals
  precisionStartTime: number | null; // performance.now() when level actually starts
  precisionEndTime: number | null; // performance.now() when last coin is collected
  completionTime: number | null; // calculated time in milliseconds
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
  | { type: 'START_PRECISION_TIMER' } // Called when actual gameplay begins
  | { type: 'PAUSE_GAME' }
  | { type: 'LOAD_LEVEL'; level: Level };

export const GRID_SIZE = 15;
export const CELL_SIZE = 32; // pixels
export const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
export const GAME_DURATION = 20; // seconds

// Falling physics constants
export const GRAVITY = 15.0; // blocks per second^2
export const TERMINAL_VELOCITY = 8.0; // blocks per second (max falling speed)
