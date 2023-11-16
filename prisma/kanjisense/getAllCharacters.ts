import { PrismaClient } from "@prisma/client";

import { baseKanjiSet } from "~/lib/baseKanji";

import { getBaseKanjiVariantGroups } from "./getBaseKanjiVariantGroups";

export async function getAllCharactersAndVariantFigures(prisma: PrismaClient) {
  const baseKanjiVariantsGroups = await getBaseKanjiVariantGroups(prisma);
  const priorityCharactersAndTheirNonComponentVariants =
    await prisma.kanjisenseFigureRelation.findMany({
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
  const priorityCharactersComponentVariants =
    await prisma.kanjisenseFigureRelation.findMany({
      where: {
        id: {
          in: Object.values(baseKanjiVariantsGroups).flatMap((g) => g.variants),
        },
        directUses: { isEmpty: false },
      },
    });

  const nonPriorityCharacters = await prisma.kanjisenseFigureRelation.findMany({
    where: {
      directUses: { isEmpty: true },
      id: {
        notIn: priorityCharactersAndTheirNonComponentVariants.map((c) => c.id),
      },
    },
  });
  const allStandaloneCharactersMinusSomeDoublingAsNonPriorityComponents =
    priorityCharactersAndTheirNonComponentVariants.concat(
      ...nonPriorityCharacters,
    );
  return {
    allStandaloneCharactersMinusSomeDoublingAsNonPriorityComponents,
    priorityCharactersAndTheirNonComponentVariants,
    nonPriorityCharacters: nonPriorityCharacters,
    priorityCharactersComponentVariants,
  };
}
