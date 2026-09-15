# Rencana: Menyiapkan ArthaKu agar Portable untuk Self-Hosting di Rumahweb

## Konteks
ArthaKu saat ini login memakai Google OAuth yang dikelola Emergent (Emergent-managed Auth). Sistem ini terikat ke infrastruktur/domain Emergent, sehingga TIDAK akan berfungsi begitu kode dijalankan di server Rumahweb milik sendiri. Kode sudah digabungkan (push) ke GitHub oleh user.

Catatan penting: saya (agent) hanya bisa mengubah/menyiapkan kode di lingkungan Emergent ini. Saya tidak punya akses ke server Rumahweb untuk melakukan deployment langsung di sana — hasil akhir dari kerja ini adalah kode yang sudah di-update dan di-push ke GitHub, siap user tarik (`git pull`) dan jalankan sendiri di Rumahweb.

## Yang Akan Dikerjakan
1. Ganti mekanisme login dari Emergent-managed Google Auth menjadi Google OAuth mandiri (standalone), menggunakan Client ID & Client Secret dari Google Cloud Console milik user sendiri.
2. Sesuaikan halaman login & alur callback di frontend agar memakai domain Rumahweb user (bukan domain Emergent).
3. Simpan Client ID / Secret sebagai environment variable di backend (tidak hardcode).
4. Update dokumentasi singkat langkah deploy manual (build frontend, jalankan backend, koneksi MongoDB) untuk dijalankan sendiri oleh user di server Rumahweb — tanpa saya menjalankannya untuk mereka.
5. Push perubahan ini ke GitHub yang sudah user siapkan.

## Yang Perlu Diputuskan / Diketahui dari User Sebelum Mulai
1. **Domain final di Rumahweb** — alamat/domain persis yang akan dipakai (contoh: `keuangan.namadomainanda.com`). Ini WAJIB didaftarkan di Google Cloud Console sebagai Authorized JavaScript Origin & Redirect URI, jika tidak login Google akan gagal.
2. **Google Cloud OAuth credentials** — user perlu membuat sendiri Client ID & Client Secret di [Google Cloud Console](https://console.cloud.google.com/) (Enable "Google Sign-In API", buat OAuth Client). Saya akan memandu langkahnya, tapi pembuatan akun/credential itu sendiri harus dilakukan user karena butuh akun Google milik user.
3. **MongoDB di Rumahweb** — Rumahweb (hosting umum Indonesia) biasanya tidak menyediakan MongoDB secara default di paket shared hosting. Asumsi: user akan pakai **MongoDB Atlas (cloud, ada free tier)** atau sudah punya instance MongoDB sendiri. Jika user punya rencana lain (misal MongoDB self-install di VPS), beri tahu supaya connection string disesuaikan.
4. **Tipe hosting Rumahweb** — perlu dipastikan apakah paketnya VPS (bisa jalankan proses Python/Node sendiri) atau shared hosting biasa (umumnya tidak bisa jalankan backend FastAPI/uvicorn). Asumsi: user memakai VPS Rumahweb, karena FastAPI + React + MongoDB membutuhkan kemampuan menjalankan proses server, bukan sekadar hosting file statis.

## Asumsi yang Dipakai Jika Tidak Ada Jawaban
- User memakai paket **VPS Rumahweb** (bukan shared hosting biasa).
- Database akan memakai **MongoDB Atlas** free/shared tier.
- Domain final belum ada → kode akan dibuat generik memakai `window.location.origin`, tapi user tetap WAJIB mendaftarkan domain asli mereka di Google Cloud Console sebelum login Google bisa berfungsi di server Rumahweb.

## Di Luar Ruang Lingkup
- Saya tidak melakukan deployment langsung ke server Rumahweb (tidak ada akses ke server tersebut).
- Konfigurasi tingkat server seperti nginx/reverse proxy, SSL certificate, systemd service di Rumahweb dilakukan sendiri oleh user (akan diberi catatan langkah, bukan dieksekusi oleh saya).
