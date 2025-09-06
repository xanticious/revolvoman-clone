interface MedalTimesProps {
  levelNumber: number;
  playerBestTime: number | null;
  medalTimes: {
    author: number;
    gold: number;
    silver: number;
    bronze: number;
  };
  bestMedal: string | null;
}

export default function MedalTimes({
  levelNumber: _levelNumber,
  playerBestTime,
  medalTimes,
  bestMedal,
}: MedalTimesProps) {
  const getMedalRowClass = (medal: string) => {
    if (bestMedal === medal) {
      switch (medal) {
        case 'author':
          return 'bg-green-800 px-2 py-1 rounded';
        case 'gold':
          return 'bg-yellow-800 px-2 py-1 rounded';
        case 'silver':
          return 'bg-gray-600 px-2 py-1 rounded';
        case 'bronze':
          return 'bg-orange-800 px-2 py-1 rounded';
        default:
          return '';
      }
    }
    return '';
  };

  const getMedalTextColor = (medal: string) => {
    switch (medal) {
      case 'author':
        return 'text-green-400';
      case 'gold':
        return 'text-yellow-400';
      case 'silver':
        return 'text-gray-300';
      case 'bronze':
        return 'text-orange-400';
      default:
        return 'text-white';
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg">
      <h3 className="text-yellow-400 font-bold mb-4 text-center">
        MEDAL TIMES
      </h3>
      <div className="space-y-2 text-sm">
        <div className={`flex justify-between ${getMedalRowClass('author')}`}>
          <span className={getMedalTextColor('author')}>Author time:</span>
          <span className="text-white">{medalTimes.author.toFixed(3)}</span>
        </div>
        <div className={`flex justify-between ${getMedalRowClass('gold')}`}>
          <span className={getMedalTextColor('gold')}>Gold time:</span>
          <span className="text-white">{medalTimes.gold.toFixed(3)}</span>
        </div>
        <div className={`flex justify-between ${getMedalRowClass('silver')}`}>
          <span className={getMedalTextColor('silver')}>Silver time:</span>
          <span className="text-white">{medalTimes.silver.toFixed(3)}</span>
        </div>
        <div className={`flex justify-between ${getMedalRowClass('bronze')}`}>
          <span className={getMedalTextColor('bronze')}>Bronze time:</span>
          <span className="text-white">{medalTimes.bronze.toFixed(3)}</span>
        </div>
        <div className="border-t border-gray-600 pt-2 mt-3">
          <div className="flex justify-between font-bold">
            <span className="text-cyan-400">Your time:</span>
            <span className="text-white">
              {playerBestTime ? playerBestTime.toFixed(3) : '--:---'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
