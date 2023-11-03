import { KanjisenseFigureRelation, PrismaClient } from "@prisma/client";

import { baseKanjiSet } from "~/lib/baseKanji";

import { shouldBeAssignedMeaning } from "./componentMeanings";
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
  const hasMeaning = await shouldBeAssignedMeaning(
    prisma,
    figure.id,
    new Set(figure.directUses),
  );
  return hasMeaning && figure.isPriorityCandidate;
}
