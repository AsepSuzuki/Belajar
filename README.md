# Belajar REST API

Aplikasi ini adalah sebuah REST API sederhana yang dirancang sebagai sarana pembelajaran untuk membangun backend modern dengan performa tinggi. Proyek ini mengimplementasikan sistem Autentikasi (Register, Login, Get Current User) serta operasi CRUD dasar untuk mengelola entitas User.

---

## 🛠️ Technology Stack & Libraries

Proyek ini dibangun menggunakan teknologi dan *library* modern:
- **Runtime:** [Bun](https://bun.sh) (v1.0+) - Runtime JavaScript/TypeScript yang sangat cepat, mencakup bundler, test runner, dan package manager bawaan.
- **Framework Web:** [ElysiaJS](https://elysiajs.com) - Framework web berkinerja tinggi yang dirancang untuk Bun.
- **ORM (Object-Relational Mapping):** [Drizzle ORM](https://orm.drizzle.team) - ORM TypeScript yang ringan dan *type-safe*.
- **Database Driver:** `mysql2` - Digunakan untuk berinteraksi dengan database MySQL atau MariaDB.
- **Validasi Skema:**
  - `Elysia t` (TypeBox bawaan ElysiaJS) untuk validasi request body/params API.
  - `Zod` untuk memvalidasi *environment variables* saat aplikasi dijalankan.
- **Keamanan:** `bcryptjs` - Untuk hashing dan komparasi password dengan aman.
- **Test Runner:** `bun:test` - Modul pengujian bawaan dari Bun.

---

## 📂 Arsitektur & Struktur Direktori

Aplikasi ini memisahkan antara layer *routing* (HTTP layer) dan layer *business logic* (Service layer).

```
├── drizzle/              # Berkas SQL migrasi yang di-generate oleh Drizzle Kit
├── src/
│   ├── db/
│   │   ├── index.ts      # Konfigurasi dan inisialisasi koneksi pool database (Drizzle + mysql2)
│   │   └── schema.ts     # Definisi skema tabel database
│   ├── routes/           # Layer Routing (menangani HTTP request, response, dan validasi via Elysia)
│   │   ├── index.ts      # Agregator route API
│   │   ├── users.ts      # Rute CRUD dasar (/users)
│   │   └── users-routes.ts # Rute Authentication & Registrasi (/api/users)
│   ├── services/         # Layer Business Logic
│   │   └── users_services.ts # Logika untuk register, login, dan fetch user
│   ├── env.ts            # Validasi environment variable
│   └── index.ts          # Entry point utama aplikasi
├── tests/                # Direktori untuk unit test
│   ├── users-auth.test.ts
│   └── users-crud.test.ts
├── .env                  # Environment variables lokal
├── package.json          # Konfigurasi project dan dependencies
└── tsconfig.json         # Konfigurasi TypeScript
```

### Konvensi Penamaan File
- **Routes:** Menggunakan format *kebab-case*. Contoh: `users-routes.ts`.
- **Services:** Menggunakan format *snake_case*. Contoh: `users_services.ts`.
- **Tests:** Berakhiran `.test.ts`. Contoh: `users-auth.test.ts`.

---

## 🗄️ Database Schema

Aplikasi ini memiliki 2 tabel utama yang berelasi:

### 1. Tabel `users`
Menyimpan informasi pengguna.
- `id` (INT, Primary Key, Auto Increment)
- `name` (VARCHAR 255, NOT NULL)
- `email` (VARCHAR 255, NOT NULL, UNIQUE)
- `password` (VARCHAR 255, NOT NULL)
- `created_at` (TIMESTAMP, Default CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, Default CURRENT_TIMESTAMP ON UPDATE)

### 2. Tabel `sessions`
Menyimpan data sesi login (token) yang merujuk ke tabel `users`.
- `token` (VARCHAR 255, Primary Key) - Berisi string UUID.
- `user_id` (INT, Foreign Key references `users(id) ON DELETE CASCADE`)
- `created_at` (TIMESTAMP, Default CURRENT_TIMESTAMP)

---

## 📡 Endpoint API Tersedia

### Authentication & Current User
| Method | Endpoint | Deskripsi | Request Body / Headers |
|---|---|---|---|
| `POST` | `/api/users` | Registrasi User baru | `{ "name": "...", "email": "...", "password": "..." }` |
| `POST` | `/api/users/login` | Login user untuk mendapat token | `{ "email": "...", "password": "..." }` |
| `GET` | `/api/users/login/current` | Mendapatkan data user yang sedang login | **Header:** `Authorization: Bearer <token>` |

### CRUD Users
| Method | Endpoint | Deskripsi | Request Body / Params |
|---|---|---|---|
| `GET` | `/api/users` | Mengambil semua user (tanpa password) | - |
| `GET` | `/api/users/:id` | Mengambil detail 1 user | Params: `id` |
| `PUT` | `/api/users/:id` | Memperbarui nama/email user | `{ "name": "...", "email": "..." }` |
| `DELETE`| `/api/users/:id` | Menghapus user | Params: `id` |

*(Catatan: Rute CRUD juga tersedia melalui prefix `/users` bawaan).*

---

## 🚀 Cara Setup Project

### Prasyarat
- [Bun](https://bun.sh/) (Disarankan versi v1.0.0 ke atas)
- Server MySQL atau MariaDB yang sedang berjalan.

### Langkah-langkah Setup

1. **Clone dan Install Dependensi**
   ```bash
   git clone <url-repo>
   cd Belajar
   bun install
   ```

2. **Persiapkan Database MySQL**
   Buat database kosong bernama `belajar_db` di server MySQL Anda:
   ```sql
   CREATE DATABASE belajar_db;
   ```

3. **Konfigurasi Environment**
   Buat atau edit file `.env` berdasarkan spesifikasi environment Anda:
   ```env
   PORT=3000
   DATABASE_HOST=localhost
   DATABASE_PORT=3306
   DATABASE_USER=root
   DATABASE_PASSWORD=password_anda
   DATABASE_NAME=belajar_db
   DATABASE_URL=mysql://root:password_anda@localhost:3306/belajar_db
   ```

4. **Jalankan Migrasi Database**
   Drizzle Kit digunakan untuk men-generate skema SQL dan mendorongnya ke database:
   ```bash
   # Melakukan generate file migrasi SQL
   bun run db:generate

   # Mengaplikasikan migrasi ke database yang terhubung
   bun run db:migrate
   ```
   *(Opsional) Anda bisa membuka Drizzle Studio untuk melihat isi tabel secara GUI:*
   ```bash
   bun run db:studio
   ```

5. **Jalankan Aplikasi**
   ```bash
   # Menjalankan server dalam mode watch (hot reload untuk development)
   bun run dev

   # Menjalankan server (production)
   bun run start
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

---

## 🧪 Cara Testing Aplikasi

Aplikasi ini sudah dilengkapi dengan unit test yang mencakup semua fungsionalitas API (100% endpoint ter-cover).

Pengujian memanfaatkan test runner bawaan Bun (`bun:test`) dan Elysia mock request via `app.handle(new Request(...))` sehingga pengujian bisa dilakukan langsung terhadap instance aplikasi tanpa perlu menyalakan port server HTTP aktif.

**Catatan Penting Pengujian:**
Saat menjalankan test, database Anda akan dimanipulasi. Setiap skenario pengujian (`beforeEach`) akan **menghapus semua isi tabel `users` dan `sessions`** untuk memastikan lingkungan test yang selalu bersih dan konsisten.

### Menjalankan Unit Test
Jalankan perintah berikut di terminal:
```bash
bun run test
```
atau langsung menggunakan perintah internal bun:
```bash
bun test
```

Bun akan secara otomatis mencari file di dalam direktori `tests/` yang berakhiran `.test.ts` (seperti `users-auth.test.ts` dan `users-crud.test.ts`) dan menjalankan semua skenario positif serta negatif yang ada (total ~25 skenario).
