import { useReducer, useEffect, useCallback } from 'react';
import {
  GameState,
  GameAction,
  Level,
  GAME_DURATION,
  GRAVITY,
  TERMINAL_VELOCITY,
  BoardOrientation,
} from '../types/game';
import {
  canPlayerMoveWithOrientation,
  applyMovementWithOrientation,
  checkCoinCollection,
  getOrientationFromRotation,
  isPlayerGroundedWithOrientation,
  getGravityDirection,
} from '../utils/gameLogic';

// Rotation physics constants
const ROTATION_DURATION = 800; // Total rotation duration in milliseconds (0.4 seconds)
const UP_JERK = 1500; // degrees/second^3 - positive jerk for acceleration phase
const UP_JERK_DURATION = 0.5; // 50% of total duration for acceleration
const DOWN_JERK = -1500; // degrees/second^3 - negative jerk for deceleration phase

// Calculate rotation position using jerk-based physics
function calculateRotationPosition(
  elapsedTime: number,
  targetAngle: number
): {
  position: number;
  velocity: number;
  acceleration: number;
  isComplete: boolean;
} {
  const t = elapsedTime / 1000; // Convert to seconds
  const totalDuration = ROTATION_DURATION / 1000; // Convert to seconds
  const upDuration = totalDuration * UP_JERK_DURATION;

  if (t >= totalDuration) {
    return {
      position: targetAngle,
      velocity: 0,
      acceleration: 0,
      isComplete: true,
    };
  }

  let position: number;
  let velocity: number;
  let acceleration: number;

  if (t <= upDuration) {
    // Acceleration phase with positive jerk
    const jerk = UP_JERK * (targetAngle / 90); // Scale jerk based on rotation direction
    acceleration = jerk * t;
    velocity = 0.5 * jerk * t * t;
    position = (1 / 6) * jerk * t * t * t;
  } else {
    // Deceleration phase with negative jerk
    const t1 = upDuration;
    const t2 = t - upDuration;

    // Values at end of acceleration phase
    const jerk1 = UP_JERK * (targetAngle / 90);
    const acc1 = jerk1 * t1;
    const vel1 = 0.5 * jerk1 * t1 * t1;
    const pos1 = (1 / 6) * jerk1 * t1 * t1 * t1;

    // Deceleration phase
    const jerk2 = DOWN_JERK * (targetAngle / 90);
    acceleration = acc1 + jerk2 * t2;
    velocity = vel1 + acc1 * t2 + 0.5 * jerk2 * t2 * t2;
    position =
      pos1 + vel1 * t2 + 0.5 * acc1 * t2 * t2 + (1 / 6) * jerk2 * t2 * t2 * t2;
  }

  return {
    position,
    velocity,
    acceleration,
    isComplete: false,
  };
}

