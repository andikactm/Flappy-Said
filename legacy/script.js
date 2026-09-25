(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const canvas = $('scene');
  const ctx = canvas.getContext('2d');
  const photo = $('player');
  // Koordinat logis tetap menjaga fisika konsisten di desktop dan HP.
  const W = 430, H = 764, GROUND = 706;
  const GRAVITY = 1150, JUMP = -405, SPEED = 170;
  const SPAWN_INTERVAL = 1.75, GAP = 248, PIPE_WIDTH = 66;
  const player = { x: W / 2, y: H * .46, width: 80, height: 108, vy: 0 };
  let mode = 'ready', pipes = [], score = 0, best = 0;
  let spawnTime = 0, sceneryTime = 0, previous = 0, freezeUntil = 0;
  const jokes = ['bro tidak berhasil terbang', 'skill issue', 'hampir bro', 'coba lagi sid', 'gravity 1 - sid 0', 'bro pikir dia burung'];

  // Beberapa browser membatasi storage saat membuka file lokal.
  try { best = Math.max(0, Number(localStorage.getItem('flappySidBest')) || 0); } catch (_) { /* Tetap playable tanpa storage. */ }

  function sizePhoto() {
    if (photo.naturalWidth) player.height = player.width * photo.naturalHeight / photo.naturalWidth;
    render();
  }
  photo.addEventListener('load', sizePhoto);
  if (photo.complete) sizePhoto();

  function start() {
    score = 0; pipes = []; spawnTime = 0; sceneryTime = 0;
    player.y = H * .46; player.vy = JUMP;
    $('score').textContent = '0';
    $('start-screen').hidden = true; $('end-screen').hidden = true;
    mode = 'playing';
    spawnPipe();
  }

  function input() {
    if (mode === 'ready' || mode === 'over') start();
    else if (mode === 'playing') player.vy = JUMP;
  }

  function spawnPipe() {
    // Gap cukup lebar untuk foto portrait; sisakan ruang di kedua ujung layar.
    const top = 95 + Math.random() * (GROUND - GAP - 190);
    pipes.push({ x: W + 14, top, passed: false });
  }

  function die() {
    if (mode !== 'playing') return;
    mode = 'frozen';
    freezeUntil = performance.now() + 300;
    best = Math.max(best, score);
    try { localStorage.setItem('flappySidBest', String(best)); } catch (_) { /* Penyimpanan opsional. */ }
  }

  function showGameOver() {
    mode = 'over';
    $('final-score').textContent = String(score);
    $('best-score').textContent = String(best);
    $('joke').textContent = jokes[Math.floor(Math.random() * jokes.length)];
    $('end-screen').hidden = false;
    $('restart').focus({ preventScroll: true });
  }

  function update(dt) {
    sceneryTime += dt;
    player.vy += GRAVITY * dt;
    player.y += player.vy * dt;
    for (const pipe of pipes) pipe.x -= SPEED * dt;
    spawnTime += dt;
    if (spawnTime >= SPAWN_INTERVAL) { spawnTime -= SPAWN_INTERVAL; spawnPipe(); }

    // Hitbox lebih kecil dari visual foto agar tabrakan pipa lebih toleran.
    const left = player.x - player.width / 2 + 9;
    const right = player.x + player.width / 2 - 9;
    const top = player.y - player.height / 2 + 11;
    const bottom = player.y + player.height / 2 - 11;
    if (player.y - player.height / 2 <= 0 || player.y + player.height / 2 >= GROUND) { die(); return; }
    for (const pipe of pipes) {
      if (right >= pipe.x - 5 && left <= pipe.x + PIPE_WIDTH + 5 && (top <= pipe.top || bottom >= pipe.top + GAP)) { die(); return; }
    }
    for (const pipe of pipes) {
      if (!pipe.passed && pipe.x + PIPE_WIDTH + 5 < player.x - player.width / 2) {
        pipe.passed = true; score += 1; $('score').textContent = String(score);
      }
    }
    pipes = pipes.filter(pipe => pipe.x + PIPE_WIDTH + 5 > 0);
  }

  function cloud(x, y, scale) {
    ctx.fillStyle = '#f7ffff'; ctx.beginPath();
    ctx.ellipse(x, y, 38 * scale, 16 * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(x - 15 * scale, y - 10 * scale, 16 * scale, 18 * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 10 * scale, y - 18 * scale, 20 * scale, 22 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function pipePart(x, y, height, capY) {
    ctx.fillStyle = '#75ca48'; ctx.strokeStyle = '#365f2b'; ctx.lineWidth = 3;
    ctx.fillRect(x, y, PIPE_WIDTH, height); ctx.strokeRect(x, y, PIPE_WIDTH, height);
    ctx.fillStyle = '#b4eb69'; ctx.fillRect(x + 7, y, 10, height);
    ctx.fillStyle = '#4da334'; ctx.fillRect(x + PIPE_WIDTH - 12, y, 9, height);
    ctx.fillStyle = '#83d84c'; ctx.fillRect(x - 5, capY, PIPE_WIDTH + 10, 25); ctx.strokeRect(x - 5, capY, PIPE_WIDTH + 10, 25);
    ctx.fillStyle = '#c3f187'; ctx.fillRect(x, capY + 4, PIPE_WIDTH, 5);
  }

  function render() {
    ctx.fillStyle = '#81d9ee'; ctx.fillRect(0, 0, W, H);
    for (const [x, y, s] of [[80, 132, .9], [320, 270, 1.1], [165, 493, .75]]) {
      cloud(((x - sceneryTime * 12 + 100) % 630 + 630) % 630 - 100, y, s);
    }
    ctx.fillStyle = '#b2e59b';
    for (let x = -40; x < W + 70; x += 75) { ctx.beginPath(); ctx.arc(x, GROUND, 67, Math.PI, 0); ctx.fill(); }
    for (const pipe of pipes) {
      pipePart(pipe.x, -3, pipe.top + 3, pipe.top - 25);
      pipePart(pipe.x, pipe.top + GAP, GROUND - pipe.top - GAP, pipe.top + GAP);
    }
    ctx.fillStyle = '#365f2b'; ctx.fillRect(0, GROUND, W, 4);
    ctx.fillStyle = '#98df55'; ctx.fillRect(0, GROUND + 4, W, 15);
    ctx.fillStyle = '#5bab3c';
    for (let x = -(sceneryTime * SPEED % 24); x < W; x += 24) ctx.fillRect(x, GROUND + 10, 12, 6);
    ctx.fillStyle = '#e7d393'; ctx.fillRect(0, GROUND + 19, W, H - GROUND - 19);
    ctx.fillStyle = '#b69d65'; ctx.fillRect(0, GROUND + 19, W, 4);
    // Hanya posisi berubah: foto utuh, tanpa bobbing, rotasi, atau animasi wajah.
    photo.style.left = `${(player.x - player.width / 2) / W * 100}%`;
    photo.style.top = `${(player.y - player.height / 2) / H * 100}%`;
  }

  function frame(now) {
    let dt = Math.min((now - previous) / 1000 || 0, .05);
    previous = now;
    // Langkah kecil mencegah foto menembus rintangan di antara frame.
    while (dt > 0 && mode === 'playing') {
      const step = Math.min(dt, 1 / 120); update(step); dt -= step;
    }
    if (mode === 'frozen' && now >= freezeUntil) showGameOver();
    render(); requestAnimationFrame(frame);
  }

  $('game').addEventListener('pointerdown', event => {
    if (event.target.closest('button') || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.preventDefault(); input();
  });
  $('restart').addEventListener('click', start);
  window.addEventListener('keydown', event => {
    if (event.code !== 'Space') return;
    event.preventDefault(); if (!event.repeat) input();
  });
  document.addEventListener('visibilitychange', () => { previous = performance.now(); });
  render(); requestAnimationFrame(frame);
})();
