import { PrismaClient } from "@prisma/client";

import { inBatchesOf } from "prisma/kanjisense/inBatchesOf";
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
    await inBatchesOf({
      count: 500,
      collection: dbInput,
      getBatchItem: (entry) => entry[1],
      action: async (batch) => {
        await prisma.kanjiDbComposition.createMany({
          data: batch,
        });
      },
    });

    await registerSeeded(prisma, "KanjiDbComposition");
  }

  console.log(`KanjiDbComposition seeded. 🌱`);
}

class KanjiDbComposition {
  constructor(
    public id: string,
    public ids: string | null,
    public etymology: string | null = null,
    public sbgySyllables: number[] = [],
  ) {}
}

async function getDbInput() {
  const dbInput = new Map<string, KanjiDbComposition>();

  await forEachLine(files.kanjiDbIdsCdpTxt, async (line) => {
    if (!line || /^#|^;;/.test(line)) return;

    const [, figureId, ids] = line.match(/\S+\t&?([^&;\s]+);?\t(.+)/u)!;
    if (!figureId || !ids) throw new Error(line);

    dbInput.set(figureId, new KanjiDbComposition(figureId, ids, null, []));
  });

  await forEachLine(files.kanjiDbAnalysisTxt, async (line) => {
    if (!line || /^#|^;;/.test(line)) return;

    const [, figureId, etymology] = line.match(/\S+\t&?([^&;\s]+);?\t(.+)/u)!;
    if (!figureId || !etymology) throw new Error(line);
    const entry = dbInput.get(figureId);
    if (!entry) console.warn(`no id for ${figureId} in ${line}`);
    if (entry?.etymology) {
      console.warn(
        `duplicate etymology for ${figureId} prioritizing first:  ${entry.etymology}`,
      );
    } else if (entry) entry.etymology = etymology;
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
      const entry =
        dbInput.get(character) || new KanjiDbComposition(character, null);
      dbInput.set(character, entry);

      entry.sbgySyllables.push(syllableNumber);
    }
  }
  return dbInput;
}
