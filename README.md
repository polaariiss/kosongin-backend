# Proyek Capstone: Kosongin (Backend API)

1. Tentang Proyek
Aplikasi ini merupakan *Backend API Service* yang dibangun menggunakan **___** sebagai bagian dari proyek akhir (Capstone Project) program Veteran Tech 2026.

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


  2. Tech Stack
  Project ini dibangun dengan arsitektur modern berbasis Node.js:
   - Language: TypeScript
   - Framework: Express.js
   - Database ORM: Drizzle ORM (dengan PostgreSQL)
   - Validation: Zod (Schema-based validation)
   - Authentication: JSON Web Token (JWT)
   - Job Scheduler: Node-cron (untuk pengingat dan update otomatis)
   - API Documentation: OpenAPI/Swagger (direpresentasikan di openapi.yaml)

  ---

  3. Struktur Project & Penjelasan Folder

  Berikut adalah peta dari direktori src/:

    1 src/
    2 ├── config/             # Konfigurasi pihak ketiga (Database, Cloudinary)
    3 ├── controllers/        # Logika bisnis utama & penanganan Request/Response
    4 ├── db/                 # Definisi Schema database dan migrasi (Drizzle)
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
  5. Cara Memulai
   1. Environment: Salin .env.example menjadi .env dan isi kredensial database Anda.
   2. Database: Jalankan npx drizzle-kit push:pg untuk mensinkronisasi schema ke database lokal Anda.
   3. Development: Jalankan npm run dev untuk memulai server dengan mode watch (hot reload).
   4. Testing: Gunakan Postman Collection yang sudah disediakan untuk mencoba endpoint-endpoint yang ada.