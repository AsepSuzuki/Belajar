# Issue: Implementasi API Login User

## Deskripsi

Buatkan API untuk login user. API ini menerima data login (email, password), memverifikasi kredensial terhadap data di database, dan jika berhasil mengembalikan token UUID yang disimpan di tabel `sessions`.

---

## 1. Buat Tabel Sessions

Tambahkan tabel `sessions` di `src/db/schema.ts` dengan struktur berikut:

| Kolom        | Tipe           | Keterangan                              |
|-------------|----------------|-----------------------------------------|
| `id`         | INT            | Auto Increment, Primary Key             |
| `token`      | VARCHAR(255)   | NOT NULL (isinya UUID)                  |
| `user_id`    | INT            | Foreign Key ke tabel `users` kolom `id` |
| `created_at` | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP               |

> **Catatan:** Pastikan kolom `user_id` memiliki relasi foreign key ke tabel `users`. Gunakan `references` dari Drizzle ORM untuk mendefinisikan FK.

Setelah schema ditambahkan, jalankan:
```bash
bun run db:generate
bun run db:migrate
```

---

## 2. Update Service Layer

Update file: `src/services/users_services.ts`

Tambahkan fungsi baru untuk login:

- **Fungsi: `loginUser(email, password)`**
  1. Query ke tabel `users` berdasarkan `email`
     - Jika user tidak ditemukan, throw error dengan pesan `"Email atau password salah"`
  2. Bandingkan `password` yang dikirim dengan hash password di database menggunakan `bcrypt.compare()`
     - Jika tidak cocok, throw error dengan pesan `"Email atau password salah"`
  3. Generate token UUID menggunakan `crypto.randomUUID()` (built-in di Bun/Node.js, tidak perlu install package tambahan)
  4. Simpan token ke tabel `sessions` dengan `user_id` dari user yang ditemukan
  5. Return token UUID tersebut

---

## 3. Update Route

Update file: `src/routes/users-routes.ts`

Tambahkan endpoint baru:

### `POST /api/users/login`

**Request Body:**
```json
{
    "email": "bayy@localhost",
    "password": "bayy123"
}
```

**Response Body (Success) — Status 200:**
```json
{
    "data": "550e8400-e29b-41d4-a716-446655440000"
}
```

> Nilai `"data"` berisi token UUID yang dihasilkan saat login.

**Response Body (Error: Kredensial salah) — Status 400:**
```json
{
    "eror": "Email atau password salah"
}
```

**Langkah di route handler:**
1. Validasi request body menggunakan Elysia typebox (`t.Object`):
   - `email`: string (gunakan pattern regex seperti endpoint registrasi)
   - `password`: string, minLength 1
2. Panggil `loginUser()` dari `users_services.ts`
3. Jika sukses, kembalikan `{ "data": "<token>" }` dengan status `200`
4. Jika error (email/password salah), kembalikan `{ "eror": "Email atau password salah" }` dengan status `400`

---

## 4. Register Route ke Server

Pastikan route baru sudah terdaftar di `src/index.ts`.

> Jika `users-routes.ts` sudah di-import dan di-`.use()` di `src/index.ts`, tidak perlu perubahan tambahan — cukup tambahkan endpoint baru di file yang sama.

---

## 5. Struktur Folder

Pastikan struktur folder di dalam `src/` tetap mengikuti konvensi ini:

```
src/
├── db/
│   ├── index.ts
│   └── schema.ts        ← Update: tambahkan tabel sessions
├── routes/
│   ├── index.ts
│   ├── users.ts
│   └── users-routes.ts   ← Update: tambahkan endpoint login
├── services/
│   └── users_services.ts ← Update: tambahkan fungsi loginUser
├── env.ts
└── index.ts
```

**Konvensi penamaan file:**
- Folder `routes/` → format: `nama-routes.ts` (kebab-case)
- Folder `services/` → format: `nama_services.ts` (snake_case)

---

## 6. Testing Manual

Setelah implementasi selesai, test dengan perintah berikut:

**Pastikan user sudah terdaftar terlebih dahulu (registrasi):**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Bayy","email":"bayy@localhost","password":"bayy123"}'
```

**Login dengan kredensial yang benar (harus berhasil):**
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bayy@localhost","password":"bayy123"}'
```
Expected: `{"data":"<uuid-token>"}` dengan status 200

**Login dengan password salah (harus gagal):**
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bayy@localhost","password":"salah123"}'
```
Expected: `{"eror":"Email atau password salah"}` dengan status 400

**Login dengan email tidak terdaftar (harus gagal):**
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tidak@ada","password":"bayy123"}'
```
Expected: `{"eror":"Email atau password salah"}` dengan status 400

---

## Checklist Implementasi

- [x] Tambahkan tabel `sessions` di `src/db/schema.ts` dengan FK ke `users`
- [x] Jalankan `bun run db:generate` dan `bun run db:migrate`
- [x] Tambahkan fungsi `loginUser` di `src/services/users_services.ts`
- [x] Tambahkan endpoint `POST /api/users/login` di `src/routes/users-routes.ts`
- [x] Pastikan route terdaftar di `src/index.ts`
- [x] Test manual dengan curl (login sukses, password salah, email tidak terdaftar)

