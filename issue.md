# Issue: Perbaikan Bug Validasi Panjang Input pada Registrasi User

## Deskripsi

Saat ini, jika seorang user mencoba melakukan registrasi dengan nama (atau data lain) yang melebihi 255 karakter, sistem akan mengalami error. Hal ini disebabkan karena skema database (MySQL) membatasi panjang kolom sebesar `VARCHAR(255)`, tetapi validasi di sisi aplikasi (ElysiaJS) belum memberikan batasan maksimal yang sesuai.

Akibatnya, query SQL akan gagal dan API akan mengembalikan pesan error internal yang berisi detail query dan *hash password* kepada client. Hal ini merupakan celah keamanan (information disclosure) yang harus segera diperbaiki.

---

## 1. Update Validasi di Routing Layer

Update file: `src/routes/users-routes.ts`

Tambahkan batasan `maxLength: 255` pada skema validasi `t.Object` untuk endpoint **POST `/api/users`** (Registrasi).

- **Sebelumnya:**
  ```typescript
  body: t.Object({
    name: t.String({ minLength: 1 }),
    email: t.String({ pattern: "^[^\\s@]+@[^\\s@]+$" }),
    password: t.String({ minLength: 1 }),
  }),
  ```

- **Perbaikan yang harus dilakukan:**
  1. Tambahkan properti `maxLength: 255` pada field `name`.
  2. Tambahkan properti `maxLength: 255` pada field `email`.
  3. Tambahkan properti `maxLength: 255` pada field `password`.

  *Catatan:* Panjang `VARCHAR` di database (`src/db/schema.ts`) untuk ketiga kolom tersebut adalah 255.

---

## 2. Update Validasi di Endpoint Login (Opsional tetapi disarankan)

Pada file yang sama (`src/routes/users-routes.ts`), endpoint **POST `/api/users/login`** juga menerima input `email` dan `password`. Agar konsisten, tambahkan juga batasan `maxLength: 255` pada skema validasi endpoint ini.

---

## 3. Testing Manual

Setelah perbaikan dilakukan, uji coba menggunakan `curl` atau aplikasi seperti Postman:

**Testing Nama Lebih dari 255 Karakter (Harus Gagal oleh Validasi Elysia, bukan Database):**
```bash
# Membuat nama dengan 300 karakter 'a'
NAME=$(printf 'a%.0s' {1..300})

curl -s -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$NAME\", \"email\":\"longname@localhost\", \"password\":\"password123\"}"
```
*Expected Result:* HTTP Status `400 Bad Request` atau `422 Unprocessable Entity` yang berasal dari validasi bawaan ElysiaJS (biasanya berupa response JSON dengan pesan error spesifik terkait `maxLength`), **bukan** error yang berisi kalimat `"Failed query: insert into..."`.

---

## Checklist Implementasi

- [x] Buka file `src/routes/users-routes.ts`.
- [x] Tambahkan `maxLength: 255` pada field `name`, `email`, dan `password` di validasi endpoint POST `/api/users`.
- [x] Tambahkan `maxLength: 255` pada field `email` dan `password` di validasi endpoint POST `/api/users/login`.
- [x] Lakukan pengujian manual untuk memastikan input dengan panjang > 255 karakter ditolak oleh validasi Elysia.
