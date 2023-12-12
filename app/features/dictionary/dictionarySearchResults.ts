import type { Prisma } from "@prisma/client";
import { FigureSearchPropertyType } from "@prisma/client";

import { prisma } from "~/db.server";

import { badgeFigureSelect } from "./badgeFigure";

export type FigureSearchResults = Awaited<
  ReturnType<typeof getDictionarySearchResults>
>;

export type FigureSearchResult = FigureSearchResults["figures"][number];
export type FigureSearchResultWithImage =
  FigureSearchResults["figures"][number] & {
    image?: FigureSearchResults["images"][number] | null;
  };

// first try exact match
// then try fuzzier match
// (english contains, kana starts with, any character key exact match)

const RESULTS_BATCH_SIZE = 20;

const WANTED_SEARCH_PROPERTY_TYPES = [
  FigureSearchPropertyType.ONYOMI_KANA,
  FigureSearchPropertyType.ONYOMI_LATIN,
  FigureSearchPropertyType.KUNYOMI_KANA,
  FigureSearchPropertyType.KUNYOMI_LATIN,
  FigureSearchPropertyType.KUNYOMI_KANA_WITH_OKURIGANA,
  FigureSearchPropertyType.KUNYOMI_LATIN_WITH_OKURIGANA,
  FigureSearchPropertyType.TRANSLATION_ENGLISH,
  FigureSearchPropertyType.MNEMONIC_ENGLISH,
];

export async function getDictionarySearchResults(searchQueries: string[]) {
  const figures = await getDictionarySearchResultsFigures(searchQueries);
  const images = await prisma.kanjisenseFigureImage.findMany({
    where: {
      id: {
        in: figures.flatMap((f) => (!f.isStandaloneCharacter ? f.id : [])),
      },
    },
  });
  return { figures, images };
}

async function collectSearchResults<T extends { id: string }>(
  batchSize: number,
  steps: {
    findMany: (returnedIds: string[], take: number) => Promise<T[]>;
  }[],
) {
  const results: T[] = [];
  const returnedIds: string[] = [];
  for (const step of steps) {
    const stepResults = await step.findMany(
      returnedIds,
      batchSize - results.length,
    );

    results.push(...stepResults);
    if (results.length >= batchSize) return results;

    for (const figure of stepResults) {
      returnedIds.push(figure.id);
    }
  }
  return results;
}

export async function getDictionarySearchResultsFigures(
  searchQueries: string[],
) {
  const selectFigures = {
    ...badgeFigureSelect,
    id: true,
    keyword: true,
    searchProperties: {
      orderBy: {
        index: "asc" as const,
      },
      select: {
        searchProperty: {
          select: {
            text: true,
            type: true,
            display: true,
          },
        },
      },
      where: {
        searchProperty: {
          type: {
            in: WANTED_SEARCH_PROPERTY_TYPES,
          },
        },
      },
    },
  };
  const figures = await collectSearchResults(RESULTS_BATCH_SIZE, [
    {
      findMany: () =>
        prisma.kanjisenseFigure.findMany({
          where: {
            searchProperties: {
              some: formSearchPropertiesWhereQuery1(searchQueries),
            },
          },
          select: selectFigures,
          orderBy: {
            aozoraAppearances: "desc",
          },
          take: RESULTS_BATCH_SIZE,
        }),
    },
    {
      findMany: (returnedFigureIds, take) =>
        prisma.kanjisenseFigure.findMany({
          where: {
            searchProperties: {
              some: formSearchPropertiesWhereQuery2(searchQueries),
            },
            id: {
              notIn: returnedFigureIds,
            },
          },
          select: selectFigures,
          orderBy: {
            aozoraAppearances: "desc",
          },
          take,
        }),
    },
    {
      findMany: (returnedFigureIds, take) =>
        prisma.kanjisenseFigure.findMany({
          where: {
            searchProperties: {
              some: formSearchPropertiesWhereQuery3(searchQueries),
            },
            id: {
              notIn: returnedFigureIds,
            },
          },
          select: selectFigures,
          orderBy: {
            aozoraAppearances: "desc",
          },
          take,
        }),
    },
    {
      findMany: (returnedFigureIds, take) =>
        prisma.kanjisenseFigure.findMany({
          where: {
            searchProperties: {
              some: formSearchPropertiesWhereQuery2(searchQueries, false),
            },
            id: {
              notIn: returnedFigureIds,
            },
          },
          select: selectFigures,
          orderBy: {
            aozoraAppearances: "desc",
          },
          take,
        }),
    },
    {
      findMany: (returnedFigureIds, take) =>
        prisma.kanjisenseFigure.findMany({
          where: {
            searchProperties: {
              some: formSearchPropertiesWhereQuery3(searchQueries, false),
            },
            id: {
              notIn: returnedFigureIds,
            },
          },
          select: selectFigures,
          orderBy: {
            aozoraAppearances: "desc",
          },
          take,
        }),
    },
  ]);
  return figures || [];
}

