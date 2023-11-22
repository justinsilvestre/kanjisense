import { readFile } from "fs/promises";

import { PrismaClient } from "@prisma/client";

import { registerSeeded } from "prisma/seedUtils";
import { GlyphsJson } from "~/features/dictionary/GlyphsJson";
import { getGlyphsFilePath } from "~/lib/files.server";

import { executeAndLogTime } from "./executeAndLogTime";
import { getGlyphWikiSvgPath } from "./getGlyphWikiSvgPath";

export async function seedGlyphImages(prisma: PrismaClient, force = false) {
  const seeded = await prisma.setup.findUnique({
    where: { step: "GlyphImage" },
  });

  if (seeded && !force) console.log(`GlyphImage already seeded. 🌱`);
  else {
    console.log(`seeding GlyphImage...`);

    const allUnicodeCharactersIds = await prisma.kanjisenseFigure
      .findMany({
        select: {
          id: true,
        },
      })
      .then((figures) =>
        figures.flatMap(({ id }) => ([...id].length === 1 ? [id] : [])),
      );

    await prisma.glyphImage.deleteMany({});

    const dbInput: { id: string; json: GlyphsJson }[] = [];
    for (const id of allUnicodeCharactersIds) {
      const json = await getFileJsonIfPresent<GlyphsJson>(
        getGlyphsFilePath(id),
      );
      const glyphwikiSvgPath = await getGlyphWikiSvgPath(id);

      if (json || glyphwikiSvgPath) {
        dbInput.push({
          id,
          json: {
            ...json,
            ...(glyphwikiSvgPath ? { gw: glyphwikiSvgPath } : null),
          },
        });
      }
    }

    await executeAndLogTime("seeding glyph images data", async () =>
      prisma.glyphImage.createMany({
        data: dbInput,
      }),
    );

    await registerSeeded(prisma, "GlyphImage");
  }
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
