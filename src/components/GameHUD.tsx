'use client';

import { GameState } from '../types/game';

interface GameHUDProps {
  gameState: GameState;
  levelNumber: number;
  onStartGame: () => void;
  onRestartGame: () => void;
  onPauseGame: () => void;
}

export default function GameHUD({
  gameState,
  levelNumber,
  onStartGame,
  onRestartGame,
  onPauseGame,
}: GameHUDProps) {
  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Top HUD */}
      <div className="flex justify-between items-center bg-gray-800 text-white px-4 py-2 rounded">
        <div className="text-lg font-bold">Level {levelNumber}</div>
        <div className="text-lg font-bold">Coins {gameState.coins.length}</div>
      </div>

      {/* Timer */}
      <div className="text-center">
        <div
          className={`text-2xl font-bold ${
            gameState.timeRemaining <= 5 ? 'text-red-500' : 'text-gray-700'
          }`}
        >
          Time: {Math.ceil(gameState.timeRemaining)}s
        </div>
      </div>

      {/* Game Status */}
      {!gameState.isGameRunning &&
        !gameState.isLevelComplete &&
        !gameState.isGameOver && (
          <div className="text-center">
            <button
              onClick={onStartGame}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded"
            >
              Start Game
            </button>
          </div>
        )}

      {gameState.isLevelComplete && (
        <div className="text-center bg-green-100 p-4 rounded">
          <h2 className="text-xl font-bold text-green-800 mb-2">
            Congratulations!
          </h2>
          <p className="text-green-700 mb-4">Level completed!</p>
          <button
            onClick={onRestartGame}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-2"
          >
            Play Again
          </button>
        </div>
      )}

      {gameState.isGameOver && (
        <div className="text-center bg-red-100 p-4 rounded">
          <h2 className="text-xl font-bold text-red-800 mb-2">
            Time&apos;s Up!
          </h2>
          <p className="text-red-700 mb-4">Press Enter to try again</p>
          <button
            onClick={onRestartGame}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Try Again
          </button>
        </div>
      )}

      {gameState.isGameRunning &&
        !gameState.isLevelComplete &&
        !gameState.isGameOver && (
          <div className="text-center">
            <button
              onClick={onPauseGame}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Pause
            </button>
            <button
              onClick={onRestartGame}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            >
              Restart (R)
            </button>
          </div>
        )}

      {/* Controls Help */}
      <div className="text-center text-sm text-gray-600 bg-gray-100 p-3 rounded">
        <p>
          <strong>Controls:</strong>
        </p>
        <p>← → Move | S/D Rotate Board | R Restart | ESC Pause</p>
      </div>

      {/* Mobile Controls */}
      <div className="flex justify-center space-x-2">
        <button
          onClick={() =>
            window.dispatchEvent(
              new KeyboardEvent('keydown', { key: 'ArrowLeft' })
            )
          }
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded"
          disabled={
            !gameState.isGameRunning ||
            gameState.isPlayerFalling ||
            gameState.isRotating
          }
        >
          ◄
        </button>
        <button
          onClick={() =>
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }))
          }
          className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded"
          disabled={!gameState.isGameRunning || gameState.isRotating}
        >
          ↺
        </button>
        <button
          onClick={() =>
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }))
          }
          className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded"
          disabled={!gameState.isGameRunning || gameState.isRotating}
        >
          ↻
        </button>
        <button
          onClick={() =>
            window.dispatchEvent(
              new KeyboardEvent('keydown', { key: 'ArrowRight' })
            )
          }
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded"
          disabled={
            !gameState.isGameRunning ||
            gameState.isPlayerFalling ||
            gameState.isRotating
          }
        >
          ►
        </button>
      </div>
    </div>
  );
}
