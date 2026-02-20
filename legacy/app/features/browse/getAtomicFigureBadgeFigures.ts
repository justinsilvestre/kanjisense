import type { PrismaClient } from "@prisma/client";

import { FIGURES_VERSION } from "~/models/figure";

import { getBadgeFiguresByPriorityGroupedWithVariants } from "./getBadgeFiguresByPriorityGroupedWithVariants";

const isPriorityComponentWhere = {
  isPriority: true,
  listsAsComponent: { isEmpty: false },
  asComponent: {
    allUses: {
      some: {
        isPriority: true,
      },
    },
  },
};

export async function getAtomicFigureBadgeFigures(prisma: PrismaClient) {
  return await getBadgeFiguresByPriorityGroupedWithVariants(prisma, {
    version: FIGURES_VERSION,
    OR: [
      {
        ...isPriorityComponentWhere,
        componentsTree: { equals: [] },
      },
      {
        listsAsCharacter: { isEmpty: false },
        componentsTree: { equals: [] },
      },
      // {
      //   isStandaloneCharacter: true,
      //   componentsTree: { equals: [] },
      // },
    ],
  });
}
