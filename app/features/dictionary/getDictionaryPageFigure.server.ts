import { prisma } from "~/db.server";

export type DictionaryPageSearchedFigure = NonNullable<
  Awaited<ReturnType<typeof getDictionaryPageFigure>>
>;

export type DictionaryPageFigureWithPriorityUses = Omit<
  DictionaryPageSearchedFigure,
  "variantGroup"
>;

export type DictionaryPageFigureWithAsComponent = Pick<
  DictionaryPageFigureWithPriorityUses,
  "asComponent"
>;

export async function getDictionaryPageFigure(figureId: string) {
  return await prisma.kanjisenseFigure.findUnique({
    where: { id: figureId },
    include: {
      ...commonInclude,
      variantGroup: {
        select: {
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
  asComponent: { select: { id: true } },

  KvgJson: true,
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
          id: true,
          keyword: true,
          mnemonicKeyword: true,
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
    where: {
      OR: [
        { parent: { isPriority: true } },
        // {
        //   parent: {
        //     isPriority: false,
        //     relation: {
        //       directUses: {
        //         isEmpty: true,
        //       },
        //     },
        //   },
        // },
      ],
    },
    include: {
      parent: {
        include: {
          reading: {
            select: {
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
            select: {
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
