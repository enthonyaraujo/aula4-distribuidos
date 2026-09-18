export type Tile = [number, number];

export type SeatPosition = 'south' | 'west' | 'north' | 'east';

export interface Player {
  id: string; // socketId or bot-id
  seat: number; // 0, 1, 2, 3
  name: string;
  isBot: boolean;
  tilesCount: number;
  tiles?: Tile[]; // Only visible to the local player for their own hand
  score: number;
}

export interface PlacedTile {
  id: string;
  tile: Tile;
  isDouble: boolean;
  rotation?: number; // 0, 90, 180, 270
}

export interface GameState {
  roomId: string;
  status: 'waiting' | 'playing' | 'round_ended' | 'game_over';
  players: (Player | null)[];
  board: PlacedTile[];
  leftEnd: number | null;
  rightEnd: number | null;
  currentTurn: number; // 0..3
  roundStarter: number;
  lastAction: string | null;
  winner: number | null; // seat of winner or -1 for draw
  winReason?: 'domino' | 'blocked' | null;
  roundScores?: number[];
  roundNumber: number;
}

export type MoveSide = 'left' | 'right';

