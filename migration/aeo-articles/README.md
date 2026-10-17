# Draf 5 artikel AEO (roadmap R24, R39, R45, R64, R67)

Ditulis 17 Oktober 2026 untuk direview owner sebelum diterbitkan. **Belum
terbit**: artikel guide ada di database dan diterbitkan lewat /admin/.

| Baris | File | Judul | Terjadwal |
|---|---|---|---|
| R24 | `r24-massage-price-bali` | How Much Is a Massage in Bali? Seminyak Price Guide | Okt minggu 4 |
| R39 | `r39-villa-massage-outcall` | Can You Get a Massage in Your Villa in Bali? How Outcall Massage Works | Nov minggu 2 |
| R45 | `r45-hair-braiding-bali` | Hair Braiding in Bali: Styles, Time and Price | Nov minggu 3 |
| R64 | `r64-sunburn-bali` | What Helps a Bad Sunburn in Bali? | Des minggu 2 |
| R67 | `r67-balinese-thai-shiatsu` | Balinese vs Thai vs Shiatsu Massage: Which One Should You Book in Bali? | Des minggu 3 |

Tiap artikel punya dua file:

- **`.md`**: draf lengkap untuk direview: kolom SEO di atas (SEO title, meta
  description, slug, excerpt, kategori), isi artikel, FAQ, sumber, dan di akhir
  **"For the owner to confirm"** (pertanyaan yang harus dijawab owner dulu).
- **`.html`**: isi artikel saja (tanpa kolom SEO dan tanpa daftar konfirmasi
  owner), siap ditempel ke editor /admin/.

## Cara menerbitkan (setelah owner setuju)

1. Jawab dan perbaiki poin "For the owner to confirm" di file `.md`, lalu
   jalankan ulang konversi ke `.html` (atau sunting langsung di /admin/).
2. Di /admin/ › New: isi Title, Slug, Excerpt, SEO title, SEO description dari
   kolom di atas file `.md`; tempel isi `.html` ke editor; pilih foto sampul.
3. Harga pasar di R24 (dari panduan wisata 2026) perlu dicek ulang sebelum
   terbit, lalu setahun sekali.
4. Artikel ini sudah dibuka dengan jawaban yang menyebut Spa Bali Moon dan
   link treatment, jadi **jangan** tambahkan baris untuknya di
   `src/data/guide/answers.ts` (kotak jawaban akan dobel).
5. Setelah R67 terbit, tambahkan link ke artikel itu dari R24 dan dari halaman
   Balinese, Thai dan Shiatsu.
