import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_HOST: z.string().default("localhost"),
  DATABASE_PORT: z.coerce.number().default(3306),
  DATABASE_USER: z.string().default("root"),
  DATABASE_PASSWORD: z.string().default(""),
  DATABASE_NAME: z.string().default("belajar_db"),
  DATABASE_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  process.exit(1);
}

export const env = {
  ...parsed.data,
  DATABASE_URL:
    parsed.data.DATABASE_URL ||
    `mysql://${parsed.data.DATABASE_USER}:${parsed.data.DATABASE_PASSWORD}@${parsed.data.DATABASE_HOST}:${parsed.data.DATABASE_PORT}/${parsed.data.DATABASE_NAME}`,
};
