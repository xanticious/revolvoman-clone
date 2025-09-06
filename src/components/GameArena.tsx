'use client';

import { useEffect, useState } from 'react';
import { GameState } from '../types/game';
import GameCanvas from './GameCanvas';
import GameStatus from './GameStatus';
import MedalTimes from './MedalTimes';
import MobileControls from './MobileControls';
import { isDebugMode } from '../utils/debugMode';

interface GameArenaProps {
  gameState: GameState;
  levelNumber: number;
  gameTitle: string;
  onStartGame: () => void;
  onRestartGame: () => void;
  onPauseGame: () => void;
  onStartPrecisionTimer?: () => void;
}

// Medal calculation utilities
const getMedalTimes = (levelNumber: number) => ({
  author: 10.002,
  gold: 12.032,
  silver: 14.822,
  bronze: 16.032,
});

const calculateEarnedMedals = (
  completionTime: number | null,
  levelNumber: number
) => {
  if (!completionTime) return [];

  const times = getMedalTimes(levelNumber);
  const medals = [];

  if (completionTime <= times.bronze) medals.push('bronze');
  if (completionTime <= times.silver) medals.push('silver');
  if (completionTime <= times.gold) medals.push('gold');
  if (completionTime <= times.author) medals.push('author');

  return medals;
};

const getBestMedal = (completionTime: number | null, levelNumber: number) => {
  const earned = calculateEarnedMedals(completionTime, levelNumber);
  if (earned.includes('author')) return 'author';
  if (earned.includes('gold')) return 'gold';
  if (earned.includes('silver')) return 'silver';
  if (earned.includes('bronze')) return 'bronze';
  return null;
};

