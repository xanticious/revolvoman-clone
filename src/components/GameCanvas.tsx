'use client';

import { useEffect, useRef } from 'react';
import { GameState, GRID_SIZE, CELL_SIZE, CANVAS_SIZE } from '../types/game';

interface GameCanvasProps {
  gameState: GameState;
}

export default function GameCanvas({ gameState }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw grid
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw blocks
    ctx.fillStyle = '#87CEEB'; // Light blue
    gameState.blocks.forEach((block) => {
      ctx.fillRect(
        block.x * CELL_SIZE + 1,
        block.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
    });

    // Draw coins
    ctx.fillStyle = '#FFD700'; // Gold
    gameState.coins.forEach((coin) => {
      const centerX = coin.x * CELL_SIZE + CELL_SIZE / 2;
      const centerY = coin.y * CELL_SIZE + CELL_SIZE / 2;
      const radius = CELL_SIZE / 3;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fill();

      // Draw cent symbol
      ctx.fillStyle = '#B8860B'; // Dark gold
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('¢', centerX, centerY);
      ctx.fillStyle = '#FFD700'; // Reset to gold
    });

    // Draw player
    const playerX = gameState.playerPosition.x * CELL_SIZE + CELL_SIZE / 2;
    const playerY = gameState.playerPosition.y * CELL_SIZE + CELL_SIZE / 2;

    // Player body (simple square for now)
    ctx.fillStyle = gameState.isPlayerFalling ? '#FF6B6B' : '#4ECDC4'; // Red when falling, teal when grounded
    ctx.fillRect(
      playerX - CELL_SIZE / 3,
      playerY - CELL_SIZE / 3,
      (CELL_SIZE / 3) * 2,
      (CELL_SIZE / 3) * 2
    );

    // Player face
    ctx.fillStyle = '#2C3E50'; // Dark blue
    ctx.fillRect(playerX - 3, playerY - 3, 6, 6);

    // Mining pick (simple line)
    ctx.strokeStyle = '#8B4513'; // Brown
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playerX + 8, playerY - 8);
    ctx.lineTo(playerX + 15, playerY - 15);
    ctx.stroke();
  }, [gameState]);

  // Calculate rotation for smooth animation
  const currentRotation = gameState.isRotating
    ? gameState.boardRotation +
      gameState.rotationDirection * gameState.rotationProgress
    : gameState.boardRotation;

  return (
    <div className="flex justify-center">
      <div
        className="transition-transform duration-100"
        style={{
          transform: `rotate(${currentRotation}deg)`,
          transformOrigin: 'center center',
        }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="border-2 border-gray-400 bg-white"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
    </div>
  );
}
