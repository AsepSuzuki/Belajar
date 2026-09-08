import { Elysia, t } from "elysia";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../services/users_services";

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
  )
  .get(
    "/api/users/login/current",
    async ({ headers, set }) => {
      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        set.status = 401;
        return {
          eror: "Unauthorized",
        };
      }

      const token = authHeader.slice(7).trim();
      if (!token) {
        set.status = 401;
        return {
          eror: "Unauthorized",
        };
      }

      try {
        const user = await getCurrentUser(token);
        set.status = 200;
        return {
          data: user,
        };
      } catch {
        set.status = 401;
        return {
          eror: "Unauthorized",
        };
      }
    }
  )
  .delete(
    "/api/users/login/current",
    async ({ headers, set }) => {
      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        set.status = 401;
        return {
          eror: "Unauthorized",
        };
      }

      const token = authHeader.slice(7).trim();
      if (!token) {
        set.status = 401;
        return {
          eror: "Unauthorized",
        };
      }

      try {
        const result = await logoutUser(token);
        set.status = 200;
        return {
          data: result,
        };
      } catch {
        set.status = 401;
        return {
          eror: "Unauthorized",
        };
      }
    }
  );
