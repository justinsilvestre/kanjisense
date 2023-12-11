import { KanjiDbVariantType, PrismaClient } from "@prisma/client";

import {
  baseKanji,
  baseKanjiSet,
  hyogaiKanji,
  jinmeiyoKanji,
  joyoKanji,
  kyoikuKanji,
} from "~/lib/baseKanji";
import { KanjiListCode, listCodes } from "~/lib/dic/KanjiListCode";
import { PatchedIds } from "~/lib/PatchedIds.server";
import { patchIds } from "~/lib/patchKanjiDbIds";
import * as ParseIds from "~/lib/vendor/tomcumming/parseIds";

import { registerSeeded } from "../seedUtils";

import { executeAndLogTime } from "./executeAndLogTime";
import { inBatchesOf } from "./inBatchesOf";

export async function seedKanjisenseFigureRelation(
  prisma: PrismaClient,
  force = false,
) {
  const seeded = await prisma.setup.findUnique({
    where: { step: "KanjisenseFigureRelation" },
  });
  if (seeded && !force)
    console.log(`KanjisenseFigureRelation already seeded. 🌱`);
  else {
    const patchedIds = patchIds(
      new PatchedIds(
        async (key) => {
          const kanjiDbComposition = await prisma.kanjiDbComposition.findUnique(
            { where: { id: key } },
          );
          return kanjiDbComposition?.ids ?? null;
        },
        {
          async figureIsSimplifiedInStandardForm(key) {
            const kanjiDbVariants = await prisma.kanjiDbVariant.count({
              where: {
                base: key,
                variantType: {
                  in: [
                    KanjiDbVariantType.OldStyle,
                    KanjiDbVariantType.VariationSelectorVariant,
                  ],
                },
              },
            });

            return kanjiDbVariants > 0;
          },
          async figureIsNonSimplified(key) {
            const allVariants = await prisma.kanjiDbVariant.count({
              where: {
                base: key,
              },
            });
            if (allVariants === 0) return true;

            const newStyleVariants = await prisma.kanjiDbVariant.count({
              where: {
                base: key,
                variantType: KanjiDbVariantType.NewStyle,
              },
            });
            return newStyleVariants !== 0;
          },
        },
      ),
    );

    const allVariantGroups = (
      await prisma.kanjisenseVariantGroup.findMany({})
    )?.map((g) => g.variants);
    const allKanjidicCharacters = await prisma.kanjidicEntry.findMany({
      select: { id: true },
    });

    const dbInput = new Map<string, CreateFigureRelationInput>();

    await executeAndLogTime(
      `Analyzing ${baseKanji.length} base kanji`,
      async () => {
        await inBatchesOf({
          batchSize: 250,
          collection: [...baseKanji],
          action: async (batch) => {
            analyzeFiguresRelations(
              prisma,
              allVariantGroups,
              batch,
              dbInput,
              patchedIds,
              {
                isPriority: true,
              },
            );
          },
        });
      },
    );

    const priorityVariants = allVariantGroups.flatMap((g) =>
      g.some((v) => baseKanjiSet.has(v))
        ? g.filter((v) => !dbInput.has(v))
        : [],
    );

    await executeAndLogTime(
      `Analyzing ${priorityVariants.length} priority variants`,
      () =>
        analyzeFiguresRelations(
          prisma,
          allVariantGroups,
          priorityVariants,
          dbInput,
          patchedIds,
          {
            isPriority: true,
          },
        ),
    );
    const nonPriorityVariants = allVariantGroups.flatMap((g) =>
      g.filter((v) => !dbInput.has(v)),
    );
    await executeAndLogTime(
      `Analyzing ${nonPriorityVariants.length} non-priority variants`,
      () =>
        analyzeFiguresRelations(
          prisma,
          allVariantGroups,
          nonPriorityVariants,
          dbInput,
          patchedIds,
          {
            isPriority: false,
          },
        ),
    );

    await executeAndLogTime(
      `Analyzing ${allKanjidicCharacters.length} kanjidic characters`,
      async () => {
        await inBatchesOf({
          batchSize: 250,
          collection: allKanjidicCharacters,
          action: async (batch) => {
            await analyzeFiguresRelations(
              prisma,
              allVariantGroups,
              batch.flatMap((c) => c.id).filter((v) => !dbInput.has(v)),
              dbInput,
              patchedIds,
              {
                isPriority: false,
              },
            );
          },
        });
      },
    );

    await prisma.kanjisenseFigureRelation.deleteMany({});
    await inBatchesOf({
      batchSize: 1000,
      collection: dbInput,
      getBatchItem: ([, r]) => ({
        id: r.id,
        idsText: r.idsText,
        selectedIdsComponents: r.selectedIdsComponents,
        directUses: [...r.directUses],
        listsAsComponent: [...r.listsAsComponent],
        isPriorityCandidate: r.isPriorityCandidate,
        variantGroupId: r.variantGroupId,
      }),
      action: async (batch) => {
        await prisma.kanjisenseFigureRelation.createMany({
          data: batch,
        });
      },
    });

    await registerSeeded(prisma, "KanjisenseFigureRelation");
  }

  console.log(`KanjisenseFigureRelation seeded. 🌱`);
}

class CreateFigureRelationInput {
  id: string;
  variantGroupId?: string | null;
  idsText: string;
  selectedIdsComponents: string[];
  directUses: Set<string>;
  listsAsComponent: Set<KanjiListCode>;
  isPriorityCandidate: boolean;

  constructor(
    id: string,
    idsText: string,
    selectedIdsComponents: string[],
    isPriorityCandidate: boolean,
    variantGroupId: string | null,
  ) {
    this.id = id;
    this.idsText = idsText;
    this.selectedIdsComponents = selectedIdsComponents;
    this.directUses = new Set();
    this.listsAsComponent = new Set();
    this.isPriorityCandidate = isPriorityCandidate;
    this.variantGroupId = variantGroupId;
  }
}

