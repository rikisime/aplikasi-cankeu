# Panduan Deploy ArthaKu ke Server Sendiri (Rumahweb / lainnya)

Aplikasi ini sekarang memakai **Google OAuth mandiri** (bukan lagi login yang dikelola Emergent), jadi bisa dijalankan di domain mana pun setelah dikonfigurasi.

## 1. Membuat Google OAuth Client ID & Secret

1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Buat project baru (atau pakai project yang sudah ada).
3. Buka menu **APIs & Services > OAuth consent screen**.
   - Pilih User Type: **External**.
   - Isi nama app (misal "ArthaKu"), email support, dan email developer.
   - Tambahkan scope: `email`, `profile`, `openid` (biasanya sudah default).
   - Simpan.
4. Buka menu **APIs & Services > Credentials > Create Credentials > OAuth Client ID**.
   - Application type: **Web application**.
   - Name: bebas, misal "ArthaKu Web".
   - **Authorized JavaScript origins** — tambahkan SEMUA domain yang akan mengakses app ini:
     ```
     https://keuanganku.sabdalabs.com
     https://money-flow-dashboard-8.preview.emergentagent.com
     ```
     (baris kedua opsional, hanya jika masih ingin testing di preview Emergent)
   - **Authorized redirect URIs**: boleh dikosongkan — login memakai mode popup (`flow: "auth-code"` dengan `redirect_uri: "postmessage"`), jadi tidak perlu redirect URI terdaftar.
   - Klik **Create**. Simpan **Client ID** dan **Client Secret** yang muncul.

## 2. Isi Environment Variables

**backend/.env**
```
MONGO_URL="<connection string MongoDB Anda>"
DB_NAME="arthaku"
CORS_ORIGINS="https://keuanganku.sabdalabs.com"
GOOGLE_CLIENT_ID="<Client ID dari langkah 1>"
GOOGLE_CLIENT_SECRET="<Client Secret dari langkah 1>"
```

**frontend/.env**
```
REACT_APP_BACKEND_URL=https://keuanganku.sabdalabs.com
REACT_APP_GOOGLE_CLIENT_ID="<Client ID yang SAMA dengan di backend>"
```

## 3. Database MongoDB

Rumahweb (hosting umum Indonesia) biasanya **tidak menyediakan MongoDB** di paket standar. Opsi termudah:

1. Buat akun gratis di [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Buat cluster gratis (Shared/M0).
3. Buat database user + password, dan whitelist IP server Rumahweb Anda (atau `0.0.0.0/0` untuk uji coba awal).
4. Ambil connection string, contoh:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Masukkan ke `MONGO_URL` di `backend/.env`.

## 4. Build & Jalankan

**Frontend (build statis):**
```bash
cd frontend
yarn install
yarn build
# hasil build ada di folder frontend/build — upload folder ini ke public_html (atau subdomain) di Rumahweb
```

**Backend (FastAPI):**
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001
```

## 5. ⚠️ Catatan Penting: Tipe Hosting Rumahweb

Anda menyebutkan memakai **shared hosting biasa** (bukan VPS). Ini penting untuk diketahui:

- **Shared hosting standar** umumnya hanya melayani file statis (HTML/PHP) dan **tidak bisa menjalankan proses Python/FastAPI (uvicorn) yang harus terus berjalan** di background/port tertentu.
- Beberapa panel cPanel (termasuk sebagian paket Rumahweb) menyediakan fitur **"Setup Python App"** (via CloudLinux Passenger). Jika tersedia di paket Anda, backend FastAPI bisa dijalankan lewat fitur ini — namun perlu dicek langsung ke Rumahweb apakah paket Anda mendukungnya, dan biasanya perlu sedikit adaptasi (wrapper `passenger_wsgi.py`).
- Jika paket Anda **tidak mendukung Python App**, backend FastAPI **tidak akan bisa berjalan** di shared hosting tersebut. Opsi realistis:
  1. **Upgrade ke VPS Rumahweb** — paling direkomendasikan, karena Anda bisa menjalankan uvicorn + nginx + systemd secara penuh.
  2. **Hosting backend di layanan lain** (misal Railway/Render/VPS murah) sementara frontend tetap di Rumahweb sebagai file statis, lalu arahkan `REACT_APP_BACKEND_URL` ke domain backend tersebut.

Silakan konfirmasi ke tim support Rumahweb apakah paket Anda memiliki fitur "Setup Python App" di cPanel sebelum lanjut — ini akan menentukan opsi mana yang bisa dipakai.

## 6. Checklist Sebelum Live
- [ ] Google Client ID & Secret sudah diisi di kedua `.env`
- [ ] Domain `keuanganku.sabdalabs.com` sudah didaftarkan di Google Cloud Console (Authorized JavaScript origins)
- [ ] SSL/HTTPS aktif di domain (cookie session pakai `secure=True`, wajib HTTPS)
- [ ] MongoDB Atlas (atau MongoDB lain) sudah bisa diakses dari server Rumahweb
- [ ] CORS_ORIGINS di backend/.env sudah diisi domain Rumahweb yang benar (bukan `*`, untuk keamanan)
