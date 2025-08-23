import { Position, GRID_SIZE, BoardOrientation } from '../types/game';

export function isValidPosition(pos: Position): boolean {
  return pos.x >= 0 && pos.x < GRID_SIZE && pos.y >= 0 && pos.y < GRID_SIZE;
}

export function isPositionBlocked(pos: Position, blocks: Position[]): boolean {
  return blocks.some((block) => block.x === pos.x && block.y === pos.y);
}

export function isPlayerGrounded(
  playerPos: Position,
  blocks: Position[]
): boolean {
  // Check if player is on ground (bottom of grid)
  if (playerPos.y >= GRID_SIZE - 1) {
    return true;
  }

  // Check if player is on top of a block
  const belowPos = { x: playerPos.x, y: playerPos.y + 1 };
  return isPositionBlocked(belowPos, blocks);
}

export function canPlayerMove(
  playerPos: Position,
  direction: 'left' | 'right',
  blocks: Position[]
): boolean {
  const newX = direction === 'left' ? playerPos.x - 1 : playerPos.x + 1;
  const newPos = { x: newX, y: playerPos.y };

  return isValidPosition(newPos) && !isPositionBlocked(newPos, blocks);
}

export function rotatePosition(pos: Position, rotation: number): Position {
  const centerX = Math.floor(GRID_SIZE / 2);
  const centerY = Math.floor(GRID_SIZE / 2);

  // Translate to origin
  const x = pos.x - centerX;
  const y = pos.y - centerY;

  // Apply rotation (rotation is in degrees: 0, 90, 180, 270)
  const radians = (rotation * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  const newX = Math.round(x * cos - y * sin);
  const newY = Math.round(x * sin + y * cos);

  // Translate back
  return {
    x: newX + centerX,
    y: newY + centerY,
  };
}

export function rotateBoardElements(
  blocks: Position[],
  coins: Position[],
  playerPos: Position,
  rotation: number
): { blocks: Position[]; coins: Position[]; playerPosition: Position } {
  return {
    blocks: blocks.map((block) => rotatePosition(block, rotation)),
    coins: coins.map((coin) => rotatePosition(coin, rotation)),
    playerPosition: rotatePosition(playerPos, rotation),
  };
}

export function checkCoinCollection(
  playerPos: Position,
  coins: Position[]
): Position[] {
  return coins.filter(
    (coin) => !(coin.x === playerPos.x && coin.y === playerPos.y)
  );
}

export function applyGravity(
  playerPos: Position,
  blocks: Position[]
): Position {
  if (isPlayerGrounded(playerPos, blocks)) {
    return playerPos;
  }

  return { x: playerPos.x, y: playerPos.y + 1 };
}

export function getOrientationFromRotation(rotation: number): BoardOrientation {
  const normalizedRotation = ((rotation % 360) + 360) % 360;
  switch (normalizedRotation) {
    case 0:
      return 'NORTH';
    case 90:
      return 'EAST';
    case 180:
      return 'SOUTH';
    case 270:
      return 'WEST';
    default:
      return 'NORTH';
  }
}

export function getGravityDirection(orientation: BoardOrientation): Position {
  switch (orientation) {
    case 'NORTH':
      return { x: 0, y: 1 };
    case 'EAST':
      return { x: 1, y: 0 };
    case 'SOUTH':
      return { x: 0, y: -1 };
    case 'WEST':
      return { x: -1, y: 0 };
  }
}

export function isPlayerGroundedWithOrientation(
  playerPos: Position,
  blocks: Position[],
  orientation: BoardOrientation
): boolean {
  const gravityDir = getGravityDirection(orientation);
  const nextPos = {
    x: playerPos.x + gravityDir.x,
    y: playerPos.y + gravityDir.y,
  };

  // Check if next position in gravity direction is out of bounds or blocked
  return !isValidPosition(nextPos) || isPositionBlocked(nextPos, blocks);
}

export function applyGravityWithOrientation(
  playerPos: Position,
  blocks: Position[],
  orientation: BoardOrientation
): Position {
  if (isPlayerGroundedWithOrientation(playerPos, blocks, orientation)) {
    return playerPos;
  }

  const gravityDir = getGravityDirection(orientation);
  return {
    x: playerPos.x + gravityDir.x,
    y: playerPos.y + gravityDir.y,
  };
}
