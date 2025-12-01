export type GameMode = 'classic' | 'random';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  selectedCard?: string;
  isReady?: boolean;
}

export interface Room {
  code: string;
  hostId: string;
  players: Player[];
  gameMode: GameMode;
  maxScore: number;
  currentRound: number;
  currentCondition?: string;
  phase: 'lobby' | 'playing' | 'voting' | 'results' | 'finished';
  submissions: Submission[];
  timer?: number;
}

export interface Submission {
  playerId: string;
  actionCard: string;
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  totalScore: number;
  bestCombination: string;
  timesVotedFor: number;
}
