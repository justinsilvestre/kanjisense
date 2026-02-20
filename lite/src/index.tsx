import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { renderToReadableStream } from "hono/jsx/dom/server";
import { IndexPage } from "./pages/IndexPage";
import * as routes from "./routes";

const app = new Hono();

app.get(routes.index(), async (c) => {
	const stream = await renderToReadableStream(<IndexPage />);
	return c.body(stream, { headers: { "Content-Type": "text/html" } });
});

app.get(routes.about(), (c) => {
	return c.text("This is the about page.");
});

app.get(routes.search(), (c) => {
	return c.json({ message: "This is the search page." });
});

app.get(routes.dict(":figureKey"), (c) => {
	const figureKey = c.req.param("figureKey");
	return c.text(`You requested the dictionary entry for: ${figureKey}`);
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
	return c.json({ message: `Listing uses for dictionary entry: ${figureKey}` });
});

// Serve the static folder where Tailwind drops the CSS
app.use("/static/*", serveStatic({ root: "./public" }));

export default app;
