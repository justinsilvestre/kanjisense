import { readFileSync } from "node:fs";

import { KanjisenseFigureRelation, PrismaClient } from "@prisma/client";
import yaml from "yaml";

import { files } from "~/lib/files.server";
import { getFigureById } from "~/models/figureRelation.server";

import { ComponentUse } from "../../app/features/dictionary/ComponentUse";
import { registerSeeded } from "../seedUtils";

import { shouldComponentBeAssignedMeaning } from "./componentMeanings";
import { executeAndLogTime } from "./executeAndLogTime";
import { getAllCharacters } from "./getAllCharacters";
import {
  ComponentMeaning,
  getFigureMeaningsText,
} from "./getFigureMeaningsText";
import { getListsMembership } from "./seedKanjisenseFigureRelation";

export async function seedKanjisenseFigures(
  prisma: PrismaClient,
  force = false,
) {
  const seeded = await prisma.setup.findUnique({
    where: { step: "KanjisenseFigure" },
  });
  if (seeded && !force) console.log(`figures already seeded. 🌱`);
  else {
    console.log("Seeding figures...");

    const componentsDictionary = yaml.parse(
      readFileSync(files.componentsDictionaryYml, "utf-8"),
    ) as Record<string, ComponentMeaning>;

    const {
      allStandaloneCharacters,
      priorityCharacters,
      nonPriorityCharacters,
    } = await getAllCharacters(prisma);

    const allAozoraCharacterFrequencies = Object.fromEntries(
      (
        await prisma.scriptinAozoraFrequency.findMany({
          where: {
            character: { in: allStandaloneCharacters.map((c) => c.id) },
          },
        })
      ).map((c) => [c.character, c]),
    );

    console.log("Checking for figures needing meaning assignment...");
    const { meaningfulComponents, meaninglessComponents } =
      await executeAndLogTime("preparing figures for meaning assignments", () =>
        prepareFiguresForMeaningAssignments(prisma, allStandaloneCharacters),
      );

    const { priorityFiguresMeanings } = await executeAndLogTime(
      "preparing priority figures meanings",
      () =>
        preparePriorityFiguresMeanings(
          prisma,
          componentsDictionary,
          allStandaloneCharacters,
          meaningfulComponents,
        ),
    );

    console.log("preparing priority figures...");
    const dbInput = new Map<string, CreateKanjisenseFigureInput>();
    for (const figure of [...priorityCharacters, ...meaningfulComponents]) {
      const id = figure.id;
      const meaning = priorityFiguresMeanings.get(figure.variantGroupId ?? id);
      if (!meaning) console.error(`meaning not found for ${id}`);

      if (!meaning?.keyword)
        console.error(`keyword not found for priority figure ${id}`);

      const createFigureInput = getCreateFigureInput(
        figure,
        meaning?.keyword ?? "[MISSING]",
        meaning?.mnemonicKeyword ?? null,
        true,
        meaning ?? null,
      );
      dbInput.set(id, createFigureInput);
    }

    console.log("preparing non-priority figures...");
    for (const figure of [...nonPriorityCharacters, ...meaninglessComponents]) {
      const id = figure.id;

      const meaning = await getFigureMeaningsText(
        prisma,
        figure,
        componentsDictionary[figure.variantGroupId ?? figure.id] || null,
      );
      const keyword =
        meaning?.kanjidicEnglish?.[0] ||
        meaning?.unihanDefinitionText?.split("; ")?.[0] ||
        "[UNNAMED FIGURE]";
      const createFigureInput = getCreateFigureInput(
        figure,
        keyword,
        null,
        false,
        meaning,
      );
      dbInput.set(id, createFigureInput);
    }

    console.log("creating entries...");

    await prisma.kanjisenseComponentUse.deleteMany({});
    await prisma.kanjisenseComponent.deleteMany({});
    await prisma.kanjisenseFigureImage.deleteMany({});
    await prisma.kanjisenseFigure.deleteMany({});

    console.log("seeding figures");
    await prisma.kanjisenseFigure.createMany({
      data: Array.from(dbInput.values(), (r) => ({
        id: r.id,
        keyword: r.keyword,
        mnemonicKeyword: r.mnemonicKeyword,
        isPriority: r.isPriority,
        listsAsComponent: { set: r.listsAsComponent },
        listsAsCharacter: { set: r.listsAsCharacter },
        aozoraAppearances: 0, // to fill in below
        variantGroupId: r.variantGroupId,
      })),
    });

    console.log("seeding meanings");

    await prisma.kanjisenseFigureMeaning.createMany({
      data: Array.from(dbInput.values(), (r) => ({
        id: r.id,
        unihanDefinition: r.meaning?.unihanDefinitionText,
        kanjidicEnglish: r.meaning?.kanjidicEnglish,
      })),
    });

    console.log("building components trees");
    const { componentsTreesInput, componentsToUses } =
      await getAllComponentsTrees(dbInput.keys(), prisma);

    await executeAndLogTime("connecting components trees entries", () =>
      connectComponentsTreesEntries(
        componentsTreesInput,
        componentsToUses,
        allAozoraCharacterFrequencies,
        prisma,
      ),
    );

    await executeAndLogTime("connecting first-class components", () =>
      connectFirstClassComponents(
        componentsTreesInput,
        priorityFiguresMeanings,
        prisma,
      ),
    );

    await executeAndLogTime(
      "updating variant group hasStandaloneCharacter field",
      async () => {
        const variantGroups = await prisma.kanjisenseVariantGroup.findMany();
        const variantGroupHeadsIds = new Set(variantGroups.map((g) => g.id));
        const standaloneVariantGroupHeads =
          await prisma.kanjisenseFigure.findMany({
            where: {
              id: { in: [...variantGroupHeadsIds] },
              OR: [
                { listsAsCharacter: { isEmpty: false } },
                {
                  firstClassUses: {
                    none: {
                      parent: {
                        isPriority: true,
                      },
                    },
                  },
                },
              ],
            },
          });
        for (const variantGroupHead of standaloneVariantGroupHeads) {
          await prisma.kanjisenseVariantGroup.update({
            where: { id: variantGroupHead.id },
            data: { hasStandaloneCharacter: true },
          });
        }
      },
    );

    await registerSeeded(prisma, "KanjisenseFigure");
    console.log(`figures seeded. 🌱`);
  }
}

