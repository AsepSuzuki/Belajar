import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";

export interface RegisterUserInput {
  name: string;
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
