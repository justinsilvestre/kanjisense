import { PrismaClient } from "@prisma/client";

import { baseKanjiSet } from "~/lib/baseKanji";

import { getBaseKanjiVariantGroups } from "./getBaseKanjiVariantGroups";

export async function getAllCharacters(prisma: PrismaClient) {
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
  const nonPriorityCharacters = await prisma.kanjisenseFigureRelation.findMany({
    where: {
      directUses: { isEmpty: true },
      id: { notIn: priorityCharacters.map((c) => c.id) },
    },
  });
  const allStandaloneCharacters = priorityCharacters.concat(
    ...nonPriorityCharacters,
  );
  return { allStandaloneCharacters, priorityCharacters, nonPriorityCharacters };
}
