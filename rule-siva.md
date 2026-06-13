# RULE — SIKLUS WANITA
## Aplikasi Web Progresif Pemantau Siklus Menstruasi

---

## 1. Informasi Umum Proyek

| Atribut | Detail |
|---|---|
| Nama Proyek | Siklus Wanita |
| Jenis | Progressive Web App (PWA) |
| Tujuan | Membantu pengguna memantau, memahami, dan memprediksi siklus menstruasi melalui dasbor visual yang intuitif, jurnal harian, dan rekomendasi gaya hidup terpersonalisasi |
| Target Pengguna | Wanita usia reproduktif (umumnya 15–45 tahun), individu maupun pasangan yang ingin memantau kesuburan |
| Mode Akses | Tamu (Guest, local storage) dan Terdaftar (Registered, Firebase Auth + Realtime Database) |
| Domain Rencana | namadomain.web.id |
| Hosting/Deployment | Vercel |

---

## 2. Teknologi & Arsitektur

### 2.1 Frontend
- **Framework**: Next.js (App Router, React Server Components untuk halaman statis/edukasi, Client Components untuk dasbor interaktif)
- **Styling**: Tailwind CSS dengan sistem desain kustom (lihat `design-siva.md`)
- **State Management**: React Context + custom hooks (`useCycleData`, `useAuth`, `useJournal`)
- **Visualisasi**: Library chart/lingkaran kustom (SVG) untuk roda siklus, `recharts` atau `chart.js` untuk grafik tren mood/energi
- **Animasi**: Framer Motion untuk transisi antar halaman dan komponen dasbor

### 2.2 Backend & Database
- **Autentikasi**: Firebase Authentication
  - Metode: Email/Password (wajib), opsional Google Sign-In
- **Database**: Firebase Realtime Database (RTDB)
  - Digunakan untuk menyimpan profil pengguna, riwayat siklus, entri jurnal, dan data admin
- **Local Storage**: Browser `localStorage` / `IndexedDB` untuk pengguna mode Tamu

### 2.3 PWA
- `manifest.json` dengan ikon multi-resolusi, `theme_color`, `background_color`, `display: standalone`
- Service Worker (via `next-pwa` atau Workbox) untuk caching aset statis dan dukungan offline-first pada data lokal
- Dukungan "Add to Home Screen" di Android (Chrome) dan iOS (Safari)

### 2.4 Deployment
- Repository di-deploy ke **Vercel**, terhubung dengan domain `.web.id`
- Environment variables Firebase (`NEXT_PUBLIC_FIREBASE_*`) dikonfigurasi di Vercel Project Settings
- Build otomatis pada setiap push ke branch `main`

---

## 3. Peran Pengguna (User Roles)

| Role | Akses | Penyimpanan Data |
|---|---|---|
| **Tamu (Guest)** | Dasbor, kalender, jurnal, prediksi — tanpa login | `localStorage` browser |
| **Pengguna Terdaftar (User)** | Seluruh fitur Tamu + sinkronisasi multi-perangkat, backup data | Firebase Realtime Database (`users/{uid}`) |

---

## 4. Alur Sistem (System Flow)

### 4.1 Kunjungan Pertama (Onboarding)
1. Pengguna membuka halaman utama → diarahkan ke `/onboarding` jika belum ada data siklus (cek `localStorage` atau sesi Firebase).
2. Layar sambutan singkat menjelaskan fungsi aplikasi (1–2 slide, opsional skip).
3. Form input data awal:
   - **Hari pertama haid terakhir (HPHT)** — date picker
   - **Rata-rata durasi siklus** — input angka (default 28 hari, rentang valid 21–35 hari)
   - **Rata-rata durasi menstruasi** — input angka (default 5 hari, rentang valid 2–10 hari)
