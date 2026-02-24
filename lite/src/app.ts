import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { Hono } from "hono";

export type App = Hono<{ Bindings: { kanjisense_db: DrizzleD1Database } }>;
