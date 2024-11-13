import { existsSync, writeFileSync } from "node:fs";

import { getGlyphWikiCode, getGlyphwikiSvgFilePath } from "~/lib/files.server";

import { getFileTextIfPresent } from "./getFileTextIfPresent";

export async function getGlyphWikiSvgPath(key: string) {
  const glyphwikiSvgPath = getGlyphwikiSvgFilePath(key);
  const glyphwikiSvgText = await getFileTextIfPresent(glyphwikiSvgPath);
  if (glyphwikiSvgText) {
    const pathStart = glyphwikiSvgText.indexOf('d="') + 3;
    if (pathStart === -1)
      throw new Error(
        `Invalid GlyphWiki SVG file for ${key} at ${glyphwikiSvgPath}`,
      );
    const pathEnd = glyphwikiSvgText.indexOf(' "', pathStart) + 1;
    const path = glyphwikiSvgText.slice(pathStart, pathEnd);
    return path;
  }

  console.log("fetching svg from web", key);
  const glyphwikiSvgFromWeb = await getGlyphWikiSvgFromWeb(key);

  return glyphwikiSvgFromWeb;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getGlyphWikiSvgFromWeb(key: string) {
  const outputFilePath = getGlyphwikiSvgFilePath(key);
  if (existsSync(outputFilePath)) {
    const text = (await getFileTextIfPresent(outputFilePath))!;
    writeFileSync(outputFilePath, text, "utf8");
    const pathStart = text.indexOf('d="') + 3;
    if (pathStart === -1)
      throw new Error(
        `Invalid GlyphWiki SVG file for ${key} at ${outputFilePath}`,
      );
    const pathEnd = text.indexOf(' "', pathStart) + 1;
    const path = text.slice(pathStart, pathEnd);
    return path;
  }

  sleep(400);

  const glyphwikiCode = getGlyphWikiCode(key).toLowerCase();
  // https://en.glyphwiki.org/glyph/u7523.svg
  const url = `https://glyphwiki.org/glyph/${glyphwikiCode}.svg`;
  return await fetch(url)
    .then((res) => res.text())
    .then((text) => {
      console.log(key, glyphwikiCode, outputFilePath);
      writeFileSync(outputFilePath, text, "utf8");
      const pathStart = text.indexOf('d="') + 3;
      if (pathStart === -1)
        throw new Error(`Invalid GlyphWiki SVG file for ${key} at ${url}`);
      const pathEnd = text.indexOf(' "', pathStart) + 1;
      const path = text.slice(pathStart, pathEnd);
      return path;
    });
}
