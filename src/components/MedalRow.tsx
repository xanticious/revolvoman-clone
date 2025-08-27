interface MedalRowProps {
  earnedMedals: string[];
}

export default function MedalRow({ earnedMedals }: MedalRowProps) {
  const getMedalClasses = (medalType: string) => {
    const baseClasses = 'w-6 h-6 rounded-full border-2';

    if (earnedMedals.includes(medalType)) {
      switch (medalType) {
        case 'author':
          return `${baseClasses} bg-green-600 border-green-400`;
        case 'gold':
          return `${baseClasses} bg-yellow-600 border-yellow-400`;
        case 'silver':
          return `${baseClasses} bg-gray-500 border-gray-300`;
        case 'bronze':
          return `${baseClasses} bg-orange-600 border-orange-400`;
        default:
          return `${baseClasses} border-gray-600`;
      }
    }

    return `${baseClasses} border-gray-600`;
  };

  return (
    <div className="flex justify-center space-x-2 mt-4">
      <div className={getMedalClasses('author')}></div>
      <div className={getMedalClasses('gold')}></div>
      <div className={getMedalClasses('silver')}></div>
      <div className={getMedalClasses('bronze')}></div>
    </div>
  );
}
