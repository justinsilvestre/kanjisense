import { renderToReadableStream } from "hono/jsx/dom/server";
import type { App } from "@/app";
import { getDb } from "@/db/db";
import { getKanjisenseFigureWithMeaningByKey } from "@/db/kanjisenseFigure";
import { seed } from "@/db/seed";
import { DictPage } from "@/pages/DictPage";
import { IndexPage } from "@/pages/IndexPage";
import * as routes from "@/routes";

export function createRoutes(app: App) {
	app.get("/seed", async (c) => {
		const db = getDb(c.env.kanjisense_db);
		await seed(db);
		return c.text("Database seeded successfully.");
	});

	app.get(routes.index(), async (c) => {
		console.log("Rendering index page");
		const stream = await renderToReadableStream(<IndexPage />);
		return c.body(stream, { headers: { "Content-Type": "text/html" } });
	});

	app.get(routes.about(), (c) => {
		return c.text("This is the about page.");
	});

	app.get(routes.search(), (c) => {
		return c.json({ message: "This is the search page." });
	});

	app.get(routes.dict(":figureKey"), async (c) => {
		const figureKey = c.req.param("figureKey");

		const db = getDb(c.env.kanjisense_db);
		const figure = await getKanjisenseFigureWithMeaningByKey(db, figureKey);
		if (!figure)
			return c.text(`No dictionary entry found for: ${figureKey}`, 404);

		const stream = await renderToReadableStream(<DictPage figure={figure} />);
		return c.body(stream, { headers: { "Content-Type": "text/html" } });
	});
	app.get(routes.dictAnalyze(":figureKey"), (c) => {
		const figureKey = c.req.param("figureKey");
		return c.json({ message: `Analyzing dictionary entry for: ${figureKey}` });
	});
	app.get(routes.dictPreview(":figureKey"), (c) => {
		const figureKey = c.req.param("figureKey");
		return c.json({ message: `Previewing dictionary entry for: ${figureKey}` });
	});
	app.get(routes.dictUses(":figureKey"), (c) => {
		const figureKey = c.req.param("figureKey");
		return c.json({
			message: `Listing uses for dictionary entry: ${figureKey}`,
		});
	});
}