interface CreateKanjisenseFigureInput {
  id: string;
  keyword: string;
  mnemonicKeyword: string | null;
  isPriority: boolean;
  listsAsComponent: string[];
  listsAsCharacter: string[];
  variantGroupId: string | null;
  meaning?: Awaited<ReturnType<typeof getFigureMeaningsText>>;
}

async function connectFirstClassComponents(
  componentsTreesInput: Map<string, ComponentUse[]>,
  priorityFiguresMeanings: Map<
    string,
    {
      unihanDefinitionText: string | null;
      kanjidicEnglish: string[];
      keyword: string | null;
      mnemonicKeyword: string | null;
    } | null
  >,
  prisma: PrismaClient,
) {
  for (const [id, tree] of componentsTreesInput.entries()) {
    const resolved = new Set<string>();
    let chain: string[] = [id];

    const firstClassComponents = tree.reduce((acc, use, indexInTree) => {
      const { parent, component } = use;
      const parentIndexInChain = chain.indexOf(parent);
      const parentIsInChain = parentIndexInChain !== -1;
      if (parentIsInChain) {
        chain = chain.slice(0, parentIndexInChain + 1);
      } else {
        chain.push(parent);
      }

      const chainString = chain.join();
      if (resolved.has(chainString)) {
        resolved.add(`${chainString},${component}`);
        return acc;
      }

      const componentIsMeaningful = priorityFiguresMeanings.has(component);
      if (componentIsMeaningful) {
        resolved.add(`${chainString},${component}`);
        const appearancesInParent = acc.get(use.component) || [];
        appearancesInParent.push(indexInTree);
        acc.set(use.component, appearancesInParent);
      }

      return acc;
    }, new Map<string, number[]>());

    const firstClassComponentsInput = Array.from(
      firstClassComponents,
      ([componentId, indexesInTree]) => {
        return indexesInTree.map((indexInTree, i) => ({
          indexInTree,
          appearanceInParent: i + 1,
          component: {
            connect: { id: componentId },
          },
        }));
      },
    ).flat();
    await prisma.kanjisenseFigure.update({
      where: { id },
      data: {
        firstClassComponents: {
          create: firstClassComponentsInput,
        },
      },
    });
  }
}

