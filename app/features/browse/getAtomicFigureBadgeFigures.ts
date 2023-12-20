import { PrismaClient } from "@prisma/client";

import {
  BadgeProps,
  badgeFigureSelect,
  getBadgeProps,
} from "~/features/dictionary/badgeFigure";

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
  const priorityAtomicComponents = await prisma.kanjisenseFigure.findMany({
    select: {
      ...badgeFigureSelect,
      keyword: true,
      mnemonicKeyword: true,
      image: true,
    },
    orderBy: { aozoraAppearances: "desc" },
    where: {
      OR: [
        {
          ...isPriorityComponentWhere,
          componentsTree: { equals: [] },
        },
        {
          listsAsCharacter: { isEmpty: false },
          componentsTree: { equals: [] },
        },
      ],
    },
  });

  type QueriedFigure = (typeof priorityAtomicComponents)[number];

  const atomicFiguresMap: Record<string, QueriedFigure> = {};
  const nonAtomicVariantsMap: Record<string, QueriedFigure> = {};
  const variantGroupHeads = new Set<string>();

  const primaryVariantToRanking: Record<string, number> = {};

  for (const figure of priorityAtomicComponents) {
    atomicFiguresMap[figure.id] = figure;
    if (figure.variantGroupId) variantGroupHeads.add(figure.variantGroupId);
    else primaryVariantToRanking[figure.id] = figure.aozoraAppearances ?? 0;
  }
  const variantGroupsRankings = await prisma.kanjisenseFigure.groupBy({
    by: ["variantGroupId"],
    where: {
      variantGroupId: { in: [...variantGroupHeads] },
    },
    _sum: { aozoraAppearances: true },
  });
  for (const group of variantGroupsRankings) {
    const variantGroup = group.variantGroupId!;
    const appearances = group._sum.aozoraAppearances;
    primaryVariantToRanking[variantGroup] = appearances ?? 0;
  }

  const variantFigures = await prisma.kanjisenseVariantGroup.findMany({
    where: { id: { in: [...variantGroupHeads] } },
    include: {
      figures: {
        where: {
          id: {
            notIn: [...priorityAtomicComponents.map((figure) => figure.id)],
          },
          listsAsComponent: { isEmpty: false },
        },
        select: {
          ...badgeFigureSelect,
          keyword: true,
          mnemonicKeyword: true,
          image: true,
        },
      },
    },
  });
  for (const group of variantFigures) {
    for (const figure of group.figures) {
      nonAtomicVariantsMap[figure.id] = figure;
    }
  }

  const groups: {
    id: string;
    appearances: number;
    keyword: string;
    mnemonicKeyword: string | null;
    figures: {
      isAtomic: boolean;
      figure: BadgeProps;
    }[];
  }[] = [];
  for (const [id, ranking] of Object.entries(primaryVariantToRanking)) {
    const isGroup = variantGroupHeads.has(id);
    const figures = isGroup
      ? variantFigures
          .find((group) => group.id === id)!
          .variants.flatMap(
            (v) => atomicFiguresMap[v] || nonAtomicVariantsMap[v] || [],
          )
      : [atomicFiguresMap[id] || nonAtomicVariantsMap[id]];

    groups.push({
      id,
      appearances: ranking,
      keyword: figures[0].keyword,
      mnemonicKeyword: figures[0].mnemonicKeyword,
      figures: figures.map((figure) => ({
        isAtomic: Boolean(atomicFiguresMap[figure.id]),
        figure: getBadgeProps(figure),
      })),
    });
  }

  return {
    atomicComponentsAndVariants: groups.sort(
      (a, b) => b.appearances - a.appearances,
    ),
    totalAtomicComponents: priorityAtomicComponents.length,
  };
}
