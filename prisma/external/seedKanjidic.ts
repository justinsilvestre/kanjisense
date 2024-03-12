import { PrismaClient } from "@prisma/client";

import { files, readJsonSync } from "~/lib/files.server";

import { runSetupStep } from "../seedUtils";

type KanjibankJson = [
  string,
  string,
  string,
  string,
  string[],
  Record<string, string>,
][];

export async function seedKanjidic(prisma: PrismaClient, force = false) {
  await runSetupStep({
    prisma,
    step: "KanjidicEntry",
    force,
    version: "KEYLESS STEP",
    async setup() {
      await prisma.kanjidicEntry.deleteMany({});

      for (const filepath of [files.kanjidicInput1, files.kanjidicInput2]) {
        console.log(`reading from ${filepath}`);
        const json = readJsonSync<KanjibankJson>(filepath);
        await prisma.kanjidicEntry.createMany({
          data: json.map(
            ([id, onReadings, kunReadings, tag, definitions, meta]) => ({
              id,
              onReadings: onReadings.length ? onReadings?.split(/\s+/) : [],
              kunReadings: kunReadings.length ? kunReadings?.split(/\s+/) : [],
              tag: tag || null,
              definitions: definitions || [],
              meta: meta || null,
            }),
          ),
        });
      }
    },
  });
}
