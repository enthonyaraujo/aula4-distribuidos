import type { Tile, MoveSide } from '../types/domino';

export function generateDeck(): Tile[] {
  const deck: Tile[] = [];
  for (let i = 0; i <= 6; i++) {
    for (let j = i; j <= 6; j++) {
      deck.push([i, j]);
    }
  }
  return deck;
}

export function shuffleDeck<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function isDouble(tile: Tile): boolean {
  return tile[0] === tile[1];
}

export function tileSum(tile: Tile): number {
  return tile[0] + tile[1];
}

export function handSum(tiles: Tile[]): number {
  return tiles.reduce((acc, tile) => acc + tileSum(tile), 0);
}

export function canPlayTile(
  tile: Tile,
  leftEnd: number | null,
  rightEnd: number | null
): { canPlayLeft: boolean; canPlayRight: boolean; canPlay: boolean } {
  if (leftEnd === null || rightEnd === null) {
    // Mesa vazia: qualquer peça pode ser jogada
    return { canPlayLeft: true, canPlayRight: true, canPlay: true };
  }

  const [a, b] = tile;
  const canPlayLeft = a === leftEnd || b === leftEnd;
  const canPlayRight = a === rightEnd || b === rightEnd;

  return {
    canPlayLeft,
    canPlayRight,
    canPlay: canPlayLeft || canPlayRight
  };
}

export function getOrientedTile(
  tile: Tile,
  side: MoveSide,
  targetEnd: number
): { oriented: Tile; newEnd: number } {
  const [a, b] = tile;
  if (side === 'left') {
    // Na ponta esquerda, a extremidade externa será o número que NÃO casa com targetEnd
    if (b === targetEnd) {
      return { oriented: [a, b], newEnd: a };
    } else {
      return { oriented: [b, a], newEnd: b };
    }
  } else {
    // Na ponta direita, a extremidade interna casa com targetEnd e a externa é o outro
    if (a === targetEnd) {
      return { oriented: [a, b], newEnd: b };
    } else {
      return { oriented: [b, a], newEnd: a };
    }
  }
}
