import { writeFileSync } from "fs";
import { join } from "path";

import {
  KanjisenseFigure,
  KanjiDbVariantType,
  SbgyXiaoyun,
} from "@prisma/client";

import { prisma } from "~/db.server";
import {
  badgeFigureSelect,
  isAtomicFigure,
} from "~/features/dictionary/badgeFigure";
import { baseKanji, baseKanjiSet, joyoKanji } from "~/lib/baseKanji";

import { BadgeFigure } from "../dictionary/getDictionaryPageFigure.server";
import { transcribeSbgyXiaoyun } from "../dictionary/transcribeSbgyXiaoyun";

export type CurationState = Awaited<ReturnType<typeof getCurationState>>;

export async function getCurationState(courseId: string, page: number) {
  const priorityCharacters = [...baseKanji];
  const priorityCharactersSet = baseKanjiSet;
  const nonPriorityVariants1 = await prisma.kanjiDbVariant.findMany({
    where: {
      variantType: {
        in: [KanjiDbVariantType.OldStyle, KanjiDbVariantType.TwEduVariant],
      },
      base: {
        in: priorityCharacters,
      },
      variant: {
        notIn: priorityCharacters,
      },
    },
  });
  const nonPriorityVariants2 = await prisma.unihan14.findMany({
    where: {
      id: {
        notIn: priorityCharacters,
      },
      OR: [
        {
          kSemanticVariant: {
            hasSome: priorityCharacters,
          },
        },
        {
          kZVariant: {
            hasSome: priorityCharacters,
          },
        },
      ],
    },
  });
  const nonPriorityToPriority: Record<string, string[]> = {};
  for (const { base, variant } of nonPriorityVariants1) {
    nonPriorityToPriority[variant] ||= [];
    if (
      priorityCharactersSet.has(base) &&
      !nonPriorityToPriority[variant].includes(base)
    )
      nonPriorityToPriority[variant].push(base);
  }
  for (const { id, kSemanticVariant, kZVariant } of nonPriorityVariants2) {
    nonPriorityToPriority[id] ||= [];
    if (kSemanticVariant) {
      for (const variant of kSemanticVariant) {
        if (
          priorityCharactersSet.has(variant) &&
          !nonPriorityToPriority[id].includes(variant)
        )
          nonPriorityToPriority[id].push(variant);
      }
    }
    if (kZVariant) {
      for (const variant of kZVariant) {
        if (
          priorityCharactersSet.has(variant) &&
          !nonPriorityToPriority[id].includes(variant)
        )
          nonPriorityToPriority[id].push(variant);
      }
    }
  }
  const joyo = new Set(joyoKanji);
  for (const variants of Object.values(nonPriorityToPriority)) {
    variants.sort((a, b) => {
      if (joyo.has(a) && !joyo.has(b)) return -1;
      if (joyo.has(b) && !joyo.has(a)) return 1;
      return 0;
    });
  }

  const joyoKanjiWithVariants = await prisma.kanjisenseFigure.findMany({
    where: {
      isPriority: true,
      listsAsCharacter: { has: "j" },
      variantGroupId: {
        not: null,
      },
    },
    select: {
      id: true,
      variantGroup: {
        select: {
          id: true,
          figures: {
            where: {
              isStandaloneCharacter: true,
            },
          },
        },
      },
    },
  });
  const oldToNew: Record<string, string> = {};
  for (const { id, variantGroup } of joyoKanjiWithVariants) {
    const variants = variantGroup!.figures.map((f) => f.id);
    for (const variant of variants) {
      if (id !== variant) oldToNew[variant] = id;
    }
  }

  const nonJoyoLessCommonPriorityToMoreCommonPriority: Record<string, string> =
    {};
  const nonJoyoPriorityCharsWithVariants =
    await prisma.kanjisenseFigure.findMany({
      where: {
        isPriority: true,
        listsAsCharacter: { isEmpty: false },
        variantGroupId: {
          not: null,
        },
        variantGroup: {
          figures: {
            none: {
              listsAsCharacter: { has: "j" },
            },
            some: {
              listsAsCharacter: { isEmpty: false },
            },
          },
        },
      },
      select: {
        id: true,
        variantGroup: {
          select: {
            id: true,
            figures: {
              where: {
                isStandaloneCharacter: true,
                listsAsCharacter: { isEmpty: false },
              },
            },
          },
        },
      },
    });

  writeFileSync(
    join(process.cwd(), "kanjiVariants.log.json"),
    JSON.stringify({
      oldToNew,
      nonPriorityToPriority,
      nonJoyoLessCommonPriorityToMoreCommonPriority,
    }),
  );
  console.log(join(process.cwd(), "kanjiVariants.log.json"));

  for (const { variantGroup } of nonJoyoPriorityCharsWithVariants) {
    const variants = variantGroup!.figures!.sort(
      // by aozora appearances desc
      (a, b) => b.aozoraAppearances - a.aozoraAppearances,
    );
    if (variants.length > 1) {
      const [mostCommonVariant, ...otherVariants] = variants;
      for (const variant of otherVariants) {
        nonJoyoLessCommonPriorityToMoreCommonPriority[variant.id] =
          mostCommonVariant.id;
      }
    }
  }

  await prisma.course.upsert({
    where: {
      id: "kj2x",
    },
    update: {},
    create: {
      id: "kj2x",
    },
  });

  const allFiguresKeys = await prisma.kanjisenseFigure
    .findMany({
      select: {
        id: true,
      },
    })
    .then((figures) => figures.map((f) => f.id));
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });
  if (!course) {
    throw new Error(`Course ${courseId} not found`);
  }

  const keysToSeenTexts = new Map(
    await prisma.baseCorpusText
      .findMany({
        where: {
          key: {
            in: ((course?.seenTexts || []) as string[][]).flat() || [],
          },
        },
        include: {
          uniqueCharacters: true,
          uniqueComponents: true,
        },
      })
      .then((texts) => texts.map((t) => [t.key, t])),
  );
  const seenTexts = ((course?.seenTexts || []) as string[][]).map((keys) =>
    keys.map((key) => {
      const text = keysToSeenTexts.get(key)!;
      if (!text) console.log(`Missing text ${key}`);
      return text;
    }),
  );
  // excluding characters not in kanjisense
  const seenCharacters = await prisma.kanjisenseFigure.findMany({
    where: {
      id: {
        in: [
          ...new Set(
            seenTexts
              .flat()
              .flatMap((t) =>
                t.uniqueCharacters.flatMap((c) => c.character || []),
              ),
          ),
        ],
      },
    },
  });
  const seenFigures = await prisma.kanjisenseFigure.findMany({
    where: {
      id: {
        in: [
          ...new Set(
            await getComponentsFromCharsAsync(
              (id) =>
                prisma.kanjisenseFigure.findUnique({
                  where: { id },
                  select: {
                    ...badgeFigureSelect,
                    componentsTree: true,
                  },
                }),
              new Set(seenCharacters.map((c) => c.id)),
            ),
          ),
        ],
      },
    },
    select: {
      ...badgeFigureSelect,
      isPriority: true,
      componentsTree: true,
      image: true,
    },
  });

  const seenCharsTangReadings = await prisma.kanjisenseFigureReading.findMany({
    where: {
      id: {
        in: seenCharacters.map((c) => c.id),
      },
      sbgyXiaoyuns: {
        some: {},
      },
    },
    select: {
      id: true,
      sbgyXiaoyunsMatchingExemplars: true,
      sbgyXiaoyuns: {
        select: {
          sbgyXiaoyun: true,
        },
      },
    },
  });
  const seenCharsTangReadingsMap = new Map(
    seenCharsTangReadings.map((r) => [r.id, r]),
  );
  const defaultTangReadings = Object.fromEntries(
    seenTexts.flat().map((text) => {
      return [
        text.key,
        getDefaultTangReadings(text.normalizedText, (id) => {
          return (
            seenCharsTangReadingsMap
              .get(id)
              ?.sbgyXiaoyuns.map((x) => x.sbgyXiaoyun) || []
          );
        }),
      ];
    }),
  );

  const remainingKanjisenseCharacters = await prisma.kanjisenseFigure.findMany({
    where: {
      id: {
        notIn: seenCharacters.map((c) => c.id),
      },
      isPriority: true,
      // should include those without directUses
      listsAsCharacter: {
        isEmpty: false,
      },
    },
    orderBy: {
      aozoraAppearances: "desc",
    },
    include: {
      image: true,
      asComponent: {
        select: {
          id: true,
          allUses: {
            select: {
              id: true,
              aozoraAppearances: true,
            },
            where: {
              isPriority: true,
            },
            orderBy: {
              aozoraAppearances: "desc",
            },
          },
        },
      },
    },
  });

  const remainingMeaningfulComponents = await prisma.kanjisenseFigure.findMany({
    where: {
      id: {
        notIn: seenFigures.map((c) => c.id),
      },
      isPriority: true,
      // should include those without directUses
      listsAsComponent: {
        isEmpty: false,
      },
    },
    orderBy: {
      aozoraAppearances: "desc",
    },
    select: {
      ...badgeFigureSelect,

      isPriorityComponent: true,
      componentsTree: true,

      isPriority: true,

      image: true,

      asComponent: {
        select: {
          id: true,
          allUses: {
            select: {
              id: true,
              aozoraAppearances: true,
              listsAsCharacter: true,
              listsAsComponent: true,
            },
            where: {
              isPriority: true,
            },
            orderBy: {
              aozoraAppearances: "desc",
            },
          },
        },
      },
    },
  });

  const soughtCharacters =
    course?.wantedCharacters || course.normalizedTextSearchQuery
      ? [
          ...new Set([
            ...course.wantedCharacters,
            ...course.normalizedTextSearchQuery.replaceAll("|", ""),
          ]),
        ]
      : null;

  console.log({
    seenCharacters: seenCharacters.map((c) => c.id).join(""),
    seenFigures: seenFigures.map((c) => c.id).join(" "),
    remainingKanjisenseCharacters: remainingKanjisenseCharacters
      .map((c) => c.id)
      .join(""),
    remainingMeaningfulComponents: remainingMeaningfulComponents
      .map((c) => c.id)
      .join(" "),
  });

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //   getting all characters
  //   in texts containing the given characters and in the given length range
  //   EXCEPT seen characters.
  //   then, group them by text, and sum these unseen characters' frequency scores to get the TEXT SCORE.
  //   a higher score means either
  //   - more unique unseen characters/components (i.e. higher raw ROI)
  //   - more frequent unseen characters/components (i.e. contains some especially important/easy characters)
  //  these texts could be further sorted by "ease" by further ordering them by the number of SEEN characters they contain.
  const wantedAuthors = course?.authors.length
    ? course.authors.filter((a) => !a.startsWith("-"))
    : null;
  const unwantedAuthors = course?.authors.length
    ? course.authors.filter((a) => a.startsWith("-")).map((a) => a.slice(1))
    : null;
  const wantedSources = course?.sources.length
    ? course.sources.filter((s) => !s.startsWith("-"))
    : null;
  const unwantedSources = course?.sources.length
    ? course.sources.filter((s) => s.startsWith("-")).map((s) => s.slice(1))
    : null;

  const charactersNotNeededAnymore = seenCharacters
    .map((c) => c.id)
    .filter((id) => !soughtCharacters?.includes(id));

  // todo: extract querying for reuse with count below
  const textGroups = await prisma.characterUsagesOnBaseCorpusText.groupBy({
    by: [
      "baseCorpusTextId",
      "baseCorpusTextLength",
      "baseCorpusUniqueCharactersCount",
      "baseCorpusUniqueComponentsCount",
      "baseCorpusTextNonPriorityCharactersCount",
    ],
    _count: {
      baseCorpusTextId: true,
    },

    where: {
      baseCorpusText: {
        normalizedLength: {
          gte: course?.minLength || undefined,
          lte: course?.maxLength || undefined,
        },
        id: {
          notIn: seenTexts.flatMap((ts) => ts.map((t) => t.id)),
        },
        AND: [
          {
            author:
              wantedAuthors?.length || unwantedAuthors?.length
                ? {
                    in: wantedAuthors?.length ? wantedAuthors : undefined,
                    notIn: unwantedAuthors?.length
                      ? unwantedAuthors
                      : undefined,
                  }
                : undefined,
          },
          {
            source:
              wantedSources?.length || unwantedSources?.length
                ? {
                    in: wantedSources?.length ? wantedSources : undefined,
                    notIn: unwantedSources?.length
                      ? unwantedSources
                      : undefined,
                  }
                : undefined,
          },
        ],
        // uniqueCharacters: {
        //   none: {
        //     figure: {
        //       isPriority: false,
        //     },
        //   },
        // },
        // uniqueCharacters: soughtCharacters
        //   ? {
        //       some: {
        //         figureId: {
        //           in: soughtCharacters?.length ? soughtCharacters : undefined,
        //           notIn: charactersNotNeededAnymore,
        //         },
        //       },
        //     }
        //   : undefined,
        // author:
        //   wantedAuthors?.length || unwantedAuthors?.length
        //     ? {
        //         in: wantedAuthors?.length ? wantedAuthors : undefined,
        //         notIn: unwantedAuthors?.length ? unwantedAuthors : undefined,
        //       }
        //     : undefined,
        // source:
        //   wantedSources?.length || unwantedSources?.length
        //     ? {
        //         in: wantedSources?.length ? wantedSources : undefined,
        //         notIn: unwantedSources?.length ? unwantedSources : undefined,
        //       }
        //     : undefined,
        OR: course?.normalizedTextSearchQuery
          ? course.normalizedTextSearchQuery
              .split("|")
              .map((q) => ({ normalizedText: { contains: q } }))
          : undefined,
      },
      character: {
        notIn: charactersNotNeededAnymore,
        in: course?.wantedCharacters.length
          ? course.wantedCharacters.split("")
          : undefined,
      },
    },
    _sum: {
      frequencyScore: true,
    },
    orderBy: [
      {
        baseCorpusTextNonPriorityCharactersCount: "asc",
      },
      {
        // useful to switch with baseCorpusUniqueCharactersCount, baseCorpusTextNonPriorityCharactersCount
        baseCorpusUniqueComponentsCount: "asc",
      },
      {
        baseCorpusUniqueCharactersCount: "asc",
      },
      {
        _sum: {
          frequencyScore: "desc",
        },
      },
      { baseCorpusTextLength: "desc" },
    ],
    take: 500,
    skip: (page - 1) * 500,
  });

  console.log("geting text groups");
  const textGroupsCount = (
    await prisma.characterUsagesOnBaseCorpusText.groupBy({
      by: ["baseCorpusTextId"],
      _count: {
        baseCorpusTextId: true,
      },

      where: {
        baseCorpusText: {
          normalizedLength: {
            gte: course?.minLength || undefined,
            lte: course?.maxLength || undefined,
          },
          id: {
            notIn: seenTexts.flatMap((ts) => ts.map((t) => t.id)),
          },
          AND: [
            {
              author:
                wantedAuthors?.length || unwantedAuthors?.length
                  ? {
                      in: wantedAuthors?.length ? wantedAuthors : undefined,
                      notIn: unwantedAuthors?.length
                        ? unwantedAuthors
                        : undefined,
                    }
                  : undefined,
            },
            {
              source:
                wantedSources?.length || unwantedSources?.length
                  ? {
                      in: wantedSources?.length ? wantedSources : undefined,
                      notIn: unwantedSources?.length
                        ? unwantedSources
                        : undefined,
                    }
                  : undefined,
            },
          ],
          // uniqueCharacters: {
          //   none: {
          //     figure: {
          //       isPriority: false,
          //     },
          //   },
          // },
          // uniqueCharacters: soughtCharacters
          //   ? {
          //       some: {
          //         figureId: {
          //           in: soughtCharacters?.length ? soughtCharacters : undefined,
          //           notIn: charactersNotNeededAnymore,
          //         },
          //       },
          //     }
          //   : undefined,
          // author:
          //   wantedAuthors?.length || unwantedAuthors?.length
          //     ? {
          //         in: wantedAuthors?.length ? wantedAuthors : undefined,
          //         notIn: unwantedAuthors?.length ? unwantedAuthors : undefined,
          //       }
          //     : undefined,
          // source:
          //   wantedSources?.length || unwantedSources?.length
          //     ? {
          //         in: wantedSources?.length ? wantedSources : undefined,
          //         notIn: unwantedSources?.length ? unwantedSources : undefined,
          //       }
          //     : undefined,
          OR: course?.normalizedTextSearchQuery
            ? course.normalizedTextSearchQuery
                .split("|")
                .map((q) => ({ normalizedText: { contains: q } }))
            : undefined,
        },
        character: {
          notIn: charactersNotNeededAnymore,
          in: course?.wantedCharacters.length
            ? course.wantedCharacters.split("")
            : undefined,
        },
      },
    })
  ).length;

  console.log("geting texts");
  const unseenTexts = await prisma.baseCorpusText.findMany({
    where: {
      id: {
        in: textGroups.map((g) => g.baseCorpusTextId),
      },
      // uniqueCharacters: {
      //   some: {
      //     figureId: {
      //       in: course?.wantedCharacters.length
      //         ? course.wantedCharacters.split("")
      //         : undefined,
      //     },
      //   },
      // },
    },
    include: {
      uniqueCharacters: true,
      uniqueComponents: true,
    },
  });

  return {
    course,
    seenTexts,
    seenCharacters,
    seenFigures,
    defaultTangReadings,
    remainingKanjisenseCharacters,
    remainingMeaningfulComponents,
    allFiguresKeys,
    unseenTexts,
    textGroups,
    textGroupsCount,
  };
}

