import { PrismaClient } from "@prisma/client";

import { files, readJsonSync } from "~/lib/files.server";
import { forEachLine } from "~/lib/forEachLine.server";

export async function seedKanjiDbComposition(
  prisma: PrismaClient,
  force = false,
) {
  const seeded = await prisma.readyTables.findUnique({
    where: { id: "KanjiDbComposition" },
  });
  if (seeded && !force) console.log(`KanjiDbComposition already seeded. 🌱`);
  else {
    console.log(`seeding KanjiDbComposition...`);

    const dbInput = await getDbInput();

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

    if (
      !(await prisma.readyTables.findUnique({
        where: { id: "KanjiDbComposition" },
      }))
    )
      await prisma.readyTables.create({ data: { id: "KanjiDbComposition" } });
  }

  console.log(`KanjiDbComposition seeded. 🌱`);
}

async function getDbInput() {
  const dbInput: Record<
    string,
    { id: string; ids?: string; etymology?: string; sbgySyllables?: number[] }
  > = {};

  await forEachLine(files.kanjiDbIdsCdpTxt, async (line) => {
    if (!line || /^#|^;;/.test(line)) return;

    const [, figureId, ids] = line.match(/\S+\t&?([^&;\s]+);?\t(.+)/u)!;
    if (!figureId || !ids) throw new Error(line);
    dbInput[figureId] = {
      id: figureId,
      ids,
    };
  });

  await forEachLine(files.kanjiDbAnalysisTxt, async (line) => {
    if (!line || /^#|^;;/.test(line)) return;

    const [, figureId, etymology] = line.match(/\S+\t&?([^&;\s]+);?\t(.+)/u)!;
    if (!figureId || !etymology) throw new Error(line);
    dbInput[figureId] = {
      id: figureId,
      etymology,
    };
  });

  const sbgyJson = readJsonSync<
    // [19,"昌終切","シュウ","充,珫,茺,㤝,䘪,𪎽,㳘"],
    [
      syllableNumber: number,
      fanqie: string,
      onReading: string,
      characters: string,
    ][]
  >(files.sbgyJson);

  for (const [syllableNumber, , , characters] of sbgyJson) {
    for (const character of characters.split(",")) {
      dbInput[character] = {
        ...dbInput[character],
        sbgySyllables: [
          ...(dbInput[character]?.sbgySyllables || []),
          syllableNumber,
        ],
      };
    }
  }
  return dbInput;
}
