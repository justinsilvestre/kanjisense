import { PrismaClient } from "@prisma/client";

import { getSeedInterface } from "prisma/SeedInterface";
import { baseKanji, baseKanjiSet } from "~/lib/baseKanji";
import { KanjiListCode } from "~/lib/dic/KanjiListCode";
import { PatchedIds } from "~/lib/PatchedIds.server";
import { patchIds } from "~/lib/patchKanjiDbIds";
import * as ParseIds from "~/lib/vendor/tomcumming/parseIds";
import { FigureKey, getFigureId } from "~/models/figure";

import { runSetupStep } from "../seedUtils";

import { executeAndLogTime } from "./executeAndLogTime";
import { inBatchesOf } from "./inBatchesOf";
import { getListsMembership } from "./getListsMembership";

export async function seedKanjisenseFigureRelation(
  prisma: PrismaClient,
  version: number,
  force = false,
) {
  await runSetupStep({
    version,
    force,
    seedInterface: getSeedInterface(prisma),
    step: "KanjisenseFigureRelation",
    async setup(seedInterface, log) {
      const patchedIds = patchIds(
        new PatchedIds(async (key) => {
          const kanjiDbComposition = await prisma.kanjiDbComposition.findUnique(
            {
              where: { id: key },
            },
          );
          return kanjiDbComposition?.ids ?? null;
        }),
      );

      const allVariantGroups = (
        await prisma.kanjisenseVariantGroup.findMany({ where: { version } })
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
                version,
                allVariantGroups,
                batch,
                dbInput,
                patchedIds,
                {
                  isPriority: true,
                },
                log,
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
            version,
            allVariantGroups,
            priorityVariants,
            dbInput,
            patchedIds,
            {
              isPriority: true,
            },
            log,
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
            version,
            allVariantGroups,
            nonPriorityVariants,
            dbInput,
            patchedIds,
            {
              isPriority: false,
            },
            log,
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
                version,
                allVariantGroups,
                batch.flatMap((c) => c.id).filter((v) => !dbInput.has(v)),
                dbInput,
                patchedIds,
                {
                  isPriority: false,
                },
                log,
              );
            },
          });
        },
      );

      await prisma.kanjisenseFigureRelation.deleteMany({
        where: { version },
      });
      await inBatchesOf({
        batchSize: 1000,
        collection: dbInput,
        getBatchItem: ([, r]) => ({
          id: r.id,
          key: r.key,
          version: r.version,
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
    },
  });
}

class CreateFigureRelationInput {
  id: string;
  key: string;
  version: number;
  variantGroupId?: string | null;
  idsText: string;
  selectedIdsComponents: string[];
  directUses: Set<string>;
  listsAsComponent: Set<KanjiListCode>;
  isPriorityCandidate: boolean;

  constructor(
    key: string,
    version: number,
    idsText: string,
    selectedIdsComponents: string[],
    isPriorityCandidate: boolean,
    variantGroupId: string | null,
  ) {
    this.id = getFigureId(version, key);
    this.key = key;
    this.version = version;
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
  version: number,
  variantGroups: FigureKey[][],
  figureKeys: string[],
  cache: Map<FigureKey, CreateFigureRelationInput>,
  patchedIds: PatchedIds,
  options: { isPriority: boolean; parentLists?: Set<KanjiListCode> },
  log: (text: string) => void,
  verbose = false,
) {
  for (const figureKey of figureKeys) {
    const cached = cache.get(figureKey);
    const idsText = cached?.idsText ?? (await patchedIds.getIds(figureKey));
    const ids = parseIds(figureKey, idsText);
    const jLocaleIndex = ids.locales["J"];

    if (verbose && !jLocaleIndex && ids.sequences.length > 1) {
      log(`Arbitrarily choosing first sequence for ${figureKey}`);
    }
    const selectedIds = ids.sequences[jLocaleIndex ?? 0];
    if (!selectedIds) {
      console.error(
        `Failed to get selectedIds for ${figureKey} from ${idsText}`,
      );
      continue;
    }
    const selectedIdsComponents = getComponentsFromIds(selectedIds).filter(
      (c) => c !== figureKey,
    );

    const variantGroupKey =
      cached?.variantGroupId ??
      variantGroups.find((v) => v.includes(figureKey))?.[0] ??
      null;

    const figureRelation =
      cached ||
      new CreateFigureRelationInput(
        figureKey,
        version,
        idsText,
        selectedIdsComponents,
        options.isPriority,
        variantGroupKey ? getFigureId(version, variantGroupKey) : null,
      );
    if (!cached) cache.set(figureKey, figureRelation);
    for (const list of options.parentLists ?? []) {
      figureRelation.listsAsComponent.add(list);
    }

    if (!cached) {
      if (selectedIdsComponents.length > 1) {
        await analyzeFiguresRelations(
          prisma,
          version,
          variantGroups,
          selectedIdsComponents,
          cache,
          patchedIds,
          {
            isPriority: options.isPriority,
            parentLists: new Set([
              ...getListsMembership(figureKey),
              ...figureRelation.listsAsComponent,
            ]),
          },
          log,
        );
      }
      for (const componentKey of selectedIdsComponents) {
        cache.get(componentKey)!.directUses.add(figureKey);
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
