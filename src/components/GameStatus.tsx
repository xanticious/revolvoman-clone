import MedalRow from './MedalRow';
import { useRouter } from 'next/navigation';
import { generateRandomEndlessSeed } from '../utils/endlessLevelGenerator';

interface GameStatusProps {
  gameState: {
    isLevelComplete: boolean;
    isGameOver: boolean;
    timeRemaining: number;
    completionTime: number | null;
  };
  earnedMedals: string[];
  onRestartGame: () => void;
  isEndlessMode?: boolean;
  currentSeed?: string;
}

export default function GameStatus({
  gameState,
  earnedMedals,
  onRestartGame,
  isEndlessMode = false,
  currentSeed,
}: GameStatusProps) {
  const router = useRouter();

  const handleGoToAnotherLevel = () => {
    if (isEndlessMode) {
      // Generate a new random seed and navigate to it
      const newSeed = generateRandomEndlessSeed();
      router.push(`/endless/${newSeed}`);
    }
  };
  // Neutral State
  if (!gameState.isLevelComplete && !gameState.isGameOver) {
    return (
      <div className="bg-gray-900 border border-gray-600 p-4 rounded-lg h-full flex flex-col">
        <h3 className="text-gray-300 font-bold mb-2 text-center">
          COLLECT ALL COINS!
        </h3>
        <div className="flex-1 flex items-center justify-center">
          <button
            onClick={onRestartGame}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            Restart
          </button>
        </div>
        <MedalRow earnedMedals={earnedMedals} />
      </div>
    );
  }

  // Level Complete State
  if (gameState.isLevelComplete) {
    return (
      <div className="bg-green-900 border border-green-400 p-4 rounded-lg h-full flex flex-col">
        <h3 className="text-green-400 font-bold mb-2 text-center">
          LEVEL COMPLETE!
        </h3>
        <p className="text-green-300 text-sm text-center mb-4">
          Completed in:{' '}
          {gameState.completionTime
            ? (gameState.completionTime / 1000).toFixed(3)
            : (20 - gameState.timeRemaining).toFixed(3)}
          s
        </p>
        <div className="flex-1 flex flex-col justify-center space-y-2">
          <button
            onClick={onRestartGame}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm"
          >
            {isEndlessMode ? 'Try Again' : 'Improve'}
          </button>
          {isEndlessMode ? (
            <button
              onClick={handleGoToAnotherLevel}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm"
            >
              Another Level
            </button>
          ) : (
            <button
              onClick={() => {
                /* TODO: Next Level */
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm"
            >
              Next Level
            </button>
          )}
        </div>
        <MedalRow earnedMedals={earnedMedals} />
      </div>
    );
  }

  // Game Over State
  return (
    <div className="bg-red-900 border border-red-400 p-4 rounded-lg h-full flex flex-col">
      <h3 className="text-red-400 font-bold mb-2 text-center">TIME UP!</h3>
      <div className="flex-1 flex flex-col justify-center space-y-2">
        <button
          onClick={onRestartGame}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg"
        >
          Try Again
        </button>
        {isEndlessMode && (
          <button
            onClick={handleGoToAnotherLevel}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            Another Level
          </button>
        )}
      </div>
      <MedalRow earnedMedals={earnedMedals} />
    </div>
  );
}
