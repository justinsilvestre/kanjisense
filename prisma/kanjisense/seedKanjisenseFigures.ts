import { readFileSync } from "node:fs";

import {
  KanjiDbVariantType,
  KanjisenseFigureRelation,
  PrismaClient,
} from "@prisma/client";
import yaml from "yaml";

import { baseKanji, baseKanjiSet } from "~/lib/baseKanji";
import { files } from "~/lib/files.server";
import { getFigureId, parseFigureId } from "~/models/figure";
import { getFigureByKey } from "~/models/figureRelation.server";

import { ComponentUse } from "../../app/features/dictionary/ComponentUse";
import { runSetupStep } from "../seedUtils";

import { shouldComponentBeAssignedMeaning } from "./componentMeanings";
import { executeAndLogTime } from "./executeAndLogTime";
import { getAllCharactersAndVariantFigures } from "./getAllCharacters";
import {
  ComponentMeaning,
  getFigureMeaningsText,
} from "./getFigureMeaningsText";
import { inBatchesOf } from "./inBatchesOf";
import { isComponentFirstClass } from "./isComponentFirstClass";
import { getListsMembership } from "./seedKanjisenseFigureRelation";

export async function seedKanjisenseFigures(
  prisma: PrismaClient,
  version: number,
  force = false,
) {
  await runSetupStep({
    version,
    force,
    prisma,
    step: "KanjisenseFigure",
    async setup() {
      const readingIds = new Set(
        await prisma.kanjisenseFigureReading
          .findMany({
            where: { version },
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
      } = await getAllCharactersAndVariantFigures(prisma, version);

      const allAozoraCharacterFrequencies = Object.fromEntries(
        (
          await prisma.scriptinAozoraFrequency.findMany({
            where: {
              character: {
                in: allStandaloneCharactersMinusSomeDoublingAsNonPriorityComponents.map(
                  (c) => c.key,
                ),
              },
            },
          })
        ).map((c) => [c.character, c]),
      );

      const figuresToVariantGroups = await getFiguresToVariantGroups(
        prisma,
        version,
      );

      const {
        componentsTreesInput,
        componentsToUses,
        componentsToDirectUsesPrimaryVariants,
      } = await executeAndLogTime("building components trees", async () => {
        return await getAllComponentsTrees(
          prisma,
          version,
          await prisma.kanjisenseFigureRelation
            .findMany({
              where: { version },
              select: { key: true },
            })
            .then((fs) => fs.map((f) => f.key)),
          figuresToVariantGroups,
        );
      });

      const { meaningfulComponents, meaninglessComponents } =
        await executeAndLogTime(
          "Checking for figures needing meaning assignment",
          () =>
            prepareFiguresForMeaningAssignments(
              prisma,
              version,
              allStandaloneCharactersMinusSomeDoublingAsNonPriorityComponents,
              figuresToVariantGroups,
              componentsToDirectUsesPrimaryVariants,
            ),
        );

      const { charactersAndPriorityComponentsMeanings } =
        await executeAndLogTime(
          "preparing characters and priority components meanings",
          () =>
            prepareCharactersAndPriorityComponentsMeanings(
              prisma,
              version,
              componentsDictionary,
              allStandaloneCharactersMinusSomeDoublingAsNonPriorityComponents,
              meaningfulComponents,
            ),
        );

      const oldVariantsToBaseKanji = new Map<string, string>(
        await prisma.kanjiDbVariant
          .findMany({
            where: {
              base: { in: [...baseKanji] },
              variantType: KanjiDbVariantType.OldStyle,
            },
          })
          .then((variants) =>
            variants.map((v) => [v.variant, v.base] as [string, string]),
          ),
      );

      const dbInput = new Map<FigureKey, CreateKanjisenseFigureInput>();

      await executeAndLogTime("preparing priority figures", async () => {
        for (const figure of [
          ...priorityCharactersAndTheirNonComponentVariants,
          ...meaningfulComponents,
        ]) {
          const key = figure.key;
          const meaning = charactersAndPriorityComponentsMeanings.get(
            getFigurePrimaryVariantKey(figure),
          );
          if (!meaning)
            console.error(`meaning not found for priority figure ${key}`);
          else if (!meaning?.keyword)
            console.error(`keyword not found for priority figure ${key}`);

          const createFigureInput = getCreateFigureInput(
            figure,
            meaning?.keyword ?? "[MISSING]",
            meaning?.mnemonicKeyword ?? null,
            true,
            meaning ?? null,
            oldVariantsToBaseKanji.get(key),
          );
          dbInput.set(key, createFigureInput);
        }
      });

      await executeAndLogTime("preparing non-priority figures", async () => {
        const nonPriorityFigures = [
          ...nonPriorityCharacters,
          ...meaninglessComponents,
        ];

        let visitedFigures = 0;
        await runAllWithConcurrencyLimit(
          500,
          nonPriorityFigures,
          async (figure) => {
            const key = figure.key;

            const meaning = await getFigureMeaningsText(
              prisma,
              figure,
              componentsDictionary[getFigurePrimaryVariantKey(figure)] || null,
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
              oldVariantsToBaseKanji.get(key),
            );
            dbInput.set(key, createFigureInput);

            visitedFigures++;
            if (
              visitedFigures % 1000 === 0 ||
              visitedFigures === nonPriorityFigures.length
            ) {
              console.log(
                `|| ${visitedFigures} / ${nonPriorityFigures.length} processed`,
              );
            }
          },
        );
      });

      await executeAndLogTime("cleaning slate before creating figures", () =>
        prisma.kanjisenseFigure.deleteMany({
          where: { version },
        }),
      );

      await executeAndLogTime("seeding figures", async () => {
        await inBatchesOf({
          batchSize: 500,
          collection: dbInput,
          getBatchItem: ([, r]) => ({
            id: r.id,
            key: r.key,
            version: r.version,
            keyword: r.keyword,
            mnemonicKeyword: r.mnemonicKeyword,
            isPriority: r.isPriority,
            listsAsComponent: { set: r.listsAsComponent },
            listsAsCharacter: { set: r.listsAsCharacter },
            aozoraAppearances: 0, // to fill in below
            variantGroupId: r.variantGroupId,
            readingId: readingIds.has(r.id) ? r.id : undefined,
            shinjitaiInBaseKanji: r.shinjitaiInBaseKanji,
          }),
          action: async (batch) => {
            await prisma.kanjisenseFigure.createMany({
              data: batch,
            });
          },
        });
      });

      await executeAndLogTime("seeding meanings", async () => {
        await prisma.kanjisenseFigureMeaning.createMany({
          data: Array.from(dbInput.values(), (r) => ({
            id: r.id,
            key: r.key,
            version: r.version,
            unihanDefinition: r.meaning?.unihanDefinitionText,
            kanjidicEnglish: r.meaning?.kanjidicEnglish,
          })),
        });
      });
      await executeAndLogTime("connecting components trees entries", () =>
        inBatchesOf({
          batchSize: 250,
          collection: componentsTreesInput,
          getBatchItem: ([id, componentsTree]) =>
            [id, componentsTree] as [
              id: string,
              componentsTree: ComponentUse[],
            ],
          action: async (batch) =>
            connectComponentsTreesEntries(
              prisma,
              version,
              batch,
              (key) => componentsToUses.get(key),
              allAozoraCharacterFrequencies,
            ),
        }),
      );

      await prisma.kanjisenseComponentUse.deleteMany({
        where: { parent: { version } },
      });

      const priorityKeys = await prisma.kanjisenseFigure
        .findMany({
          where: {
            version,
            isPriority: true,
          },
          select: { key: true },
        })
        .then((fs) => fs.map((f) => f.key));
      const firstClassComponentsDbInput = await prepareFirstClassComponents(
        prisma,
        version,
        componentsTreesInput,
        new Set(priorityKeys),
        componentsToDirectUsesPrimaryVariants,
        figuresToVariantGroups,
      );

      await executeAndLogTime("connecting first-class components", async () =>
        inBatchesOf({
          batchSize: 250,
          collection: firstClassComponentsDbInput,
          getBatchItem: (componentUse) => componentUse.toJSON(),
          action: async (data) => {
            await prisma.kanjisenseComponentUse.createMany({ data });
          },
        }),
      );
    },
  });
}

interface CreateKanjisenseFigureInput {
  id: string;
  key: string;
  version: number;
  keyword: string;
  mnemonicKeyword: string | null;
  isPriority: boolean;
  listsAsComponent: string[];
  listsAsCharacter: string[];
  variantGroupId: string | null;
  meaning?: Awaited<ReturnType<typeof getFigureMeaningsText>>;
  shinjitaiInBaseKanji: string | null;
}

export async function getFiguresToVariantGroups(
  prisma: PrismaClient,
  version: number,
) {
  const allVariantGroupsWithoutRelations =
    await prisma.kanjisenseVariantGroup.findMany({
      select: { key: true, variants: true },
      where: { version },
    });
  const figuresToVariantGroups = new Map<string, string[]>();
  for (const variantGroup of allVariantGroupsWithoutRelations) {
    for (const variant of variantGroup.variants) {
      figuresToVariantGroups.set(variant, variantGroup.variants);
    }
  }
  return figuresToVariantGroups;
}

class ComponentUseDbInput {
  constructor(
    public version: number,
    public parentKey: string,
    public indexInTree: number,
    public appearanceInParent: number,
    public componentKey: string,
  ) {}
  toJSON() {
    return {
      parentId: getFigureId(this.version, this.parentKey),
      indexInTree: this.indexInTree,
      appearanceInParent: this.appearanceInParent,
      componentId: getFigureId(this.version, this.componentKey),
    };
  }
}

async function prepareFirstClassComponents(
  prisma: PrismaClient,
  version: number,
  componentsTreesInput: Map<FigureKey, ComponentUse[]>,
  priorityFiguresKeys: Set<FigureKey>,
  componentsToDirectUsesPrimaryVariants: Map<FigureKey, Set<FigureKey>>,
  figuresToVariantGroups: Map<FigureKey, FigureKey[]>,
) {
  const componentUsesDbInput: ComponentUseDbInput[] = [];
  const standaloneCharactersKeys = await prisma.kanjisenseFigureRelation
    .findMany({
      select: { key: true },
      where: {
        version,
        OR: [
          { key: { in: [...baseKanjiSet] } },
          {
            directUses: {
              hasSome: [...priorityFiguresKeys],
            },
          },
        ],
      },
    })
    .then((fs) => fs.map((f) => f.key));
  const standaloneCharactersOldVariants = await prisma.kanjiDbVariant.findMany({
    where: {
      base: { in: standaloneCharactersKeys },
      variantType: KanjiDbVariantType.OldStyle,
    },
  });
  const oldToNewVariants = new Map<string, string[]>();
  for (const variant of standaloneCharactersOldVariants) {
    if (!oldToNewVariants.has(variant.base))
      oldToNewVariants.set(variant.base, []);
    oldToNewVariants.get(variant.base)!.push(variant.variant);
  }
  for (const [key, tree] of componentsTreesInput.entries()) {
    const resolved = new Set<string>();
    let chain: string[] = [key];

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
          priorityFiguresKeys,
          parent,
          component,
          componentsToDirectUsesPrimaryVariants,
          figuresToVariantGroups,
          componentsTreesInput,
        )
      ) {
        resolved.add(`${chainString},${component}`);
        const appearancesInParent = acc.get(use.component) || [];
        appearancesInParent.push(indexInTree);
        acc.set(use.component, appearancesInParent);
      }

      return acc;
    }, new Map<string, number[]>());

    for (const [componentKey, indexesInTree] of firstClassComponents) {
      let appearances = 0;
      for (const indexInTree of indexesInTree) {
        componentUsesDbInput.push(
          new ComponentUseDbInput(
            version,
            key,
            indexInTree,
            appearances + 1,
            componentKey,
          ),
        );
        appearances++;
      }
    }
  }
  return componentUsesDbInput;
}

