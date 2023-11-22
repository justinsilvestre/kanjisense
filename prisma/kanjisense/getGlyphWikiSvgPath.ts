import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { getGlyphwikiSvgFilePath } from "~/lib/files.server";

import { getFileTextIfPresent } from "./seedKanjisenseFigureImages";

export async function getGlyphWikiSvgPath(id: string) {
  const glyphwikiSvgPath = getGlyphwikiSvgFilePath(id);
  const glyphwikiSvgText = await getFileTextIfPresent(glyphwikiSvgPath);
  if (glyphwikiSvgText) {
    const pathStart = glyphwikiSvgText.indexOf('d="') + 3;
    if (pathStart === -1)
      throw new Error(
        `Invalid GlyphWiki SVG file for ${id} at ${glyphwikiSvgPath}`,
      );
    const pathEnd = glyphwikiSvgText.indexOf(' "', pathStart) + 1;
    const path = glyphwikiSvgText.slice(pathStart, pathEnd);
    return path;
  }

  const glyphwikiSvgFromWeb = await getGlyphWikiSvgFromWeb(id);

  return glyphwikiSvgFromWeb;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getGlyphWikiSvgFromWeb(id: string) {
  const unicode = id.codePointAt(0)?.toString(16);
  const outputFilePath = join(__dirname, "gws", `u${unicode}.svg`);
  if (existsSync(outputFilePath)) {
    const text = (await getFileTextIfPresent(outputFilePath))!;
    writeFileSync(outputFilePath, text, "utf8");
    const pathStart = text.indexOf('d="') + 3;
    if (pathStart === -1)
      throw new Error(
        `Invalid GlyphWiki SVG file for ${id} at ${outputFilePath}`,
      );
    const pathEnd = text.indexOf(' "', pathStart) + 1;
    const path = text.slice(pathStart, pathEnd);
    return path;
  }

  sleep(400);

  // https://en.glyphwiki.org/glyph/u7523.svg
  const url = `https://glyphwiki.org/glyph/u${unicode}.svg`;
  return await fetch(url)
    .then((res) => res.text())
    .then((text) => {
      console.log(id, unicode, outputFilePath);
      writeFileSync(outputFilePath, text, "utf8");
      const pathStart = text.indexOf('d="') + 3;
      if (pathStart === -1)
        throw new Error(`Invalid GlyphWiki SVG file for ${id} at ${url}`);
      const pathEnd = text.indexOf(' "', pathStart) + 1;
      const path = text.slice(pathStart, pathEnd);
      return path;
    });
}
