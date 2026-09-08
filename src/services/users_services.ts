import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { sessions, users } from "../db/schema";

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface CurrentUserResponse {
  id: number;
  name: string;
  email: string;
  created_at: Date;
}

/**
 * Mendaftarkan pengguna (user) baru ke dalam sistem.
 * Fungsi ini akan memverifikasi apakah email sudah digunakan,
 * melakukan enkripsi (hashing) pada password, dan menyimpan data user ke tabel `users`.
 *
 * @param {RegisterUserInput} input - Objek yang berisi name, email, dan password raw dari request.
 * @returns {Promise<string>} Mengembalikan string "OK" jika proses registrasi berhasil.
 * @throws {Error} Jika email sudah terdaftar sebelumnya.
 */
export async function registerUser({
  name,
  email,
  password,
}: RegisterUserInput): Promise<string> {
  // 1. Cek apakah email sudah terdaftar di database
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) {
    throw new Error("Email sudah terdaftar");
  }

  // 2. Hash password menggunakan bcrypt (salt rounds: 10)
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Simpan data user baru ke tabel users
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  // 4. Return "OK" jika berhasil
  return "OK";
}

/**
 * Mengautentikasi pengguna dan membuat sesi (session) baru.
 * Fungsi ini akan memvalidasi keberadaan email, mencocokkan password dengan hash di database,
 * dan menghasilkan token UUID yang disimpan ke tabel `sessions`.
 *
 * @param {LoginUserInput} input - Objek yang berisi email dan password raw dari request.
 * @returns {Promise<string>} Mengembalikan token UUID sesi pengguna jika login berhasil.
 * @throws {Error} Jika email tidak ditemukan atau password tidak cocok.
 */
export async function loginUser({
  email,
  password,
}: LoginUserInput): Promise<string> {
  // 1. Cari user berdasarkan email
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    throw new Error("Email atau password salah");
  }

  // 2. Verifikasi password dengan bcrypt
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Email atau password salah");
  }

  // 3. Generate token UUID
  const token = crypto.randomUUID();

  // 4. Simpan session token ke database
  await db.insert(sessions).values({
    token,
    userId: user.id,
  });

  // 5. Return token UUID
  return token;
}

/**
 * Mengambil data profil pengguna yang sedang login (Current User) berdasarkan token sesi.
 * Fungsi ini akan mencari sesi aktif di tabel `sessions`, kemudian mengambil data profil
 * dari tabel `users` yang berelasi dengan sesi tersebut. Password tidak akan dikembalikan.
 *
 * @param {string} token - Token UUID (dari header Authorization Bearer).
 * @returns {Promise<CurrentUserResponse>} Mengembalikan objek berisi id, name, email, dan created_at.
 * @throws {Error} Jika token tidak ditemukan, tidak valid, atau user terkait sudah dihapus (Unauthorized).
 */
export async function getCurrentUser(token: string): Promise<CurrentUserResponse> {
  // 1. Cari session berdasarkan token
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  if (!session) {
    throw new Error("Unauthorized");
  }

  // 2. Cari user berdasarkan user_id dari session
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      created_at: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}
