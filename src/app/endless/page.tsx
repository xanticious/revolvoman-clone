'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateRandomEndlessSeed } from '../../utils/endlessLevelGenerator';

export default function EndlessRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Generate a random seed and redirect to it
    const seed = generateRandomEndlessSeed();
    router.push(`/endless/${seed}`);
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="text-xl font-bold mb-4 text-cyan-400">
          Generating Random Level...
        </div>
        <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}
