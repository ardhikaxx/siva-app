# SIVA (Siklus Interaktif Vitalitas wanitA) 🌸

SIVA adalah aplikasi *FemTech* revolusioner dan komprehensif yang dirancang untuk membantu wanita melacak siklus menstruasi, memahami pola tubuh, dan mengelola kesehatan reproduksi dengan cara yang sangat personal, aman, dan interaktif. Dibangun dengan antarmuka yang modern, responsif, dan kaya akan animasi mulus.

---

## ✨ Fitur Unggulan

### 1. Pelacakan Siklus Cerdas & Prediksi
*   **Algoritma Cerdas:** Memprediksi masa menstruasi, jendela kesuburan, dan masa ovulasi berdasarkan riwayat siklus Anda.
*   **Mode Pengguna Khusus:** Aplikasi dapat beradaptasi sesuai dengan fase hidup Anda:
    *   **Normal:** Pelacakan menstruasi standar.
    *   **Program Hamil (TTC):** Melacak suhu basal tubuh (BBT) dan mencatat tes kesuburan.
    *   **Kehamilan:** Melacak usia kehamilan per minggu berdasarkan Hari Perkiraan Lahir (HPL).
    *   **Kontrasepsi:** Sinkronisasi cerdas dengan metode KB yang digunakan (Pil, IUD, Suntik, Implan).
*   **Fokus Sindrom:** Mengubah kuesioner medis sesuai kebutuhan bagi penderita **PCOS** atau **Endometriosis**.

### 2. Jurnal Kesehatan Tingkat Lanjut
*   **Pelacakan Komprehensif:** Catat Suasana Hati, Energi, Intensitas Nyeri (Skala 1-10), Obat-obatan, Suhu Tubuh (BBT), Berat Badan, dan Durasi Tidur setiap hari.
*   **Pelacak Intensitas Pendarahan (Flow Tracker):** Memantau volume pendarahan harian (Bercak, Ringan, Sedang, Sangat Banyak).
*   **Pengingat Cerdas:** Pengingat sisa pembalut sebelum menstruasi datang.

### 3. Wawasan & Korelasi Cerdas (Advanced Analytics)
*   **Korelasi SIVA:** Algoritma yang secara otomatis menemukan hubungan sebab-akibat dari rutinitas harian Anda (misal: "Tidur kurang dari 6 jam memicu kram yang lebih parah" atau "Minum cukup air meredakan gejala kembung").
*   **Deteksi Dini PMDD:** Peringatan otomatis jika aplikasi mendeteksi perubahan suasana hati ekstrem di fase Luteal (Pramenstruasi).
*   **Peringatan Medis (Health SOS):** Deteksi dini jika siklus terlalu pendek (<21 hari), terlalu panjang (>35 hari), durasi haid ekstrem (>8 hari), atau tingkat nyeri yang tidak normal.

### 4. Gamifikasi & Motivasi
*   **Jurnal Rutin (Streaks):** Dapatkan lencana *Streak* 🔥 untuk setiap hari berturut-turut Anda mengisi jurnal.
*   **Hydro Homie 💧:** Tantangan gamifikasi untuk mencatat minum air putih minimal 8 gelas sehari.

### 5. Komunitas & Laporan Medis
*   **SIVA Sisterhood:** Forum diskusi anonim yang aman bagi sesama wanita untuk saling mendukung, bercerita, dan berbagi pengalaman tanpa takut dihakimi.
*   **Pembuat Laporan Medis (PDF Export):** Ekspor otomatis ringkasan siklus, riwayat keluhan, dan data 90 hari terakhir Anda ke dalam format PDF yang rapi, siap untuk dicetak dan dibawa saat konsultasi ke dokter kandungan (Obgyn).
*   **Pusat Edukasi:** Ribuan artikel kesehatan reproduksi berkinerja tinggi yang dimuat seketika tanpa *lagging* berkat sistem paginasi cerdas.

### 6. Kustomisasi UI/UX
*   **Tema Dinamis:** Ganti warna aplikasi (Peach, Matcha, Ocean, Cyberpunk, Lavender) sesuai selera.
*   **Dukungan Multi-Bahasa:** Tersedia dalam Bahasa Indonesia (ID) dan English (EN).
*   **Transisi Halus:** Didukung oleh Framer Motion untuk *micro-interactions* yang premium.

---

## 💻 Tech Stack
*   **Framework:** Next.js 16+ (App Router) dengan Turbopack.
*   **Styling:** TailwindCSS
*   **Database & Auth:** Firebase (Realtime Database & Authentication)
*   **Animasi:** Framer Motion
*   **Grafik:** Recharts
*   **Ikonografi:** Lucide React
*   **Tanggal & Waktu:** Date-fns

---

## 🚀 Cara Menjalankan Secara Lokal

1. **Clone repository ini:**
   ```bash
   git clone https://github.com/ardhikaxx/siva-app.git
   ```
2. **Masuk ke direktori proyek:**
   ```bash
   cd siva-app
   ```
3. **Instal dependensi:**
   ```bash
   npm install
   ```
4. **Jalankan server pengembangan (Development Server):**
   ```bash
   npm run dev
   ```
5. **Buka di Browser:**
   Akses `http://localhost:3000` di *browser* favorit Anda.

---

## 🔒 Privasi dan Keamanan Data
Semua data jurnal yang dimasukkan ke dalam aplikasi SIVA sepenuhnya dienkripsi dan disimpan dengan aman menggunakan Firebase. SIVA didesain sebagai ruang privat yang berfokus penuh pada **kesehatan wanita**, karenanya SIVA dengan sengaja *tidak mengimplementasikan* fitur pelacak keuangan atau koneksi langsung ke akun pasangan demi menjaga otonomi medis pengguna.

---
*Dibuat untuk kesejahteraan wanita, oleh teknologi masa depan.*
