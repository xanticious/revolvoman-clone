'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getLevel } from '../../../data/levels';
import { Level } from '../../../types/game';
import { useGameEngine } from '../../../hooks/useGameEngine';
import GameCanvas from '../../../components/GameCanvas';
import GameHUD from '../../../components/GameHUD';

export default function CampaignLevelClient() {
  const params = useParams();
  const router = useRouter();
  const [level, setLevel] = useState<Level | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const levelNumber = parseInt(params.level as string);

  useEffect(() => {
    const levelData = getLevel(levelNumber);
    if (!levelData) {
      router.push('/main-menu');
      return;
    }
    setLevel(levelData);
    setIsLoading(false);
  }, [levelNumber, router]);

  // Always call useGameEngine to avoid violating Rules of Hooks
  const fallbackLevel: Level = {
    id: 1,
    playerStart: { x: 7, y: 13 },
    coins: [{ x: 9, y: 13 }],
    blocks: [
      { x: 6, y: 14 },
      { x: 7, y: 14 },
      { x: 8, y: 14 },
      { x: 9, y: 14 },
      { x: 10, y: 14 },
    ],
  };

  const gameEngine = useGameEngine(level || fallbackLevel);

  // Handle Enter key for restart when game over
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && gameEngine.gameState.isGameOver) {
        gameEngine.restartGame();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameEngine, gameEngine.gameState.isGameOver]);

  if (isLoading || !level) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold mb-4">
            Loading Level {levelNumber}...
          </div>
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Back to Menu */}
        <div className="mb-4">
          <button
            onClick={() => router.push('/main-menu')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          >
            ← Back to Menu
          </button>
        </div>

        {/* Game Title */}
        <h1 className="text-3xl font-bold text-center mb-8">
          Campaign Level {levelNumber}
        </h1>

        {/* Game Area */}
        <div className="flex flex-col lg:flex-row items-start justify-center gap-8">
          {/* Game Canvas */}
          <div className="flex-shrink-0">
            <GameCanvas gameState={gameEngine.gameState} />
          </div>

          {/* Game HUD */}
          <div className="flex-shrink-0">
            <GameHUD
              gameState={gameEngine.gameState}
              levelNumber={levelNumber}
              onStartGame={gameEngine.startGame}
              onRestartGame={gameEngine.restartGame}
              onPauseGame={gameEngine.pauseGame}
            />
          </div>
        </div>

        {/* Debug Info (for development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-gray-800 text-white p-4 rounded text-sm">
            <h3 className="font-bold mb-2">Debug Info:</h3>
            <p>
              Player Position: ({gameEngine.gameState.playerPosition.x},{' '}
              {gameEngine.gameState.playerPosition.y})
            </p>
            <p>
              Is Falling: {gameEngine.gameState.isPlayerFalling ? 'Yes' : 'No'}
            </p>
            <p>
              Is Grounded:{' '}
              {gameEngine.gameState.isPlayerGrounded ? 'Yes' : 'No'}
            </p>
            <p>Board Rotation: {gameEngine.gameState.boardRotation}°</p>
            <p>Coins Remaining: {gameEngine.gameState.coins.length}</p>
            <p>
              Time Remaining: {gameEngine.gameState.timeRemaining.toFixed(1)}s
            </p>
            <p>
              Game Running: {gameEngine.gameState.isGameRunning ? 'Yes' : 'No'}
            </p>
            <p>
              Level Complete:{' '}
              {gameEngine.gameState.isLevelComplete ? 'Yes' : 'No'}
            </p>
          </div>
        )}

        {/* Controls Info */}
        <div className="mt-8 text-center text-gray-600">
          <p className="mb-2">
            <strong>Controls:</strong>
          </p>
          <p>
            Left/Right Arrows: Move • Down Arrow: Rotate board • Spacebar:
            Start/Pause
          </p>
          <p>Enter: Restart (when game over)</p>
        </div>
      </div>
    </div>
  );
}
