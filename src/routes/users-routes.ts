import { Elysia, t } from "elysia";
import { registerUser } from "../services/users_services";

export const usersRoutes = new Elysia().post(
  "/api/users",
  async ({ body, set }) => {
    try {
      const result = await registerUser({
        name: body.name,
        email: body.email,
        password: body.password,
      });

      set.status = 201;
      return {
        data: result,
      };
    } catch (err: unknown) {
      set.status = 400;
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan";
      return {
        eror: message,
      };
    }
  },
  {
    body: t.Object({
      name: t.String({ minLength: 1 }),
      email: t.String({ pattern: "^[^\\s@]+@[^\\s@]+$" }),
      password: t.String({ minLength: 1 }),
    }),
  }
);
