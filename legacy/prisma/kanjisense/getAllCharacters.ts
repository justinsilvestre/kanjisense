import { PrismaClient } from "@prisma/client";

import { baseKanjiSet } from "~/lib/baseKanji";

import { getBaseKanjiVariantGroups } from "./getBaseKanjiVariantGroups";

export async function getAllCharactersAndVariantFigures(
  prisma: PrismaClient,
  version: number,
) {
  const baseKanjiVariantsGroups = await getBaseKanjiVariantGroups(prisma);
  const priorityCharactersAndTheirNonComponentVariants =
    await prisma.kanjisenseFigureRelation.findMany({
      where: {
        version,
        OR: [
          {
            key: { in: [...baseKanjiSet] },
          },
          {
            key: {
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
        version,
        key: {
          in: Object.values(baseKanjiVariantsGroups).flatMap((g) => g.variants),
        },
        directUses: { isEmpty: false },
      },
    });

  const nonPriorityCharacters = await prisma.kanjisenseFigureRelation.findMany({
    where: {
      version,
      directUses: { isEmpty: true },
      key: {
        notIn: priorityCharactersAndTheirNonComponentVariants.map((c) => c.key),
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