export default function GameArena({
  gameState,
  levelNumber,
  gameTitle,
  onStartGame,
  onRestartGame,
  onPauseGame,
  onStartPrecisionTimer,
}: GameArenaProps) {
  const [startCountdown, setStartCountdown] = useState<number | null>(null);
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Mock completion time for testing - in real game this would come from game state
  const [playerBestTime] = useState<number | null>(12.323);

  const medalTimes = getMedalTimes(levelNumber);
  const earnedMedals = calculateEarnedMedals(playerBestTime, levelNumber);
  const bestMedal = getBestMedal(playerBestTime, levelNumber);

  // Auto-start logic with countdown - only on initial load
  useEffect(() => {
    if (
      !gameState.isGameRunning &&
      !gameState.isLevelComplete &&
      !gameState.isGameOver &&
      !hasStarted
    ) {
      setIsInputDisabled(true);
      setStartCountdown(2);

      const timer1 = setTimeout(() => {
        setStartCountdown(1);

        const timer2 = setTimeout(() => {
          setStartCountdown(null);
          setIsInputDisabled(false);
          setHasStarted(true);
          onStartGame();
          // Start precision timer right after "Go!"
          if (onStartPrecisionTimer) {
            onStartPrecisionTimer();
          }
        }, 1000);

        return () => clearTimeout(timer2);
      }, 1000);

      return () => clearTimeout(timer1);
    }
  }, [
    gameState.isGameRunning,
    gameState.isLevelComplete,
    gameState.isGameOver,
    hasStarted,
    onStartGame,
    onStartPrecisionTimer,
  ]);

  // Reset on restart
  useEffect(() => {
    if (
      !gameState.isGameRunning &&
      !gameState.isLevelComplete &&
      !gameState.isGameOver &&
      hasStarted
    ) {
      setIsInputDisabled(true);
      setStartCountdown(2);
      setHasStarted(false);
    }
  }, [
    gameState.isGameRunning,
    gameState.isLevelComplete,
    gameState.isGameOver,
    hasStarted,
  ]);

  // Block keyboard inputs during countdown
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isInputDisabled) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    if (isInputDisabled) {
      window.addEventListener('keydown', handleKeyDown, true);
      return () => window.removeEventListener('keydown', handleKeyDown, true);
    }
  }, [isInputDisabled]);

  // Handle mobile button presses with input blocking
  const handleMobileInput = (key: string) => {
    if (isInputDisabled) return;

    window.dispatchEvent(new KeyboardEvent('keydown', { key }));
  };

  const formatTime = () => {
    if (startCountdown === 2) return 'Ready';
    if (startCountdown === 1) return 'Set';
    if (gameState.isGameOver) return "Time's Up!";
    return `${Math.ceil(gameState.timeRemaining)}s`;
  };

  return (
    <div className="h-screen bg-black text-white flex items-center">
      <div className="container mx-auto px-4">
        {/* Main Game Area with Side Panels */}
        <div className="flex gap-32 justify-center mb-12">
          {/* Left Side Panel */}
          <div className="w-64 space-y-6">
            {/* Level Name */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-yellow-400">
                {gameTitle}
              </h1>
            </div>

            {/* Medal Times */}
            <MedalTimes
              levelNumber={levelNumber}
              playerBestTime={playerBestTime}
              medalTimes={medalTimes}
              bestMedal={bestMedal}
            />
          </div>

          {/* Center - Game Canvas */}
          <div className="flex flex-col items-center">
            <div
              className={`relative ${
                isInputDisabled ? 'opacity-75' : ''
              } transition-opacity`}
            >
              <GameCanvas gameState={gameState} />
            </div>
          </div>

          {/* Right Side Panel */}
          <div className="w-64 space-y-6">
            {/* Game Status */}
            <div className="h-56">
              <GameStatus
                gameState={gameState}
                earnedMedals={earnedMedals}
                onRestartGame={onRestartGame}
              />
            </div>

            {/* Controls Info */}
            <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg">
              <p className="text-yellow-400 font-bold mb-3 text-center">
                CONTROLS
              </p>
              <div className="space-y-1 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Move:</span>
                  <span>← →</span>
                </div>
                <div className="flex justify-between">
                  <span>Rotate Board:</span>
                  <span>S / D</span>
                </div>
                <div className="flex justify-between">
                  <span>Restart:</span>
                  <span>R</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Control Buttons */}
        <MobileControls
          isInputDisabled={isInputDisabled}
          gameState={gameState}
          formatTime={formatTime}
          handleMobileInput={handleMobileInput}
        />

        {/* Debug Info */}
        {isDebugMode() && (
          <div className="mt-8 bg-gray-900 border border-gray-700 text-green-400 p-4 rounded-lg text-sm max-w-2xl mx-auto">
            <h3 className="font-bold mb-2 text-yellow-400">DEBUG INFO:</h3>
            <div className="grid grid-cols-2 gap-2">
              <p>
                Player Position: ({gameState.playerPosition.x},{' '}
                {gameState.playerPosition.y})
              </p>
              <p>Is Falling: {gameState.isPlayerFalling ? 'Yes' : 'No'}</p>
              <p>Is Grounded: {gameState.isPlayerGrounded ? 'Yes' : 'No'}</p>
              <p>
                At Terminal Velocity:{' '}
                {gameState.isPlayerAtTerminalVelocity ? 'Yes' : 'No'}
              </p>
              <p>Board Rotation: {gameState.boardRotation}°</p>
              <p>
                Player Velocity: ({gameState.playerVelocity.x.toFixed(2)},{' '}
                {gameState.playerVelocity.y.toFixed(2)})
              </p>
              <p>Coins Remaining: {gameState.coins.length}</p>
              <p>Time Remaining: {gameState.timeRemaining.toFixed(1)}s</p>
              <p>Game Running: {gameState.isGameRunning ? 'Yes' : 'No'}</p>
              <p>Level Complete: {gameState.isLevelComplete ? 'Yes' : 'No'}</p>
              <p>
                Precision Start: {gameState.precisionStartTime ? 'Set' : 'None'}
              </p>
              <p>
                Precision End: {gameState.precisionEndTime ? 'Set' : 'None'}
              </p>
              <p>
                Completion Time:{' '}
                {gameState.completionTime
                  ? `${(gameState.completionTime / 1000).toFixed(3)}s`
                  : 'None'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
