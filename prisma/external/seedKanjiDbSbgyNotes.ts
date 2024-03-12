import { PrismaClient } from "@prisma/client";

import { files, readJsonSync } from "~/lib/files.server";

import { runSetupStep } from "../seedUtils";

export async function seedKanjiDbSbgyNotes(prisma: PrismaClient) {
  await runSetupStep({
    prisma,
    step: "KanjiDbSbgyNote",
    force: false,
    version: "KEYLESS STEP",
    async setup() {
      const dbInput: { character: string; syllable: number; text: string }[] =
        [];

      const json = readJsonSync<Record<string, Record<string, string>>>(
        files.sbgyNotesJson,
      );
      for (const char in json) {
        for (const [syllableNumber, text] of Object.entries(json[char])) {
          dbInput.push({
            character: char,
            syllable: Number(syllableNumber),
            text,
          });
        }
      }
    },
  });
}
