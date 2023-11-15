import { prisma } from "~/db.server";

import { badgeFigureSelect } from "./displayFigure";

export type DictionaryPageSearchedFigure = NonNullable<
  Awaited<ReturnType<typeof getDictionaryPageFigure>>
>;

export type DictionaryPageFigureWithPriorityUses = Omit<
  DictionaryPageSearchedFigure,
  "variantGroup"
>;

export async function getDictionaryPageFigure(figureId: string) {
  return await prisma.kanjisenseFigure.findUnique({
    where: { id: figureId },
    include: {
      ...commonInclude,
      variantGroup: {
        select: {
          ...commonInclude.variantGroup.select,
          id: true,
          variants: true,
          figures: {
            include: commonInclude,
          },
        },
      },
    },
  });
}

const commonInclude = {
  _count: {
    select: {
      firstClassComponents: true,
      firstClassUses: {
        where: {
          parent: {
            isPriority: true,
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

          image: true,
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
      parent: {
        select: {
          activeSoundMarkId: true,
          activeSoundMarkValue: true,
        },
      },
    },
  },
  firstClassUses: {
    orderBy: {
      parent: {
        aozoraAppearances: "desc" as const,
      },
    },
    where: {
      OR: [{ parent: { isPriority: true } }],
    },
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
