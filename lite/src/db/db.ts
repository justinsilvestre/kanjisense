import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";

import * as schema from "./schema";

export type Db = DrizzleD1Database<typeof schema>;

export const getDb = (d1: DrizzleD1Database) =>
	drizzle(d1, {
		casing: "snake_case",
		schema,
	});