async function analyzeFiguresRelations(
  prisma: PrismaClient,
  variantGroups: string[][],
  figureIds: string[],
  cache: Map<string, CreateFigureRelationInput>,
  patchedIds: PatchedIds,
  options: { isPriority: boolean; parentLists?: Set<KanjiListCode> },
  verbose = false,
) {
  for (const figureId of figureIds) {
    const cached = cache.get(figureId);
    const idsText = cached?.idsText ?? (await patchedIds.getIds(figureId));
    const ids = parseIds(figureId, idsText);
    const jLocaleIndex = ids.locales["J"];
    if (verbose && !jLocaleIndex && ids.sequences.length > 1) {
      console.log(`Arbitrarily choosing first sequence for ${figureId}`);
    }
    const selectedIds = ids.sequences[jLocaleIndex ?? 0];
    if (!selectedIds) {
      console.error(
        `Failed to get selectedIds for ${figureId} from ${idsText}`,
      );
      continue;
    }
    const selectedIdsComponents = getComponentsFromIds(selectedIds).filter(
      (c) => c !== figureId,
    );

    const variantGroupId =
      cached?.variantGroupId ??
      variantGroups.find((v) => v.includes(figureId))?.[0] ??
      null;

    const figureRelation =
      cached ||
      new CreateFigureRelationInput(
        figureId,
        idsText,
        selectedIdsComponents,
        options.isPriority,
        variantGroupId,
      );
    if (!cached) cache.set(figureId, figureRelation);
    for (const list of options.parentLists ?? []) {
      figureRelation.listsAsComponent.add(list);
    }

    if (!cached) {
      if (selectedIdsComponents.length > 1) {
        await analyzeFiguresRelations(
          prisma,
          variantGroups,
          selectedIdsComponents,
          cache,
          patchedIds,
          {
            isPriority: options.isPriority,
            parentLists: new Set([
              ...getListsMembership(figureId),
              ...figureRelation.listsAsComponent,
            ]),
          },
        );
      }
      for (const componentKey of selectedIdsComponents) {
        cache.get(componentKey)!.directUses.add(figureId);
      }
    }
  }
}

/** returns figure keys for NON-ATOMIC components,
 * and empty array for atomic components
 */
function getComponentsFromIds(ids: ParseIds.IDS): string[] {
  try {
    return ParseIds.flatten(ids).map((component) => {
      const key = component.type === "html" ? component.code : component.char;
      return key;
    });
  } catch (error) {
    console.error("Failed to get components from IDS", ids);
    throw error;
  }
}

function parseLocaleTaggedIdss(key: string, idsSequences: string[]) {
  const warnings: string[] = [];

  const result = idsSequences.reduce(
    (acc, possiblyTaggedSequenceString, sequenceIndex) => {
      const localeMatch =
        possiblyTaggedSequenceString.match(/(.+)\[([A-Z]+)\]/);
      const locales = localeMatch ? localeMatch[2].split("") : [];
      const untaggedSequenceString = localeMatch
        ? localeMatch[1]
        : possiblyTaggedSequenceString;

      const ids = ParseIds.parse(untaggedSequenceString);

      if (!ids) {
        warnings.push(
          `Could not parse sequence for sequences: ${idsSequences.join("\t")}`,
        );
      } else {
        for (const locale of locales) {
          if (typeof acc.locales[locale] !== "undefined") {
            warnings.push(
              `Duplicate locale data for locale ${locale} in sequences: ${idsSequences.join(
                "\t",
              )}`,
            );
          }
          acc.locales[locale] = sequenceIndex;
        }
        acc.sequences.push(ids);
      }

      return acc;
    },
    {
      key,
      get sequencesText() {
        return idsSequences.join("\t");
      },
      warnings,
      locales: {} as Record<string, number>,
      sequences: [] as ParseIds.IDS[],
    },
  );

  if (!result.sequences.length) {
    throw new Error(
      `Failed to parse IDS from sequences "${idsSequences.join("\t")}"`,
    );
  }

  return result;
}
function parseIds(figure: string, idsText: string) {
  const idsSequences = idsText.split("\t");
  return parseLocaleTaggedIdss(figure, idsSequences);
}

const joyo = new Set(joyoKanji);
const jinmeiyo = new Set(jinmeiyoKanji);
const hyogai = new Set(hyogaiKanji);

const kyoiku1 = new Set(kyoikuKanji[0]);
const kyoiku2 = new Set(kyoikuKanji[1]);
const kyoiku3 = new Set(kyoikuKanji[2]);
const kyoiku4 = new Set(kyoikuKanji[3]);
const kyoiku5 = new Set(kyoikuKanji[4]);
const kyoiku6 = new Set(kyoikuKanji[5]);

export function getListsMembership(figure: string) {
  const lists = new Set<KanjiListCode>();
  if (!baseKanji.includes(figure)) return lists;

  if (joyo.has(figure)) lists.add(listCodes.joyo);
  if (jinmeiyo.has(figure)) lists.add(listCodes.jinmeiyo);
  if (hyogai.has(figure)) lists.add(listCodes.hyogai);
  if (kyoiku1.has(figure)) lists.add(listCodes.kyoiku1);
  if (kyoiku2.has(figure)) lists.add(listCodes.kyoiku2);
  if (kyoiku3.has(figure)) lists.add(listCodes.kyoiku3);
  if (kyoiku4.has(figure)) lists.add(listCodes.kyoiku4);
  if (kyoiku5.has(figure)) lists.add(listCodes.kyoiku5);
  if (kyoiku6.has(figure)) lists.add(listCodes.kyoiku6);

  return lists;
}