async function connectComponentsTreesEntries(
  prisma: PrismaClient,
  version: number,
  componentsTreesInput: Iterable<[FigureKey, ComponentUse[]]>,
  getComponentUses: (key: FigureKey) => Set<FigureKey> | undefined,
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
  return await Promise.all(
    Array.from(componentsTreesInput, async ([key, componentsTree]) => {
      const figureUsesAsComponent = getComponentUses(key);
      try {
        const combinedAozoraAppearances =
          (allAozoraCharacterFrequencies[key]?.appearances ?? 0) +
          (figureUsesAsComponent
            ? setReduce(
                figureUsesAsComponent,
                (acc, parentKey) =>
                  acc +
                  (allAozoraCharacterFrequencies[parentKey]?.appearances ?? 0),
                0,
              )
            : 0);

        await prisma.kanjisenseFigure.update({
          where: { id: getFigureId(version, key) },
          data: {
            aozoraAppearances: combinedAozoraAppearances,
            componentsTree: componentsTree.map((c) => c.toJSON()),
            asComponent: figureUsesAsComponent?.size
              ? {
                  create: {
                    version,
                    key,
                    allUses: {
                      connect: Array.from(
                        figureUsesAsComponent,
                        (parentKey) => ({
                          id: getFigureId(version, parentKey),
                        }),
                      ),
                    },
                  },
                }
              : undefined,
          },
        });
      } catch (e) {
        console.log({ key, componentsTree, figureUsesAsComponent });
        throw e;
      }
    }),
  );
}

