import { readFileSync } from "node:fs";

import { KanjisenseFigureRelation, PrismaClient } from "@prisma/client";
import yaml from "yaml";

import { baseKanjiSet } from "~/lib/baseKanji";
import { files } from "~/lib/files.server";
import { getFigureById } from "~/models/getFigureById.server";

import { registerSeeded } from "../seedUtils";

import { shouldComponentBeAssignedMeaning } from "./componentMeanings";
import { getBaseKanjiVariantGroups } from "./getBaseKanjiVariantGroups";
import {
  ComponentMeaning,
  getFigureMeaningsText,
} from "./getFigureMeaningsText";
// import { getStandaloneCharacters } from "./getStandaloneCharacters";
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
    // initialize figures with ID (and maybe keyword?)
    // simultaneously seed meanings

    const baseKanjiVariantsGroups = await getBaseKanjiVariantGroups(prisma);

    const priorityCharacters = await prisma.kanjisenseFigureRelation.findMany({
      where: {
        OR: [
          {
            id: { in: [...baseKanjiSet] },
          },
          {
            id: {
              in: Object.values(baseKanjiVariantsGroups).flatMap(
                (g) => g.variants,
              ),
            },
            directUses: { isEmpty: true },
          },
        ],
      },
    });
    const nonPriorityCharacters =
      await prisma.kanjisenseFigureRelation.findMany({
        where: {
          OR: [
            {
              id: { notIn: priorityCharacters.map((c) => c.id) },
              directUses: { isEmpty: true },
            },
            {
              id: {
                in: Object.values(baseKanjiVariantsGroups).flatMap((g) =>
                  g.variants.filter(
                    (v) => !priorityCharacters.some((c) => c.id === v),
                  ),
                ),
              },
            },
          ],
        },
      });
    const allStandaloneCharacters = priorityCharacters.concat(
      ...nonPriorityCharacters,
    );
    const componentFiguresPotentiallyNeedingMeaningAssignment =
      await prisma.kanjisenseFigureRelation.findMany({
        where: {
          directUses: { isEmpty: false },
          id: { not: { in: allStandaloneCharacters.map((c) => c.id) } },
          // variantGroupId: { not: null },
        },
      });

    console.log("Checking for figures needing meaning assignment...");
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
    remainingMeaninglessComponents.push(...meaninglessComponents);

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

    const priorityFiguresMeanings = new Map<
      string,
      Awaited<ReturnType<typeof getFigureMeaningsText>>
    >();

    console.log("preparing meanings for priority figures");
    for (const figure of [
      ...allStandaloneCharacters,
      ...meaningfulComponents,
    ]) {
      const primaryVariantId = figure.variantGroupId || figure.id;

      let meaning = await getFigureMeaningsText(
        prisma,
        figure,
        componentsDictionary[primaryVariantId] || null,
      );
      if (!meaning) {
        const variants =
          (
            await prisma.kanjisenseVariantGroup.findUnique({
              where: { id: primaryVariantId },
              select: { variants: true },
            })
          )?.variants ?? [];
        const componentMeaning = componentsDictionary[primaryVariantId];
        for (const variant of variants) {
          const variantFigure = await getFigureById(prisma, variant);
          meaning = await getFigureMeaningsText(
            prisma,
            variantFigure,
            componentMeaning || null,
          );
          if (meaning) {
            console.warn(
              `meaning not found for priority figure variant ${variantFigure.id}, using variant ${variant}, ${meaning.kanjidicEnglish} // ${meaning.unihanDefinitionText}`,
            );
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

    const allAozoraCharacterFrequencies = Object.fromEntries(
      (
        await prisma.scriptinAozoraFrequency.findMany({
          where: {
            character: { in: allStandaloneCharacters.map((c) => c.id) },
          },
        })
      ).map((c) => [c.character, c]),
    );

    const dbInput = new Map<string, CreateKanjisenseFigureInput>();

    console.log("preparing priority figures...");
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
        allAozoraCharacterFrequencies[id]?.appearances,
        true,
      );
      dbInput.set(id, createFigureInput);
    }

    console.log("preparing non-priority figures...");
    for (const figure of [...nonPriorityCharacters, ...meaninglessComponents]) {
      const id = figure.id;

      const appearances = 0;
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
        appearances,
        false,
      );
      dbInput.set(id, createFigureInput);
    }

    console.log("creating entries...");

    await prisma.kanjisenseComponent.deleteMany({});
    await prisma.kanjisenseFigure.deleteMany({});

    console.log("seeding figures");
    await prisma.kanjisenseFigure.createMany({
      data: [...dbInput.values()].map((r) => ({
        id: r.id,
        keyword: r.keyword,
        mnemonicKeyword: r.mnemonicKeyword,
        isPriority: r.isPriority,
        listsAsComponent: { set: r.listsAsComponent },
        listsAsCharacter: { set: r.listsAsCharacter },
        aozoraAppearances: r.aozoraAppearances,
        variantGroupId: r.variantGroupId,
      })),
    });

    console.log("seeding meanings");

    await prisma.kanjisenseFigureMeaning.createMany({
      data: [...dbInput.values()].map((r) => ({
        id: r.id,
        unihanDefinition: r.meaning?.unihanDefinitionText,
        kanjidicEnglish: r.meaning?.kanjidicEnglish,
      })),
    });

    console.log("building components trees");
    const { componentsTreesInput, componentsToUses } =
      await getAllComponentsTrees(dbInput.keys(), prisma);

    console.log("connecting components trees entries");
    for (const [id, componentsTree] of componentsTreesInput.entries()) {
      const figureUsesAsComponent = componentsToUses.get(id);
      try {
        await prisma.kanjisenseFigure.update({
          where: { id },
          data: {
            componentsTree: componentsTree.map((c) => c.toJSON()),
            asComponent: figureUsesAsComponent?.size
              ? {
                  create: {
                    uses: {
                      connect: Array.from(
                        figureUsesAsComponent,
                        (parentId) => ({
                          id: parentId,
                        }),
                      ),
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

    console.log("connecting top-level components");

    console.log("registering active sound marks");

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
  aozoraAppearances: number;
  variantGroupId: string | null;
  meaning?: Awaited<ReturnType<typeof getFigureMeaningsText>>;
}

class ComponentUse {
  constructor(
    public parent: string,
    public component: string,
  ) {
    this.parent = parent;
    this.component = component;
  }

  toJSON() {
    return [this.parent, this.component];
  }
}

function getVariantsMessage(variants: string[]) {
  return variants.length ? `variants: [${variants.join(", ")}]` : "no variants";
}

async function getAllComponentsTrees(
  dbInput: IterableIterator<string>,
  prisma: PrismaClient,
) {
  const componentsTreesInput = new Map<string, ComponentUse[]>();
  const componentsToUses = new Map<string, Set<string>>();
  const charactersToComponents = new Map<string, Set<string>>();
  const getSelectedIdsComponentsCache = new Map<string, string[]>();
  for (const parent of dbInput) {
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
  aozoraAppearances: number,
  isPriority: boolean,
) {
  const figureId = figure.id;

  return {
    id: figureId,
    keyword: keyword,
    mnemonicKeyword: mnemonicKeyword,
    isPriority,
    listsAsComponent: figure.listsAsComponent, // refine?
    listsAsCharacter: [...getListsMembership(figureId)],
    aozoraAppearances: aozoraAppearances ?? 0,
    variantGroupId: figure.variantGroupId,
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
