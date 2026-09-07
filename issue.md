# Project Setup: REST API dengan Bun + ElysiaJS + Drizzle + MySQL

## Deskripsi

Buat project REST API baru di repository ini menggunakan **Bun** sebagai runtime, **ElysiaJS** sebagai framework HTTP, **Drizzle ORM** untuk database layer, dan **MySQL** sebagai database.

---

## 1. Inisialisasi Project

- Inisialisasi project Bun baru di root folder (`bun init`)
- Setup TypeScript config yang sesuai
- Buat struktur folder:
  ```
  src/
  ├── index.ts          # Entry point, setup server ElysiaJS
  ├── db/
  │   ├── index.ts      # Koneksi database & Drizzle instance
  │   └── schema.ts     # Definisi schema/tabel Drizzle
  ├── routes/
  │   └── index.ts      # Definisi routes API
  └── env.ts            # Validasi environment variables
  ```

## 2. Install Dependencies

- **Runtime:** Bun (sudah terinstall)
- **Framework:** `elysia`
- **ORM:** `drizzle-orm`, `drizzle-kit`
- **MySQL Driver:** `mysql2`
- **Env:** `@t3-oss/env-core` + `zod` (opsional, untuk validasi env)

## 3. Konfigurasi Database

- Buat file `.env` dengan variable koneksi MySQL (`DATABASE_URL` atau host/port/user/password/database terpisah)
- Buat file `.env.example` sebagai template
- Setup koneksi Drizzle ke MySQL menggunakan `mysql2`
- Buat `drizzle.config.ts` untuk konfigurasi Drizzle Kit (migrasi, dsb.)

## 4. Schema Database

- Buat minimal 1 contoh tabel di `src/db/schema.ts` (misalnya tabel `users` dengan kolom `id`, `name`, `email`, `created_at`)
- Pastikan schema menggunakan Drizzle MySQL schema builder (`mysqlTable`)

## 5. Setup ElysiaJS Server

- Buat instance Elysia di `src/index.ts`
- Pasang routes dari folder `routes/`
- Buat minimal endpoint CRUD dasar untuk contoh tabel di atas:
  - `GET /users` — ambil semua data
  - `GET /users/:id` — ambil data by ID
  - `POST /users` — buat data baru
  - `PUT /users/:id` — update data
  - `DELETE /users/:id` — hapus data
- Server listen di port dari env variable (default `3000`)

## 6. Script & Tooling

- Tambahkan script di `package.json`:
  - `dev` — jalankan server dengan hot reload (`bun run --watch src/index.ts`)
  - `db:generate` — generate migrasi Drizzle (`drizzle-kit generate`)
  - `db:migrate` — jalankan migrasi (`drizzle-kit migrate`)
  - `db:studio` — buka Drizzle Studio (`drizzle-kit studio`)
- Buat `.gitignore` yang sesuai (node_modules, .env, dll.)

## 7. Dokumentasi

- Update `README.md` dengan:
  - Deskripsi singkat project
  - Cara install & menjalankan
  - Cara setup database
  - Cara menjalankan migrasi

---

## Catatan

- Pastikan semua kode menggunakan **TypeScript**
- Gunakan **ESM** (import/export), bukan CommonJS
- Ikuti konvensi Drizzle ORM terbaru untuk MySQL
- Tidak perlu auth/middleware kompleks, cukup setup dasar yang bersih dan siap dikembangkan
