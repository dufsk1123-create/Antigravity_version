export type Player = 'X' | 'O' | null;

export interface Scores {
  X: number;
  O: number;
  draws: number;
}

export const LOCAL_STORAGE_KEY = 'tictactoe-scores';

export const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6]             // diagonals
];
