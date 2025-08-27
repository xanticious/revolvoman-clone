'use client';

import { useRouter } from 'next/navigation';

export default function MainMenuPage() {
  const router = useRouter();

  const handlePlayClick = () => {
    router.push('/campaign/1');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        {/* Main Title */}
        <h1
          className="text-5xl md:text-7xl font-bold text-cyan-400 mb-16"
          style={{
            textShadow: '0 0 2px #00FFFF, 0 0 40px #00FFFF',
            fontFamily: 'Arial Black, sans-serif',
          }}
        >
          RevolvoMan Clone
        </h1>

        {/* Simple Play Button */}
        <button
          onClick={handlePlayClick}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-6 px-12 rounded text-2xl shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-yellow-300"
          style={{
            boxShadow: '0 0 20px rgba(255, 255, 0, 0.5)',
          }}
        >
          PLAY
        </button>

        {/* Coming Soon indicators */}
        <div className="mt-12 text-cyan-300 text-sm">
          <p>Phase 1: Core Mechanics</p>
          <p>Campaign Level 1 Ready</p>
        </div>
      </div>
    </div>
  );
}
