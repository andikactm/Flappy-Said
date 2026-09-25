export type GameStatus = "loading" | "ready" | "playing" | "frozen" | "over" | "error";

export interface GameSnapshot {
  status: GameStatus;
  score: number;
  best: number;
  message: string;
}

// React receives events only when a score or screen changes, never every frame.
export type OnGameChange = (snapshot: GameSnapshot) => void;
export const PLAY_EVENT = "flappy-sid:play";
