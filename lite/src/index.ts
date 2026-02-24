import { Hono } from "hono";
import type { App } from "@/app";
import { createRoutes } from "@/createRoutes";

const app: App = new Hono();

createRoutes(app);

// static assets folder
// is configured in wrangler.jsonc

export default app;