4. Setelah submit, data disimpan ke `localStorage` (mode Tamu) dan algoritma kalkulasi fase dijalankan secara langsung di sisi klien.
5. Pengguna diarahkan ke Dasbor Utama (`/`).
6. Banner non-intrusif muncul menawarkan opsi "Buat Akun untuk Mencadangkan Data" — dapat ditutup dan dimunculkan kembali secara periodik.

### 4.2 Pendaftaran & Migrasi Data (Guest → Registered)
1. Pengguna memilih "Daftar" → form Email, Password, Konfirmasi Password.
2. Setelah `createUserWithEmailAndPassword` berhasil, sistem memeriksa keberadaan data siklus di `localStorage`.
3. Jika ada, data tersebut otomatis diunggah (migrasi satu kali) ke `users/{uid}/profile` dan `users/{uid}/cycles` di RTDB, lalu `localStorage` dibersihkan.
4. Sesi selanjutnya, seluruh pembacaan/penulisan data dilakukan terhadap RTDB.

### 4.3 Login
1. Form Email & Password → `signInWithEmailAndPassword`.
2. Setelah autentikasi sukses, sistem mengambil data dari `users/{uid}` dan menyinkronkan ke state aplikasi.
3. Jika gagal (kredensial salah, akun tidak ditemukan), tampilkan pesan error berbahasa Indonesia yang ramah.

### 4.4 Sesi Berjalan
- Setiap kali pengguna mencatat siklus baru atau mengisi jurnal, data ditulis secara real-time:
  - Tamu → `localStorage`
  - Terdaftar → `users/{uid}/...` di RTDB (listener `onValue` untuk sinkronisasi multi-perangkat)

---

## 5. Algoritma Kalkulasi Fase Siklus

Algoritma dijalankan di sisi klien (client-side computation) berdasarkan tiga input dasar:
- `lastPeriodStart` (tanggal HPHT)
- `cycleLength` (rata-rata durasi siklus, hari)
- `periodLength` (rata-rata durasi menstruasi, hari)

### 5.1 Pembagian Fase

| Fase | Rentang Hari (dihitung dari hari ke-1 siklus) | Karakteristik |
|---|---|---|
| **Menstruasi** | Hari 1 sampai `periodLength` | Peluruhan dinding rahim |
| **Folikular** | Hari (`periodLength` + 1) sampai (`ovulationDay` − 1) | Pematangan folikel, hormon estrogen meningkat |
| **Ovulasi** | `ovulationDay` ± 1 hari (jendela 3 hari) | Pelepasan sel telur, masa subur puncak |
| **Luteal** | (`ovulationDay` + 2) sampai `cycleLength` | Penebalan dinding rahim, persiapan menstruasi berikutnya / PMS |

### 5.2 Rumus Inti

```
ovulationDay = cycleLength - 14
// (estimasi standar: ovulasi terjadi ~14 hari sebelum siklus berikutnya)

fertileWindowStart = ovulationDay - 4
fertileWindowEnd   = ovulationDay + 1

nextPeriodDate = lastPeriodStart + cycleLength (hari)

cycleDayToday = (today - lastPeriodStart) % cycleLength + 1
```

### 5.3 Penentuan Fase Hari Ini
Fungsi `getCurrentPhase(cycleDayToday)` mengembalikan salah satu dari: `menstruasi`, `folikular`, `ovulasi`, `luteal`, berdasarkan tabel rentang pada poin 5.1.

### 5.4 Pembaruan Otomatis Siklus Baru
- Sistem memeriksa apakah `today >= nextPeriodDate`.
- Jika pengguna mengonfirmasi menstruasi baru telah dimulai (melalui tombol "Tandai Hari Pertama Haid"), maka:
  - Siklus sebelumnya disimpan ke riwayat (`cycles/{cycleId}`) dengan `actualCycleLength` terhitung.
  - `lastPeriodStart` diperbarui ke tanggal konfirmasi.
  - `cycleLength` rata-rata dapat dihitung ulang dari 3–6 siklus terakhir untuk meningkatkan akurasi prediksi (adaptive prediction).

---

