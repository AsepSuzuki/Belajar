import { Elysia } from "elysia";
import { userRoutes } from "./users";
import { usersRoutes } from "./users-routes";

export const apiRoutes = new Elysia({ prefix: "/api" })
  .use(userRoutes);

export { usersRoutes, userRoutes };
