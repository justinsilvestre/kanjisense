import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "drizzle-kit";

const sqliteFilePath = findSQLiteFile();
console.log(`Found SQLite file at: ${sqliteFilePath}`);

export default defineConfig({
	schema: "./src/db/schema.ts",
	out: "./migrations", // default for D1
	dialect: "sqlite",
	// driver: "d1-http",
	dbCredentials: {
		url: sqliteFilePath,
	},
});

function findSQLiteFile() {
	const stateDir = "./.wrangler/state/v3/d1/miniflare-D1DatabaseObject";
	const fullStateDir = path.resolve(stateDir);
	if (!fs.existsSync(fullStateDir)) {
		throw new Error(`State directory not found: ${fullStateDir}`);
	}

	const files = fs.readdirSync(fullStateDir);
	for (const file of files) {
		if (file.endsWith(".sqlite")) {
			return path.join(fullStateDir, file);
		}
	}

	throw new Error("SQLite file not found in state directory");
}
