# Issue: Implementasi API Get Current User

## Deskripsi

Buatkan API untuk mengambil data user yang sedang login berdasarkan token session. API ini membaca token dari header `Authorization: Bearer <token>`, memvalidasi token di tabel `sessions`, dan mengembalikan data user yang terkait.

---

## 1. Update Service Layer

Update file: `src/services/users_services.ts`

Tambahkan fungsi baru untuk mendapatkan user saat ini:

- **Fungsi: `getCurrentUser(token)`**
  1. Query ke tabel `sessions` berdasarkan `token`
     - Jika session tidak ditemukan, throw error dengan pesan `"Unauthorized"`
  2. Ambil `user_id` dari session yang ditemukan
  3. Query ke tabel `users` berdasarkan `user_id` (atau gunakan join)
     - Jika user tidak ditemukan, throw error dengan pesan `"Unauthorized"`
  4. Return data user (hanya kolom: `id`, `name`, `email`, `created_at`)
     - **Jangan** kembalikan kolom `password`

---

## 2. Update Route

Update file: `src/routes/users-routes.ts`

Tambahkan endpoint baru:

### `GET /api/users/login/current`

**Headers:**
```
Authorization: Bearer <token>
```

> Token diambil dari header `Authorization`. Format: `Bearer <token>`. Parse header untuk mengambil bagian token saja (setelah `"Bearer "`).

**Response Body (Success) — Status 200:**
```json
{
    "data": {
        "id": 1,
        "name": "bayy",
        "email": "bayy@localhost",
        "created_at": "timestamp"
    }
}
```

**Response Body (Error: Token tidak valid / tidak ada) — Status 401:**
```json
{
    "eror": "Unauthorized"
}
```

**Langkah di route handler:**
1. Ambil header `Authorization` dari request (`headers.authorization`)
2. Cek apakah header ada dan diawali dengan `"Bearer "`
   - Jika tidak ada atau format salah, kembalikan status `401` dengan `{ "eror": "Unauthorized" }`
3. Extract token dari header (hapus prefix `"Bearer "`)
4. Panggil `getCurrentUser(token)` dari `users_services.ts`
5. Jika sukses, kembalikan `{ "data": { id, name, email, created_at } }` dengan status `200`
6. Jika error (token tidak valid), kembalikan `{ "eror": "Unauthorized" }` dengan status `401`

---

## 3. Register Route ke Server

Pastikan route baru sudah terdaftar di `src/index.ts`.

> Jika `users-routes.ts` sudah di-import dan di-`.use()` di `src/index.ts`, tidak perlu perubahan tambahan — cukup tambahkan endpoint baru di file yang sama.

---

## 4. Struktur Folder

Pastikan struktur folder di dalam `src/` tetap mengikuti konvensi ini:

```
src/
├── db/
│   ├── index.ts
│   └── schema.ts
├── routes/
│   ├── index.ts
│   ├── users.ts
│   └── users-routes.ts   ← Update: tambahkan endpoint GET current user
├── services/
│   └── users_services.ts ← Update: tambahkan fungsi getCurrentUser
├── env.ts
└── index.ts
```

**Konvensi penamaan file:**
- Folder `routes/` → format: `nama-routes.ts` (kebab-case)
- Folder `services/` → format: `nama_services.ts` (snake_case)

---

## 5. Testing Manual

Setelah implementasi selesai, test dengan perintah berikut:

**Login terlebih dahulu untuk mendapatkan token:**
```bash
curl -s -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bayy@localhost","password":"bayy123"}'
```
Catat nilai `data` (token UUID) dari response.

**Get current user dengan token valid (harus berhasil):**
```bash
curl -i -X GET http://localhost:3000/api/users/login/current \
  -H "Authorization: Bearer <token-dari-login>"
```
Expected: `{"data":{"id":1,"name":"bayy","email":"bayy@localhost","created_at":"..."}}` dengan status 200

**Get current user tanpa header Authorization (harus gagal):**
```bash
curl -i -X GET http://localhost:3000/api/users/login/current
```
Expected: `{"eror":"Unauthorized"}` dengan status 401

**Get current user dengan token asal-asalan (harus gagal):**
```bash
curl -i -X GET http://localhost:3000/api/users/login/current \
  -H "Authorization: Bearer token-asal-asalan"
```
Expected: `{"eror":"Unauthorized"}` dengan status 401

---

## Checklist Implementasi

- [x] Tambahkan fungsi `getCurrentUser` di `src/services/users_services.ts`
- [x] Tambahkan endpoint `GET /api/users/login/current` di `src/routes/users-routes.ts`
- [x] Pastikan route terdaftar di `src/index.ts`
- [x] Test manual dengan curl (token valid, tanpa header, token salah)
