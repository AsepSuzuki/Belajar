import { Elysia, t } from "elysia";
import { loginUser, registerUser } from "../services/users_services";

export const usersRoutes = new Elysia()
  .post(
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
  )
  .post(
    "/api/users/login",
    async ({ body, set }) => {
      try {
        const token = await loginUser({
          email: body.email,
          password: body.password,
        });

        set.status = 200;
        return {
          data: token,
        };
      } catch (err: unknown) {
        set.status = 400;
        const message =
          err instanceof Error ? err.message : "Email atau password salah";
        return {
          eror: message,
        };
      }
    },
    {
      body: t.Object({
        email: t.String({ pattern: "^[^\\s@]+@[^\\s@]+$" }),
        password: t.String({ minLength: 1 }),
      }),
    }
  );
