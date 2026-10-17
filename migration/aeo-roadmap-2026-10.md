# AEO Roadmap (Okt–Des 2026): yang diubah di website

Sumber: spreadsheet "AEO-Roadmap-Spa Bali Moon-Updated" (SEO Boost Indonesia,
versi 1.1, dicek terhadap staging 16 Okt 2026), tab *3 Month Roadmap*,
*Staging Check*, *Diagnosis* dan *Read Me* (checklist AEO 10 poin).
Diterapkan 17 Oktober 2026. **Belum di-commit dan belum di-push.**

Nomor "R.." = baris di tab *3 Month Roadmap*.

## A. Diterapkan di kode

### Structured data (schema)
| Baris | Perubahan |
|---|---|
| R9 | Schema `DaySpa` dipindah dari beranda ke layout, jadi ada di **semua halaman** (target "All pages, template level"). Ditambah `foundingDate` 2009, `@id`, `hasMap`, jam 09:00–23:00 (bukan 22:00, sesuai catatan staging), `paymentAccepted`. |
| R10, R33, R46, R65 | Template halaman treatment: `Service` + `Offer` harga IDR per durasi + `BreadcrumbList` (Home › Price List › Treatment), di samping `FAQPage` yang sudah ada. |
| R38 | `Service` dengan `areaServed` di /outcall-home-service-massage/ dan /villa-hotel-massage/. |
| Diagnosis S11 | Artikel guide: schema `Article` (penulis, tanggal terbit/diubah, publisher) + `BreadcrumbList`, dan nama penulis tampil di halaman. |

### Halaman treatment (24 halaman)
| Baris | Perubahan |
|---|---|
| R15 | Semua meta title treatment kini memuat "Spa Bali Moon" (sebelumnya 16 dari 24 tidak), begitu juga halaman villa. |
| R17, R40 | Blok baru **"Visit Spa Bali Moon"** di setiap halaman treatment: alamat + link peta, jam buka, di spa atau di villa/hotel, biaya home service IDR 75.000 per terapis, link ke halaman Villa & Hotel Massage, Home Service dan price list. Diambil dari `business.ts`, jadi otomatis sama di semua halaman. |
| R30, R31, R32 | Lymphatic: semua jawaban FAQ 40–60 kata, pertanyaan "how often", catatan "Not suitable for" + FAQ "who should not book", link ke artikel guide lymphatic. |
| R42, R43 | Hair braiding: pembuka menyebut gaya kepangan; 9 jawaban FAQ 40–60 kata. |
| R57 | Couples: pertanyaan liburan (Natal/Tahun Baru). |
| R58, R59, Staging | Balinese: FAQ dibuka "What is a Balinese massage?", minimal 10 FAQ 40–60 kata, link ke artikel guide Balinese, tulisan "Revive Your Senses" di foto FAQ dihapus. |
| R62 | Sunburn: 9 jawaban FAQ 40–60 kata. |
| R66 | Thai, Shiatsu, Sports, Deep Tissue: semua jawaban FAQ 40–60 kata. |

### Price list /seminyak/
| Baris | Perubahan |
|---|---|
| R21 | Tabel harga HTML baru: tiap pijat × 30 menit / 1 jam / 1,5 jam / 2 jam dalam IDR, plus biaya home service. Daftar harga interaktif tetap seperti sekarang. |
| R22 | 15 jawaban FAQ jadi 40–60 kata; tambah pertanyaan pembayaran dan jam buka. |
| R23 | Heading H2 jadi pertanyaan ("How Much Does a Massage Cost in Seminyak?", "How Much Is a Balinese Massage Package?", …). |
| R25 | Nama treatment di daftar harga, kartu paket dan tabel harga kini link ke halaman treatment-nya. |

### Outcall & Villa
| Baris | Perubahan |
|---|---|
| R34 | Tugas tiap halaman dibedakan: Outcall = home service di seluruh Bali (area, biaya, cara kerja); Villa & Hotel = tamu hotel/villa di Seminyak (aturan hotel, pasangan di villa). H1 dan pembuka diganti, kedua halaman saling link. |
| R35 | Pembuka outcall menyebut area, biaya, kapan harus booking, apa yang dibawa terapis. |
| R36 | Villa: 6 jawaban FAQ jadi 40–60 kata + pertanyaan area, tip, aturan hotel, pasangan di villa. |
| R37 | Tabel area layanan di halaman outcall (area, biaya, waktu tiba). Lihat catatan C3. |

