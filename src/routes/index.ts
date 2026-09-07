import { Elysia } from "elysia";
import { userRoutes } from "./users";

export const apiRoutes = new Elysia({ prefix: "/api" })
  .use(userRoutes);