function formSearchPropertiesWhereQuery1(
  searchQueries: string[],
): Prisma.SearchPropertiesOnFigureWhereInput {
  return {
    OR: [
      {
        figure: { isPriority: true },
        searchProperty: {
          type: {
            in: WANTED_SEARCH_PROPERTY_TYPES,
          },

          text: {
            in: searchQueries,
            mode: "insensitive",
          },
        },
      },
      {
        figureId: {
          in: searchQueries.flatMap((qs) => [...qs]),
        },
      },
    ],
  };
}

function formSearchPropertiesWhereQuery2(
  searchQueries: string[],
  isPriority = true,
): Prisma.SearchPropertiesOnFigureWhereInput {
  return {
    OR: searchQueries.flatMap((query) =>
      formSearchPropertiesWhereQuery2Component(query, isPriority),
    ),
  };
}
function formSearchPropertiesWhereQuery3(
  searchQueries: string[],
  isPriority = true,
): Prisma.SearchPropertiesOnFigureWhereInput {
  return {
    OR: searchQueries.flatMap((query) =>
      formSearchPropertiesWhereQuery3Component(query, isPriority),
    ),
  };
}

function formSearchPropertiesWhereQuery2Component(
  searchQuery: string,
  isPriority = true,
) {
  const or: Prisma.SearchPropertiesOnFigureWhereInput[] = [
    {
      figure: { isPriority: true },
      searchProperty: {
        text: {
          startsWith: searchQuery,
          mode: "insensitive",
        },
        type: {
          in: [
            FigureSearchPropertyType.KUNYOMI_KANA,
            FigureSearchPropertyType.KUNYOMI_LATIN,
            FigureSearchPropertyType.KUNYOMI_KANA_WITH_OKURIGANA,
            FigureSearchPropertyType.KUNYOMI_LATIN_WITH_OKURIGANA,
            FigureSearchPropertyType.ONYOMI_KANA,
            FigureSearchPropertyType.ONYOMI_LATIN,
          ],
        },
      },
    },

    ...(searchQuery.length > 3
      ? [
          {
            figure: { isPriority: isPriority },
            searchProperty: {
              text: {
                contains: searchQuery,
                mode: "insensitive" as const,
              },
              type: {
                in: [
                  FigureSearchPropertyType.TRANSLATION_ENGLISH,
                  FigureSearchPropertyType.MNEMONIC_ENGLISH,
                ],
              },
            },
          },
        ]
      : []),
  ];
  return or;
}
function formSearchPropertiesWhereQuery3Component(
  searchQuery: string,
  isPriority = true,
): Prisma.SearchPropertiesOnFigureWhereInput {
  return {
    OR: [
      {
        figure: { isPriority: isPriority },
        searchProperty: {
          text: {
            contains: searchQuery,
            mode: "insensitive",
          },
          type: {
            in: [
              FigureSearchPropertyType.KUNYOMI_KANA,
              FigureSearchPropertyType.KUNYOMI_LATIN,
              FigureSearchPropertyType.KUNYOMI_KANA_WITH_OKURIGANA,
              FigureSearchPropertyType.KUNYOMI_LATIN_WITH_OKURIGANA,
              FigureSearchPropertyType.ONYOMI_KANA,
              FigureSearchPropertyType.ONYOMI_LATIN,
            ],
          },
        },
      },
      ...(searchQuery.length > 3
        ? [
            {
              figure: { isPriority: true },
              searchProperty: {
                text: {
                  contains: searchQuery,
                  mode: "insensitive" as const,
                },
                type: {
                  in: [
                    FigureSearchPropertyType.TRANSLATION_ENGLISH,
                    FigureSearchPropertyType.MNEMONIC_ENGLISH,
                  ],
                },
              },
            },
          ]
        : []),
    ],
  };
}
