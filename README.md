# Belajar REST API: Bun + ElysiaJS + Drizzle ORM + MySQL

REST API starter project yang dibangun menggunakan runtime [Bun](https://bun.sh), web framework [ElysiaJS](https://elysiajs.com), ORM [Drizzle ORM](https://orm.drizzle.team), dan database [MySQL / MariaDB](https://mariadb.org).

---

## 📁 Struktur Direktori

```
├── drizzle/              # Berkas SQL migrasi yang dihasilkan Drizzle Kit
├── src/
│   ├── db/
│   │   ├── index.ts      # Setup koneksi database (mysql2/promise + Drizzle)
│   │   └── schema.ts     # Definisi schema/tabel database (users)
│   ├── routes/
│   │   ├── index.ts      # Agregator route API (/api)
│   │   └── users.ts      # Endpoints CRUD Users (/users)
│   ├── env.ts            # Validasi dan pemetaan environment variable (Zod)
│   └── index.ts          # Entry point server ElysiaJS
├── .env                  # Environment variables lokal
├── .env.example          # Template environment variables
├── drizzle.config.ts     # Konfigurasi Drizzle Kit
├── package.json          # Konfigurasi script dan dependensi
└── tsconfig.json         # Konfigurasi TypeScript
```

---

## 🚀 Memulai

### 1. Prasyarat
- [Bun](https://bun.sh) (v1.0+)
- MySQL atau MariaDB Server yang sedang berjalan

### 2. Instalasi Dependensi
```bash
bun install
```

### 3. Konfigurasi Environment (`.env`)
Salin berkas `.env.example` ke `.env` (atau edit file `.env` yang ada):
```bash
cp .env.example .env
```
Sesuaikan kredensial database Anda:
```env
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_NAME=belajar_db
DATABASE_URL=mysql://root:@localhost:3306/belajar_db
```

### 4. Migrasi Database
Pastikan database telah dibuat di MySQL (`CREATE DATABASE belajar_db;`), kemudian jalankan:
```bash
# Generate berkas migrasi SQL berdasarkan schema
bun run db:generate

# Terapkan migrasi ke database
bun run db:migrate
```

Untuk melihat database via antarmuka visual:
```bash
bun run db:studio
```

### 5. Menjalankan Server
```bash
# Mode development (dengan hot-reload)
bun run dev

# Mode production
bun run start
```
Server akan berjalan di `http://localhost:3000`.

---

## 📡 Endpoint API

| Method | Path | Deskripsi |
|---|---|---|
| `GET` | `/` | Health check server |
| `GET` | `/users` atau `/api/users` | Mengambil seluruh daftar user |
| `GET` | `/users/:id` | Mengambil data user berdasarkan ID |
| `POST` | `/users` | Menambahkan user baru (Body: `{ "name": "...", "email": "..." }`) |
| `PUT` | `/users/:id` | Memperbarui data user |
| `DELETE` | `/users/:id` | Menghapus data user |

---

## 🛠️ Script Tersedia

- `bun run dev`: Menjalankan server dalam mode development dengan watch mode.
- `bun run start`: Menjalankan server.
- `bun run db:generate`: Membuat file migrasi baru dari `schema.ts`.
- `bun run db:migrate`: Mengeksekusi migrasi ke database MySQL.
- `bun run db:studio`: Membuka Drizzle Studio di browser.