async function connectComponentsTreesEntries(
  componentsTreesInput: Map<string, ComponentUse[]>,
  componentsToUses: Map<string, Set<string>>,
  allAozoraCharacterFrequencies: Record<
    string,
    {
      character: string;
      appearances: number;
      fraction: number;
      rank: number;
    }
  >,
  prisma: PrismaClient,
) {
  for (const [id, componentsTree] of componentsTreesInput.entries()) {
    const figureUsesAsComponent = componentsToUses.get(id);
    try {
      const combinedAozoraAppearances =
        (allAozoraCharacterFrequencies[id]?.appearances ?? 0) +
        (figureUsesAsComponent
          ? setReduce(
              figureUsesAsComponent,
              (acc, parentId) =>
                acc +
                (allAozoraCharacterFrequencies[parentId]?.appearances ?? 0),
              0,
            )
          : 0);

      await prisma.kanjisenseFigure.update({
        where: { id },
        data: {
          aozoraAppearances: combinedAozoraAppearances,
          componentsTree: componentsTree.map((c) => c.toJSON()),
          asComponent: figureUsesAsComponent?.size
            ? {
                create: {
                  allUses: {
                    connect: Array.from(figureUsesAsComponent, (parentId) => ({
                      id: parentId,
                    })),
                  },
                },
              }
            : undefined,
        },
      });
    } catch (e) {
      console.log({ id, componentsTree, figureUsesAsComponent });
      throw e;
    }
  }
}

async function prepareFiguresForMeaningAssignments(
  prisma: PrismaClient,
  allStandaloneCharacters: KanjisenseFigureRelation[],
) {
  const componentFiguresPotentiallyNeedingMeaningAssignment =
    await prisma.kanjisenseFigureRelation.findMany({
      where: {
        directUses: { isEmpty: false },
        id: { not: { in: allStandaloneCharacters.map((c) => c.id) } },
        isPriorityCandidate: true,
      },
    });
  const meaningfulComponents: KanjisenseFigureRelation[] = [];
  const meaninglessComponents: KanjisenseFigureRelation[] = [];
  for (const figure of componentFiguresPotentiallyNeedingMeaningAssignment) {
    const shouldBeAssignedMeaning = await shouldComponentBeAssignedMeaning(
      prisma,
      figure,
    );
    if (shouldBeAssignedMeaning) meaningfulComponents.push(figure);
    else meaninglessComponents.push(figure);
  }
  const remainingMeaninglessComponents =
    await prisma.kanjisenseFigureRelation.findMany({
      where: {
        id: {
          notIn: [
            ...meaningfulComponents.map((c) => c.id),
            ...meaninglessComponents.map((c) => c.id),
            ...allStandaloneCharacters.map((c) => c.id),
          ],
        },
      },
    });
  meaninglessComponents.push(...remainingMeaninglessComponents);

  const allFiguresCount =
    meaningfulComponents.length +
    meaninglessComponents.length +
    allStandaloneCharacters.length;
  if (allFiguresCount !== (await prisma.kanjisenseFigureRelation.count())) {
    const unnaccountedForFigures =
      await prisma.kanjisenseFigureRelation.findMany({
        where: {
          id: {
            notIn: [
              ...meaningfulComponents.map((c) => c.id),
              ...meaninglessComponents.map((c) => c.id),
              ...allStandaloneCharacters.map((c) => c.id),
            ],
          },
        },
      });
    console.log(unnaccountedForFigures);
    throw new Error(
      `allFiguresCount (${allFiguresCount}) !== await prisma.kanjisenseFigureRelation.count() (${await prisma.kanjisenseFigureRelation.count()})`,
    );
  }
  return { meaningfulComponents, meaninglessComponents };
}
async function preparePriorityFiguresMeanings(
  prisma: PrismaClient,
  componentsDictionary: Record<string, ComponentMeaning>,
  allStandaloneCharacters: KanjisenseFigureRelation[],
  meaningfulComponents: KanjisenseFigureRelation[],
) {
  const priorityFiguresMeanings = new Map<
    string,
    Awaited<ReturnType<typeof getFigureMeaningsText>>
  >();
  for (const figure of [...allStandaloneCharacters, ...meaningfulComponents]) {
    const primaryVariantId = figure.variantGroupId || figure.id;

    const componentsDictionaryEntry = componentsDictionary[primaryVariantId];
    let meaning = await getFigureMeaningsText(
      prisma,
      figure,
      componentsDictionaryEntry || null,
    );
    if (!meaning) {
      const variants =
        (
          await prisma.kanjisenseVariantGroup.findUnique({
            where: { id: primaryVariantId },
            select: { variants: true },
          })
        )?.variants ?? [];
      for (const variant of variants) {
        const variantFigure = await getFigureById(prisma, variant);
        meaning = await getFigureMeaningsText(
          prisma,
          variantFigure,
          componentsDictionaryEntry || null,
        );
        if (meaning) {
          // console.warn(
          //   `meaning not found for priority figure variant ${figure.id}, using variant ${variant}, ${meaning.kanjidicEnglish} // ${meaning.unihanDefinitionText}`,
          // );
          break;
        }
      }
      if (!meaning)
        throw new Error(
          `meaning not found for any variants of priority figure ${
            figure.id
          } having ${getVariantsMessage(variants)}`,
        );
      if (!meaning.keyword) {
        throw new Error(
          `keyword not found for priority figure ${
            figure.id
          } having ${getVariantsMessage(variants)}`,
        );
      }
    }
    priorityFiguresMeanings.set(figure.id, meaning);
  }

  return { priorityFiguresMeanings };
}

