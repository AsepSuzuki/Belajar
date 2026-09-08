import { Elysia, t } from "elysia";
import {
  getCurrentUser,
  loginUser,
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
      detail: {
        tags: ["Auth"],
        summary: "Registrasi User Baru",
        description: "Mendaftarkan user baru dengan nama, email, dan password.",
      },
      body: t.Object({
        name: t.String({
          minLength: 1,
          maxLength: 255,
          example: "John Doe",
          description: "Nama lengkap user",
        }),
        email: t.String({
          pattern: "^[^\\s@]+@[^\\s@]+$",
          maxLength: 255,
          example: "johndoe@example.com",
          description: "Alamat email unik user",
        }),
        password: t.String({
          minLength: 1,
          maxLength: 255,
          example: "secretpassword123",
          description: "Kata sandi user",
        }),
      }),
      response: {
        201: t.Object(
          {
            data: t.String({ example: "OK" }),
          },
          { description: "User berhasil didaftarkan" }
        ),
        400: t.Object(
          {
            eror: t.String({ example: "Email sudah terdaftar" }),
          },
          { description: "Gagal registrasi user (misal: email duplikat)" }
        ),
      },
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
      detail: {
        tags: ["Auth"],
        summary: "Login User",
        description: "Autentikasi user dengan email dan password untuk mendapatkan token session.",
      },
      body: t.Object({
        email: t.String({
          pattern: "^[^\\s@]+@[^\\s@]+$",
          maxLength: 255,
          example: "johndoe@example.com",
          description: "Alamat email user",
        }),
        password: t.String({
          minLength: 1,
          maxLength: 255,
          example: "secretpassword123",
          description: "Kata sandi user",
        }),
      }),
      response: {
        200: t.Object(
          {
            data: t.String({
              example: "550e8400-e29b-41d4-a716-446655440000",
              description: "Session token UUID",
            }),
          },
          { description: "Login berhasil, mengembalikan token sesi" }
        ),
        400: t.Object(
          {
            eror: t.String({ example: "Email atau password salah" }),
          },
          { description: "Kredensial login tidak valid" }
        ),
      },
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
    },
    {
      detail: {
        tags: ["Auth"],
        summary: "Mendapatkan Data User Saat Ini (Current User)",
        description: "Mengambil data profil user yang sedang login berdasarkan token Authorization Bearer.",
        security: [{ bearerAuth: [] }],
      },
      headers: t.Object({
        authorization: t.Optional(
          t.String({
            example: "Bearer 550e8400-e29b-41d4-a716-446655440000",
            description: "Header Authorization Bearer token",
          })
        ),
      }),
      response: {
        200: t.Object(
          {
            data: t.Object({
              id: t.Number({ example: 1 }),
              name: t.String({ example: "John Doe" }),
              email: t.String({ example: "johndoe@example.com" }),
              created_at: t.Date({ example: "2026-09-08T00:00:00.000Z" }),
            }),
          },
          { description: "Data user berhasil diambil" }
        ),
        401: t.Object(
          {
            eror: t.String({ example: "Unauthorized" }),
          },
          { description: "Tidak terautentikasi atau token tidak valid" }
        ),
      },
    }
  );