// Apply realistic falling physics
function applyFallingPhysics(
  playerPos: { x: number; y: number },
  playerVelocity: { x: number; y: number },
  blocks: { x: number; y: number }[],
  orientation: BoardOrientation,
  deltaTime: number
): {
  newPosition: { x: number; y: number };
  newVelocity: { x: number; y: number };
  isAtTerminalVelocity: boolean;
} {
  const gravityDir = getGravityDirection(orientation);

  // Calculate current velocity component in gravity direction
  let gravityVelocity =
    gravityDir.x !== 0
      ? playerVelocity.x * gravityDir.x
      : playerVelocity.y * gravityDir.y;

  // Apply gravity acceleration
  gravityVelocity += GRAVITY * deltaTime;

  // Cap at terminal velocity
  const isAtTerminalVelocity = gravityVelocity >= TERMINAL_VELOCITY;
  if (isAtTerminalVelocity) {
    gravityVelocity = TERMINAL_VELOCITY;
  }

  // Calculate new velocity vector
  const newVelocity = {
    x: gravityDir.x !== 0 ? gravityVelocity * gravityDir.x : playerVelocity.x,
    y: gravityDir.y !== 0 ? gravityVelocity * gravityDir.y : playerVelocity.y,
  };

  // Calculate position change
  const deltaPos = {
    x: newVelocity.x * deltaTime,
    y: newVelocity.y * deltaTime,
  };

  // Calculate target position with fractional coordinates
  const targetPos = {
    x: playerPos.x + deltaPos.x,
    y: playerPos.y + deltaPos.y,
  };

  // Helper function to check if a grid position is blocked
  const isBlocked = (gridX: number, gridY: number): boolean => {
    // Check boundaries
    if (gridX < 0 || gridX >= 15 || gridY < 0 || gridY >= 15) {
      return true;
    }
    // Check blocks
    return blocks.some((block) => block.x === gridX && block.y === gridY);
  };

  // Check collision based on movement direction
  let collisionPos: { x: number; y: number } | null = null;

  if (gravityDir.y > 0) {
    // Falling down - check if we hit the bottom boundary or a block below
    const belowGridY = Math.floor(targetPos.y + 1);
    const currentGridX = Math.round(targetPos.x);

    if (belowGridY >= 15 || isBlocked(currentGridX, belowGridY)) {
      // Hit boundary or block below, stop at the top of that cell
      collisionPos = { x: targetPos.x, y: belowGridY - 1 };
    }
  } else if (gravityDir.y < 0) {
    // Falling up - check if we hit the top boundary or a block above
    const aboveGridY = Math.ceil(targetPos.y - 1);
    const currentGridX = Math.round(targetPos.x);

    if (aboveGridY < 0 || isBlocked(currentGridX, aboveGridY)) {
      // Hit boundary or block above, stop at the bottom of that cell
      collisionPos = { x: targetPos.x, y: aboveGridY + 1 };
    }
  } else if (gravityDir.x > 0) {
    // Falling right - check if we hit the right boundary or a block to the right
    const rightGridX = Math.floor(targetPos.x + 1);
    const currentGridY = Math.round(targetPos.y);

    if (rightGridX >= 15 || isBlocked(rightGridX, currentGridY)) {
      // Hit boundary or block to the right, stop at the left of that cell
      collisionPos = { x: rightGridX - 1, y: targetPos.y };
    }
  } else if (gravityDir.x < 0) {
    // Falling left - check if we hit the left boundary or a block to the left
    const leftGridX = Math.ceil(targetPos.x - 1);
    const currentGridY = Math.round(targetPos.y);

    if (leftGridX < 0 || isBlocked(leftGridX, currentGridY)) {
      // Hit boundary or block to the left, stop at the right of that cell
      collisionPos = { x: leftGridX + 1, y: targetPos.y };
    }
  }

  // If there's a collision, stop at the collision point
  if (collisionPos) {
    return {
      newPosition: collisionPos,
      newVelocity: { x: 0, y: 0 }, // Stop all velocity on collision
      isAtTerminalVelocity: false,
    };
  }

  // No collision, continue moving
  return {
    newPosition: targetPos,
    newVelocity,
    isAtTerminalVelocity,
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'LOAD_LEVEL':
      return {
        ...state,
        playerPosition: action.level.playerStart,
        coins: [...action.level.coins],
        blocks: [...action.level.blocks],
        originalLevel: action.level,
        timeRemaining: GAME_DURATION,
        isLevelComplete: false,
        isGameOver: false,
        isGameRunning: false,
        boardRotation: 0,
        boardOrientation: 'NORTH',
        isRotating: false,
        rotationDirection: 0,
        rotationProgress: 0,
        rotationPosition: 0,
        rotationVelocity: 0,
        rotationAcceleration: 0,
        rotationStartTime: 0,
        isPlayerFalling: false,
        isPlayerGrounded: false,
        isPlayerAtTerminalVelocity: false,
        precisionStartTime: null,
        precisionEndTime: null,
        completionTime: null,
      };

    case 'START_GAME':
      return {
        ...state,
        isGameRunning: true,
        timeRemaining: GAME_DURATION,
      };

    case 'START_PRECISION_TIMER':
      return {
        ...state,
        precisionStartTime: performance.now(),
        precisionEndTime: null,
        completionTime: null,
      };

    case 'PAUSE_GAME':
      return {
        ...state,
        isGameRunning: !state.isGameRunning,
      };

    case 'RESTART':
      return {
        ...state,
        playerPosition: state.originalLevel.playerStart,
        coins: [...state.originalLevel.coins],
        blocks: [...state.originalLevel.blocks],
        timeRemaining: GAME_DURATION,
        isLevelComplete: false,
        isGameOver: false,
        isGameRunning: false, // Changed to false to trigger countdown
        boardRotation: 0,
        boardOrientation: 'NORTH',
        isRotating: false,
        rotationDirection: 0,
        rotationProgress: 0,
        rotationPosition: 0,
        rotationVelocity: 0,
        rotationAcceleration: 0,
        rotationStartTime: 0,
        isPlayerFalling: false,
        isPlayerGrounded: false,
        isPlayerAtTerminalVelocity: false,
        precisionStartTime: null,
        precisionEndTime: null,
        completionTime: null,
      };

    case 'MOVE_LEFT':
      if (
        !state.isGameRunning ||
        state.isPlayerFalling ||
        state.isLevelComplete ||
        state.isRotating
      ) {
        return state;
      }

      if (
        canPlayerMoveWithOrientation(
          state.playerPosition,
          'left',
          state.blocks,
          state.boardOrientation
        )
      ) {
        const newPosition = applyMovementWithOrientation(
          state.playerPosition,
          'left',
          state.boardOrientation
        );
        const remainingCoins = checkCoinCollection(newPosition, state.coins);
        const isLevelComplete = remainingCoins.length === 0;

        // Calculate completion time if level is completed and we have a start time
        let precisionEndTime = state.precisionEndTime;
        let completionTime = state.completionTime;

        if (
          isLevelComplete &&
          state.precisionStartTime &&
          !state.precisionEndTime
        ) {
          precisionEndTime = performance.now();
          completionTime = precisionEndTime - state.precisionStartTime;
        }

        return {
          ...state,
          playerPosition: newPosition,
          coins: remainingCoins,
          isLevelComplete,
          precisionEndTime,
          completionTime,
          playerVelocity: { x: 0, y: 0 }, // Reset velocity on horizontal movement
        };
      }
      return state;

    case 'MOVE_RIGHT':
      if (
        !state.isGameRunning ||
        state.isPlayerFalling ||
        state.isLevelComplete ||
        state.isRotating
      ) {
        return state;
      }

      if (
        canPlayerMoveWithOrientation(
          state.playerPosition,
          'right',
          state.blocks,
          state.boardOrientation
        )
      ) {
        const newPosition = applyMovementWithOrientation(
          state.playerPosition,
          'right',
          state.boardOrientation
        );
        const remainingCoins = checkCoinCollection(newPosition, state.coins);
        const isLevelComplete = remainingCoins.length === 0;

        // Calculate completion time if level is completed and we have a start time
        let precisionEndTime = state.precisionEndTime;
        let completionTime = state.completionTime;

        if (
          isLevelComplete &&
          state.precisionStartTime &&
          !state.precisionEndTime
        ) {
          precisionEndTime = performance.now();
          completionTime = precisionEndTime - state.precisionStartTime;
        }

        return {
          ...state,
          playerPosition: newPosition,
          coins: remainingCoins,
          isLevelComplete,
          precisionEndTime,
          completionTime,
          playerVelocity: { x: 0, y: 0 }, // Reset velocity on horizontal movement
        };
      }
      return state;

    case 'ROTATE_CCW':
      if (
        !state.isGameRunning ||
        state.isPlayerFalling ||
        state.isLevelComplete ||
        state.isRotating
      ) {
        return state;
      }

      return {
        ...state,
        isRotating: true,
        rotationDirection: -90,
        rotationProgress: 0,
        rotationPosition: 0,
        rotationVelocity: 0,
        rotationAcceleration: 0,
        rotationStartTime: Date.now(),
      };

    case 'ROTATE_CW':
      if (
        !state.isGameRunning ||
        state.isPlayerFalling ||
        state.isLevelComplete ||
        state.isRotating
      ) {
        return state;
      }

      return {
        ...state,
        isRotating: true,
        rotationDirection: 90,
        rotationProgress: 0,
        rotationPosition: 0,
        rotationVelocity: 0,
        rotationAcceleration: 0,
        rotationStartTime: Date.now(),
      };

    case 'ROTATION_STEP':
      if (!state.isRotating) {
        return state;
      }

      const currentTime = Date.now();
      const elapsedTime = currentTime - state.rotationStartTime;

      const rotationPhysics = calculateRotationPosition(
        elapsedTime,
        state.rotationDirection
      );

      if (rotationPhysics.isComplete) {
        // Animation complete - finalize rotation
        const newBoardRotation =
          (state.boardRotation + state.rotationDirection + 360) % 360;
        const newBoardOrientation =
          getOrientationFromRotation(newBoardRotation);

        return {
          ...state,
          boardRotation: newBoardRotation,
          boardOrientation: newBoardOrientation,
          isRotating: false,
          rotationDirection: 0,
          rotationProgress: 0,
          rotationPosition: 0,
          rotationVelocity: 0,
          rotationAcceleration: 0,
          rotationStartTime: 0,
          isPlayerFalling: true,
          playerVelocity: { x: 0, y: 0 }, // Reset velocity when rotation completes
          isPlayerAtTerminalVelocity: false,
        };
      }

      // Update rotation physics and progress
      const normalizedProgress =
        Math.abs(rotationPhysics.position) / Math.abs(state.rotationDirection);

      return {
        ...state,
        rotationProgress: Math.min(1, normalizedProgress),
        rotationPosition: rotationPhysics.position,
        rotationVelocity: rotationPhysics.velocity,
        rotationAcceleration: rotationPhysics.acceleration,
      };

    case 'TICK':
      if (!state.isGameRunning || state.isLevelComplete) {
        return state;
      }

      // Handle rotation animation at 60fps
      if (state.isRotating) {
        return gameReducer(state, { type: 'ROTATION_STEP' });
      }

      // Game logic with time-based physics
      const deltaTime = 0.016; // 16ms per frame at 60fps
      const newTimeRemaining = Math.max(0, state.timeRemaining - deltaTime);

      const isGrounded = isPlayerGroundedWithOrientation(
        state.playerPosition,
        state.blocks,
        state.boardOrientation
      );

      let newPlayerPosition = state.playerPosition;
      let newPlayerVelocity = state.playerVelocity;
      let newIsPlayerFalling = state.isPlayerFalling;
      let newIsPlayerAtTerminalVelocity = state.isPlayerAtTerminalVelocity;

      // Apply falling physics if player is not grounded
      if (!isGrounded) {
        const fallingPhysics = applyFallingPhysics(
          state.playerPosition,
          state.playerVelocity,
          state.blocks,
          state.boardOrientation,
          deltaTime
        );

        newPlayerPosition = fallingPhysics.newPosition;
        newPlayerVelocity = fallingPhysics.newVelocity;
        newIsPlayerFalling = true;
        newIsPlayerAtTerminalVelocity = fallingPhysics.isAtTerminalVelocity;
      } else {
        // Player is grounded, reset falling state and velocity
        newIsPlayerFalling = false;
        newIsPlayerAtTerminalVelocity = false;
        newPlayerVelocity = { x: 0, y: 0 };
      }

      // Check coin collection after movement
      const remainingCoins = checkCoinCollection(
        newPlayerPosition,
        state.coins
      );

      const isLevelComplete = remainingCoins.length === 0;

      // Calculate completion time if level is completed and we have a start time
      let precisionEndTime = state.precisionEndTime;
      let completionTime = state.completionTime;

      if (
        isLevelComplete &&
        state.precisionStartTime &&
        !state.precisionEndTime
      ) {
        precisionEndTime = performance.now();
        completionTime = precisionEndTime - state.precisionStartTime;
      }

      return {
        ...state,
        playerPosition: newPlayerPosition,
        playerVelocity: newPlayerVelocity,
        isPlayerFalling: newIsPlayerFalling,
        isPlayerGrounded: isGrounded,
        isPlayerAtTerminalVelocity: newIsPlayerAtTerminalVelocity,
        coins: remainingCoins,
        timeRemaining: newTimeRemaining,
        isLevelComplete,
        precisionEndTime,
        completionTime,
        isGameOver: newTimeRemaining <= 0 && remainingCoins.length > 0,
      };

    default:
      return state;
  }
}

