'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import {
  generateEndlessLevel,
  generateRandomEndlessSeed,
} from '../../utils/endlessLevelGenerator';
import { Level } from '../../types/game';
import { useGameEngine } from '../../hooks/useGameEngine';
import GameArena from '../../components/GameArena';

function EndlessLevelComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [level, setLevel] = useState<Level | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSeed, setCurrentSeed] = useState<string>('');

  useEffect(() => {
    const seedParam = searchParams.get('seed');

    if (!seedParam) {
      // No seed provided, generate a random one and update URL
      const randomSeed = generateRandomEndlessSeed();
      router.replace(`/endless?seed=${randomSeed}`);
      return;
    }

    setCurrentSeed(seedParam);

    try {
      // Generate level from seed
      const levelData = generateEndlessLevel(seedParam);
      setLevel(levelData);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to generate endless level:', error);
      // Redirect to main menu on error
      router.push('/main-menu');
    }
  }, [searchParams, router]);

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

  const gameEngine = useGameEngine(level || fallbackLevel, true);

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

  if (isLoading || !level || !currentSeed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold mb-4 text-cyan-400">
            {currentSeed
              ? 'Generating Endless Level...'
              : 'Generating Random Level...'}
          </div>
          {currentSeed && (
            <div className="text-sm text-gray-400 mb-4">
              Seed: {currentSeed}
            </div>
          )}
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
          Seed: {currentSeed}
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
        currentSeed={currentSeed}
      />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="text-xl font-bold mb-4 text-cyan-400">
          Loading Endless Mode...
        </div>
        <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}

export default function EndlessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EndlessLevelComponent />
    </Suspense>
  );
}
