import { Elysia, t } from "elysia";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";

export const userRoutes = new Elysia({ prefix: "/users" })
  .get(
    "",
    async () => {
      return await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          createdAt: users.createdAt,
        })
        .from(users);
    },
    {
      detail: {
        tags: ["Users"],
        summary: "Mengambil Semua User",
        description: "Mengembalikan daftar seluruh pengguna yang terdaftar tanpa field password.",
      },
      response: {
        200: t.Array(
          t.Object({
            id: t.Number({ example: 1 }),
            name: t.String({ example: "John Doe" }),
            email: t.String({ example: "johndoe@example.com" }),
            createdAt: t.Date({ example: "2026-09-08T00:00:00.000Z" }),
          }),
          { description: "Daftar seluruh user" }
        ),
      },
    }
  )
  .get(
    "/:id",
    async ({ params, set }) => {
      const id = Number(params.id);
      if (Number.isNaN(id)) {
        set.status = 400;
        return { message: "Invalid ID" };
      }

      const [user] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, id));

      if (!user) {
        set.status = 404;
        return { message: "User not found" };
      }

      return user;
    },
    {
      detail: {
        tags: ["Users"],
        summary: "Mengambil User Berdasarkan ID",
        description: "Mengembalikan detail data satu pengguna berdasarkan ID.",
      },
      params: t.Object({
        id: t.String({ example: "1", description: "ID user (angka)" }),
      }),
      response: {
        200: t.Object(
          {
            id: t.Number({ example: 1 }),
            name: t.String({ example: "John Doe" }),
            email: t.String({ example: "johndoe@example.com" }),
            createdAt: t.Date({ example: "2026-09-08T00:00:00.000Z" }),
          },
          { description: "Data user ditemukan" }
        ),
        400: t.Object(
          {
            message: t.String({ example: "Invalid ID" }),
          },
          { description: "ID bukan angka valid" }
        ),
        404: t.Object(
          {
            message: t.String({ example: "User not found" }),
          },
          { description: "User dengan ID tersebut tidak ditemukan" }
        ),
      },
    }
  )
  .put(
    "/:id",
    async ({ params, body, set }) => {
      const id = Number(params.id);
      if (Number.isNaN(id)) {
        set.status = 400;
        return { message: "Invalid ID" };
      }

      const [existing] = await db.select().from(users).where(eq(users.id, id));
      if (!existing) {
        set.status = 404;
        return { message: "User not found" };
      }

      await db
        .update(users)
        .set({
          ...(body.name ? { name: body.name } : {}),
          ...(body.email ? { email: body.email } : {}),
        })
        .where(eq(users.id, id));

      return { message: "User updated successfully" };
    },
    {
      detail: {
        tags: ["Users"],
        summary: "Memperbarui Data User",
        description: "Memperbarui nama dan/atau email pengguna berdasarkan ID.",
      },
      params: t.Object({
        id: t.String({ example: "1", description: "ID user yang ingin diupdate" }),
      }),
      body: t.Object({
        name: t.Optional(
          t.String({ minLength: 1, maxLength: 255, example: "John Doe Updated" })
        ),
        email: t.Optional(
          t.String({ format: "email", maxLength: 255, example: "johnupdated@example.com" })
        ),
      }),
      response: {
        200: t.Object(
          {
            message: t.String({ example: "User updated successfully" }),
          },
          { description: "User berhasil diperbarui" }
        ),
        400: t.Object(
          {
            message: t.String({ example: "Invalid ID" }),
          },
          { description: "ID bukan angka valid" }
        ),
        404: t.Object(
          {
            message: t.String({ example: "User not found" }),
          },
          { description: "User tidak ditemukan" }
        ),
      },
    }
  )
  .delete(
    "/:id",
    async ({ params, set }) => {
      const id = Number(params.id);
      if (Number.isNaN(id)) {
        set.status = 400;
        return { message: "Invalid ID" };
      }

      const [existing] = await db.select().from(users).where(eq(users.id, id));
      if (!existing) {
        set.status = 404;
        return { message: "User not found" };
      }

      await db.delete(users).where(eq(users.id, id));

      return { message: "User deleted successfully" };
    },
    {
      detail: {
        tags: ["Users"],
        summary: "Menghapus User",
        description: "Menghapus data pengguna dari database berdasarkan ID.",
      },
      params: t.Object({
        id: t.String({ example: "1", description: "ID user yang ingin dihapus" }),
      }),
      response: {
        200: t.Object(
          {
            message: t.String({ example: "User deleted successfully" }),
          },
          { description: "User berhasil dihapus" }
        ),
        400: t.Object(
          {
            message: t.String({ example: "Invalid ID" }),
          },
          { description: "ID bukan angka valid" }
        ),
        404: t.Object(
          {
            message: t.String({ example: "User not found" }),
          },
          { description: "User tidak ditemukan" }
        ),
      },
    }
  );
