export const WORLD = { width: 432, height: 768, groundY: 704 } as const;
export const TUNING = {
  playerWidth: 82,
  gravity: 1000,
  flapVelocity: -370,
  pipeSpeed: 180,
  pipeWidth: 72,
  gap: 210,
  spawnInterval: 1600,
  freezeDuration: 400,
  hitboxRatio: 0.75,
} as const;

export const BEST_SCORE_KEY = "flappy-sid-best-score";
export const DEATH_MESSAGES = [
  "bro tidak berhasil terbang",
  "skill issue",
  "hampir bro",
  "coba lagi sid",
  "gravity 1 - sid 0",
  "bro pikir dia burung",
  "physics won",
  "NOT LIKE THIS",
  "terbangnya kurang niat",
  "masih mahasiswa bukan burung",
] as const;
