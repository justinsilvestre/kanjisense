import type { Prisma, PrismaClient } from "@prisma/client";

import {
  FigureKey,
  parseFigureId,
  FIGURES_VERSION,
  getLatestFigureId,
} from "~/models/figure";

import {
  badgeFigureSelect,
  BadgeProps,
  getBadgeProps,
} from "../dictionary/badgeFigure";

export async function getBadgeFiguresByPriorityGroupedWithVariants<
  Q extends Prisma.KanjisenseFigureWhereInput,
>(prisma: PrismaClient, whereQuery: Q) {
  const matchedFigures = await prisma.kanjisenseFigure.findMany({
    select: {
      ...badgeFigureSelect,
      keyword: true,
      mnemonicKeyword: true,
      image: true,
    },
    orderBy: { aozoraAppearances: "desc" },
    where: whereQuery,
  });

  type QueriedFigure = (typeof matchedFigures)[number];

  const matchedFiguresMap: Record<FigureKey, QueriedFigure> = {};
  const nonMatchedFiguresMap: Record<FigureKey, QueriedFigure> = {};
  const variantGroupHeads = new Set<string>();

  const primaryVariantToRanking: Record<FigureKey, number> = {};

  for (const figure of matchedFigures) {
    matchedFiguresMap[figure.key] = figure;
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
            notIn: [...matchedFigures.map((figure) => figure.key)],
          },
          OR: [
            {
              listsAsCharacter: { isEmpty: false },
            },
            {
              listsAsComponent: { isEmpty: false },
            },
          ],
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
      nonMatchedFiguresMap[figure.key] = figure;
    }
  }

  const groups: {
    key: string;
    appearances: number;
    keyword: string;
    mnemonicKeyword: string | null;
    figures: {
      isMatch: boolean;
      figure: BadgeProps;
    }[];
  }[] = [];
  for (const [key, ranking] of Object.entries(primaryVariantToRanking)) {
    const isGroup = variantGroupHeads.has(getLatestFigureId(key));
    const figures = isGroup
      ? variantFigures
          .find((group) => group.key === key)!
          .variants.flatMap(
            (v) => matchedFiguresMap[v] || nonMatchedFiguresMap[v] || [],
          )
      : [matchedFiguresMap[key] || nonMatchedFiguresMap[key]];

    const groupHead = figures[0];
    if (!groupHead) console.error("No group head for", key);

    groups.push({
      key,
      appearances: ranking,
      keyword: groupHead.keyword,
      mnemonicKeyword: groupHead.mnemonicKeyword,
      figures: figures.map((figure) => ({
        isMatch: Boolean(matchedFiguresMap[figure.key]),
        figure: getBadgeProps(figure),
      })),
    });
  }

  return {
    matchedFiguresAndVariants: groups.sort(
      (a, b) => b.appearances - a.appearances,
    ),
    matchedFiguresCount: matchedFigures.length,
  };
}
