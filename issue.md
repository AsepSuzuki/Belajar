# Issue: Implementasi API Logout User

## Deskripsi

Buatkan API untuk logout user. API ini membaca token dari header `Authorization: Bearer <token>`, memvalidasi token di tabel `sessions`, dan jika valid maka menghapus data session tersebut dari database sehingga token tidak bisa digunakan lagi.

---

## 1. Update Service Layer

Update file: `src/services/users_services.ts`

Tambahkan fungsi baru untuk logout:

- **Fungsi: `logoutUser(token)`**
  1. Query ke tabel `sessions` berdasarkan `token`
     - Jika session tidak ditemukan, throw error dengan pesan `"Unauthorized"`
  2. Hapus record session dengan token tersebut dari tabel `sessions`
  3. Return `"OK"` jika berhasil

---

## 2. Update Route

Update file: `src/routes/users-routes.ts`

Tambahkan endpoint baru:

### `DELETE /api/users/login/current`

**Headers:**
```
Authorization: Bearer <token>
```

> Token diambil dari header `Authorization`. Format: `Bearer <token>`. Parse header untuk mengambil bagian token saja (setelah `"Bearer "`).

**Response Body (Success) — Status 200:**
```json
{
    "data": "OK"
}
```

> Jika success logout, data session dengan token tersebut **harus dihapus** dari database (tabel `sessions`). Token yang sama tidak boleh bisa digunakan lagi setelah logout.

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
4. Panggil `logoutUser(token)` dari `users_services.ts`
5. Jika sukses, kembalikan `{ "data": "OK" }` dengan status `200`
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
│   └── users-routes.ts   ← Update: tambahkan endpoint DELETE logout
├── services/
│   └── users_services.ts ← Update: tambahkan fungsi logoutUser
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

**Pastikan token valid (get current user):**
```bash
curl -i -X GET http://localhost:3000/api/users/login/current \
  -H "Authorization: Bearer <token-dari-login>"
```
Expected: `{"data":{...}}` dengan status 200

**Logout dengan token valid (harus berhasil):**
```bash
curl -i -X DELETE http://localhost:3000/api/users/login/current \
  -H "Authorization: Bearer <token-dari-login>"
```
Expected: `{"data":"OK"}` dengan status 200

**Coba get current user lagi dengan token yang sama (harus gagal karena sudah logout):**
```bash
curl -i -X GET http://localhost:3000/api/users/login/current \
  -H "Authorization: Bearer <token-yang-sudah-logout>"
```
Expected: `{"eror":"Unauthorized"}` dengan status 401

**Logout tanpa header Authorization (harus gagal):**
```bash
curl -i -X DELETE http://localhost:3000/api/users/login/current
```
Expected: `{"eror":"Unauthorized"}` dengan status 401

**Logout dengan token asal-asalan (harus gagal):**
```bash
curl -i -X DELETE http://localhost:3000/api/users/login/current \
  -H "Authorization: Bearer token-asal-asalan"
```
Expected: `{"eror":"Unauthorized"}` dengan status 401

---

## Checklist Implementasi

- [x] Tambahkan fungsi `logoutUser` di `src/services/users_services.ts`
- [x] Tambahkan endpoint `DELETE /api/users/login/current` di `src/routes/users-routes.ts`
- [x] Pastikan route terdaftar di `src/index.ts`
- [x] Test manual dengan curl (logout sukses, token sudah tidak valid setelah logout, tanpa header, token salah)

