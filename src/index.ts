import { Elysia } from "elysia";
import { env } from "./env";
import { userRoutes } from "./routes/users";
import { usersRoutes } from "./routes/users-routes";
import { apiRoutes } from "./routes";

export const app = new Elysia()
  .get("/", () => ({
    message: "Welcome to Bun + ElysiaJS + Drizzle + MySQL API",
    status: "ok",
  }))
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
