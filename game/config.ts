import * as Phaser from "phaser";
import { WORLD, TUNING } from "./constants";
import { GameScene } from "./scenes/GameScene";
import type { OnGameChange } from "./types";

// This module is dynamically imported inside a React effect, never on the server.
export function createGame(parent: HTMLElement, onChange: OnGameChange) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: WORLD.width,
    height: WORLD.height,
    backgroundColor: "#88deec",
    banner: false,
    render: { antialias: true, roundPixels: false },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: "arcade",
      arcade: { gravity: { x: 0, y: TUNING.gravity }, debug: false, fps: 60 },
    },
    fps: { target: 60 },
    audio: { noAudio: true },
    callbacks: {
      postBoot: game => {
        game.canvas.setAttribute("aria-label", "Flappy Sid. Tekan Spasi, klik, atau tap untuk terbang.");
        game.canvas.setAttribute("role", "img");
      },
    },
    scene: [new GameScene(onChange)],
  });
}
