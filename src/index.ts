import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { env } from "./env";
import { userRoutes } from "./routes/users";
import { usersRoutes } from "./routes/users-routes";
import { apiRoutes } from "./routes";

export const app = new Elysia()
  .use(
    swagger({
      documentation: {
        info: {
          title: "Belajar REST API",
          version: "1.0.0",
          description: "Dokumentasi API untuk aplikasi Belajar REST API",
        },
        tags: [
          { name: "General", description: "Endpoint umum dan health check" },
          { name: "Auth", description: "Endpoint autentikasi dan manajemen user saat ini" },
          { name: "Users", description: "Endpoint operasi CRUD pengguna" },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "UUID",
              description: "Masukkan token session UUID (contoh: 550e8400-e29b-41d4-a716-446655440000)",
            },
          },
        },
      },
    })
  )
  .get(
    "/",
    () => ({
      message: "Welcome to Bun + ElysiaJS + Drizzle + MySQL API",
      status: "ok",
    }),
    {
      detail: {
        tags: ["General"],
        summary: "Health Check Server",
      },
      response: {
        200: t.Object(
          {
            message: t.String({
              example: "Welcome to Bun + ElysiaJS + Drizzle + MySQL API",
            }),
            status: t.String({ example: "ok" }),
          },
          { description: "Server aktif dan merespons dengan baik" }
        ),
      },
    }
  )
  .use(usersRoutes)
  .use(userRoutes)
  .use(apiRoutes);

if (import.meta.main) {
  app.listen(env.PORT);
  console.log(
    `🚀 Server is running at http://${app.server?.hostname}:${app.server?.port}`
  );
}

export type App = typeof app;
