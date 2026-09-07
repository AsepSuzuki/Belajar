# Issue: Implementasi API Registrasi User

## Deskripsi

Buatkan API untuk registrasi user baru. API ini menerima data user (name, email, password), melakukan hashing password menggunakan bcrypt, dan menyimpan ke database MySQL.

---

## 1. Update Schema Database

Update tabel `users` di `src/db/schema.ts` agar sesuai dengan struktur berikut:

| Kolom        | Tipe             | Keterangan                    |
|-------------|------------------|-------------------------------|
| `id`         | INT              | Auto Increment, Primary Key   |
| `name`       | VARCHAR(255)     | NOT NULL                      |
| `email`      | VARCHAR(255)     | NOT NULL, UNIQUE              |
| `password`   | VARCHAR(255)     | NOT NULL (hash bcrypt)        |
| `created_at` | TIMESTAMP        | DEFAULT CURRENT_TIMESTAMP     |

> **Catatan:** Kolom `updated_at` yang ada di schema sebelumnya bisa dihapus atau tetap dipertahankan sesuai kebutuhan. Yang penting kolom `password` harus ditambahkan.

Setelah schema diubah, jalankan:
```bash
bun run db:generate
bun run db:migrate
```

---

## 2. Install Dependency Tambahan

Install package untuk hashing password:
```bash
bun add bcryptjs
bun add -d @types/bcryptjs
```

> Gunakan `bcryptjs` (pure JS) agar kompatibel dengan Bun runtime.

---

## 3. Buat Service Layer

Buat file baru: `src/services/users_services.ts`

File ini berisi logic bisnis untuk registrasi user:

- **Fungsi: `registerUser(name, email, password)`**
  1. Cek apakah email sudah terdaftar di database
     - Jika sudah terdaftar, throw error dengan pesan `"Email sudah terdaftar"`
  2. Hash password menggunakan bcrypt (salt rounds: 10)
  3. Insert data user baru ke tabel `users` (name, email, hashed password)
  4. Return `"OK"` jika berhasil

---

## 4. Buat Route

Buat file baru: `src/routes/users-routes.ts`

Definisikan endpoint:

### `POST /api/users`

**Request Body:**
```json
{
    "name": "Bayy",
    "email": "bayy@localhost",
    "password": "bayy123"
}
```

**Response Body (Success) — Status 201:**
```json
{
    "data": "OK"
}
```

**Response Body (Error: Email duplikat) — Status 400:**
```json
{
    "eror": "Email sudah terdaftar"
}
```

**Langkah di route handler:**
1. Validasi request body menggunakan Elysia typebox (`t.Object`):
   - `name`: string, minLength 1
   - `email`: string, format email
   - `password`: string, minLength 6
2. Panggil `registerUser()` dari `users_services.ts`
3. Jika sukses, kembalikan `{ "data": "OK" }` dengan status `201`
4. Jika error (email duplikat), kembalikan `{ "eror": "Email sudah terdaftar" }` dengan status `400`

---

## 5. Register Route ke Server

Di `src/index.ts`, import dan `.use()` route baru dari `src/routes/users-routes.ts`.

> **Catatan:** Hapus atau sesuaikan route CRUD users lama di `src/routes/users.ts` jika konflik dengan endpoint baru.

---

## 6. Struktur Folder

Pastikan struktur folder di dalam `src/` mengikuti konvensi ini:

```
src/
├── db/
│   ├── index.ts
│   └── schema.ts        ← Update: tambahkan kolom password
├── routes/
│   ├── index.ts
│   ├── users.ts          ← Route lama (opsional dipertahankan)
│   └── users-routes.ts   ← [NEW] Route registrasi
├── services/
│   └── users_services.ts ← [NEW] Logic bisnis registrasi
├── env.ts
└── index.ts              ← Update: register route baru
```

**Konvensi penamaan file:**
- Folder `routes/` → format: `nama-routes.ts` (kebab-case)
- Folder `services/` → format: `nama_services.ts` (snake_case)

---

## 7. Testing Manual

Setelah implementasi selesai, test dengan perintah berikut:

**Registrasi user baru (harus berhasil):**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Bayy","email":"bayy@localhost","password":"bayy123"}'
```
Expected: `{"data":"OK"}` dengan status 201

**Registrasi dengan email yang sama (harus gagal):**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Bayy2","email":"bayy@localhost","password":"bayy456"}'
```
Expected: `{"eror":"Email sudah terdaftar"}` dengan status 400

---

## Checklist Implementasi

- [x] Update schema `users` di `src/db/schema.ts` (tambah kolom `password`, sesuaikan kolom lain)
- [x] Jalankan `bun run db:generate` dan `bun run db:migrate`
- [x] Install `bcryptjs` dan `@types/bcryptjs`
- [x] Buat `src/services/users_services.ts` dengan fungsi `registerUser`
- [x] Buat `src/routes/users-routes.ts` dengan endpoint `POST /api/users`
- [x] Register route baru di `src/index.ts`
- [x] Test manual dengan curl
