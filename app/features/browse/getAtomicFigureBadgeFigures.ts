import { PrismaClient } from "@prisma/client";

import {
  BadgeProps,
  badgeFigureSelect,
  getBadgeProps,
} from "~/features/dictionary/badgeFigure";
import {
  FIGURES_VERSION,
  FigureKey,
  getLatestFigureId,
  parseFigureId,
} from "~/models/figure";

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
      ],
    },
  });

  type QueriedFigure = (typeof priorityAtomicComponents)[number];

  const atomicFiguresMap: Record<FigureKey, QueriedFigure> = {};
  const nonAtomicVariantsMap: Record<FigureKey, QueriedFigure> = {};
  const variantGroupHeads = new Set<string>();

  const primaryVariantToRanking: Record<FigureKey, number> = {};

  for (const figure of priorityAtomicComponents) {
    atomicFiguresMap[figure.key] = figure;
    if (figure.variantGroupId) variantGroupHeads.add(figure.variantGroupId);
    else primaryVariantToRanking[figure.key] = figure.aozoraAppearances ?? 0;
  }
  const variantGroupsRankings = await prisma.kanjisenseFigure.groupBy({
    by: ["variantGroupId"],
    where: {
      variantGroupId: { in: [...variantGroupHeads] },
    },
    _sum: { aozoraAppearances: true },
  });
  for (const group of variantGroupsRankings) {
    const variantGroupKey = parseFigureId(group.variantGroupId!).key;
    const appearances = group._sum?.aozoraAppearances ?? 0;
    primaryVariantToRanking[variantGroupKey] = appearances ?? 0;
  }

  const variantFigures = await prisma.kanjisenseVariantGroup.findMany({
    where: { id: { in: [...variantGroupHeads] } },
    include: {
      figures: {
        where: {
          version: FIGURES_VERSION,
          key: {
            notIn: [...priorityAtomicComponents.map((figure) => figure.key)],
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
      nonAtomicVariantsMap[figure.key] = figure;
    }
  }

  const groups: {
    key: string;
    appearances: number;
    keyword: string;
    mnemonicKeyword: string | null;
    figures: {
      isAtomic: boolean;
      figure: BadgeProps;
    }[];
  }[] = [];
  for (const [key, ranking] of Object.entries(primaryVariantToRanking)) {
    const isGroup = variantGroupHeads.has(getLatestFigureId(key));
    const figures = isGroup
      ? variantFigures
          .find((group) => group.key === key)!
          .variants.flatMap(
            (v) => atomicFiguresMap[v] || nonAtomicVariantsMap[v] || [],
          )
      : [atomicFiguresMap[key] || nonAtomicVariantsMap[key]];

    const groupHead = figures[0];
    if (!groupHead) console.error("No group head for", key);

    groups.push({
      key,
      appearances: ranking,
      keyword: groupHead.keyword,
      mnemonicKeyword: groupHead.mnemonicKeyword,
      figures: figures.map((figure) => ({
        isAtomic: Boolean(atomicFiguresMap[figure.key]),
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
