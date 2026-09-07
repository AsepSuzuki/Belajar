import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      `mysql://${process.env.DATABASE_USER || "root"}:${process.env.DATABASE_PASSWORD || ""}@${process.env.DATABASE_HOST || "localhost"}:${process.env.DATABASE_PORT || "3306"}/${process.env.DATABASE_NAME || "belajar_db"}`,
  },
});
