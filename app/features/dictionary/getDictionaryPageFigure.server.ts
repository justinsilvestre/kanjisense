import { prisma } from "~/db.server";

import { badgeFigureSelect } from "./badgeFigure";
import { PRELOADED_USES_COUNT } from "./PRELOADED_USES_COUNT";

export type DictionaryPageSearchedFigure = NonNullable<
  Awaited<ReturnType<typeof getDictionaryPageFigure>>
>;

export type DictionaryPageFigureWithPriorityUses = Omit<
  DictionaryPageSearchedFigure,
  "variantGroup"
>;

export type BadgeFigure = NonNullable<
  Awaited<ReturnType<typeof getBadgeFigure>>
>;

export async function getBadgeFigure(figureId: string) {
  return await prisma.kanjisenseFigure.findUnique({
    where: { id: figureId },
    select: badgeFigureSelect,
  });
}

export async function getDictionaryPageFigure(figureId: string) {
  return await prisma.kanjisenseFigure.findUnique({
    where: { id: figureId },
    include: {
      ...dictionaryPageFigureInclude,

      variantGroup: {
        select: {
          ...dictionaryPageFigureInclude.variantGroup.select,
          id: true,
          variants: true,
          figures: {
            include: dictionaryPageFigureInclude,
          },
        },
      },
    },
  });
}

export const dictionaryPageFigureInclude = {
  _count: {
    select: {
      firstClassComponents: true,
      firstClassUses: {
        where: {
          parent: {
            isPriority: { equals: true },
            OR: [
              {
                listsAsCharacter: {
                  isEmpty: false,
                },
              },
              { shinjitaiInBaseKanji: { not: null } },
            ],
          },
        },
      },
    },
  },

  variantGroup: {
    select: {
      hasStandaloneCharacter: true,
    },
  },

  image: true,
  shuowenImage: true,
  glyphImage: true,
  asComponent: {
    select: {
      _count: {
        select: {
          soundMarkUses: {
            where: { isPriority: true },
          },
        },
      },
    },
  },

  meaning: {
    select: {
      kanjidicEnglish: true,
      unihanDefinition: true,
    },
  },
  reading: {
    include: {
      sbgyXiaoyuns: {
        include: {
          sbgyXiaoyun: true,
        },
      },
      unihan15: {
        select: {
          kRSUnicode: true,
        },
      },
      kanjidicEntry: {
        select: {
          onReadings: true,
          kunReadings: true,
        },
      },
    },
  },
  firstClassComponents: {
    orderBy: {
      indexInTree: "asc" as const,
    },
    include: {
      component: {
        select: {
          ...badgeFigureSelect,

          id: true,
          keyword: true,
          mnemonicKeyword: true,
          activeSoundMarkId: true,
          activeSoundMarkValue: true,

          image: true,

          firstClassComponents: {
            select: {
              componentId: true,
              component: {
                select: {
                  reading: {
                    select: {
                      sbgyXiaoyuns: {
                        select: {
                          sbgyXiaoyun: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },

          reading: {
            select: {
              selectedOnReadings: true,
              sbgyXiaoyuns: {
                include: {
                  sbgyXiaoyun: true,
                },
              },
              kanjidicEntry: {
                select: {
                  onReadings: true,
                  kunReadings: true,
                },
              },
            },
          },
        },
      },
      parent: {
        select: {
          activeSoundMarkId: true,
          activeSoundMarkValue: true,
        },
      },
    },
  },
  firstClassUses: {
    take: PRELOADED_USES_COUNT,

    distinct: ["parentId" as const, "componentId" as const],

    orderBy: {
      parent: {
        aozoraAppearances: "desc" as const,
      },
    },
    where: { parent: { isPriority: true } },
    include: {
      parent: {
        select: {
          ...badgeFigureSelect,
          activeSoundMarkId: true,
          activeSoundMarkValue: true,
          keyword: true,
          mnemonicKeyword: true,
          isPriority: true,
          image: true,
          variantGroup: {
            select: {
              hasStandaloneCharacter: true,
            },
          },
          reading: {
            select: {
              selectedOnReadings: true,
              sbgyXiaoyuns: {
                select: { sbgyXiaoyun: true },
              },
              kanjidicEntry: {
                select: {
                  onReadings: true,
                },
              },
            },
          },
          asComponent: {
            ...badgeFigureSelect.asComponent,
            select: {
              ...badgeFigureSelect.asComponent.select,
              id: true,
              soundMarkUses: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
    },
  },
};
