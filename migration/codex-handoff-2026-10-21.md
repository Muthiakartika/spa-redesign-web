# Handoff untuk Codex: perubahan 21 Oct 2026 (halaman Home Service, jarak antar section, blog)

Dokumen ini ringkasan keadaan proyek dan daftar tugas lanjutan. Baca dulu `AGENTS.md` (Next.js di proyek ini punya perubahan besar; baca `node_modules/next/dist/docs/` sebelum menulis kode Next).

Brief sumber: `migration/outcall-page-dev-brief.md`. Dev server: port 3009 (`npm run dev`). Jangan menghentikan dev server milik pemilik.

## 0. Aturan kerja

- Jangan `git add -A`. Empat file ini diubah pemilik sendiri sebelum sesi ini, dan `VisitUs.tsx` bercampur dengan perubahan sesi ini. Stage per file dan periksa `git diff` dulu:
  `src/components/sections/QuickFacts.tsx`, `src/components/sections/VisitUs.tsx`, `src/content/pages/about.tsx`, `src/styles/custom.css`.
- Jangan commit atau push tanpa diminta. Belum ada yang di-commit.
- Tanda `{{CONFIRM Cx}}` dari brief tidak boleh tampil di situs. Fakta C1 sampai C14 belum ada dari pemilik; kalimatnya sengaja dibuang (lihat komentar `Owner fact Cx` di `src/components/outcall/OutcallSections.tsx`).
- Warna emas tema: `var(--theme-color1)` (#b88c35). Link di teks isi: tebal, emas, tanpa garis bawah.
- Cek setiap perubahan: `npx tsc --noEmit -p .` dan `npx eslint src` (keduanya harus bersih), lalu `npm run build` sekali sebelum deploy.

## 1. Yang sudah selesai (jangan dikerjakan ulang)

1. **Halaman outcall** (`src/content/pages/outcall-home-service-massage.tsx`, `src/components/outcall/OutcallSections.tsx`, `src/data/pages/home-service.ts`): section S01 sampai S14 sesuai brief. S11 (ulasan tamu) sengaja tidak ditampilkan sampai ada ulasan Google asli (C12). Latar selang-seling krem/putih. Gambar baru: `public/images/banners/homeservice-hero.webp` (+ `-sm`), `public/images/outcall/homeservice-2.webp`, `homeservice-3.webp`.
2. **Metadata dan schema:** judul/deskripsi outcall sesuai brief; `homeServiceSchema` memakai `serviceType`; JSON-LD baru untuk `/guide/` (`blogIndexSchema` di `src/lib/schema.ts`, dipasang di `src/app/(site)/guide/page.tsx`).
3. **Menu dan footer:** "Outcall" jadi "Home Service", isi dropdown dan footer diperbarui (`src/data/navigation.ts`, `Footer.tsx`, `MobileMenu.tsx`, `MainMenu.tsx`, `src/data/business.ts`). Ikon Facebook di footer dihapus.
4. **Beranda:** link "home service" di hero dan FAQ (pakai `src/lib/linkedText.tsx`, tulisan `[kata](/alamat/)`), band "Prefer a massage at your villa?" di `Steps.tsx`.
5. **Halaman treatment:** satu kalimat link ke outcall (`src/data/homeServiceLines.ts`), disisipkan template ke dalam blok quick facts lewat `appendChild` (`src/lib/treatments/tree.ts`, `QuickFacts` menerima `children`). `hair-braiding` dan `nail-spa` dilewati sampai fakta C13 ada.
6. **Blog:** 8 dari 9 artikel isinya sama dengan live (selisih hanya kalimat link outcall di `src/data/guide/homeServiceLines.ts`). Artikel IV Drip di `src/data/guide/seed-posts.json` sudah diganti ke versi live: slug `before-you-book-iv-drip-therapy`, judul "IV Drip Therapy - What to Know Before You Book?". Redirect lama ada di `src/data/redirects.ts`.
7. **Tampilan:** hero harga (`PageBanner`: `chips`, `priceUnit`, caption dihapus), "Visit us" kompak di laptop ke atas (`src/styles/outcall.css` bagian 11; `VisitUs.tsx`: tampilan "columns" tanpa tombol Get directions, Villa & hotel, Book on WhatsApp, dan tanpa kata "WhatsApp"), tepi hero bertemu krem tanpa pembatas, switch durasi "60 Mins" dst, teks foto FAQ tidak terpotong, judul blog punya margin, tabel blog tidak dobel border (`src/lib/blog/sanitize.ts`).
8. **Aturan jarak antar section** (`src/styles/spacing.css`): lihat bagian 2.

Semua gaya baru ada di `src/styles/outcall.css` (diimpor di `src/app/layout.tsx`), dibagi per bagian bernomor.

## 2. Aturan jarak (DIKEMBALIKAN ke awal atas permintaan pemilik)

**Update terakhir:** pemilik meminta jarak antar section dikembalikan ke keadaan awal sebelum diubah. `src/styles/spacing.css` sudah di-`git checkout` ke versi asli (200/160/140px, tepi sobekan di tengah). Semua yang tertulis di bawah ini adalah eksperimen yang sudah dibatalkan; jangan diterapkan ulang tanpa diminta. `tools/spacing/measure-gaps.mjs` hanya menyimpan perbaikan pembacaan sitemap (`src/data/sitemap.ts`).

(Eksperimen yang dibatalkan:)

- `--sp-gap`: 150px (>=992px), 110px (tablet, pilihan saya, belum dikonfirmasi), 75px (HP).
- Dua section berurutan yang sama-sama putih polos: `--sp-same` 100px / 80px / 50px.
- Di sisi tepi sobekan krem: dari konten terakhir ke awal warna krem solid = `--sp-gap`, dan dari krem solid ke konten berikutnya = `--sp-gap` (`--sp-x-top` dan `--sp-x-bottom` sekarang sama dengan `--sp-gap`). Diukur pemilik dengan PixGrid. Di HP, sisi sebelum garis warna tidak bisa kurang dari tinggi tepi (~76px).
- Pemilik pernah menyebut "100px/95px" dan "50px/65px" untuk section satu warna; saya hanya memakai 100 dan 50. Tanyakan ke pemilik kalau 95/65 memang dimaksud.
- Koreksi kecil per halaman memakai variabel `--sp-in-top` / `--sp-in-bottom` (ruang kosong di dalam section) di `spacing.css`.

## 3. Tugas lanjutan (urut prioritas)

1. **Ukur ulang jarak** dengan alat proyek. Alat itu butuh `puppeteer-core` (tidak ada di `package.json`):
   ```bash
   npm i --no-save --no-package-lock puppeteer-core
   WIDTHS=1440,820,390 node tools/spacing/measure-gaps.mjs http://localhost:3009
   ```
   Hasil mentah: `tools/spacing/gaps.json`. Alat sudah diperbaiki membaca daftar halaman dari `src/data/sitemap.ts`, tapi harapan (`G`, bagian akhir skrip) masih untuk aturan lama di batas bertepi sobekan. Perbarui: untuk pasangan yang salah satunya bertepi sobekan, harapannya `--sp-gap` per sisi garis warna, bukan total.
2. **Periksa visual** halaman ini di lebar 1440, 1024, 820, 390 setelah aturan tepi sobekan baru: `/`, `/about/`, `/outcall-home-service-massage/`, `/seminyak/`, satu halaman treatment (misalnya `/seminyak/balinese-massage/`), `/massage-kuta/`, `/guide/`. Cari konten yang menempel ke tepi sobekan di HP dan jarak yang terlalu lega.
3. **Selisih jarak yang diketahui** (sebelum aturan tepi baru): sekitar 9px antar section "about" bertepi sobekan di halaman treatment; 14 sampai 26px antara hero dan quick facts di beberapa halaman (`.quick-facts__lead--long`); `/seminyak/` hero ke video-section; testimonial ke section berikutnya di beranda dan `/seminyak/body-scrub/`.
4. **Deploy:** jalankan `npm run build`. Konten blog produksi ada di database Neon, bukan di `seed-posts.json`. Samakan artikel IV Drip di /admin/ (judul, slug, isi, SEO) atau jalankan ulang `npm run blog:setup` untuk database baru. Redirect baru baca dari `next.config.ts`, jadi butuh restart server.
5. **Fakta pemilik yang masih kosong** (lihat tabel di `migration/outcall-page-dev-brief.md`): C1 sampai C14. Tambahkan kalimatnya kembali di tempat bertanda `Owner fact Cx` begitu pemilik mengirimnya.
6. **Pasca-deploy (untuk pemilik):** Search Console minta indexing untuk halaman outcall lalu beranda; tambahkan layanan di Google Business Profile; jangan ubah halaman outcall selama 4 minggu.

## 4. Hal yang perlu diputuskan pemilik

- Tablet: 110px, apakah cukup?
- Section satu warna: 100/50 atau 95/65?
- Apakah di batas krem total konten ke konten ~300px (150 + 150 + tepi) memang yang diinginkan, atau yang dimaksud total 150px?
- `sameAs` di schema beranda (`src/lib/schema.ts`) masih memuat link Facebook yang sudah dihapus dari footer.
- Teks pada foto FAQ di halaman treatment dikosongkan sejak 15 Oct; apakah mau diisi?
- Jarak besar bawaan yang belum disentuh: halaman Contact (sekitar 400px desktop, 620px HP antara detail kontak dan peta).

## 5. Perintah yang sering dipakai

```bash
npm run dev                      # port 3009 (jangan jalankan kalau sudah berjalan)
npx tsc --noEmit -p .            # tipe
npx eslint src                   # lint
npm run build                    # build produksi
git status --short               # lihat file yang berubah
git diff -- src/styles/outcall.css src/styles/spacing.css
```

## 6. Peta file penting

| Topik | File |
|---|---|
| Section baru outcall | `src/components/outcall/OutcallSections.tsx` |
| Halaman outcall | `src/content/pages/outcall-home-service-massage.tsx` |
| Gaya semua perubahan sesi ini | `src/styles/outcall.css` |
| Aturan jarak | `src/styles/spacing.css`, `tools/spacing/measure-gaps.mjs` |
| Link dalam teks | `src/lib/linkedText.tsx` |
| Kalimat link treatment dan blog | `src/data/homeServiceLines.ts`, `src/data/guide/homeServiceLines.ts` |
| Schema | `src/lib/schema.ts`, `src/components/seo/FaqJsonLd.tsx` |
| Hero dan harga | `src/components/sections/PageBanner.tsx` |
| Visit us | `src/components/sections/VisitUs.tsx` |
| Redirect, menu | `src/data/redirects.ts`, `src/data/navigation.ts` |
