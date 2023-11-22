import { readFileSync } from "node:fs";

import {
  KanjiDbVariantType,
  KanjisenseFigureRelation,
  Prisma,
  PrismaClient,
} from "@prisma/client";
import yaml from "yaml";

import { baseKanjiSet } from "~/lib/baseKanji";
import { files } from "~/lib/files.server";
import { getFigureById } from "~/models/figureRelation.server";

import { ComponentUse } from "../../app/features/dictionary/ComponentUse";
import { registerSeeded } from "../seedUtils";

import { shouldComponentBeAssignedMeaning } from "./componentMeanings";
import { executeAndLogTime } from "./executeAndLogTime";
import { getAllCharactersAndVariantFigures } from "./getAllCharacters";
import {
  ComponentMeaning,
  getFigureMeaningsText,
} from "./getFigureMeaningsText";
import { isComponentFirstClass } from "./isComponentFirstClass";
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

    const readingIds = new Set(
      await prisma.kanjisenseFigureReading
        .findMany({
          select: { id: true },
        })
        .then((rs) => rs.map((r) => r.id)),
    );

    const componentsDictionary = yaml.parse(
      readFileSync(files.componentsDictionaryYml, "utf-8"),
    ) as Record<string, ComponentMeaning>;

    const {
      allStandaloneCharactersMinusSomeDoublingAsNonPriorityComponents,
      priorityCharactersAndTheirNonComponentVariants,
      nonPriorityCharacters,
      // priorityCharactersComponentVariants,
    } = await getAllCharactersAndVariantFigures(prisma);

    const allAozoraCharacterFrequencies = Object.fromEntries(
      (
        await prisma.scriptinAozoraFrequency.findMany({
          where: {
            character: {
              in: allStandaloneCharactersMinusSomeDoublingAsNonPriorityComponents.map(
                (c) => c.id,
              ),
            },
          },
        })
      ).map((c) => [c.character, c]),
    );

    const figuresToVariantGroups = await getFiguresToVariantGroups(prisma);

    console.log("building components trees");
    const {
      componentsTreesInput,
      componentsToUses,
      componentsToDirectUsesPrimaryVariants,
    } = await getAllComponentsTrees(
      prisma,
      await prisma.kanjisenseFigureRelation
        .findMany({ select: { id: true } })
        .then((fs) => fs.map((f) => f.id)),
      figuresToVariantGroups,
    );

    console.log("Checking for figures needing meaning assignment...");
    const { meaningfulComponents, meaninglessComponents } =
      await executeAndLogTime("preparing figures for meaning assignments", () =>
        prepareFiguresForMeaningAssignments(
          prisma,
          allStandaloneCharactersMinusSomeDoublingAsNonPriorityComponents,
          figuresToVariantGroups,
          componentsToDirectUsesPrimaryVariants,
        ),
      );

    const { charactersAndPriorityComponentsMeanings } = await executeAndLogTime(
      "preparing characters and priority components meanings",
      () =>
        prepareCharactersAndPriorityComponentsMeaningsMeanings(
          prisma,
          componentsDictionary,
          allStandaloneCharactersMinusSomeDoublingAsNonPriorityComponents,
          meaningfulComponents,
        ),
    );

    console.log("preparing priority figures...");
    const dbInput = new Map<string, CreateKanjisenseFigureInput>();
    for (const figure of [
      ...priorityCharactersAndTheirNonComponentVariants,
      ...meaningfulComponents,
    ]) {
      const id = figure.id;
      const meaning = charactersAndPriorityComponentsMeanings.get(
        figure.variantGroupId ?? id,
      );
      if (!meaning)
        console.error(`meaning not found for priority figure ${id}`);
      else if (!meaning?.keyword)
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
        readingId: readingIds.has(r.id) ? r.id : undefined,
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

    await executeAndLogTime("connecting components trees entries", () =>
      connectComponentsTreesEntries(
        prisma,
        componentsTreesInput,
        componentsToUses,
        allAozoraCharacterFrequencies,
      ),
    );

    await prisma.kanjisenseComponentUse.deleteMany({});

    await executeAndLogTime(
      "connecting first-class components",
      async () =>
        await connectFirstClassComponents(
          prisma,
          componentsTreesInput,
          new Set(
            await prisma.kanjisenseFigure
              .findMany({
                where: {
                  isPriority: true,
                },
                select: { id: true },
              })
              .then((fs) => fs.map((f) => f.id)),
          ),
          componentsToDirectUsesPrimaryVariants,
          figuresToVariantGroups,
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

export async function getFiguresToVariantGroups(prisma: PrismaClient) {
  const allVariantGroupsWithoutRelations =
    await prisma.kanjisenseVariantGroup.findMany({
      select: { id: true, variants: true },
    });
  const figuresToVariantGroups = new Map<string, string[]>();
  for (const variantGroup of allVariantGroupsWithoutRelations) {
    for (const variant of variantGroup.variants) {
      figuresToVariantGroups.set(variant, variantGroup.variants);
    }
  }
  return figuresToVariantGroups;
}

async function connectFirstClassComponents(
  prisma: PrismaClient,
  componentsTreesInput: Map<string, ComponentUse[]>,
  priorityFiguresIds: Set<string>,
  componentsToDirectUsesPrimaryVariants: Map<string, Set<string>>,
  figuresToVariantGroups: Map<string, string[]>,
) {
  const standaloneCharactersIds = await prisma.kanjisenseFigureRelation
    .findMany({
      select: { id: true },
      where: {
        OR: [
          { id: { in: [...baseKanjiSet] } },
          {
            directUses: {
              hasSome: [...priorityFiguresIds],
            },
          },
        ],
      },
    })
    .then((fs) => fs.map((f) => f.id));
  const standaloneCharactersOldVariants = await prisma.kanjiDbVariant.findMany({
    where: {
      base: { in: standaloneCharactersIds },
      variantType: KanjiDbVariantType.OldStyle,
    },
  });
  const oldToNewVariants = new Map<string, string[]>();
  for (const variant of standaloneCharactersOldVariants) {
    if (!oldToNewVariants.has(variant.base))
      oldToNewVariants.set(variant.base, []);
    oldToNewVariants.get(variant.base)!.push(variant.variant);
  }
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

      if (
        isComponentFirstClass(
          priorityFiguresIds,
          parent,
          component,
          componentsToDirectUsesPrimaryVariants,
          figuresToVariantGroups,
        )
      ) {
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
        return indexesInTree.map((indexInTree, i) =>
          createFirstClassComponentsInput({
            indexInTree,
            appearanceInParent: i + 1,
            component: {
              connect: { id: componentId },
            },
          }),
        );
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
  prisma: PrismaClient,
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
  figuresToVariantGroups: Map<string, string[]>,
  componentsToDirectUsesPrimaryVariants: Map<string, Set<string>>,
) {
  const componentFiguresPotentiallyNeedingMeaningAssignment =
    await prisma.kanjisenseFigureRelation.findMany({
      where: {
        directUses: { isEmpty: false },
        id: { not: { in: allStandaloneCharacters.map((c) => c.id) } },
        isPriorityCandidate: true,
      },
    });
  const priorityCandidatesIds = new Set(
    await prisma.kanjisenseFigureRelation
      .findMany({
        where: { isPriorityCandidate: true },
        select: { id: true },
      })
      .then((fs) => fs.map((f) => f.id)),
  );
  const meaningfulComponents: KanjisenseFigureRelation[] = [];
  const meaninglessComponents: KanjisenseFigureRelation[] = [];
  for (const figure of componentFiguresPotentiallyNeedingMeaningAssignment) {
    const { result: shouldBeAssignedMeaning } =
      await shouldComponentBeAssignedMeaning(
        figuresToVariantGroups,
        componentsToDirectUsesPrimaryVariants,
        priorityCandidatesIds,
        figure.id,
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
async function prepareCharactersAndPriorityComponentsMeaningsMeanings(
  prisma: PrismaClient,
  componentsDictionary: Record<string, ComponentMeaning>,
  allStandaloneCharacters: KanjisenseFigureRelation[],
  meaningfulComponents: KanjisenseFigureRelation[],
) {
  const charactersAndPriorityComponentsMeanings = new Map<
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
        console.error(
          `meaning not found for any variants of priority figure ${
            figure.id
          } having ${getVariantsMessage(variants)}`,
        );
      if (meaning && !meaning.keyword) {
        console.error(
          `keyword not found for priority figure ${
            figure.id
          } having ${getVariantsMessage(variants)}`,
        );
      }
    }
    charactersAndPriorityComponentsMeanings.set(figure.id, meaning);
  }

  return {
    /** not necesarily all characters and priority components */
    charactersAndPriorityComponentsMeanings:
      charactersAndPriorityComponentsMeanings,
  };
}

function getVariantsMessage(variants: string[]) {
  return variants.length ? `variants: [${variants.join(", ")}]` : "no variants";
}

async function getAllComponentsTrees(
  prisma: PrismaClient,
  figuresKeys: Iterable<string>,
  figuresToVariantGroups: Map<string, string[]>,
) {
  const componentsTreesInput = new Map<string, ComponentUse[]>();
  const componentsToUses = new Map<string, Set<string>>();
  const componentsToDirectUsesPrimaryVariants = new Map<string, Set<string>>();
  const charactersToComponents = new Map<string, Set<string>>();
  const getSelectedIdsComponentsCache = new Map<string, string[]>();
  for (const treeRoot of figuresKeys) {
    const componentsTree = await getComponentsTree(treeRoot, async (id) => {
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
    for (const { component, parent: treeMemberParent } of componentsTree) {
      if (treeMemberParent === treeRoot) {
        if (!componentsToDirectUsesPrimaryVariants.has(component))
          componentsToDirectUsesPrimaryVariants.set(component, new Set());
        const parentPrimaryVariant =
          figuresToVariantGroups.get(treeRoot)?.[0] || treeRoot;
        componentsToDirectUsesPrimaryVariants
          .get(component)!
          .add(parentPrimaryVariant);
      }

      if (!componentsToUses.has(component))
        componentsToUses.set(component, new Set());
      componentsToUses.get(component)!.add(treeRoot);
      if (!charactersToComponents.has(treeRoot))
        charactersToComponents.set(treeRoot, new Set());
      charactersToComponents.get(treeRoot)!.add(component);
    }
    componentsTreesInput.set(treeRoot, componentsTree);
  }
  return {
    componentsTreesInput,
    componentsToUses,
    componentsToDirectUsesPrimaryVariants,
  };
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

function createFirstClassComponentsInput<
  T extends
    | Prisma.XOR<
        Prisma.KanjisenseComponentUseCreateWithoutParentInput,
        Prisma.KanjisenseComponentUseUncheckedCreateWithoutParentInput
      >
    | Prisma.KanjisenseComponentUseCreateWithoutParentInput[]
    | Prisma.KanjisenseComponentUseUncheckedCreateWithoutParentInput[],
>(input: T): T {
  return input;
}
