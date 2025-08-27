'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getLevel } from '../../../data/levels';
import { Level } from '../../../types/game';
import { useGameEngine } from '../../../hooks/useGameEngine';
import GameArena from '../../../components/GameArena';

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold mb-4 text-cyan-400">
            Loading Level {levelNumber}...
          </div>
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

      {/* Game Arena */}
      <GameArena
        gameState={gameEngine.gameState}
        levelNumber={levelNumber}
        gameTitle={`Campaign Level ${levelNumber}`}
        onStartGame={gameEngine.startGame}
        onRestartGame={gameEngine.restartGame}
        onPauseGame={gameEngine.pauseGame}
      />
    </div>
  );
}
