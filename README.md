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

## Build statis dan GitHub Pages

```sh
npm ci
npm run build
```

Hasil export ada di `out/`; gunakan static HTTP server untuk preview. `npm start` / `next start` tidak mendukung `output: "export"`. Development tetap memakai `npm run dev` di http://localhost:3000/ tanpa prefix.

Workflow `.github/workflows/deploy.yml` berjalan saat push ke `main` atau lewat **Actions > Deploy to GitHub Pages > Run workflow**. Workflow memakai Node.js 24, menjalankan `npm ci` dan `npm run build`, lalu mengunggah `out/` menggunakan official GitHub Pages Actions.

Di repository `andikactm/Flappy-Said`, buka **Settings > Pages > Build and deployment > Source**, lalu pilih **GitHub Actions**. Setelah workflow sukses, website tersedia di https://andikactm.github.io/Flappy-Said/.

`next.config.ts` mengaktifkan `/Flappy-Said` hanya pada production build dengan `GITHUB_ACTIONS=true` (disediakan otomatis oleh GitHub). `basePath`, `assetPrefix`, dan path foto Phaser memakai prefix yang sama. Tidak perlu `.env`, secret, atau environment variable manual. `trailingSlash: true` menghasilkan halaman `index.html` agar URL halaman bisa dibuka langsung dan di-refresh pada static hosting.

Untuk mereproduksi build Pages di PowerShell:

```powershell
$env:GITHUB_ACTIONS = 'true'
npm run build
Remove-Item Env:GITHUB_ACTIONS
```

Audit: satu halaman game, tanpa API routes, Server Actions, middleware, SSR dinamis, ISR, atau image optimizer. Phaser dimuat hanya di browser, best score disimpan di localStorage, font dibundel dari `@fontsource`, audio dinonaktifkan, dan satu asset publik adalah `player.png`. Tekstur lainnya dibuat oleh Phaser. Folder `legacy/` adalah arsip dan tidak ikut export. Checkout ini belum memiliki skin selector.

Untuk Netlify, konfigurasi yang tersimpan juga memublikasikan `out/` sebagai static site tanpa prefix GitHub Pages.

Referensi: [Next.js static export](https://nextjs.org/docs/app/guides/static-exports), [GitHub Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

Tuning gameplay ada di `game/constants.ts`: gravity 1000, flap -370, kecepatan pipa 180, gap 210, spawn 1600 ms. Posisi gap acak dibatasi agar perbedaan tinggi antarpipa tetap terjangkau.

Referensi: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation), [Phaser Arcade Physics](https://docs.phaser.io/phaser/concepts/physics/arcade), [Phaser Scale Manager](https://docs.phaser.io/phaser/concepts/scale-manager).
