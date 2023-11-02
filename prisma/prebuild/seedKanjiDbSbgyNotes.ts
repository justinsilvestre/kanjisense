import { PrismaClient } from "@prisma/client";

import { files, readJsonSync } from "~/lib/files.server";

export async function seedKanjiDbSbgyNotes(prisma: PrismaClient) {
  const seeded = await prisma.readyTables.findUnique({
    where: { id: "KanjiDbSbgyNote" },
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

    await prisma.kanjiDbSbgyNote.createMany({
      data: dbInput,
    });

    await prisma.readyTables.create({ data: { id: "KanjiDbSbgyNote" } });

    console.log(`KanjiDbSbgyNote seeded. 🌱`);
  }
}
