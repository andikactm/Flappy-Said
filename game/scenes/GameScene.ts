import * as Phaser from "phaser";
import { BEST_SCORE_KEY, DEATH_MESSAGES, TUNING, WORLD } from "../constants";
import { PLAY_EVENT, type GameStatus, type OnGameChange } from "../types";

type PipePair = {
  parts: Phaser.Physics.Arcade.Image[];
  scored: boolean;
};

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Image;
  private pipes!: Phaser.Physics.Arcade.Group;
  private pairs: PipePair[] = [];
  private clouds: Phaser.GameObjects.Image[] = [];
  private grass!: Phaser.GameObjects.TileSprite;
  private spawnTimer?: Phaser.Time.TimerEvent;
  private status: GameStatus = "ready";
  private score = 0;
  private best = 0;
  private lastGap = WORLD.height * 0.46;
  private autoStart = false;

  constructor(private readonly onChange: OnGameChange) {
    super("GameScene");
  }

  init(data: { autoStart?: boolean } = {}) {
    this.autoStart = Boolean(data.autoStart);
    this.status = "ready";
    this.score = 0;
    this.pairs = [];
    this.clouds = [];
    this.spawnTimer = undefined;
    this.lastGap = WORLD.height * 0.46;
    try {
      const saved = Number(localStorage.getItem(BEST_SCORE_KEY));
      this.best = Number.isFinite(saved) ? Math.max(this.best, 0, Math.floor(saved)) : this.best;
    } catch {
      // Keep the session best if browser storage is unavailable.
    }
  }

  preload() {
    if (!this.textures.exists("player")) this.load.image("player", `${process.env.NEXT_PUBLIC_BASE_PATH}/player.png`);
  }

  create() {
    this.makeTextures();
    this.makeBackground();
    if (!this.textures.exists("player")) {
      this.status = "error";
      this.publish("Foto gagal dimuat. Muat ulang halaman untuk mencoba lagi.");
      return;
    }

    this.physics.resume();
    this.pipes = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      allowGravity: false,
      immovable: true,
    });

    const ground = this.physics.add.staticImage(
      WORLD.width / 2,
      WORLD.groundY + (WORLD.height - WORLD.groundY) / 2,
      "ground",
    ).setDepth(3);
    this.grass = this.add.tileSprite(WORLD.width / 2, WORLD.groundY + 10, WORLD.width, 12, "grass").setDepth(4);

    this.player = this.physics.add.image(WORLD.width / 2, WORLD.height * 0.46, "player");
    // Uniform scale displays the complete original photo. No crop, mask or rotation.
    this.player.setScale(TUNING.playerWidth / this.player.width).setDepth(5);
    this.player.setVelocity(0, 0).setRotation(0);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setAllowRotation(false);
    // Arcade body size uses unscaled texture pixels; the image scale is applied by Phaser.
    body.setSize(this.player.width * TUNING.hitboxRatio, this.player.height * TUNING.hitboxRatio, true);
    body.setMaxVelocity(0, 650);

    // Overlap avoids a separation impulse: Sid freezes exactly where he hits the pipe.
    this.physics.add.overlap(this.player, this.pipes, this.crash, undefined, this);
    this.physics.add.overlap(this.player, ground, this.crash, undefined, this);
    this.input.on("pointerdown", this.onPointer);
    this.input.keyboard?.addCapture(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.input.keyboard?.on("keydown-SPACE", this.onSpace);
    this.game.events.on(PLAY_EVENT, this.onAction);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);

    if (this.autoStart) this.startRun();
    else this.publish();
  }

  private publish(message = "") {
    this.onChange({ status: this.status, score: this.score, best: this.best, message });
  }

  private readonly onSpace = (event: KeyboardEvent) => {
    event.preventDefault();
    if (!event.repeat) this.onAction();
  };

  private readonly onPointer = (pointer: Phaser.Input.Pointer) => {
    if (pointer.wasTouch || pointer.leftButtonDown()) this.onAction();
  };

  private readonly onAction = () => {
    if (this.status === "ready") this.startRun();
    else if (this.status === "playing") this.player.setVelocityY(TUNING.flapVelocity);
    else if (this.status === "over") {
      this.status = "frozen"; // Ignore further inputs until the restart is processed.
      this.scene.restart({ autoStart: true });
    }
  };

  private startRun() {
    this.status = "playing";
    (this.player.body as Phaser.Physics.Arcade.Body).setAllowGravity(true);
    this.player.setVelocityY(TUNING.flapVelocity);
    this.spawnPair();
    this.spawnTimer = this.time.addEvent({
      delay: TUNING.spawnInterval,
      callback: this.spawnPair,
      callbackScope: this,
      loop: true,
    });
    this.publish();
  }

  private spawnPair() {
    if (this.status !== "playing") return;
    // Limit changes between gaps so a tall portrait can comfortably reach the next one.
    const center = Phaser.Math.Clamp(this.lastGap + Phaser.Math.Between(-95, 95), 220, WORLD.groundY - 155);
    this.lastGap = center;
    const top = center - TUNING.gap / 2;
    const bottom = center + TUNING.gap / 2;
    const x = WORLD.width + TUNING.pipeWidth / 2 + 8;
    const makePart = (y: number, height: number, cap: boolean) => {
      const pipe = this.pipes.create(x, y, cap ? "pipe-cap" : "pipe-body") as Phaser.Physics.Arcade.Image;
      pipe.setOrigin(0.5, 0).setDisplaySize(cap ? TUNING.pipeWidth : TUNING.pipeWidth - 12, height);
      pipe.setImmovable(true).setVelocityX(-TUNING.pipeSpeed).setDepth(cap ? 2 : 1);
      return pipe;
    };
    this.pairs.push({
      parts: [makePart(0, top, false), makePart(top - 24, 24, true), makePart(bottom, WORLD.groundY - bottom, false), makePart(bottom, 24, true)],
      scored: false,
    });
  }

  private readonly crash = () => {
    if (this.status !== "playing") return;
    this.status = "frozen";
    this.physics.pause();
    if (this.spawnTimer) this.spawnTimer.paused = true;
    this.publish();
    // Physics and scenery stop; only this UI timer keeps running. No death animation.
    this.time.delayedCall(TUNING.freezeDuration, () => {
      this.status = "over";
      this.publish(DEATH_MESSAGES[Phaser.Math.Between(0, DEATH_MESSAGES.length - 1)]);
    });
  };

  update(_time: number, delta: number) {
    if (this.status !== "playing") return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (body.top <= 0) { this.crash(); return; }

    for (const pair of this.pairs) {
      const cap = pair.parts[1];
      const pipeBody = cap.body as Phaser.Physics.Arcade.Body;
      if (!pair.scored && pipeBody.right < body.left) {
        pair.scored = true;
        this.score += 1;
        if (this.score > this.best) {
          this.best = this.score;
          try { localStorage.setItem(BEST_SCORE_KEY, String(this.best)); } catch { /* Storage is optional. */ }
        }
        this.publish();
      }
    }
    // Destroy every image and its physics body once the pair leaves the viewport.
    this.pairs = this.pairs.filter(pair => {
      if (pair.parts[1].x + TUNING.pipeWidth / 2 >= -8) return true;
      pair.parts.forEach(part => part.destroy());
      return false;
    });
    const seconds = Math.min(delta, 50) / 1000;
    this.clouds.forEach((cloud, index) => {
      cloud.x -= seconds * (8 + index * 3);
      if (cloud.x < -90) cloud.x = WORLD.width + 90;
    });
    this.grass.tilePositionX += seconds * TUNING.pipeSpeed;
  }

  private cleanup() {
    this.input.off("pointerdown", this.onPointer);
    this.input.keyboard?.off("keydown-SPACE", this.onSpace);
    this.input.keyboard?.removeCapture(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.game.events.off(PLAY_EVENT, this.onAction);
    this.spawnTimer?.remove();
    // Phaser Scene shutdown also destroys bodies, colliders and delayed calls.
  }

  private makeBackground() {
    this.cameras.main.setBackgroundColor("#88deec");
    const landscape = this.add.graphics();
    landscape.fillStyle(0xbcebb0);
    for (let x = -30; x <= WORLD.width + 80; x += 85) landscape.fillCircle(x, WORLD.groundY + 12, 68);
    landscape.fillStyle(0x90dca0);
    for (let x = -50; x <= WORLD.width + 80; x += 105) landscape.fillCircle(x, WORLD.groundY + 42, 65);
    this.clouds = [[66, 110, 0.7], [332, 240, 1], [116, 515, 0.8]].map(([x, y, scale]) =>
      this.add.image(x, y, "cloud").setScale(scale).setAlpha(0.88),
    );
  }

  private makeTextures() {
    // Reusable graphics textures are created once, including across Scene.restart().
    if (this.textures.exists("pipe-body")) return;
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x2f602f).fillRect(0, 0, 60, 8);
    g.fillStyle(0x82d64b).fillRect(3, 0, 54, 8);
    g.fillStyle(0xc5f27c).fillRect(7, 0, 10, 8);
    g.fillStyle(0x53ac3c).fillRect(46, 0, 10, 8);
    g.generateTexture("pipe-body", 60, 8);
    g.clear().fillStyle(0x2f602f).fillRect(0, 0, 72, 24);
    g.fillStyle(0x88dc50).fillRect(3, 3, 66, 18);
    g.fillStyle(0xc5f27c).fillRect(6, 5, 59, 5);
    g.fillStyle(0x53ac3c).fillRect(6, 17, 62, 4);
    g.generateTexture("pipe-cap", 72, 24);
    g.clear().fillStyle(0xffffff);
    g.fillRoundedRect(0, 26, 130, 29, 14).fillCircle(36, 26, 22).fillCircle(72, 25, 25).fillCircle(100, 32, 18);
    g.generateTexture("cloud", 132, 58);
    g.clear().fillStyle(0xe8d89f).fillRect(0, 0, WORLD.width, 64);
    g.fillStyle(0x315632).fillRect(0, 0, WORLD.width, 4);
    g.fillStyle(0x96dc53).fillRect(0, 4, WORLD.width, 16);
    g.fillStyle(0x56843f).fillRect(0, 20, WORLD.width, 4);
    g.fillStyle(0xc3ad70).fillRect(0, 24, WORLD.width, 4);
    for (let x = 12; x < WORLD.width; x += 36) g.fillRect(x, 44, 5, 3);
    g.generateTexture("ground", WORLD.width, 64);
    g.clear().fillStyle(0x96dc53).fillRect(0, 0, 24, 12);
    g.fillStyle(0x69b345).fillRect(0, 6, 12, 6);
    g.generateTexture("grass", 24, 12);
    g.destroy();
  }
}
