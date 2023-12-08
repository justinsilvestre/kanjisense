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
  const figures1 = await prisma.kanjisenseFigure.findMany({
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
  });
  if (figures1.length >= RESULTS_BATCH_SIZE) return figures1;
  const figures2 = await prisma.kanjisenseFigure.findMany({
    where: {
      searchProperties: {
        some: formSearchPropertiesWhereQuery2(searchQueries),
      },
      id: {
        notIn: figures1.map((figure) => figure.id),
      },
    },
    select: selectFigures,
    orderBy: {
      aozoraAppearances: "desc",
    },
    take: RESULTS_BATCH_SIZE - figures1.length,
  });

  if (figures2.length + figures1.length >= RESULTS_BATCH_SIZE)
    return figures1.concat(figures2);

  const figures3 = await prisma.kanjisenseFigure.findMany({
    where: {
      searchProperties: {
        some: formSearchPropertiesWhereQuery3(searchQueries),
      },
      id: {
        notIn: figures1
          .map((figure) => figure.id)
          .concat(figures2.map((figure) => figure.id)),
      },
    },
    select: selectFigures,
    orderBy: {
      aozoraAppearances: "desc",
    },
    take: RESULTS_BATCH_SIZE - figures1.length - figures2.length,
  });

  if (figures1.length + figures2.length + figures3.length)
    return figures1.concat(figures2).concat(figures3);
  return [];
}

function formSearchPropertiesWhereQuery1(
  searchQueries: string[],
): Prisma.SearchPropertiesOnFigureWhereInput {
  return {
    OR: [
      {
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
): Prisma.SearchPropertiesOnFigureWhereInput {
  return {
    OR: searchQueries.flatMap((query) =>
      formSearchPropertiesWhereQuery2Component(query),
    ),
  };
}
function formSearchPropertiesWhereQuery3(
  searchQueries: string[],
): Prisma.SearchPropertiesOnFigureWhereInput {
  return {
    OR: searchQueries.flatMap((query) =>
      formSearchPropertiesWhereQuery3Component(query),
    ),
  };
}

function formSearchPropertiesWhereQuery2Component(searchQuery: string) {
  const or: Prisma.SearchPropertiesOnFigureWhereInput[] = [
    {
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
): Prisma.SearchPropertiesOnFigureWhereInput {
  return {
    OR: [
      {
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
