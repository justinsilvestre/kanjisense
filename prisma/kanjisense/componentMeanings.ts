import { KanjisenseFigureRelation, PrismaClient } from "@prisma/client";

import { baseKanjiSet } from "~/lib/baseKanji";

import { getFigureById } from "../../app/models/figureRelation.server";

export const forcedMeaninglessFiguresSet = new Set<string>([
  "亏",
  "吅",
  "帀",
  "𠓜",
  "𠔼",
  "CDP-8D52",
  "CDP-8CE6",
  "CDP-89A6",
  "𠫔",
]);

const MINIMUM_USES_IN_PRIORITY_CANDIDATES = 2;

/**
 * checks relations to see if the given component figure
 * should be assigned a name in kanjisense
 */
export async function shouldComponentBeAssignedMeaning(
  prisma: PrismaClient,
  {
    id: figureId,
    directUses,
    variantGroupId,
  }: {
    id: string;
    directUses: string[];
    variantGroupId: string | null;
  },
) {
  if (forcedMeaninglessFiguresSet.has(figureId))
    return {
      result: false,
      reason: "forced",
    };

  const primaryVariantIsInBaseKanji = baseKanjiSet.has(
    variantGroupId ?? figureId,
  );
  if (primaryVariantIsInBaseKanji)
    return {
      result: true,
      reason: "base kanji or variant thereof",
    };

  if (!directUses.length)
    return {
      result: false,
      reason: "no direct uses in composition data",
    };

  if (directUses.length === 1)
    return {
      result: false,
      reason: `only used in ${directUses[0]}`,
    };

  const usesInPriorityCandidates =
    await allVariantsUsesInPriorityCandidatesCountingVariantsOncePrimaryVariants(
      prisma,
      variantGroupId,
      directUses,
    );

  const enoughUses = Boolean(
    usesInPriorityCandidates.size >= MINIMUM_USES_IN_PRIORITY_CANDIDATES,
  );
  return {
    result: enoughUses,
    reason: enoughUses
      ? `used in ${[...usesInPriorityCandidates].join(" ")}`
      : usesInPriorityCandidates.size
      ? `only used in ${[...usesInPriorityCandidates].join(" ")}`
      : "not used in priority candidates",
  };
}

async function allVariantsUsesInPriorityCandidatesCountingVariantsOncePrimaryVariants(
  prisma: PrismaClient,
  variantGroupId: string | null,
  directUses: string[],
) {
  if (!variantGroupId)
    return new Set(
      (await usesInPriorityCandidates(prisma, directUses)).map(
        (u) => u.variantGroupId ?? u.id,
      ),
    );

  const variantGroup = await prisma.kanjisenseVariantGroup.findUnique({
    where: { id: variantGroupId },
  });
  if (!variantGroup)
    throw new Error(`variant group ${variantGroupId} not found`);

  const keys = new Set<string>();
  const uses: KanjisenseFigureRelation[] = [];
  for (const variant of variantGroup.variants) {
    const variantFigure = await getFigureById(prisma, variant);
    const variantFigureUses = await usesInPriorityCandidates(
      prisma,
      variantFigure.directUses,
    );
    for (const vfu of variantFigureUses) {
      if (!keys.has(vfu.id)) {
        keys.add(vfu.id);
        uses.push(vfu);
      }
    }
  }
  return new Set(uses.map((u) => u.variantGroupId ?? u.id));
}

async function usesInPriorityCandidates(
  prisma: PrismaClient,
  directUses: string[],
) {
  return await prisma.kanjisenseFigureRelation.findMany({
    where: {
      id: {
        in: directUses,
      },
      isPriorityCandidate: true,
    },
  });
}
