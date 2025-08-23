'use client';

import { useEffect, useState } from 'react';

export default function WelcomePage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setIsVisible(true);

    // Auto-advance after 3 seconds (for now, later this will go to profile selection)
    const timer = setTimeout(() => {
      console.log('Auto-advancing from welcome page...');
      // TODO: Navigate to profile selection
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-cyan-400 flex items-center justify-center">
      <div className="text-center">
        {/* Main Title */}
        <h1
          className={`text-6xl md:text-8xl font-bold text-white mb-8 transition-all duration-1000 ${
            isVisible
              ? 'opacity-100 transform translate-y-0'
              : 'opacity-0 transform translate-y-10'
          }`}
          style={{
            textShadow: '4px 4px 8px rgba(0, 0, 0, 0.3)',
            fontFamily: 'Arial Black, sans-serif',
          }}
        >
          RevolvoMan
        </h1>

        {/* Subtitle */}
        <p
          className={`text-xl md:text-2xl text-white/90 mb-12 transition-all duration-1000 delay-300 ${
            isVisible
              ? 'opacity-100 transform translate-y-0'
              : 'opacity-0 transform translate-y-10'
          }`}
          style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' }}
        >
          Clone
        </p>

        {/* Loading animation */}
        <div
          className={`transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
            <div
              className="w-3 h-3 bg-white rounded-full animate-bounce"
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className="w-3 h-3 bg-white rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
        </div>

        {/* Fun game-related graphics placeholder */}
        <div
          className={`mt-16 transition-all duration-1000 delay-700 ${
            isVisible
              ? 'opacity-100 transform scale-100'
              : 'opacity-0 transform scale-95'
          }`}
        >
          {/* Simple miner pick icon placeholder */}
          <div className="mx-auto w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center transform rotate-45">
            <div className="w-8 h-2 bg-amber-800 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
