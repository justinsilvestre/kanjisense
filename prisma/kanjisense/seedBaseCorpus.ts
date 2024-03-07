import { createReadStream } from "fs";
import readline from "readline";

import { type PrismaClient } from "@prisma/client";

import {
  BaseCorpus,
  CuratorCorpusText,
} from "~/features/curate/CuratorCorpusText";

import { executeAndLogTime } from "./executeAndLogTime";

const COURSE = "kj";

export async function seedCorpus(prisma: PrismaClient, corpusTextPath: string) {
  const startTime = Date.now();

  console.log("Seeding corpus");

  const fileStream = createReadStream(corpusTextPath, "utf8");
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  const corpusJson: BaseCorpus = {};
  for await (const line of rl) {
    const poem = JSON.parse(line) as CuratorCorpusText;
    corpusJson[poem.normalizedText] = poem;
  }
  await fileStream.close();

  await executeAndLogTime("Deleting all baseCorpusTexts", () =>
    prisma.baseCorpusText.deleteMany({
      where: {
        course: COURSE,
      },
    }),
  );
  console.log("Creating baseCorpusTexts...");

  const priorityFiguresKeys = await prisma.kanjisenseFigure
    .findMany({
      select: { id: true },
      where: { isPriority: true },
    })
    .then((figures) => new Set(figures.map(({ id }) => id)));
  const priorityComponentsKeys = await prisma.kanjisenseFigure
    .findMany({
      select: { id: true },
      where: { isPriorityComponent: true, isPriority: true },
    })
    .then((figures) => new Set(figures.map(({ id }) => id)));
  const allFiguresWithTrees = await prisma.kanjisenseFigure
    .findMany({
      select: { id: true, componentsTree: true },
    })
    .then((figures) => {
      const figuresMap = new Map<
        string,
        [parent: string, component: string][] | null
      >();
      for (const { id, componentsTree } of figures) {
        figuresMap.set(
          id,
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
      select: { id: true, aozoraAppearances: true },
    })
    .then((figures) => {
      const figuresMap = new Map<string, number>();
      for (const { id, aozoraAppearances } of figures) {
        figuresMap.set(id, aozoraAppearances);
      }
      return figuresMap;
    });

  const figuresToUniquePriorityComponents = new Map<string, string[]>();
  for (const [id] of allFiguresWithTrees) {
    const components = getAllUniquePriorityComponents(
      (id) => {
        return allFiguresWithTrees.get(id) ?? null;
      },
      priorityFiguresKeys,
      priorityComponentsKeys,
      id,
    );
    figuresToUniquePriorityComponents.set(id, components);
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
        where: {
          isPriority: true,
        },
      })
      .then((figures) => new Set(figures.map(({ id }) => id)));

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
    const result = await prisma.baseCorpusText.createMany({
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
          figureId: allFiguresWithTrees.has(character) ? character : null,
          frequencyScore: allFiguresFrequencyScores.get(character) ?? 0,
          baseCorpusTextLength: lengthCache[i],
          baseCorpusUniqueCharactersCount: uniqueChars.length,
          baseCorpusUniqueComponentsCount: uniqueComponents.length,
          baseCorpusTextNonPriorityCharactersCount:
            nonPriorityCharactersCountCache[i],
        };
      });
    });
    await prisma.characterUsagesOnBaseCorpusText.createMany({
      data: characterUsagesData,
    });

    console.log("Seeding component relations...");

    const createdComponentUsages =
      await prisma.componentUsagesOnBaseCorpusText.createMany({
        data: batch.reduce(
          (all, [, { uniqueChars }], i) => {
            const uniqueComponents = uniquePriorityComponentsCache[i];
            for (const figureId of uniqueComponents) {
              all.push({
                figureId,
                baseCorpusTextId: hashCache[i],
                frequencyScore: allFiguresFrequencyScores.get(figureId) ?? 0,
                baseCorpusTextLength: lengthCache[i],
                baseCorpusUniqueCharactersCount: uniqueChars.length,
                baseCorpusUniqueComponentsCount: uniqueComponents.length,
              });
            }
            return all;
          },
          [] as {
            figureId: string;
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
