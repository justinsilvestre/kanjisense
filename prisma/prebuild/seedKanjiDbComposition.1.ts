import { PrismaClient } from "@prisma/client";

import { files, readJsonSync } from "~/lib/files.server";
import { forEachLine } from "~/lib/forEachLine.server";

export async function seedKanjiDbComposition(prisma: PrismaClient) {
  const seeded = await prisma.readyTables.findUnique({
    where: { id: "KanjiDbComposition" },
  });
  if (seeded) console.log(`KanjiDbComposition already seeded. 🌱`);
  else {
    console.log(`seeding KanjiDbComposition...`);
    await prisma.kanjiDbComposition.deleteMany({});

    const dbInput: Record<
      string,
      { id: string; ids?: string; etymology?: string; sbgySyllables?: number[] }
    > = {};

    await forEachLine(files.kanjiDbIdsCdpTxt, async (line) => {
      if (!line || /^#|^;;/.test(line)) return;

      const [, figureKey, ids] = line.match(/\S+\t&?([^&;\s]+);?\t(.+)/u)!;
      if (!figureKey || !ids) throw new Error(line);
      dbInput[figureKey] ||= { id: figureKey };
      dbInput[figureKey].ids = ids;
    });

    await forEachLine(files.kanjiDbAnalysisTxt, async (line) => {
      if (!line || /^#|^;;/.test(line)) return;

      const [, figureKey, etymology] = line.match(
        /\S+\t&?([^&;\s]+);?\t(.+)/u,
      )!;
      if (!figureKey || !etymology) throw new Error(line);
      dbInput[figureKey] ||= { id: figureKey };

      dbInput[figureKey].etymology = etymology;
    });

    const sbgyJson = readJsonSync<
      [
        syllableNumber: number,
        fanqie: string,
        onReading: string,
        characters: string,
      ][]
    >(files.sbgyJson);
    for (const [syllableNumber, , , characters] of sbgyJson) {
      for (const character of characters.split(",")) {
        dbInput[character] ||= { id: character };

        dbInput[character].sbgySyllables ||= [];
        dbInput[character].sbgySyllables!.push(syllableNumber);
      }
    }

    await prisma.kanjiDbComposition.createMany({
      data: Object.values(dbInput).map(
        ({ id, ids, etymology, sbgySyllables }) => ({
          id,
          ids: ids || null,
          etymology: etymology || null,
          sbgySyllables: sbgySyllables || [],
        }),
      ),
    });

    await prisma.readyTables.create({ data: { id: "KanjiDbComposition" } });

    console.log(`KanjiDbComposition seeded. 🌱`);
  }
}
