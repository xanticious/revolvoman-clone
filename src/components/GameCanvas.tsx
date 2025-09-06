'use client';

import { useEffect, useRef } from 'react';
import { GameState, CELL_SIZE, CANVAS_SIZE } from '../types/game';

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

    // Calculate smooth rotation for animation (for canvas drawing)
    let canvasRotation = gameState.boardRotation;
    if (gameState.isRotating) {
      // Use the smooth rotation position from physics calculation
      canvasRotation = gameState.boardRotation + gameState.rotationPosition;
    }

    // Clear canvas with black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw border only (no internal grid lines)
    ctx.strokeStyle = '#00FFFF'; // Bright cyan border
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw blocks - full cell, bold blue color
    ctx.fillStyle = '#0066FF'; // Bold blue
    gameState.blocks.forEach((block) => {
      ctx.fillRect(
        block.x * CELL_SIZE,
        block.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
    });

    // Draw coins - bright gold
    ctx.fillStyle = '#FFD700'; // Bright gold
    gameState.coins.forEach((coin) => {
      const centerX = coin.x * CELL_SIZE + CELL_SIZE / 2;
      const centerY = coin.y * CELL_SIZE + CELL_SIZE / 2;
      const radius = CELL_SIZE / 3;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fill();

      // Draw cent symbol with counter-rotation to keep it upright
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((-canvasRotation * Math.PI) / 180); // Counter-rotate
      ctx.fillStyle = '#B8860B'; // Dark gold
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('¢', 0, 0);
      ctx.restore();
      ctx.fillStyle = '#FFD700'; // Reset to gold
    });

    // Draw player
    const playerX = gameState.playerPosition.x * CELL_SIZE + CELL_SIZE / 2;
    const playerY = gameState.playerPosition.y * CELL_SIZE + CELL_SIZE / 2;

    // Apply counter-rotation to keep player upright
    ctx.save();
    ctx.translate(playerX, playerY);
    ctx.rotate((-canvasRotation * Math.PI) / 180); // Counter-rotate

    // Player body - bright colors with terminal velocity indication
    const playerColor = gameState.isPlayerAtTerminalVelocity
      ? '#FF8000' // Bright orange at terminal velocity
      : gameState.isPlayerFalling
      ? '#FF0040' // Bright red when falling
      : '#00FF80'; // Bright green when grounded

    ctx.fillStyle = playerColor;
    ctx.fillRect(
      -CELL_SIZE / 3,
      -CELL_SIZE / 3,
      (CELL_SIZE / 3) * 2,
      (CELL_SIZE / 3) * 2
    );

    // Player face - bright white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-4, -4, 8, 8);

    // Mining pick - bright yellow
    ctx.strokeStyle = '#FFFF00'; // Bright yellow
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(8, -8);
    ctx.lineTo(15, -15);
    ctx.stroke();

    ctx.restore();
  }, [gameState]);

  // Calculate smooth rotation for animation
  let currentRotation = gameState.boardRotation;

  if (gameState.isRotating) {
    // Use the smooth rotation position from physics calculation
    currentRotation = gameState.boardRotation + gameState.rotationPosition;
  }

  return (
    <div className="flex justify-center">
      <div
        style={{
          transform: `rotate(${currentRotation}deg)`,
          transformOrigin: 'center center',
        }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="border-4 border-cyan-400 bg-black"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
    </div>
  );
}
