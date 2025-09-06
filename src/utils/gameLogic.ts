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

export function getMovementDirection(
  direction: 'left' | 'right',
  orientation: BoardOrientation
): Position {
  switch (direction) {
    case 'left': {
      switch (orientation) {
        case 'NORTH':
          return { x: -1, y: 0 };
        case 'EAST':
          return { x: 0, y: 1 };
        case 'SOUTH':
          return { x: 1, y: 0 };
        case 'WEST':
          return { x: 0, y: -1 };
      }
    }
    case 'right': {
      switch (orientation) {
        case 'NORTH':
          return { x: 1, y: 0 };
        case 'EAST':
          return { x: 0, y: -1 };
        case 'SOUTH':
          return { x: -1, y: 0 };
        case 'WEST':
          return { x: 0, y: 1 };
      }
    }
  }
}

export function canPlayerMoveWithOrientation(
  playerPos: Position,
  direction: 'left' | 'right',
  blocks: Position[],
  orientation: BoardOrientation
): boolean {
  // Round current position to grid for movement calculations
  const currentGridPos = {
    x: Math.round(playerPos.x),
    y: Math.round(playerPos.y),
  };

  const moveDir = getMovementDirection(direction, orientation);
  const newPos = {
    x: currentGridPos.x + moveDir.x,
    y: currentGridPos.y + moveDir.y,
  };

  return isValidPosition(newPos) && !isPositionBlocked(newPos, blocks);
}

export function applyMovementWithOrientation(
  playerPos: Position,
  direction: 'left' | 'right',
  orientation: BoardOrientation
): Position {
  // Round current position to grid and apply movement
  const currentGridPos = {
    x: Math.round(playerPos.x),
    y: Math.round(playerPos.y),
  };

  const moveDir = getMovementDirection(direction, orientation);
  return {
    x: currentGridPos.x + moveDir.x,
    y: currentGridPos.y + moveDir.y,
  };
}

export function checkCoinCollection(
  playerPos: Position,
  coins: Position[]
): Position[] {
  // Round player position to nearest grid cell for coin collection
  const gridX = Math.round(playerPos.x);
  const gridY = Math.round(playerPos.y);

  return coins.filter((coin) => !(coin.x === gridX && coin.y === gridY));
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

  // For fractional positions, we need to check if the player is close enough to a surface
  // that they should be considered grounded
  const tolerance = 0.01; // Small tolerance for floating point precision

  if (gravityDir.y > 0) {
    // Gravity pointing down - check if at bottom boundary or on top of a block
    const gridY = Math.round(playerPos.y);
    const gridX = Math.round(playerPos.x);

    // Check bottom boundary
    if (gridY >= 14 && Math.abs(playerPos.y - 14) < tolerance) {
      return true;
    }

    // Check if there's a block below and player is sitting on top of it
    const belowY = gridY + 1;
    if (belowY < 15 && isPositionBlocked({ x: gridX, y: belowY }, blocks)) {
      return Math.abs(playerPos.y - gridY) < tolerance;
    }
  } else if (gravityDir.y < 0) {
    // Gravity pointing up - check if at top boundary or below a block
    const gridY = Math.round(playerPos.y);
    const gridX = Math.round(playerPos.x);

    // Check top boundary
    if (gridY <= 0 && Math.abs(playerPos.y - 0) < tolerance) {
      return true;
    }

    // Check if there's a block above and player is sitting below it
    const aboveY = gridY - 1;
    if (aboveY >= 0 && isPositionBlocked({ x: gridX, y: aboveY }, blocks)) {
      return Math.abs(playerPos.y - gridY) < tolerance;
    }
  } else if (gravityDir.x > 0) {
    // Gravity pointing right - check if at right boundary or left of a block
    const gridX = Math.round(playerPos.x);
    const gridY = Math.round(playerPos.y);

    // Check right boundary
    if (gridX >= 14 && Math.abs(playerPos.x - 14) < tolerance) {
      return true;
    }

    // Check if there's a block to the right and player is sitting left of it
    const rightX = gridX + 1;
    if (rightX < 15 && isPositionBlocked({ x: rightX, y: gridY }, blocks)) {
      return Math.abs(playerPos.x - gridX) < tolerance;
    }
  } else if (gravityDir.x < 0) {
    // Gravity pointing left - check if at left boundary or right of a block
    const gridX = Math.round(playerPos.x);
    const gridY = Math.round(playerPos.y);

    // Check left boundary
    if (gridX <= 0 && Math.abs(playerPos.x - 0) < tolerance) {
      return true;
    }

    // Check if there's a block to the left and player is sitting right of it
    const leftX = gridX - 1;
    if (leftX >= 0 && isPositionBlocked({ x: leftX, y: gridY }, blocks)) {
      return Math.abs(playerPos.x - gridX) < tolerance;
    }
  }

  return false;
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