### Halaman lain
| Baris | Perubahan |
|---|---|
| R14 | Halaman baru **/about/** (sejak 2009, alamat, terapis, produk yang dipakai, kebersihan), hanya dari fakta yang sudah ada di situs. Link di header, menu HP dan footer; masuk sitemap. |
| R32, R59, R69, Staging (guide) | Kotak "At Spa Bali Moon" di bawah judul 6 artikel guide: dua kalimat yang menyebut Spa Bali Moon, harga, dan link ke halaman treatment (draf dari copy rewrite 12 Okt). Dibuat di kode, jadi tidak perlu edit database. IV Drip tidak diberi kotak. |
| — | Tanggal "Last updated" halaman treatment dan `lastmod` sitemap ikut diperbarui. |

### Putaran 2 (17 Okt): semua FAQ dan draf artikel
| Baris | Perubahan |
|---|---|
| Diagnosis S3, checklist poin 2 | Jawaban FAQ di **semua** halaman lain juga 40–60 kata: 15 halaman treatment yang belum terjadwal (ear candle, foot reflexology, foot massage, head massage, nail art, manicure pedicure, traditional, waxing, facial, hot stone, cream bath, coconut oil, body scrub, cellulite, day spa), beranda, Kuta, dan dua jawaban outcall yang masih pendek. Pertanyaan dan urutannya tidak berubah. |
| R24, R39, R45, R64, R67 | **Draf 5 artikel AI** di `migration/aeo-articles/` (.md untuk review, .html siap tempel ke /admin/, plus README cara terbit). Belum diterbitkan. |
| — | Salinan schema lama di `src/data/pages/home.ts` dihapus; schema spa kini hanya di `src/lib/schema.ts`. |

### Desain blok baru (dipilih 17 Okt)
Setelah tiga putaran opsi, tampilan yang dipilih (mengikuti referensi situs spa kelas atas: Four Seasons Sayan, Belmond Jimbaran Puri, menu spa cetak):

| Blok | Tampilan |
|---|---|
| Visit Us (24 halaman treatment + /about/) | kartu besar bersudut membulat: foto spa di kiri, panel krem di kanan dengan baris label/nilai bergaris emas tipis, satu tombol emas + link "Get directions" (pita gelap ditolak; versi putih di tengah masih ada sebagai `variant="light"`). About memakai foto lain agar tidak dobel. |
| Tabel harga (/seminyak/) | menu spa cetak dua kolom: nama, deskripsi singkat, durasi dengan garis titik ke harga; di HP satu kolom tanpa geser ke samping (tetap `<table>` dengan role ARIA) |
| Area layanan (outcall) | baris tanpa kotak, "ZONE 01" kecil di atas nama area, biaya dan waktu tiba di sampingnya |
| Kotak jawaban artikel | pembuka majalah: label "The short answer", teks serif besar, garis emas di bawahnya |

Opsi lain dan halaman perbandingan /aeo-options/ sudah dihapus.

### Hiasan daun/bunga di setiap section, juga di laptop (17 Okt)
Permintaan: "setiap section harusnya ada hiasan", dan hiasannya harus terlihat di laptop. Screenshot owner diambil di lebar 1280 px (layar 1920 dengan zoom 150%).

- **Penyebab "hilang"**: aturan lama di `decorations.css` (owner, 2 Okt: hiasan tidak boleh menutupi teks) dan aturan bawaan situs live untuk halaman Balinese menyembunyikan hampir semua hiasan di bawah 1400–1500 px. Di 1280 px tidak ada satu pun hiasan di halaman treatment. Ini sudah begitu sebelum pekerjaan AEO.
- **Sekarang**: di 24 halaman treatment, mulai 1200 px, setiap section punya hiasan lagi, tetap tidak menutupi teks. Di laptop (1200–1699 px) ukurannya lebih kecil, atau pindah ke sudut yang kosong di lebar itu (misalnya daun di bawah foto, bukan di bawah daftar; bunga di sebelah daftar, bukan di sebelah judul).
- **Section yang sebelumnya tidak punya hiasan sama sekali kini punya**: Quick facts (bunga merah muda + daun), FAQ (mangkuk spa + daun), Visit Us (kamboja + daun, juga di /about/), link treatment di Day Spa, banner penutup (kelopak bunga + mangkuk spa). Testimoni kini punya nampan spa di kanan dan section "Why guests choose…" punya daun di kiri (dulu sengaja dimatikan di data halaman).
- Pita angka (Experienced Therapists, dst.) dan banner atas tidak ditambah hiasan: pita itu rendah dan isinya selebar layar.
- Di bawah 1200 px (tablet, HP) tidak berubah.
- **Dicek**: pemeriksaan piksel (hiasan yang terlihat tidak boleh berjarak kurang dari 10 px dari teks) di 24 halaman treatment + /about/ pada 1200, 1280, 1366, 1440, 1536, 1600, 1680, 1700, 1800 dan 1920 px.
- File: `src/components/ui/SectionShapes.tsx` (baru), `src/styles/decorations.css` (blok "EVERY SECTION, ON LAPTOPS TOO"), gambar dipilih di `src/app/(site)/seminyak/[slug]/page.tsx`, data 24 JSON treatment (dua nilai `null` dihapus, slider Day Spa diberi hiasan).

## B. Butuh data atau keputusan owner (tidak aku karang)
1. **R11 rating 4.2 dari 193 ulasan** di schema: dari mana angkanya? Samakan dengan Google Business Profile atau hapus. Untuk sekarang dibiarkan.
2. **R9 link Google Business Profile dan TripAdvisor** untuk `sameAs`: URL-nya belum ada di situs dan tidak ketemu lewat pencarian. Sekarang `sameAs` = Facebook + Instagram.
3. **R37 tabel area**: biaya dan waktu tiba untuk area jauh (Kuta, Jimbaran, Uluwatu, Nusa Dua, Sanur, Denpasar, Ubud) belum pernah disebut. Tabel menulis "dikonfirmasi saat booking". Syarat & Ketentuan juga bilang IDR 75.000 hanya berlaku "within Seminyak" (FEE-01).
4. **R44 durasi cream bath**: lama cream bath tunggal tidak tercantum di mana pun (paket menyebut 30 menit atau 1 jam). Belum ditambahkan ke pembuka.
5. **R42 waktu per gaya kepangan**: belum ada datanya; hanya "30 menit sampai 2 jam".
6. **R18 artikel IV Drip**: tetap terindeks. Owner perlu memutuskan: pertahankan (cek klaim medis), tulis ulang, atau noindex.
7. **R31 kalimat keamanan lymphatic** ("Not suitable for"): mohon dicek owner/dokter.
8. **Pembayaran**: footer menulis Visa, Mastercard, Cash; halaman villa juga menyebut transfer bank. FAQ baru di price list hanya menyebut Visa, Mastercard, cash.
9. **R14 halaman About**: cerita pendiri, pelatihan terapis dan standar kebersihan yang lebih rinci bisa ditambah kalau owner memberi datanya.
10. **Couples, Natal & Tahun Baru**: FAQ baru menjawab "Yes" berdasarkan "open daily". Pastikan spa memang buka 25 Desember dan 1 Januari.
11. **Biaya home service untuk hair braiding**: jawaban FAQ hair braiding kini menyebut +IDR 75.000 per terapis (halaman itu sebelumnya tidak menyebut biayanya).
12. **Lymphatic untuk wajah**: daftar area di halaman tidak menyebut wajah, jadi FAQ menulis pijatnya untuk badan (termasuk leher dan tulang selangka) dan menyarankan facial. Ubah kalau wajah ternyata termasuk.
13. **Minyak di semua treatment** (FAQ price list no. 14, kalimat lama): Thai dan Shiatsu di situs disebut tanpa minyak.
14. **Kalimat praktis kecil** yang ditambahkan di FAQ: "kirim foto referensi lewat WhatsApp" (hair braiding), "beri tahu terapis soal kondisi kesehatan" (Thai, Shiatsu), "sebutkan gejala sebelum sesi" (sciatica, deep tissue).

Dari putaran 2:

15. **Lisensi** (FAQ beranda "Is Spa Bali Moon a licensed spa?"): jawabannya "Yes", tapi situs tidak menyebut izin apa. Pastikan, atau ubah kalimatnya.
16. **Walk-in** (FAQ beranda dan price list): "walk-ins are welcome" diambil dari halaman reservasi. Masih berlaku?
17. **Biaya Kuta**: halaman Kuta menulis outcall biasa (IDR 75.000 per terapis), tapi halaman outcall/villa memasukkan Kuta ke area "biaya perjalanan dikonfirmasi". FAQ Kuta mengikuti halaman Kuta dengan catatan itu.
18. **Harga Nail Art tidak sama dengan price list**: halaman Nail Art menulis manicure with colour IDR 159.000 dan pedicure with colour IDR 169.000; di price list manicure + colour = IDR 168.000, pedicure + colour = IDR 208.000. Tidak diubah, perlu dipilih yang benar (schema `Offer` halaman ini ikut angka halaman).
19. **Ear candle**: jawaban kini juga menyarankan ke dokter untuk "masalah telinga apa pun" dan telinga yang terasa tersumbat setelah terbang (lebih hati-hati dari sebelumnya).
20. **Waxing**: kalimat "Mancine Strawberry Hard Wax untuk area sensitif" kini ada di jawaban Brazilian.
21. **Kartu untuk home service**: beberapa jawaban menyebut "Visa, Mastercard atau cash" tanpa syarat; halaman villa bilang pembayaran kartu "subject to availability".
22. **Teks halaman sunburn**: "supports the skin's natural recovery" dan "supports hydration" lebih jauh dari sumber kesehatan (Healthdirect: aloe vera terasa menenangkan tapi tidak mempercepat penyembuhan). Pertimbangkan diperhalus.
23. **Draf artikel**: tiap file di `migration/aeo-articles/` punya daftar "For the owner to confirm" sendiri (pajak/service charge, aturan pembatalan 12 jam untuk home service, box braids dalam 2 jam, Thai/Shiatsu di matras atau ranjang, kebijakan ibu hamil, perbandingan "di bawah kisaran harga day spa", dll.).

## Hasil pengecekan (17 Okt)
- `tsc` dan `eslint`: bersih. `next build`: sukses, 61 halaman (termasuk /about/).
- JSON-LD di HTML hasil build: 41 halaman publik, 0 error parse. Tiap halaman punya `DaySpa`; 24 treatment + outcall + villa punya `Service` + `BreadcrumbList`; 7 artikel punya `Article`. Day Spa tidak punya `Offer` (harganya paket campuran).
- Panjang jawaban FAQ setelah putaran 2: **semua 30 halaman ber-FAQ, 46 sampai 59 kata per jawaban** (rata-rata per halaman 51,7–56,2). Sebelumnya rata-rata 20–37 kata; Diagnosis mencatat rata-rata 26,8 vs 53,7 di Healthy Look.
- Halaman treatment: tanggal "Last updated" kini 17 Oktober. Simpanan /admin/ sebelum 17 Okt 02:00 UTC tidak dipakai lagi (`src/lib/treatments/content.ts`); di staging tidak ada halaman yang disimpan sejak 15 Okt, jadi tidak ada edit owner yang hilang.
- Header: item "About" menambah ±60px. Di lebar ±1400–1500px header memang sudah turun dua baris sebelum perubahan ini (dicek dengan dan tanpa item About).

## Pengecekan akhir (17 Okt)
- **369 pengecekan di 39 halaman, semua lolos** (HTML hasil build produksi): judul dengan "Spa Bali Moon", satu schema `DaySpa` per halaman, `Service` + `Offer` IDR + `BreadcrumbList` di 24 treatment, outcall dan villa, `Article` di 7 artikel, FAQ 40–60 kata di semua halaman, Visit Us di 24 treatment + /about/, tanggal "Last updated" 17 Okt, heading pertanyaan dan tabel menu di /seminyak/, area outcall, H1 villa, link About di header dan footer, kotak "The short answer" di 6 artikel, /about/ di sitemap, /aeo-options/ terhapus.
- **Tampilan di 7 lebar layar** (1920, 1366, 1280, 1024, 768, 390, 360 px) × 11 halaman: tidak ada halaman yang bisa digeser ke samping; blok baru tidak keluar dari layar. Dicek juga secara visual di desktop, tablet (768) dan HP (375/390).
- Diperbaiki selama pengecekan: menu harga tetap dua kolom di tablet (satu kolom hanya di HP); judul di foto FAQ yang terpotong di HP (bawaan lama dari CSS situs live) kini boleh turun baris.
- Bawaan lama, tidak diubah: header turun dua baris di ±1024 px dan ±1400–1500 px (sudah begitu sebelum item "About" ditambah).

## C. Bukan pekerjaan di kode website
- R4–R8, R26–R27, R52–R54, R70–R72: Brand Radar (Ahrefs), prompt, laporan bulanan.
- R12–R13: Search Console, Bing Webmaster, log crawler AI.
- R47–R51: outreach list pihak ketiga, Google Business Profile, TripAdvisor, ulasan, NAP di direktori.
- R24, R39, R45, R64, R67: **menerbitkan** 5 artikel AI lewat /admin/ setelah owner menyetujui drafnya (draf ada, lihat A, putaran 2).
- R19, R29, R41, R56: skor audit AEO (pekerjaan tim SEO).
- R60, R68: jadwal live sebelum pertengahan Desember (deploy).
- Artikel guide Thai: hapus heading "How Facial Massage Supports Skin Wellness" lewat /admin/ (isinya di database).
