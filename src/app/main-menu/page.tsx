'use client';

import { useRouter } from 'next/navigation';

export default function MainMenuPage() {
  const router = useRouter();

  const handlePlayClick = () => {
    router.push('/campaign/1');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-cyan-400 flex items-center justify-center">
      <div className="text-center">
        {/* Main Title */}
        <h1
          className="text-5xl md:text-7xl font-bold text-white mb-16"
          style={{
            textShadow: '4px 4px 8px rgba(0, 0, 0, 0.3)',
            fontFamily: 'Arial Black, sans-serif',
          }}
        >
          RevolvoMan Clone
        </h1>

        {/* Simple Play Button */}
        <button
          onClick={handlePlayClick}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-6 px-12 rounded-full text-2xl shadow-lg transform hover:scale-105 transition-all duration-200"
          style={{
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
          }}
        >
          PLAY
        </button>

        {/* Coming Soon indicators */}
        <div className="mt-12 text-white/70 text-sm">
          <p>Phase 1: Core Mechanics</p>
          <p>Campaign Level 1 Ready</p>
        </div>
      </div>
    </div>
  );
}