export function useGameEngine(level: Level) {
  const initialState: GameState = {
    playerPosition: level.playerStart,
    playerVelocity: { x: 0, y: 0 },
    isPlayerFalling: false,
    isPlayerGrounded: false,
    isPlayerAtTerminalVelocity: false,
    boardRotation: 0,
    boardOrientation: 'NORTH',
    isRotating: false,
    rotationDirection: 0,
    rotationProgress: 0,
    rotationPosition: 0,
    rotationVelocity: 0,
    rotationAcceleration: 0,
    rotationStartTime: 0,
    coins: [...level.coins],
    blocks: [...level.blocks],
    originalLevel: level,
    timeRemaining: GAME_DURATION,
    isGameRunning: false,
    isLevelComplete: false,
    isGameOver: false,
    precisionStartTime: null,
    precisionEndTime: null,
    completionTime: null,
  };

  const [gameState, dispatch] = useReducer(gameReducer, initialState);

  // Update game state when level changes
  useEffect(() => {
    dispatch({ type: 'LOAD_LEVEL', level });
  }, [level]);

  // Game loop
  useEffect(() => {
    if (!gameState.isGameRunning) return;

    const gameLoop = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 16); // ~60 FPS for smooth rotation animation

    return () => clearInterval(gameLoop);
  }, [gameState.isGameRunning]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'arrowleft':
          dispatch({ type: 'MOVE_LEFT' });
          break;
        case 'arrowright':
          dispatch({ type: 'MOVE_RIGHT' });
          break;
        case 's':
          dispatch({ type: 'ROTATE_CCW' });
          break;
        case 'd':
          dispatch({ type: 'ROTATE_CW' });
          break;
        case 'r':
          dispatch({ type: 'RESTART' });
          break;
        case 'escape':
          dispatch({ type: 'PAUSE_GAME' });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const startGame = useCallback(() => {
    dispatch({ type: 'START_GAME' });
  }, []);

  const pauseGame = useCallback(() => {
    dispatch({ type: 'PAUSE_GAME' });
  }, []);

  const restartGame = useCallback(() => {
    dispatch({ type: 'RESTART' });
  }, []);

  const startPrecisionTimer = useCallback(() => {
    dispatch({ type: 'START_PRECISION_TIMER' });
  }, []);

  return {
    gameState,
    startGame,
    pauseGame,
    restartGame,
    startPrecisionTimer,
    dispatch,
  };
}
