import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/db/schema.ts",
	casing: "snake_case",
	out: "./migrations", // default for D1
	dialect: "sqlite",
	driver: "d1-http",
});
