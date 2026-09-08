# Issue: Pembuatan Unit Test untuk Seluruh API

## Deskripsi
Buatkan unit test untuk semua API yang tersedia pada aplikasi ini menggunakan test runner bawaan Bun (`bun test`).
Simpan seluruh file unit test di dalam folder `tests/`.

## Aturan Penting
1. **Konsistensi Data:** Sebelum menjalankan setiap skenario test, pastikan untuk menghapus/mereset data di tabel terkait (misalnya tabel `users` dan `sessions`) agar test selalu berjalan di lingkungan data yang bersih (clean state).
2. **Framework:** Gunakan framework bawaan `bun:test` (`describe`, `it`, `expect`, `beforeEach`/`afterEach`).
3. **Struktur Folder:** Letakkan file test di dalam folder `tests/` (contoh: `tests/users-auth.test.ts`, `tests/users-crud.test.ts`).

---

## Skenario Test

Berikut adalah skenario test per API yang harus diimplementasikan. Buatkan unit test selengkap mungkin berdasarkan skenario berikut:

### 1. Registrasi User (`POST /api/users`)
- **Positif:**
  - Registrasi dengan data valid harus mengembalikan status 201 Created dan pesan sukses.
- **Negatif:**
  - Registrasi gagal jika format email tidak valid.
  - Registrasi gagal jika field `name`, `email`, atau `password` kosong.
  - Registrasi gagal jika email sudah digunakan oleh user lain.
  - Registrasi gagal jika panjang input melebihi 255 karakter (validasi panjang).

### 2. Login User (`POST /api/users/login`)
- **Positif:**
  - Login berhasil dengan email dan password yang benar, dan mengembalikan token UUID.
- **Negatif:**
  - Login gagal jika email tidak ditemukan.
  - Login gagal jika password salah.
  - Login gagal dengan input email yang tidak valid atau terlalu panjang.

### 3. Get Current User (`GET /api/users/login/current`)
- **Positif:**
  - Request dengan header `Authorization: Bearer <token_valid>` yang ada di tabel sessions harus mengembalikan data user saat ini (id, name, email, created_at) tanpa kolom password.
- **Negatif:**
  - Request gagal (401 Unauthorized) jika tidak menyertakan header Authorization.
  - Request gagal (401 Unauthorized) jika format header Authorization salah (tidak memakai `Bearer`).
  - Request gagal (401 Unauthorized) jika token tidak ditemukan di database (invalid atau sudah terhapus).

### 4. Get All Users (`GET /api/users`)
- **Positif:**
  - Jika tidak ada data user, kembalikan array kosong.
  - Jika ada data user, kembalikan list semua user (hanya mengembalikan id, name, email, created_at).

### 5. Get User By ID (`GET /api/users/:id`)
- **Positif:**
  - Request dengan ID yang terdaftar di database akan mengembalikan detail data user tersebut.
- **Negatif:**
  - Request gagal (404 Not Found) jika ID tidak ada di database.
  - Request gagal (400 Bad Request) jika ID yang diberikan bukan angka valid.

### 6. Update User (`PUT /api/users/:id`)
- **Positif:**
  - Berhasil mengubah `name` saja pada user yang valid.
  - Berhasil mengubah `email` saja pada user yang valid.
- **Negatif:**
  - Update gagal (404 Not Found) jika ID tidak ditemukan.
  - Update gagal (400 Bad Request) jika format email baru tidak valid.

### 7. Delete User (`DELETE /api/users/:id`)
- **Positif:**
  - Berhasil menghapus user yang valid dari database.
- **Negatif:**
  - Delete gagal (404 Not Found) jika ID tidak ditemukan.

---
**Catatan untuk Junior Programmer / AI:**
Silakan lengkapi detail implementasinya, seperti setup Drizzle DB, inisiasi aplikasi Elysia untuk di-request langsung lewat `app.handle(new Request(...))`, dan pembersihan data di block `beforeEach`. Gunakan skenario di atas sebagai acuan.

