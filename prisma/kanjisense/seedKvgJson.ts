import { readFile } from "fs/promises";

import { PrismaClient } from "@prisma/client";

import { registerSeeded } from "prisma/seedUtils";
import { kanjivgExtractedComponents } from "~/lib/dic/kanjivgExtractedComponents";
import { getKvgPath } from "~/lib/files.server";

import { executeAndLogTime } from "./executeAndLogTime";
import { KvgJsonData } from "./KvgJsonData";

export async function seedKvgJson(prisma: PrismaClient, force = false) {
  const seeded = await prisma.setup.findUnique({
    where: { step: "KvgJson" },
  });

  if (seeded && !force) console.log(`KvgJson already seeded. 🌱`);
  else {
    console.log(`seeding KvgJson...`);

    console.log("preparing kvg jsons");
    const allFiguresIds = await prisma.kanjisenseFigure.findMany({
      select: { id: true },
    });
    const dbInput = new Map<string, KvgJsonData>();
    for (const { id } of allFiguresIds) {
      const kvgPath = getKvgPath(id);
      const kvgJson = await getKvgJson(id, kvgPath);
      if (kvgJson) {
        dbInput.set(id, kvgJson);
      }
    }

    executeAndLogTime("seeding kanjivg json", () =>
      prisma.kvgJson.createMany({
        data: Array.from(dbInput.entries()).map(([id, json]) => ({
          id,
          json: json as unknown as Record<string, string[]>,
        })),
      }),
    );

    await registerSeeded(prisma, "KvgJson");
  }
}

async function getKvgJson(
  key: string,
  kvgPath: string,
): Promise<KvgJsonData | null> {
  if (key === "匕") {
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

  const strokesSegment = kanjivgExtractedComponents[key]?.[1];

  const paths = Array.from(kvgFileText.matchAll(/\bd="(.+?)"/g), (x) => x[1]);
  const numbers = Array.from(
    kvgFileText.matchAll(/\btransform="(.+?)"/g),
    (x) => x[1],
  );
  return {
    p: strokesSegment
      ? paths.slice(strokesSegment[0] - 1, strokesSegment[1])
      : paths,
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
