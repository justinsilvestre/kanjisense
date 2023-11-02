import { PrismaClient } from "@prisma/client";

import { files, readJsonSync } from "~/lib/files.server";
import { forEachLine } from "~/lib/forEachLine.server";

// mostly ocr and xml structure corrections
const replacementFanqie = {
  179: "尺隹切",
  549: "奴還切",
  682: "尺招切",
  795: "敕加切",
  1155: "符咸切",
  1170: "蒲蠓切",
  1444: "于罪切",
  1509: "仄謹切",
  1612: "方典切",
  1795: "叉瓦切",
  1919: "章拯切", // no homophones
  2100: "千弄切",
  2109: "千仲切",
  2600: "符万切",
  2970: "北諍切",
  3176: "士懴切",
  3177: "影鑑切", // no homophones
  3791: "士七切",
  // apparently errors in original text, cf. margin notes of ytenx scans
  2295: "丘倨切",
  2697: "黃練切",
  2085: "仕檻切",
};
const replacementExemplars: { [xiaoyun: number]: (text: string) => string } = {
  // probably ocr mistakes
  522: (t) => t.replace("𢘆", "桓"),
  // using commoner variant
  539: (t) => t.replace("𠜂", "刪"),
  595: (t) => t.replace("𤣥", "玄"),
};

export async function seedKanjiDbComposition(prisma: PrismaClient) {
  const seeded = await prisma.readyTables.findUnique({
    where: { id: "KanjiDbComposition" },
  });
  if (seeded) console.log(`KanjiDbComposition already seeded. 🌱`);
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

    const [, figureKey, ids] = line.match(/\S+\t&?([^&;\s]+);?\t(.+)/u)!;
    if (!figureKey || !ids) throw new Error(line);
    dbInput[figureKey] = {
      id: figureKey,
      ids,
    };
  });

  await forEachLine(files.kanjiDbAnalysisTxt, async (line) => {
    if (!line || /^#|^;;/.test(line)) return;

    const [, figureKey, etymology] = line.match(/\S+\t&?([^&;\s]+);?\t(.+)/u)!;
    if (!figureKey || !etymology) throw new Error(line);
    dbInput[figureKey] = {
      id: figureKey,
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
