import { KanjisenseFigureRelation, PrismaClient } from "@prisma/client";

import { baseKanjiSet } from "~/lib/baseKanji";

import { getFigureById } from "./getFigureById";

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

/** checks relations to see if the figure is a character
 * or a component needing to be assigned a name in Kanjijump.
 */
export async function shouldBeAssignedMeaning(
  prisma: PrismaClient,
  figureId: string,
  directUses: Set<string>,
) {
  if (forcedMeaninglessFiguresSet.has(figureId)) return false;

  const figure = await prisma.kanjisenseFigureRelation.findUnique({
    where: { id: figureId },
  });
  if (!figure) throw new Error(`figure ${figureId} not found`);

  if (await isPrimaryVariantInBaseKanji(figure)) return true;

  if (!directUses.size) return false;

  const usesInPriorityCandidates =
    await allVariantsUsesInPriorityCandidatesCountingVariantsOncePrimaryVariants(
      prisma,
      figure,
    );
  const isAtomic = false;
  const minimumUsesInPriorityCandidates = isAtomic ? 1 : 2;

  return Boolean(
    usesInPriorityCandidates.size >= minimumUsesInPriorityCandidates,
  );
}

async function isPrimaryVariantInBaseKanji(
  figure: KanjisenseFigureRelation,
): Promise<boolean> {
  return baseKanjiSet.has(figure?.variantGroupId ?? figure.id);
}

async function allVariantsUsesInPriorityCandidatesCountingVariantsOncePrimaryVariants(
  prisma: PrismaClient,
  figure: KanjisenseFigureRelation,
) {
  if (!figure.variantGroupId)
    return new Set(
      (await usesInPriorityCandidates(prisma, figure)).map(
        (u) => u.variantGroupId ?? u.id,
      ),
    );

  const variantGroup = await prisma.kanjisenseVariantGroup.findUnique({
    where: { id: figure.variantGroupId },
  });
  if (!variantGroup)
    throw new Error(`variant group ${figure.variantGroupId} not found`);

  const keys = new Set<string>();
  const uses: KanjisenseFigureRelation[] = [];
  for (const variant of variantGroup.variants) {
    const variantFigure = await getFigureById(prisma, variant);
    const variantFigureUses = await usesInPriorityCandidates(
      prisma,
      variantFigure,
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
  figure: KanjisenseFigureRelation,
) {
  return await prisma.kanjisenseFigureRelation.findMany({
    where: {
      id: {
        in: figure.directUses,
      },
      isPriorityCandidate: true,
    },
  });
}
