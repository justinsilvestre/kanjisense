import { PrismaClient, KanjisenseFigureImageType } from "@prisma/client";
import SVGPathCommander from "svg-path-commander";

import { getSeedInterface } from "prisma/SeedInterface";
import { runSetupStep } from "prisma/seedUtils";
import { kanjivgExtractedComponents } from "~/lib/dic/kanjivgExtractedComponents";
import { getKvgFilePath } from "~/lib/files.server";
import { FigureKey, getFigureId } from "~/models/figure";

import { KvgJsonData } from "../../app/features/dictionary/KvgJsonData";

import { executeAndLogTime } from "./executeAndLogTime";
import { getFileTextIfPresent } from "./getFileTextIfPresent";
import { getGlyphWikiSvgPath } from "./getGlyphWikiSvgPath";
import { inBatchesOf } from "./inBatchesOf";

export async function seedFigureImages(
  prisma: PrismaClient,
  version: number,
  force = false,
) {
  await runSetupStep({
    seedInterface: getSeedInterface(prisma),
    version,
    step: "KanjisenseFigureImage",
    force,
    async setup() {
      console.log("preparing images data");
      const allFiguresKeys = await prisma.kanjisenseFigure.findMany({
        select: { key: true },
        where: { version },
      });
      const dbInput = new Map<
        FigureKey,
        | {
            type: Extract<KanjisenseFigureImageType, "Kvg">;
            content: KvgJsonData;
          }
        | {
            type: Extract<KanjisenseFigureImageType, "GlyphWiki">;
            content: string;
          }
      >();
      for (const { key } of allFiguresKeys) {
        const kvgPath = getKvgFilePath(key);
        const kvgJson = await getKvgJson(key, kvgPath);
        if (kvgJson) {
          dbInput.set(key, {
            type: KanjisenseFigureImageType.Kvg,
            content: kvgJson as unknown as KvgJsonData,
          });
        } else {
          const path = await getGlyphWikiSvgPath(key);
          if (path)
            dbInput.set(key, {
              type: KanjisenseFigureImageType.GlyphWiki,
              content: JSON.stringify(path),
            });
        }
      }

      await prisma.kanjisenseFigureImage.deleteMany({
        where: { version },
      });

      await executeAndLogTime("seeding images data", () =>
        inBatchesOf({
          batchSize: 500,
          collection: dbInput,
          getBatchItem: ([key, { type, content }]) => ({
            id: getFigureId(version, key),
            key,
            version,
            type,
            content: content as unknown as Record<string, string[]>,
          }),
          action: (data) =>
            prisma.kanjisenseFigureImage.createMany({
              data,
            }),
        }),
      );
    },
  });
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
