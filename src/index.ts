import { Elysia } from "elysia";
import { env } from "./env";
import { userRoutes } from "./routes/users";
import { apiRoutes } from "./routes";

const app = new Elysia()
  .get("/", () => ({
    message: "Welcome to Bun + ElysiaJS + Drizzle + MySQL API",
    status: "ok",
  }))
  .use(userRoutes)
  .use(apiRoutes)
  .listen(env.PORT);

console.log(
  `🚀 Server is running at http://${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
