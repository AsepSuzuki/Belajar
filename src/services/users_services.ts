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
