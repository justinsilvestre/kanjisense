import { readFile } from "fs/promises";

import { PrismaClient, KanjisenseFigureImageType } from "@prisma/client";
import SVGPathCommander from "svg-path-commander";

import { registerSeeded } from "prisma/seedUtils";
import { kanjivgExtractedComponents } from "~/lib/dic/kanjivgExtractedComponents";
import { getGlyphwikiSvgPath, getKvgPath } from "~/lib/files.server";

import { KvgJsonData } from "../../app/features/dictionary/KvgJsonData";

import { executeAndLogTime } from "./executeAndLogTime";

export async function seedFigureImages(prisma: PrismaClient, force = false) {
  const seeded = await prisma.setup.findUnique({
    where: { step: "KanjisenseFigureImage" },
  });

  if (seeded && !force) console.log(`KanjisenseFigureImage already seeded. 🌱`);
  else {
    console.log(`seeding KanjisenseFigureImage...`);

    console.log("preparing images data");
    const allFiguresIds = await prisma.kanjisenseFigure.findMany({
      select: { id: true },
    });
    const dbInput = new Map<
      string,
      | {
          type: Extract<KanjisenseFigureImageType, "Kvg">;
          content: KvgJsonData;
        }
      | {
          type: Extract<KanjisenseFigureImageType, "GlyphWiki">;
          content: string;
        }
    >();
    for (const { id } of allFiguresIds) {
      const kvgPath = getKvgPath(id);
      const kvgJson = await getKvgJson(id, kvgPath);
      if (kvgJson) {
        dbInput.set(id, {
          type: KanjisenseFigureImageType.Kvg,
          content: kvgJson as unknown as KvgJsonData,
        });
      } else {
        const glyphwikiSvgPath = getGlyphwikiSvgPath(id);
        const glyphwikiSvgText = await getFileTextIfPresent(glyphwikiSvgPath);
        if (glyphwikiSvgText) {
          const pathStart = glyphwikiSvgText.indexOf('d="') + 3;
          if (pathStart === -1)
            throw new Error(
              `Invalid GlyphWiki SVG file for ${id} at ${glyphwikiSvgPath}`,
            );
          const pathEnd = glyphwikiSvgText.indexOf(' "', pathStart) + 1;
          const path = glyphwikiSvgText.slice(pathStart, pathEnd);
          dbInput.set(id, {
            type: KanjisenseFigureImageType.GlyphWiki,
            content: JSON.stringify(path),
          });
        }
      }
    }

    await prisma.kanjisenseFigureImage.deleteMany({});

    await executeAndLogTime("seeding images data", () =>
      prisma.kanjisenseFigureImage.createMany({
        data: Array.from(dbInput.entries()).map(([id, { type, content }]) => ({
          id,
          type,
          content: content as unknown as Record<string, string[]>,
        })),
      }),
    );

    await registerSeeded(prisma, "KanjisenseFigureImage");
  }
}

async function getKvgJson(
  key: string,
  kvgPath: string,
): Promise<KvgJsonData | null> {
  if (key === "匕") {
    // fixing apparent error in KanjiVG where strokes overlap
    return {
      p: [
        "M 78.35 26.56 C 78.75 27.25 79 29.25 77.97 30.3 C 71.32 37.15 52.225 55.839 30.725 62.839",
        "M 27.998 14.25 C 29.144 15.44 29.229 16.24 29.615 17.82 C 30 19.41 30 77.98 30 82.96 C 30 95.75 45.405 93.75 58.519 93.75 C 68.689 93.75 77.168 93.08 81.001 89.5 C 84.833 85.92 84.362 81.77 84.748 78.2",
      ],
      n: ["matrix(1 0 0 1 70.50 25.50)", "matrix(1 0 0 1 20.50 12.50)"],
    };
  }

  const kvgFileText = await getFileTextIfPresent(kvgPath);
  if (!kvgFileText) return null;

  const transform = kanjivgExtractedComponents[key]?.[2];
  const strokesSegment = kanjivgExtractedComponents[key]?.[1];

  const paths = Array.from(kvgFileText.matchAll(/\bd="(.+?)"/g), (x) => x[1]);
  const transformedPaths =
    transform && strokesSegment
      ? paths.map((p) =>
          new SVGPathCommander(p).transform(transform).toString(),
        )
      : null;
  const numbers = Array.from(
    kvgFileText.matchAll(/\btransform="(.+?)"/g),
    (x) => x[1],
  );
  return {
    p: strokesSegment
      ? (transformedPaths || paths).slice(
          strokesSegment[0] - 1,
          strokesSegment[1],
        )
      : transformedPaths || paths,
    n: strokesSegment
      ? numbers.slice(strokesSegment[0] - 1, strokesSegment[1])
      : numbers,
  } as const;
}

async function getFileTextIfPresent(path: string | null) {
  if (!path) return null;
  try {
    return await readFile(path, "utf-8");
  } catch (error) {
    if (error && typeof error === "object" && "code" in error) {
      if ((error as unknown as { code: string }).code === "ENOENT") {
        return null;
      } else {
        throw error;
      }
    }
  }
}
