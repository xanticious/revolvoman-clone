import { useReducer, useEffect, useCallback } from 'react';
import { GameState, GameAction, Level, GAME_DURATION } from '../types/game';
import {
  canPlayerMove,
  rotateBoardElements,
  checkCoinCollection,
  getOrientationFromRotation,
  isPlayerGroundedWithOrientation,
  applyGravityWithOrientation,
} from '../utils/gameLogic';

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
        isPlayerFalling: false,
        isPlayerGrounded: false,
      };

    case 'START_GAME':
      return {
        ...state,
        isGameRunning: true,
        timeRemaining: GAME_DURATION,
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
        isGameRunning: true,
        boardRotation: 0,
        boardOrientation: 'NORTH',
        isRotating: false,
        rotationDirection: 0,
        rotationProgress: 0,
        isPlayerFalling: false,
        isPlayerGrounded: false,
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

      if (canPlayerMove(state.playerPosition, 'left', state.blocks)) {
        const newPosition = {
          x: state.playerPosition.x - 1,
          y: state.playerPosition.y,
        };
        const remainingCoins = checkCoinCollection(newPosition, state.coins);

        return {
          ...state,
          playerPosition: newPosition,
          coins: remainingCoins,
          isLevelComplete: remainingCoins.length === 0,
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

      if (canPlayerMove(state.playerPosition, 'right', state.blocks)) {
        const newPosition = {
          x: state.playerPosition.x + 1,
          y: state.playerPosition.y,
        };
        const remainingCoins = checkCoinCollection(newPosition, state.coins);

        return {
          ...state,
          playerPosition: newPosition,
          coins: remainingCoins,
          isLevelComplete: remainingCoins.length === 0,
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
      };

    case 'ROTATION_STEP':
      if (!state.isRotating) {
        return state;
      }

      const newProgress = Math.min(1, state.rotationProgress + 0.2); // 5 steps for smooth animation

      if (newProgress >= 1) {
        // Animation complete - apply the actual rotation
        const rotatedElements = rotateBoardElements(
          state.blocks,
          state.coins,
          state.playerPosition,
          state.rotationDirection
        );

        const newBoardRotation =
          (state.boardRotation + state.rotationDirection + 360) % 360;
        const newBoardOrientation =
          getOrientationFromRotation(newBoardRotation);

        return {
          ...state,
          boardRotation: newBoardRotation,
          boardOrientation: newBoardOrientation,
          blocks: rotatedElements.blocks,
          coins: rotatedElements.coins,
          playerPosition: rotatedElements.playerPosition,
          isRotating: false,
          rotationDirection: 0,
          rotationProgress: 0,
          isPlayerFalling: true,
        };
      }

      return {
        ...state,
        rotationProgress: newProgress,
      };

    case 'TICK':
      if (!state.isGameRunning) {
        return state;
      }

      // Handle rotation animation
      if (state.isRotating) {
        return gameReducer(state, { type: 'ROTATION_STEP' });
      }

      const newTimeRemaining = Math.max(0, state.timeRemaining - 0.1);
      const isGrounded = isPlayerGroundedWithOrientation(
        state.playerPosition,
        state.blocks,
        state.boardOrientation
      );

      let newPlayerPosition = state.playerPosition;
      let newIsPlayerFalling = state.isPlayerFalling;

      // Apply gravity if player is falling
      if (!isGrounded) {
        newPlayerPosition = applyGravityWithOrientation(
          state.playerPosition,
          state.blocks,
          state.boardOrientation
        );
        newIsPlayerFalling = true;
      } else {
        newIsPlayerFalling = false;
      }

      // Check coin collection after movement
      const remainingCoins = checkCoinCollection(
        newPlayerPosition,
        state.coins
      );

      return {
        ...state,
        playerPosition: newPlayerPosition,
        isPlayerFalling: newIsPlayerFalling,
        isPlayerGrounded: isGrounded,
        coins: remainingCoins,
        timeRemaining: newTimeRemaining,
        isLevelComplete: remainingCoins.length === 0,
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
    boardRotation: 0,
    boardOrientation: 'NORTH',
    isRotating: false,
    rotationDirection: 0,
    rotationProgress: 0,
    coins: [...level.coins],
    blocks: [...level.blocks],
    originalLevel: level,
    timeRemaining: GAME_DURATION,
    isGameRunning: false,
    isLevelComplete: false,
    isGameOver: false,
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
    }, 100); // 10 FPS for now

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

  return {
    gameState,
    startGame,
    pauseGame,
    restartGame,
    dispatch,
  };
}
