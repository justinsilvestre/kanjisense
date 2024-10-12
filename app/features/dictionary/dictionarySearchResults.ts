import type { Prisma } from "@prisma/client";
import { FigureSearchPropertyType } from "@prisma/client";

import { prisma } from "~/db.server";
import { FIGURES_VERSION, getFigureId } from "~/models/figure";

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
      version: FIGURES_VERSION,
      key: {
        in: figures.flatMap((f) => (!f.isStandaloneCharacter ? f.key : [])),
      },
    },
  });
  return { figures, images };
}

async function collectSearchResults<T extends { id: string }>(
  batchSize: number,
  steps: {
    continue: boolean;
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

    if (results.length && !step.continue) {
      return results;
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
            version: true,
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
      continue: false,
      findMany: () =>
        prisma.kanjisenseFigure
          .findMany({
            where: {
              version: FIGURES_VERSION,
              id: {
                in: searchQueries.flatMap((qs) =>
                  Array.from(qs, (key) => getFigureId(FIGURES_VERSION, key)),
                ),
              },
            },
            select: selectFigures,
            take: RESULTS_BATCH_SIZE,
          })
          .then((f) =>
            f.sort(
              (a, b) =>
                searchQueries.indexOf(a.id) - searchQueries.indexOf(b.id),
            ),
          ),
    },
    {
      continue: true,
      findMany: () =>
        prisma.kanjisenseFigure.findMany({
          where: {
            version: FIGURES_VERSION,
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
      continue: true,
      findMany: (returnedFigureIds, take) =>
        prisma.kanjisenseFigure.findMany({
          where: {
            version: FIGURES_VERSION,
            isPriority: true,
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
      continue: true,
      findMany: (returnedFigureIds, take) =>
        prisma.kanjisenseFigure.findMany({
          where: {
            version: FIGURES_VERSION,
            isPriority: true,
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
      continue: true,
      findMany: (returnedFigureIds, take) =>
        prisma.kanjisenseFigure.findMany({
          where: {
            version: FIGURES_VERSION,
            isPriority: false,
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
      continue: true,
      findMany: (returnedFigureIds, take) =>
        prisma.kanjisenseFigure.findMany({
          where: {
            version: FIGURES_VERSION,
            isPriority: false,
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
  ]);
  return figures || [];
}

function formSearchPropertiesWhereQuery1(
  searchQueries: string[],
): Prisma.SearchPropertiesOnFigureWhereInput {
  return {
    version: FIGURES_VERSION,

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
  };
}

const JAPANESE_TYPES = [
  FigureSearchPropertyType.KUNYOMI_KANA,
  FigureSearchPropertyType.KUNYOMI_LATIN,
  FigureSearchPropertyType.KUNYOMI_KANA_WITH_OKURIGANA,
  FigureSearchPropertyType.KUNYOMI_LATIN_WITH_OKURIGANA,
  FigureSearchPropertyType.ONYOMI_KANA,
  FigureSearchPropertyType.ONYOMI_LATIN,
];
const ENGLISH_TYPES = [
  FigureSearchPropertyType.TRANSLATION_ENGLISH,
  FigureSearchPropertyType.MNEMONIC_ENGLISH,
];

const COMBINED_TYPES = [...JAPANESE_TYPES, ...ENGLISH_TYPES];

function formSearchPropertiesWhereQuery2(
  searchQueries: string[],
  // isPriority: boolean,
  // excludeIds: string[],
): Prisma.SearchPropertiesOnFigureWhereInput {
  return {
    version: FIGURES_VERSION,
    // figure: {
    //   isPriority: isPriority,
    //   // maybe unnecessary
    //   // key: {
    //   //   notIn: excludeIds,
    //   // },
    // },
    OR: searchQueries.map((query) => ({
      searchProperty: {
        text: {
          startsWith: query,
          mode: "insensitive",
        },
        type: {
          in: query.length > 3 ? COMBINED_TYPES : JAPANESE_TYPES,
        },
      },
    })),
  };
}

function formSearchPropertiesWhereQuery3(
  searchQueries: string[],
  // isPriority: boolean,
  // excludeIds: string[],
): Prisma.SearchPropertiesOnFigureWhereInput {
  return {
    version: FIGURES_VERSION,
    // figure: {
    //   isPriority: isPriority,
    //   // maybe unnecessary
    //   // key: {
    //   //   notIn: excludeIds,
    //   // },
    // },
    OR: searchQueries.map((query) => ({
      searchProperty: {
        text: {
          contains: query,
          mode: "insensitive",
        },
        type: {
          in: query.length > 3 ? COMBINED_TYPES : JAPANESE_TYPES,
        },
      },
    })),
  };
}
