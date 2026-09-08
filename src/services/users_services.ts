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

export async function logoutUser(token: string): Promise<string> {
  // 1. Cari session berdasarkan token
  const [session] = await db
    .select({ id: sessions.id })
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  if (!session) {
    throw new Error("Unauthorized");
  }

  // 2. Hapus session dari tabel sessions
  await db.delete(sessions).where(eq(sessions.token, token));

  // 3. Return "OK"
  return "OK";
}