async function prepareFiguresForMeaningAssignments(
  prisma: PrismaClient,
  version: number,
  allStandaloneCharacters: KanjisenseFigureRelation[],
  figuresToVariantGroups: Map<FigureKey, FigureKey[]>,
  componentsToDirectUsesPrimaryVariants: Map<FigureKey, Set<FigureKey>>,
) {
  const componentFiguresPotentiallyNeedingMeaningAssignment =
    await prisma.kanjisenseFigureRelation.findMany({
      where: {
        version,
        directUses: { isEmpty: false },
        id: { not: { in: allStandaloneCharacters.map((c) => c.id) } },
        isPriorityCandidate: true,
      },
    });
  const priorityCandidatesKeys = new Set(
    await prisma.kanjisenseFigureRelation
      .findMany({
        where: {
          version,
          isPriorityCandidate: true,
        },
        select: { key: true },
      })
      .then((fs) => fs.map((f) => f.key)),
  );
  const meaningfulComponents: KanjisenseFigureRelation[] = [];
  const meaninglessComponents: KanjisenseFigureRelation[] = [];
  for (const figure of componentFiguresPotentiallyNeedingMeaningAssignment) {
    const { result: shouldBeAssignedMeaning } =
      await shouldComponentBeAssignedMeaning(
        figuresToVariantGroups,
        componentsToDirectUsesPrimaryVariants,
        priorityCandidatesKeys,
        figure.key,
      );
    if (shouldBeAssignedMeaning) meaningfulComponents.push(figure);
    else meaninglessComponents.push(figure);
  }
  const remainingMeaninglessComponents =
    await prisma.kanjisenseFigureRelation.findMany({
      where: {
        version,
        key: {
          notIn: [
            ...meaningfulComponents.map((c) => c.key),
            ...meaninglessComponents.map((c) => c.key),
            ...allStandaloneCharacters.map((c) => c.key),
          ],
        },
      },
    });
  meaninglessComponents.push(...remainingMeaninglessComponents);

  const allFiguresCount =
    meaningfulComponents.length +
    meaninglessComponents.length +
    allStandaloneCharacters.length;
  if (
    allFiguresCount !==
    (await prisma.kanjisenseFigureRelation.count({
      where: { version },
    }))
  ) {
    const unaccountedForFigures =
      await prisma.kanjisenseFigureRelation.findMany({
        where: {
          version,
          key: {
            notIn: [
              ...meaningfulComponents.map((c) => c.key),
              ...meaninglessComponents.map((c) => c.key),
              ...allStandaloneCharacters.map((c) => c.key),
            ],
          },
        },
      });
    console.log(unaccountedForFigures);
    throw new Error(
      `allFiguresCount (${allFiguresCount}) !== await prisma.kanjisenseFigureRelation.count({where: { version }}) (${await prisma.kanjisenseFigureRelation.count(
        {
          where: { version },
        },
      )})`,
    );
  }
  return { meaningfulComponents, meaninglessComponents };
}
async function prepareCharactersAndPriorityComponentsMeanings(
  prisma: PrismaClient,
  version: number,
  componentsDictionary: Record<string, ComponentMeaning>,
  allStandaloneCharacters: KanjisenseFigureRelation[],
  meaningfulComponents: KanjisenseFigureRelation[],
) {
  const charactersAndPriorityComponentsMeanings = new Map<
    FigureKey,
    Awaited<ReturnType<typeof getFigureMeaningsText>>
  >();
  let visitedFigures = 0;
  const combinedMeaningCandidates = [
    ...allStandaloneCharacters,
    ...meaningfulComponents,
  ];

  await Promise.all(
    Array.from(combinedMeaningCandidates).map(async (figure) => {
      visitedFigures++;
      if (
        visitedFigures % 1000 === 0 ||
        visitedFigures === combinedMeaningCandidates.length
      ) {
        console.log(
          `|| ${visitedFigures} / ${combinedMeaningCandidates.length} processed`,
        );
      }
      const primaryVariantId = figure.variantGroupId || figure.id;

      const primaryVariantKey = parseFigureId(primaryVariantId).key;
      const componentsDictionaryEntry = componentsDictionary[primaryVariantKey];
      let meaning = await getFigureMeaningsText(
        prisma,
        figure,
        componentsDictionaryEntry || null,
      );
      if (!meaning) {
        const variantsKeys =
          (
            await prisma.kanjisenseVariantGroup.findUnique({
              where: { id: primaryVariantId },
              select: { variants: true },
            })
          )?.variants ?? [];
        for (const variantKey of variantsKeys) {
          const variantFigure = await getFigureByKey(
            prisma,
            version,
            variantKey,
          );
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
            } having ${getVariantsMessage(variantsKeys)}`,
          );
        if (meaning && !meaning.keyword) {
          console.error(
            `keyword not found for priority figure ${
              figure.id
            } having ${getVariantsMessage(variantsKeys)}`,
          );
        }
      }
      charactersAndPriorityComponentsMeanings.set(figure.key, meaning);
    }),
  );

  return {
    /** not necesarily all characters and priority components */
    charactersAndPriorityComponentsMeanings:
      charactersAndPriorityComponentsMeanings,
  };
}

function getVariantsMessage(variants: string[]) {
  return variants.length ? `variants: [${variants.join(", ")}]` : "no variants";
}

type FigureKey = string;

async function getAllComponentsTrees(
  prisma: PrismaClient,
  version: number,
  figuresKeys: FigureKey[],
  figuresToVariantGroups: Map<FigureKey, FigureKey[]>,
) {
  const componentsTreesInput = new Map<FigureKey, ComponentUse[]>();
  const componentsToUses = new Map<FigureKey, Set<FigureKey>>();
  const componentsToDirectUsesPrimaryVariants = new Map<
    FigureKey,
    Set<FigureKey>
  >();
  const charactersToComponents = new Map<FigureKey, Set<FigureKey>>();
  const getSelectedKeysComponentsCache = new Map<FigureKey, FigureKey[]>();
  let visitedFigures = 0;

  await runAllWithConcurrencyLimit(500, figuresKeys, async (treeRoot) => {
    const componentsTree = await getComponentsTree(
      treeRoot,
      async (key) => {
        if (getSelectedKeysComponentsCache.has(key))
          return getSelectedKeysComponentsCache.get(key)!;
        try {
          const id = getFigureId(version, key);
          const relation = await prisma.kanjisenseFigureRelation.findUnique({
            where: { id },
            select: { selectedIdsComponents: true },
          });
          if (!relation) throw new Error(`figure ${id} not found`);
          getSelectedKeysComponentsCache.set(
            id,
            relation.selectedIdsComponents,
          );
          return relation.selectedIdsComponents;
        } catch (err) {
          console.error(
            `error getting selectedIdsComponents for figure ${key}`,
          );
          throw err;
        }
      },
      componentsTreesInput,
    );
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

    visitedFigures++;
    if (visitedFigures % 1000 === 0 || visitedFigures === figuresKeys.length) {
      console.log(`|| ${visitedFigures} / ${figuresKeys.length} processed`);
    }
  });

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
  shinjitaiInBaseKanji: string | null = null,
): CreateKanjisenseFigureInput {
  console.log(figure.key, isPriority, keyword);
  return {
    id: getFigureId(figure.version, figure.key),
    version: figure.version,
    key: figure.key,
    keyword: keyword,
    mnemonicKeyword: mnemonicKeyword,
    isPriority,
    listsAsComponent: figure.listsAsComponent, // refine?
    listsAsCharacter: [...getListsMembership(figure.key)],
    variantGroupId: figure.variantGroupId,
    meaning,
    shinjitaiInBaseKanji,
  };
}

export async function getComponentsTree(
  figureKey: string,
  getSelectedIdsComponents: (key: FigureKey) => Promise<string[]>,
  componentsTreeCache = new Map<FigureKey, ComponentUse[]>(),
) {
  if (componentsTreeCache.has(figureKey))
    return componentsTreeCache.get(figureKey)!;

  const componentsTree: ComponentUse[] = [];
  for (const componentKey of await getSelectedIdsComponents(figureKey)) {
    if (componentKey === figureKey) continue; // prevent infinite loop for atomic figures

    componentsTree.push(
      new ComponentUse(figureKey, componentKey),
      ...(await getComponentsTree(
        componentKey,
        getSelectedIdsComponents,
        componentsTreeCache,
      )),
    );
  }

  componentsTreeCache.set(figureKey, componentsTree);

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

async function runAllWithConcurrencyLimit<T, U>(
  maxConcurrentOperations: number,
  collection: T[],
  operation: (a: T) => Promise<U>,
) {
  const results = [];
  let i = 0;

  while (i < collection.length) {
    const batch = collection.slice(i, i + maxConcurrentOperations);
    results.push(...(await Promise.all(batch.map(operation))));
    i += maxConcurrentOperations;
  }
  return results;
}

function getFigurePrimaryVariantKey(figure: KanjisenseFigureRelation) {
  return figure.variantGroupId
    ? parseFigureId(figure.variantGroupId).key
    : figure.key;
}
