import { PrismaClient } from "@prisma/client";

import { files, readJsonSync } from "~/lib/files.server";

import { registerSeeded } from "../seedUtils";

export async function seedKanjiDbSbgyNotes(prisma: PrismaClient) {
  const seeded = await prisma.setup.findUnique({
    where: { step: "KanjiDbSbgyNote" },
  });
  if (seeded) console.log(`KanjiDbSbgyNote already seeded. 🌱`);
  else {
    console.log(`seeding KanjiDbSbgyNote...`);
    const dbInput: { character: string; syllable: number; text: string }[] = [];

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

    await registerSeeded(prisma, "KanjiDbSbgyNote");

    console.log(`KanjiDbSbgyNote seeded. 🌱`);
  }
}
