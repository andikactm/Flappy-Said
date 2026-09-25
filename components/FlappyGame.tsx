"use client";

import { useEffect, useRef, useState } from "react";
import type * as Phaser from "phaser";
import { PLAY_EVENT, type GameSnapshot } from "@/game/types";
import GameOverlay from "./GameOverlay";

const INITIAL_STATE: GameSnapshot = { status: "loading", score: 0, best: 0, message: "" };

export default function FlappyGame() {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [state, setState] = useState<GameSnapshot>(INITIAL_STATE);

  useEffect(() => {
    let cancelled = false;
    let instance: Phaser.Game | null = null;
    const host = hostRef.current;
    if (!host) return;

    // Importing inside the effect avoids Phaser's window/document references during SSR.
    // The cancellation guard also handles React Strict Mode and Fast Refresh safely.
    void import("@/game/config").then(({ createGame }) => {
      if (cancelled || gameRef.current) return;
      instance = createGame(host, snapshot => {
        if (!cancelled) setState(snapshot);
      });
      gameRef.current = instance;
    }).catch((error: unknown) => {
      console.error("Unable to start Flappy Sid:", error);
      if (!cancelled) setState({ ...INITIAL_STATE, status: "error", message: "Game gagal dimuat. Coba muat ulang halaman." });
    });

    return () => {
      cancelled = true;
      if (instance) {
        // Phaser removes its canvas, scene timers, keyboard listeners and physics world.
        instance.destroy(true);
        if (gameRef.current === instance) gameRef.current = null;
      }
    };
  }, []);

  const play = () => gameRef.current?.events.emit(PLAY_EVENT);

  return (
    <section className="game-shell" aria-label="Flappy Sid mini game">
      <div className="mb-4 flex items-center justify-between text-[8px] text-[#9eb6a0] sm:text-[9px]" aria-hidden="true">
        <span>SID&apos;S ARCADE</span>
        <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 bg-[#b0dc72]" />JUST ONE MORE</span>
      </div>
      <div className="game-frame">
        <div ref={hostRef} className="phaser-host" />
        {state.status !== "loading" && state.status !== "error" && (
          <div className="score-text pointer-events-none absolute top-[5%] z-10 w-full text-center text-[11cqw] leading-normal" aria-label={`Score: ${state.score}`}>{state.score}</div>
        )}
        <GameOverlay state={state} onPlay={play} />
        <p className="pointer-events-none absolute bottom-[2.4%] w-full text-center text-[2cqw] tracking-[.15em] text-[#687245]" aria-hidden="true">SID VS GRAVITY</p>
      </div>
      <p className="mt-7 text-center text-[7px] leading-relaxed tracking-wide text-[#b1c4ac] sm:text-[8px]">SPACE / CLICK / TAP TO FLY</p>
      <noscript><p className="mt-4 text-center text-sm">Aktifkan JavaScript untuk memainkan Flappy Sid.</p></noscript>
    </section>
  );
}
