import { createReadStream } from "fs";
import { createInterface } from "readline";

import { type PrismaClient } from "@prisma/client";

import {
  BaseCorpus,
  CuratorCorpusText,
} from "~/features/curate/CuratorCorpusText";
import { FIGURES_VERSION } from "~/models/figure";

import { executeAndLogTime } from "./executeAndLogTime";

const COURSE = "kj";

export async function seedCorpus(
  prisma: PrismaClient,
  corpusTextPath = "/Users/justin/code/notes/2020/han_character_course/compiledTexts2.txt",
) {
  const startTime = Date.now();

  console.log("Seeding corpus");

  const corpusJson: BaseCorpus = {};

  const fileStream = createReadStream(corpusTextPath, "utf8");
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    const poem = JSON.parse(line) as CuratorCorpusText;
    corpusJson[poem.normalizedText] = poem;
  }
  await fileStream.close();

  const shenxiu = {
    title: "身是菩提樹",
    text: "身是菩提樹，心如明鏡臺。時時勤拂拭，勿使惹塵埃。",
    normalizedText: "身是菩提樹心如明鏡台時時勤払拭勿使惹塵埃",
    uniqueChars: "身是菩提樹心如明鏡台時勤払拭勿使惹塵埃",
    section: "行由品",
    source: "六祖壇經",
    author: "神秀",
    urls: [
      "https://zh.wikisource.org/wiki/%E5%85%AD%E7%A5%96%E5%A3%87%E7%B6%93/%E8%A1%8C%E7%94%B1%E5%93%81",
    ],
  };
  const huineng = {
    title: "菩提本無樹",
    text: "菩提本無樹，明鏡亦非台，本來無一物，何處惹塵埃。",
    normalizedText: "菩提本無樹明鏡亦非台本来無一物何処惹塵埃",
    uniqueChars: "菩提本無樹明鏡亦非台来一物何処惹塵埃",
    section: "行由品",
    source: "六祖壇經",
    author: "惠能",
    urls: [
      "https://zh.wikisource.org/wiki/%E5%85%AD%E7%A5%96%E5%A3%87%E7%B6%93/%E8%A1%8C%E7%94%B1%E5%93%81",
    ],
  };
  corpusJson[shenxiu.normalizedText] = new CuratorCorpusText(
    shenxiu,
    shenxiu.normalizedText,
  );
  corpusJson[huineng.normalizedText] = new CuratorCorpusText(
    huineng,
    huineng.normalizedText,
  );

  await executeAndLogTime("Deleting all baseCorpusTexts", () =>
    prisma.baseCorpusText.deleteMany({
      where: {
        course: COURSE,
        // id: {
        //   in: Object.keys(corpusJson).map((key) => hashString(key)),
        // },
      },
    }),
  );
  console.log("Creating baseCorpusTexts...");

  const priorityFiguresKeys = await prisma.kanjisenseFigure
    .findMany({
      select: { key: true },
      where: { version: FIGURES_VERSION, isPriority: true },
    })
    .then((figures) => new Set(figures.map(({ key }) => key)));
  const priorityComponentsKeys = await prisma.kanjisenseFigure
    .findMany({
      select: { key: true },
      where: {
        version: FIGURES_VERSION,
        isPriorityComponent: true,
        isPriority: true,
      },
    })
    .then((figures) => new Set(figures.map(({ key }) => key)));
  const allFiguresWithTrees = await prisma.kanjisenseFigure
    .findMany({
      where: { version: FIGURES_VERSION },
      select: { key: true, componentsTree: true },
    })
    .then((figures) => {
      const figuresMap = new Map<
        string,
        [parent: string, component: string][] | null
      >();
      for (const { key, componentsTree } of figures) {
        figuresMap.set(
          key,
          (componentsTree as unknown as [
            parent: string,
            component: string,
          ][]) ?? null,
        );
      }
      return figuresMap;
    });
  const allFiguresFrequencyScores = await prisma.kanjisenseFigure
    .findMany({
      select: { key: true, aozoraAppearances: true },
    })
    .then((figures) => {
      const figuresMap = new Map<string, number>();
      for (const { key, aozoraAppearances } of figures) {
        figuresMap.set(key, aozoraAppearances);
      }
      return figuresMap;
    });

  const figuresToUniquePriorityComponents = new Map<string, string[]>();
  for (const [key] of allFiguresWithTrees) {
    const components = getAllUniquePriorityComponents(
      (key) => {
        return allFiguresWithTrees.get(key) ?? null;
      },
      priorityFiguresKeys,
      priorityComponentsKeys,
      key,
    );
    figuresToUniquePriorityComponents.set(key, components);
  }

  const totalTexts = Object.keys(corpusJson).length;
  let seeded = 0;
  await inBatchesOf(2000, Object.entries(corpusJson), async (batch) => {
    const lengthCache = new Array<number>(batch.length);
    const nonPriorityCharactersCountCache = new Array<number>(batch.length);
    const hashCache = new Array<number>(batch.length);
    const uniquePriorityComponentsCache = new Array<string[]>(batch.length);
    const hashAndCache = (text: string, i: number) => {
      if (hashCache[i]) return hashCache[i];
      const hash = hashString(text);
      hashCache[i] = hash;
      return hash;
    };
    const getAllUniqueComponentsAndCache = (uniqueChars: string, i: number) => {
      if (uniquePriorityComponentsCache[i])
        return uniquePriorityComponentsCache[i];
      const uniqueComponents = new Set<string>();
      for (const char of uniqueChars) {
        if (priorityFiguresKeys.has(char)) {
          const components = figuresToUniquePriorityComponents.get(char) ?? [];
          for (const component of components) {
            uniqueComponents.add(component);
          }
        }
      }
      uniquePriorityComponentsCache[i] = [...uniqueComponents];

      return uniquePriorityComponentsCache[i];
    };

    const priorityFigures = await prisma.kanjisenseFigure
      .findMany({
        where: { version: FIGURES_VERSION, isPriority: true },
      })
      .then((figures) => new Set(figures.map(({ key }) => key)));

    const batchData = batch.map(([key, value], i) => {
      lengthCache[i] = value.normalizedText.length;
      let nonPriorityCharactersCount = 0;
      for (const char of value.normalizedText) {
        if (!priorityFigures.has(char)) nonPriorityCharactersCount++;
      }
      nonPriorityCharactersCountCache[i] = nonPriorityCharactersCount;
      return {
        id: hashAndCache(key, i),
        key,
        course: COURSE,
        title: value.title,
        author: value.author,
        source: value.source,
        section: value.section,
        dynasty: value.dynasty,
        urls: value.urls ?? [],
        text: value.text,

        normalizedText: value.normalizedText,
        normalizedLength: value.normalizedText.length,
        nonPriorityCharactersCount,
      };
    });
    // const alreadyMade = (
    //   await Promise.all(
    //     batchData.map((t) =>
    //       prisma.baseCorpusText.findFirst({ where: { id: t.id } }),
    //     ),
    //   )
    // ).filter((x) => x);
    // console.log(alreadyMade.map((x) => x!.text));
    const result = await prisma.baseCorpusText.createMany({
      // data: batchData.filter(
      //   (t) => !alreadyMade.some((existing) => existing!.id === t.id),
      // ),
      data: batchData,
    });

    seeded += result.count;
    console.log(`Seeded ${seeded} baseCorpusTexts of ${totalTexts}`);

    console.log("Seeding character relations...");

    const characterUsagesData = batch.flatMap(([, { uniqueChars }], i) => {
      const uniqueComponents = getAllUniqueComponentsAndCache(uniqueChars, i);

      return Array.from(uniqueChars, (character) => {
        return {
          character,
          baseCorpusTextId: hashCache[i],
          // figureKey: allFiguresWithTrees.has(character) ? character : null,
          frequencyScore: allFiguresFrequencyScores.get(character) ?? 0,
          baseCorpusTextLength: lengthCache[i],
          baseCorpusUniqueCharactersCount: uniqueChars.length,
          baseCorpusUniqueComponentsCount: uniqueComponents.length,
          baseCorpusTextNonPriorityCharactersCount:
            nonPriorityCharactersCountCache[i],
        };
      });
    });

    // const existingCharacterUsages = (
    //   await Promise.all(
    //     characterUsagesData.map((u) =>
    //       prisma.characterUsagesOnBaseCorpusText.findFirst({
    //         where: {
    //           character: u.character,
    //           baseCorpusTextId: u.baseCorpusTextId,
    //         },
    //       }),
    //     ),
    //   )
    // ).filter((x) => x);
    // const toCreate = characterUsagesData.filter(
    //   (u) =>
    //     !existingCharacterUsages.some(
    //       (existing) =>
    //         existing!.character === u.character &&
    //         existing!.baseCorpusTextId === u.baseCorpusTextId,
    //     ),
    // );

    const createdCharacterUsages =
      await prisma.characterUsagesOnBaseCorpusText.createMany({
        // data: toCreate,
        data: characterUsagesData,
      });
    console.log(createdCharacterUsages.count, "character usages created");

    console.log("Seeding component relations...");

    const createdComponentUsages =
      await prisma.componentUsagesOnBaseCorpusText.createMany({
        data: batch.reduce(
          (all, [, { uniqueChars }], i) => {
            const uniqueComponents = uniquePriorityComponentsCache[i];
            for (const figureKey of uniqueComponents) {
              all.push({
                figureKey,
                baseCorpusTextId: hashCache[i],
                frequencyScore: allFiguresFrequencyScores.get(figureKey) ?? 0,
                baseCorpusTextLength: lengthCache[i],
                baseCorpusUniqueCharactersCount: uniqueChars.length,
                baseCorpusUniqueComponentsCount: uniqueComponents.length,
              });
            }
            return all;
          },
          [] as {
            figureKey: string;
            baseCorpusTextId: number;
            frequencyScore: number;
            baseCorpusTextLength: number;
            baseCorpusUniqueCharactersCount: number;
            baseCorpusUniqueComponentsCount: number;
          }[],
        ),
      });
    console.log(createdComponentUsages.count, "component usages created");

    const endTime = Date.now();
    const ms = endTime - startTime;
    const seconds = ms / 1000;
    console.log(
      `Seeded character and component relations for batch in ${seconds.toFixed(
        3,
      )} seconds.`,
    );
  });

  console.log(`Seeded ${seeded} baseCorpusTexts.}`);
  const endTime = Date.now();
  const ms = endTime - startTime;
  const seconds = ms / 1000;
  console.log(`Finished in ${seconds.toFixed(3)} seconds.`);
}

async function inBatchesOf<T, U>(
  count: number,
  array: T[],
  action: (batch: T[]) => Promise<U>,
) {
  for (let i = 0; i < array.length; i += count) {
    const batch = array.slice(i, i + count);
    await action(batch);
  }
}

function hashString(string: string) {
  let hash = 0,
    i,
    chr;
  if (string.length === 0) return hash;
  for (i = 0; i < string.length; i++) {
    chr = string.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
}

function getAllUniquePriorityComponents(
  getComponentsTree: (
    key: string,
  ) => [parent: string, component: string][] | null,
  priorityFiguresKeys: Set<string>,
  priorityComponentsKeys: Set<string>,
  character: string,
) {
  if (!priorityFiguresKeys.has(character)) return [];
  const components = new Set<string>();

  const componentsTreeJson = getComponentsTree(character);
  if (!componentsTreeJson?.length) {
    components.add(character);
  } else {
    for (const [, component] of componentsTreeJson) {
      if (priorityComponentsKeys.has(component)) components.add(component);
    }
  }

  return [...components];
}