function getVariantsMessage(variants: string[]) {
  return variants.length ? `variants: [${variants.join(", ")}]` : "no variants";
}

async function getAllComponentsTrees(
  figuresKeys: IterableIterator<string>,
  prisma: PrismaClient,
) {
  const componentsTreesInput = new Map<string, ComponentUse[]>();
  const componentsToUses = new Map<string, Set<string>>();
  const charactersToComponents = new Map<string, Set<string>>();
  const getSelectedIdsComponentsCache = new Map<string, string[]>();
  for (const parent of figuresKeys) {
    const componentsTree = await getComponentsTree(parent, async (id) => {
      if (getSelectedIdsComponentsCache.has(id))
        return getSelectedIdsComponentsCache.get(id)!;

      const relation = await prisma.kanjisenseFigureRelation.findUnique({
        where: { id },
        select: { selectedIdsComponents: true },
      });
      if (!relation) throw new Error(`figure ${id} not found`);
      getSelectedIdsComponentsCache.set(id, relation.selectedIdsComponents);
      return relation.selectedIdsComponents;
    });
    for (const { component } of componentsTree) {
      if (!componentsToUses.has(component))
        componentsToUses.set(component, new Set());
      componentsToUses.get(component)!.add(parent);
      if (!charactersToComponents.has(parent))
        charactersToComponents.set(parent, new Set());
      charactersToComponents.get(parent)!.add(component);
    }
    componentsTreesInput.set(parent, componentsTree);
  }
  return { componentsTreesInput, componentsToUses };
}

function getCreateFigureInput(
  figure: KanjisenseFigureRelation,
  keyword: string,
  mnemonicKeyword: string | null,
  isPriority: boolean,
  meaning: Awaited<ReturnType<typeof getFigureMeaningsText>> | null,
) {
  const figureId = figure.id;

  return {
    id: figureId,
    keyword: keyword,
    mnemonicKeyword: mnemonicKeyword,
    isPriority,
    listsAsComponent: figure.listsAsComponent, // refine?
    listsAsCharacter: [...getListsMembership(figureId)],
    variantGroupId: figure.variantGroupId,
    meaning,
  };
}

export async function getComponentsTree(
  figureId: string,
  getSelectedIdsComponents: (id: string) => Promise<string[]>,
  componentsTreeCache = new Map<string, ComponentUse[]>(),
) {
  if (componentsTreeCache.has(figureId))
    return componentsTreeCache.get(figureId)!;

  const componentsTree: ComponentUse[] = [];
  for (const componentId of await getSelectedIdsComponents(figureId)) {
    if (componentId === figureId) continue; // prevent infinite loop for atomic figures

    componentsTree.push(
      new ComponentUse(figureId, componentId),
      ...(await getComponentsTree(
        componentId,
        getSelectedIdsComponents,
        componentsTreeCache,
      )),
    );
  }

  componentsTreeCache.set(figureId, componentsTree);

  return componentsTree;
}

function setReduce<T, U>(
  set: Set<T>,
  reducer: (acc: U, next: T) => U,
  initialValue: U,
) {
  let acc = initialValue;
  for (const next of set) {
    acc = reducer(acc, next);
  }
  return acc;
}
