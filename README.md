# Proyek Capstone: Kosongin (Backend API)

## 1. Tentang Proyek

Aplikasi ini merupakan *Backend API Service* yang dibangun menggunakan **Node.js, Express.js, TypeScript, dan PostgreSQL** sebagai bagian dari proyek akhir (Capstone Project) program Veteran Tech 2026.

**Kosongin** hadir sebagai platform "rem digital" dan ruang refleksi bagi Gen Z dan Milenial untuk membangun kebiasaan belanja yang lebih sadar (*mindful consumption*). Aplikasi ini fokus pada intervensi perilaku sebelum transaksi (melalui *Impulse Shield*), pelacakan riwayat konsumsi, dan penyediaan wadah aksi nyata melalui *Community Challenges* untuk mengatasi *eco-guilt*.

🧾 **Informasi Proyek**
- **Program/Acara:** Capstone Project - Veteran Tech 2026
- **Tema:** SDG 12 (Responsible Consumption) x SDG 9 (Industry, Innovation and Infrastructure)
- **Kelompok:** Kelompok 1

👥 **Anggota Kelompok**

| No | Nama Lengkap | Peran / Role |
|---|---|---|
| 1 | Tania Syarofina Aliyah | Product Manager |
| 2 | Jeremia Marco Namara | Product Manager |
| 3 | Nawra Nashiramitha Fawza | Front-End Developer |
| 4 | Andhika Rahman | Front-End Developer |
| 5 | Kemal Satya Wibowo | Back-End Developer |
| 6 | Radya Muhammad Ikmal | Back-End Developer |
| 7 | Prasasti Nurul Septiana | UI/UX Designer |

---

## 2. Tech Stack
  Project ini dibangun dengan arsitektur modern berbasis Node.js:
   - Language: TypeScript
   - Framework: Express.js
   - Database ORM: Drizzle ORM (dengan PostgreSQL)
   - Validation: Zod (Schema-based validation)
   - Authentication: JSON Web Token (JWT)
   - Job Scheduler: Node-cron (untuk pengingat dan update otomatis)
   - API Documentation: OpenAPI/Scalar (direpresentasikan di openapi.yaml)
   - Deployment: Railway

  ---
---

## 3. Prerequisites & Requirements

