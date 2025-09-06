'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { generateEndlessLevel } from '../../../utils/endlessLevelGenerator';
import { Level } from '../../../types/game';
import { useGameEngine } from '../../../hooks/useGameEngine';
import GameArena from '../../../components/GameArena';

export default function EndlessLevelClient() {
  const params = useParams();
  const router = useRouter();
  const [level, setLevel] = useState<Level | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const seed = params.seed as string;

  useEffect(() => {
    try {
      // Generate level from seed
      const levelData = generateEndlessLevel(seed);
      setLevel(levelData);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to generate endless level:', error);
      // Redirect to main menu on error
      router.push('/main-menu');
    }
  }, [seed, router]);

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold mb-4 text-cyan-400">
            Generating Endless Level...
          </div>
          <div className="text-sm text-gray-400 mb-4">Seed: {seed}</div>
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Back to Menu */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => router.push('/main-menu')}
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg border border-gray-500"
        >
          Menu
        </button>
      </div>

      {/* Seed Display */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-gray-800 border border-gray-600 px-3 py-1 rounded text-xs text-gray-300">
          Seed: {seed}
        </div>
      </div>

      {/* Game Arena */}
      <GameArena
        gameState={gameEngine.gameState}
        levelNumber={level.id}
        gameTitle="Endless Mode"
        onStartGame={gameEngine.startGame}
        onRestartGame={gameEngine.restartGame}
        onPauseGame={gameEngine.pauseGame}
        onStartPrecisionTimer={gameEngine.startPrecisionTimer}
        isEndlessMode={true}
        currentSeed={seed}
      />
    </div>
  );
}
