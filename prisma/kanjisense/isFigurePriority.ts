import { KanjisenseFigureRelation, PrismaClient } from "@prisma/client";

import { baseKanjiSet } from "~/lib/baseKanji";

import { shouldComponentBeAssignedMeaning } from "./componentMeanings";
import { isStandalone } from "./isStandalone";

export async function isFigurePriority(
  prisma: PrismaClient,
  baseKanjiVariants: string[][],
  figure: KanjisenseFigureRelation,
) {
  const figureIsStandaloneCharacter = isStandalone(
    baseKanjiVariants,
    figure.id,
    new Set(figure.directUses),
  );
  const figureIsPriorityComponent =
    !figureIsStandaloneCharacter && (await isPriorityComponent(prisma, figure));
  const isPriority =
    figureIsPriorityComponent ||
    (figureIsStandaloneCharacter && baseKanjiSet.has(figure.id));
  return { isPriority, figureIsPriorityComponent };
}

async function isPriorityComponent(
  prisma: PrismaClient,
  figure: KanjisenseFigureRelation,
): Promise<boolean> {
  const { result: hasMeaning } = await shouldComponentBeAssignedMeaning(
    prisma,
    {
      id: figure.id,
      directUses: figure.directUses,
      variantGroupId: figure.variantGroupId,
    },
  );
  return hasMeaning && figure.isPriorityCandidate;
}