Sebelum memulai, pastikan sistem Anda memiliki:
- **Node.js** v18.x atau lebih tinggi ([Download](https://nodejs.org/))
- **npm** v9.x atau lebih tinggi (biasanya disertakan dengan Node.js)
- **PostgreSQL** v12 atau lebih tinggi (database server lokal atau remote)
- **Git** untuk cloning repository

Verifikasi instalasi:
```bash
node --version    # Harus v18.x+
npm --version     # Harus v9.x+
```

---

## 4
  Berikut adalah peta dari direktori src/:

    1 src/
---

## 5 4 ├── db/                 # Definisi Schema database dan migrasi (Drizzle)
    5 ├── middlewares/        # Fungsi perantara (Auth, Error handling, Validation)
    6 ├── query/              # Layer akses data (Query SQL mentah/Drizzle)
    7 ├── routes/             # Definisi endpoint API dan pemetaan ke controller
    8 ├── schemas/            # Definisikan skema Zod untuk validasi data
    9 ├── utility/            # Fungsi bantuan (Email, Cron jobs, Custom Error)

  Fungsi File-File Penting:
   - src/index.ts: Entry point aplikasi. Menjalankan server, menghubungkan rute, dan memulai Cron Jobs.
   - src/db/schema.ts: "Single source of truth" untuk struktur tabel database. Semua tabel (Users, Consumptions, Wishlists, dll) didefinisikan
     di sini.
   - src/middlewares/auth.middleware.ts: Menangani verifikasi JWT dan Role-Based Access Control (RBAC).
   - src/utility/reminder.cron.ts: Berisi logika otomatisasi yang berjalan di background (misal: mengirim email pengingat harian).

  ---

  4. Aliran Data (Data Flow)

  Memahami bagaimana data bergerak dari request user hingga ke database:

   1. Request: User memanggil endpoint (misal: POST /api/consumption-logs).
   2. Routing (routes/): Request diterima oleh router. Di sini, middleware validasi dipanggil pertama kali.
   3. Validation (middlewares/validation.middleware.ts & schemas/): Data di req.body atau req.query diperiksa menggunakan Zod. Jika tidak
      valid, API langsung mengembalikan error 400.
   4. Authentication (middlewares/auth.middleware.ts): Jika endpoint diproteksi, middleware akan mengecek token JWT dan menyuntikkan data user
      ke req.user.
   5. Controller (controllers/): Jika validasi & auth lolos, controller mengambil alih. Controller bertugas mengolah logika (misal: menghitung
      sesuatu) tapi tidak melakukan query langsung.
   6. Query (query/): Controller memanggil fungsi di layer Query. Di sini Drizzle ORM melakukan interaksi dengan database PostgreSQL.

---

## 6. Quick Start - Cara Memulai Lokal

### Step 1: Clone Repository
```bash
git clone https://github.com/polaariiss/kosongin-backend.git
cd kosongin-backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Setup Environment Variables
Salin `.env.example` ke `.env`:
```bash
cp .env.example .env
```

Kemudian edit `.env` dan isi nilai-nilai berikut dengan kredensial Anda:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/kosongin_db

# Cloudinary (untuk upload gambar)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key
RESEND_SENDER=noreply@kosongin.example.com

# Upload Folders
UPLOAD_CONSUMPTION_FOLDER=consumptions
UPLOAD_CHALLENGE_POSTER_FOLDER=challenges

# Environment
NODE_ENV=development

# Frontend URL (untuk CORS)
FRONTEND_URL=http://localhost:3000

# Admin Special Code
ADMIN_SPECIAL_CODE=your_admin_code
```

> **⚠️ Catatan:** Jangan commit file `.env` ke repository. Gunakan `.env.example` sebagai template.

### Step 4: Setup Database
Jalankan migrasi schema ke database PostgreSQL Anda:
```bash
npm run db:push
```

(Alternatif: Jika ingin generate migrasi baru, gunakan `npm run db:generate`)

### Step 5: (Opsional) Seed Database
Jika ingin mengisi database dengan data dummy untuk testing:
```bash
npm run db:seed
```

### Step 6: Jalankan Server
Untuk development dengan hot reload:
```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000` (atau port lain yang terdefinisi).

Atau untuk production:
```bash
npm run build
npm start
```

---

## 7. API Documentation

Dokumentasi API tersedia di dua format:

### Scalar UI (Recommended)
Akses dokumentasi API interaktif di:
```
http://localhost:3000/api/docs
```

### OpenAPI Specification
File lengkap OpenAPI spec tersedia di:
```
./openapi.yaml
```

Anda bisa import file ini ke Postman atau tools lainnya untuk testing.

---

## 8. Testing dengan Postman

### Import Postman Collection
1. Buka Postman
2. Klik **Import** → **File**
3. Pilih Postman collection file (jika disediakan di repo)
4. Collection akan berisi semua endpoint yang sudah dikonfigurasi

### Atau Manual Setup
Jika tidak ada pre-made collection:
1. Set Base URL: `http://localhost:3000/api`
2. Gunakan dokumentasi OpenAPI di bagian [API Documentation](#7-api-documentation)
3. Untuk endpoint yang memerlukan auth, tambahkan header:
   ```
   Authorization: Bearer YOUR_JWT_TOKEN
   ```

---

## 9. Available Scripts

| Command | Deskripsi |
|---------|-----------|
| `npm run dev` | Jalankan server dalam dev mode dengan hot reload |
| `npm run build` | Build TypeScript ke JavaScript |
| `npm start` | Jalankan production build |
| `npm run lint` | Cek code style dengan ESLint |
| `npm run format` | Format code dengan Prettier |
| `npm run db:push` | Sinkronkan schema database |
| `npm run db:generate` | Generate migrasi database baru |
| `npm run db:seed` | Seed database dengan data dummy |

---

## 10. Production Deployment

### URL Production
```
Vercel: https://kosongin.vercel.app
```

```
Railway: https://postgres-production-53aa.up.railway.app
```

### Environment Variables untuk Production
Pastikan environment variables berikut sudah dikonfigurasi di platform deployment (Railway/Vercel/etc):
- `DATABASE_URL` → Production PostgreSQL URL
- `NODE_ENV=production`
- `CLOUDINARY_*` → Production credentials
- `RESEND_API_KEY` → Production email service key
- `FRONTEND_URL` → Production frontend URL
- Semua variabel lainnya sesuai dengan `.env.example`

---

## 11. Troubleshooting

### Port 3000 sudah terpakai
```bash
# Ubah port di src/index.ts atau set environment variable PORT
PORT=3001 npm run dev
```

### Database connection error
- Pastikan PostgreSQL server berjalan
- Cek `DATABASE_URL` di `.env` sudah benar
- Verifikasi credentials database

### Hot reload tidak berfungsi (dev mode)
```bash
npm install -g tsx  # Install tsx globally
npm run dev
```

---

## 12. Kontribusi & Feedback

Untuk reporting bugs atau request features, buka issue di repository:
```
https://github.com/polaariiss/kosongin-backend/issues
```

---