function getDefaultTangReadings(
  normalizedShinjitai: string,
  getFigureReadings: (k: string) => SbgyXiaoyun[],
): string {
  return Array.from(normalizedShinjitai, (char) => {
    const readings = getFigureReadings(char);
    const tangReadings = readings.map((r) => transcribeSbgyXiaoyun(r));
    if (char === "不") return tangReadings[1];

    if (!tangReadings.length) return "X";
    if (tangReadings.length === 1) return tangReadings[0];
    return tangReadings.join("/");
  }).join(" ");
}

async function getComponentsFromCharsAsync(
  getFigure: (
    key: string,
  ) => Promise<(BadgeFigure & Pick<KanjisenseFigure, "componentsTree">) | null>,
  seenChars: Set<string>,
) {
  return new Set(
    await asyncFlatMap(seenChars, async (char: string) => {
      const figure = await getFigure(char);
      if (!figure) {
        return [];
      }
      const components: string[] = [];

      if (figure.isPriorityComponent || isAtomicFigure(figure))
        components.push(char);
      const componentsTree = (figure.componentsTree || []) as [
        string,
        string,
      ][];
      components.push(
        ...componentsTree.map((c: [parent: string, component: string]) => c[1]),
      );
      return components;
    }),
  );
}

function asyncFlatMap<T, U>(
  arr: Iterable<T>,
  fn: (item: T) => Promise<U[]>,
): Promise<U[]> {
  return Promise.all(Array.from(arr, fn)).then((arrs) => arrs.flat());
}