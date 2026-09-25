# Flappy Sid

Mini game Next.js App Router + TypeScript + React + Phaser 3 + Tailwind CSS. Tidak memerlukan backend, database, atau environment variable.

## Jalankan lokal

Gunakan Node.js 20.9 atau lebih baru (Node 22/24 LTS disarankan).

```sh
npm install
npm run dev
```

Buka http://localhost:3000. Versi Next.js dijalankan lewat server ini, bukan dengan membuka file HTML langsung.

## Kontrol

- SPACE, klik canvas, atau tap: mulai / terbang.
- PLAY: mulai permainan.
- MAIN LAGI: restart tanpa refresh.
- Hindari pipa, tanah, dan batas atas. Setiap pasangan pipa bernilai satu poin.

Best score disimpan di browser dengan key `flappy-sid-best-score`. Jika storage browser diblokir, permainan tetap berjalan.

## Struktur

```text
app/                   Halaman, layout, dan Tailwind CSS
components/            Container React dan UI
game/config.ts         Pembuatan Phaser.Game (hanya client)
game/constants.ts      Ukuran dunia, tuning physics, dan death messages
game/scenes/GameScene.ts Physics, pipa, skor, freeze, dan restart
public/player.png      Foto asli utuh, tanpa modifikasi
legacy/                Versi HTML sebelumnya, disimpan sebagai arsip
```

Foto ditampilkan sebagai Phaser Arcade Image dengan lebar 82 px, skala seragam, rotasi nol, dan hitbox tengah 75%. Tidak ada crop, mask, frame animasi, atau pengubahan foto.

Game memakai dunia tetap 432 × 768 dan Phaser Scale.FIT. Area di halaman maksimal 430 px. React hanya menerima perubahan status/skor; update tiap frame ada di Phaser. Obstacle dan physics body dihancurkan setelah keluar layar; restart membersihkan scene dan timer. Tabrakan menghentikan physics serta parallax selama 400 ms sebelum overlay muncul.

## Build dan deploy ke Vercel

```sh
npm run typecheck
npm run lint
npm run build
npm start
```

Push proyek ke repository Git, lalu import repository tersebut di Vercel. Pilih preset **Next.js**; gunakan build command `npm run build` dan output directory default. Tidak perlu environment variable atau konfigurasi server tambahan.

## Deploy ke Netlify

Import repository `andikactm/Flappy-Said` dan pilih branch `main`. Biarkan base directory kosong (root proyek). File `netlify.toml` mengatur build command `npm run build`, publish directory `.next`, dan Node.js 22. Netlify mendeteksi Next.js dan memasang adapter secara otomatis. Tidak perlu mengisi environment variable aplikasi.

Jika repository tidak muncul saat import, periksa akses aplikasi Netlify di GitHub dan pastikan repository ini diizinkan. Jika build gagal, buka deploy log untuk melihat pesan error; kegagalan koneksi GitHub tidak dapat diperbaiki melalui konfigurasi build.

Referensi: [Next.js on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/).

Tuning gameplay ada di `game/constants.ts`: gravity 1000, flap -370, kecepatan pipa 180, gap 210, spawn 1600 ms. Posisi gap acak dibatasi agar perbedaan tinggi antarpipa tetap terjangkau.

Referensi: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation), [Phaser Arcade Physics](https://docs.phaser.io/phaser/concepts/physics/arcade), [Phaser Scale Manager](https://docs.phaser.io/phaser/concepts/scale-manager).
