import { readFile } from "fs/promises";

import { PrismaClient } from "@prisma/client";

import { getSeedInterface } from "prisma/SeedInterface";
import { runSetupStep } from "prisma/seedUtils";
import { GlyphsJson } from "~/features/dictionary/GlyphsJson";
import { getGlyphsFilePath } from "~/lib/files.server";
import { getFigureId } from "~/models/figure";

import { executeAndLogTime } from "./executeAndLogTime";
import { getGlyphWikiSvgPath } from "./getGlyphWikiSvgPath";
import { inBatchesOf } from "./inBatchesOf";

export async function seedGlyphImages(
  prisma: PrismaClient,
  version: number,
  force = false,
) {
  await runSetupStep({
    seedInterface: getSeedInterface(prisma),
    step: "GlyphImage",
    version,
    force,
    async setup() {
      const allUnicodeCharactersKeys = await prisma.kanjisenseFigure
        .findMany({
          where: { version },
          select: {
            key: true,
          },
        })
        .then((figures) =>
          figures.flatMap(({ key }) => ([...key].length === 1 ? [key] : [])),
        );

      await prisma.glyphImage.deleteMany({ where: { version } });

      const dbInput: {
        id: string;
        key: string;
        version: number;
        json: GlyphsJson;
      }[] = [];
      for (const key of allUnicodeCharactersKeys) {
        const json = await getFileJsonIfPresent<GlyphsJson>(
          getGlyphsFilePath(key),
        );
        const glyphwikiSvgPath = await getGlyphWikiSvgPath(key);

        if (json || glyphwikiSvgPath) {
          dbInput.push({
            id: getFigureId(version, key),
            key,
            version,
            json: {
              ...json,
              ...(glyphwikiSvgPath ? { gw: glyphwikiSvgPath } : null),
            },
          });
        }
      }

      await executeAndLogTime("seeding glyph images data", async () =>
        inBatchesOf({
          collection: dbInput,
          batchSize: 500,
          action: (data) => prisma.glyphImage.createMany({ data }),
        }),
      );
    },
  });
}

async function getFileJsonIfPresent<T>(path: string | null) {
  if (!path) return null;
  let fileContent: string | null = null;
  try {
    fileContent = await readFile(path, "utf-8");
  } catch (error) {
    if (error && typeof error === "object" && "code" in error) {
      if ((error as unknown as { code: string }).code === "ENOENT") {
        fileContent = null;
      } else {
        throw error;
      }
    }
  }

  if (!fileContent) return null;
  return JSON.parse(fileContent) as T;
}
