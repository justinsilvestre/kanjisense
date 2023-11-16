import { PrismaClient } from "@prisma/client";

import { files, readJsonSync } from "~/lib/files.server";
import { forEachLine } from "~/lib/forEachLine.server";

import { registerSeeded } from "../seedUtils";

export async function seedKanjiDbComposition(
  prisma: PrismaClient,
  force = false,
) {
  const seeded = await prisma.setup.findUnique({
    where: { step: "KanjiDbComposition" },
  });
  if (seeded && !force) console.log(`KanjiDbComposition already seeded. 🌱`);
  else {
    console.log(`seeding KanjiDbComposition...`);

    const dbInput = await getDbInput();

    await prisma.kanjiDbComposition.deleteMany({});
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

    await registerSeeded(prisma, "KanjiDbComposition");
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
    if (!dbInput[figureId]) console.warn(`no id for ${figureId} in ${line}`);
    if (dbInput[figureId]?.etymology) {
      console.warn(
        `duplicate etymology for ${figureId} prioritizing first:  ${dbInput[figureId].etymology}`,
      );
    } else if (dbInput[figureId]) dbInput[figureId].etymology = etymology;
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

  for (const [syllableNumber, fanqie, , characters] of sbgyJson) {
    for (const character of characters.split(",")) {
      if (!character)
        console.warn(`no character for ${syllableNumber} ${fanqie}`);
      dbInput[character] ||= {
        id: character,
      };

      dbInput[character].sbgySyllables ||= [];
      dbInput[character].sbgySyllables!.push(syllableNumber);
    }
  }
  return dbInput;
}
