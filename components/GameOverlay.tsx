"use client";

import type { GameSnapshot } from "@/game/types";

interface Props { state: GameSnapshot; onPlay: () => void }

export default function GameOverlay({ state, onPlay }: Props) {
  if (state.status === "playing" || state.status === "frozen") return null;

  if (state.status === "loading" || state.status === "error") {
    return (
      <div className="absolute inset-0 z-20 grid place-items-center bg-[#88deec] p-6 text-center text-[#254d3c]" role="status">
        <div>
          <p className="text-[4cqw] leading-loose">{state.status === "error" ? "OOPS!" : "LOADING SID..."}</p>
          <p className="game-copy mt-4 text-[3.5cqw]">{state.message || "Menyiapkan foto untuk lepas landas."}</p>
          {state.status === "error" && <button onClick={() => window.location.reload()} className="arcade-button mt-6 px-4 py-4 text-[3cqw]">COBA LAGI</button>}
        </div>
      </div>
    );
  }

  if (state.status === "ready") {
    return (
      <div className="pointer-events-none absolute inset-0 z-10 text-center text-[#234737]">
        <div className="absolute top-[14%] w-full">
          <p className="mb-[5%] text-[2.25cqw] tracking-[.12em]">ONE PHOTO. ZERO AERODYNAMICS.</p>
          <h1 className="arcade-title text-[10cqw] leading-[1.3]">FLAPPY<br /><span className="text-[14cqw] text-[#ffda71]">SID</span></h1>
        </div>
        <div className="absolute top-[60%] w-full px-[12%]">
          <p className="text-[2.9cqw] leading-loose">Press SPACE to Fly</p>
          <p className="game-copy mt-[2%] text-[3.2cqw] font-bold opacity-70">or click anywhere</p>
          <button onClick={onPlay} className="arcade-button pointer-events-auto mt-[8%] min-h-11 w-full py-[6%] text-[4.1cqw]">PLAY <span aria-hidden="true">▶</span></button>
          <p className="mt-[9%] text-[2.3cqw] opacity-70">BEST: {state.best}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-[#183e3655] px-[7%]" role="dialog" aria-modal="true" aria-label="Game over">
      <div className="w-full border-4 border-[#294b35] bg-[#fff1c4] px-[7%] py-[9%] text-center text-[#294b35] shadow-[6px_7px_0_#294b35]">
        <p className="mb-[7%] text-[2.5cqw] tracking-wider text-[#6c8154]">FLIGHT CANCELLED</p>
        <h2 className="text-[6cqw] leading-relaxed text-[#d46543]">GAME OVER</h2>
        <p className="game-copy my-[7%] min-h-10 text-[3.8cqw] font-bold leading-relaxed">&ldquo;{state.message}&rdquo;</p>
        <div className="mb-[9%] grid grid-cols-2 border-2 border-[#d8c58e] bg-[#fff9de] py-[7%]">
          <div className="border-r-2 border-[#d8c58e]"><p className="text-[2.5cqw] text-[#778364]">SCORE</p><p className="mt-4 text-[7cqw]">{state.score}</p></div>
          <div><p className="text-[2.5cqw] text-[#778364]">BEST</p><p className="mt-4 text-[7cqw]">{state.best}</p></div>
        </div>
        <button onClick={onPlay} className="arcade-button min-h-11 w-full py-[6%] text-[3.6cqw]">MAIN LAGI</button>
        <p className="game-copy mt-[8%] text-[3cqw] font-bold text-[#798363]">foto sama, harapan baru.</p>
      </div>
    </div>
  );
}