## 6. Struktur Data — Firebase Realtime Database

```
users/
  {uid}/
    profile/
      email: string
      displayName: string
      createdAt: timestamp
      cycleSettings/
        lastPeriodStart: date (ISO)
        cycleLength: number
        periodLength: number
        averageCycleLength: number   // hasil adaptive calculation
    cycles/
      {cycleId}/
        startDate: date
        endDate: date
        actualCycleLength: number
        actualPeriodLength: number
    journal/
      {YYYY-MM-DD}/
        mood: string            // contoh: "senang", "cemas", "mudah_tersinggung"
        energyLevel: number     // skala 1–5
        symptoms: array<string> // contoh: ["kram", "sakit_kepala", "kembung"]
        notes: string
        cyclePhaseAtEntry: string

### 6.1 Aturan Keamanan (Security Rules — ringkasan)
- `users/{uid}/*` → hanya dapat dibaca/ditulis oleh pengguna dengan `auth.uid === uid`.
- Validasi tipe data pada `cycleSettings` (misalnya `cycleLength` harus berupa angka antara 21–35).

---

## 7. Spesifikasi Fitur Utama

### 7.1 Dasbor Utama (`/`)
- **Visualisasi Siklus Melingkar (Cycle Wheel)**: representasi 28–35 hari dalam bentuk lingkaran, dibagi menjadi 4 segmen warna sesuai fase (lihat `design-siva.md` untuk palet warna).
- Indikator posisi "Hari ini" pada roda siklus.
- Ringkasan kartu info:
  - Fase saat ini & deskripsi singkat
  - Hari ke-berapa dalam siklus (contoh: "Hari ke-14 dari 28")
  - Estimasi menstruasi berikutnya (countdown hari)
  - Estimasi masa subur (rentang tanggal)
- Tombol aksi cepat: "Tandai Hari Pertama Haid", "Isi Jurnal Hari Ini"

### 7.2 Kalender Interaktif (`/calendar`)
- Tampilan kalender bulanan dengan penandaan warna per hari sesuai fase.
- Klik pada tanggal menampilkan detail: fase, prediksi vs aktual (jika sudah lewat), dan entri jurnal hari itu (jika ada).
- Navigasi antar bulan dengan transisi halus (Framer Motion).

### 7.3 Mesin Prediksi
- Menampilkan estimasi:
  - Tanggal mulai menstruasi berikutnya
  - Rentang masa subur (fertile window)
  - Perkiraan tanggal ovulasi
- Tingkat keyakinan prediksi (label sederhana: "Berdasarkan rata-rata 3 siklus terakhir") jika data riwayat ≥ 3 siklus tersedia.

### 7.4 Jurnal Harian (`/journal`)
- Form input harian:
  - **Mood**: pilihan ikon emosi (senang, sedih, cemas, mudah tersinggung, tenang, dll.)
  - **Tingkat Energi**: skala bintang/slider 1–5
  - **Keluhan Fisik**: multi-select chip (kram, sakit kepala, kembung, nyeri punggung, payudara sensitif, mual, dll.)
  - **Catatan tambahan**: textarea bebas
- Riwayat jurnal dapat dilihat dalam tampilan daftar atau grafik tren (mood/energi terhadap waktu, dikorelasikan dengan fase siklus).

### 7.5 Rekomendasi Gaya Hidup Terpersonalisasi (`/insights` atau bagian dasbor)
- Konten rekomendasi diambil dari `admin/content` berdasarkan `relatedPhase` yang cocok dengan fase pengguna saat ini.
- Kategori rekomendasi: nutrisi, olahraga, manajemen stres, pola tidur.
- Jika pengguna mencatat keluhan tertentu di jurnal (misalnya "kram" pada fase menstruasi), sistem dapat menampilkan rekomendasi tambahan yang relevan (rule-based, bukan AI generatif).

### 7.6 Pengaturan & Profil (`/settings`)
- Edit `cycleLength`, `periodLength`, `lastPeriodStart`
- Toggle notifikasi (jika menggunakan push notification — opsional fase lanjutan)
- Untuk pengguna terdaftar: ubah email/password, ekspor data (JSON), hapus akun
- Untuk pengguna tamu: opsi "Buat Akun" / "Masuk"



## 9. Autentikasi & Privasi Data

- **Mode Tamu**: seluruh data tersimpan lokal di perangkat (`localStorage`), tidak pernah dikirim ke server kecuali pengguna memilih membuat akun.
- **Mode Terdaftar**: data dikirim ke Firebase RTDB melalui koneksi HTTPS, dilindungi oleh Firebase Security Rules berbasis `auth.uid`.
- Tidak ada data kesehatan yang dibagikan ke pihak ketiga.
- Pesan validasi dan notifikasi sistem menggunakan **Bahasa Indonesia** yang jelas dan empatik (contoh: "Tanggal haid terakhir tidak boleh di masa depan", "Durasi siklus harus antara 21–35 hari").

---

## 10. Konfigurasi PWA

- `manifest.json`:
  - `name`: "Siklus Wanita"
  - `short_name`: "Siklus Wanita"
  - `display`: "standalone"
  - `start_url`: "/"
  - `theme_color` & `background_color` sesuai palet desain (lihat `design-siva.md`)
  - Ikon: 192x192 dan 512x512 (format PNG, mendukung maskable icon)
- Service Worker:
  - Caching strategi "Cache First" untuk aset statis (CSS, font, ikon)
  - "Network First" untuk data Firebase, dengan fallback ke cache saat offline
- Dukungan instalasi "Add to Home Screen" diuji pada Chrome (Android/Desktop) dan Safari (iOS)

---

## 11. Struktur Halaman / Routing (Next.js App Router)

```
/                     → Dasbor Utama
/onboarding           → Pengisian data awal (hanya tampil jika belum ada data siklus)
/calendar             → Kalender interaktif
/journal              → Jurnal harian & riwayat
/insights             → Rekomendasi gaya hidup
/settings             → Pengaturan profil & siklus
/login                → Halaman masuk
/register             → Halaman daftar
```

---

## 12. Kebutuhan Non-Fungsional

- **Performa**: navigasi antar halaman instan (client-side routing Next.js), waktu muat awal < 2 detik pada koneksi 4G.
- **Responsivitas**: desain mobile-first, diuji pada lebar layar 320px–1440px.
- **Aksesibilitas**: kontras warna sesuai WCAG AA, navigasi dapat diakses via keyboard, label ARIA pada elemen interaktif.
- **Kompatibilitas Browser**: Chrome, Safari, Edge, Firefox (versi 2 tahun terakhir).
- **Offline Support**: dasbor utama dan data siklus yang sudah dimuat tetap dapat diakses tanpa koneksi internet (mode Tamu maupun cache data terakhir untuk pengguna terdaftar).

---

## 13. Tahapan Pengembangan (Ringkasan)

1. Setup proyek Next.js + Tailwind + konfigurasi PWA
2. Implementasi onboarding & algoritma kalkulasi fase (mode Tamu, local storage)
3. Implementasi Dasbor Utama & visualisasi roda siklus
4. Implementasi Kalender Interaktif
5. Implementasi Jurnal Harian & riwayat
6. Integrasi Firebase Authentication (Login/Register) & migrasi data Tamu → Terdaftar
7. Integrasi Firebase Realtime Database untuk sinkronisasi data
8. Implementasi Rekomendasi Gaya Hidup (Insights)
9. Pengujian responsivitas, PWA installability, dan aksesibilitas
10. Deployment ke Vercel & konfigurasi domain `.web.id`

---

*Dokumen ini menjadi acuan pengembangan teknis untuk Siklus Wanita. Untuk spesifikasi visual, tipografi, palet warna, dan tata letak antarmuka, lihat dokumen pendamping `design-siva.md`.*
