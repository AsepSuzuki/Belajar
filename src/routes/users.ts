import { Elysia, t } from "elysia";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";

export const userRoutes = new Elysia({ prefix: "/users" })
  .get("", async () => {
    return await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users);
  })
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
      params: t.Object({
        id: t.String(),
      }),
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
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1 })),
        email: t.Optional(t.String({ format: "email" })),
      }),
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
      params: t.Object({
        id: t.String(),
      }),
    }
  );
