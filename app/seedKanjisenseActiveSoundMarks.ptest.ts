import { PrismaClient } from "@prisma/client";

import { getAllCharactersAndVariantFigures } from "prisma/kanjisense/getAllCharacters";

import { permittedLostSoundMarks } from "./lib/dic/permittedLostSoundMarks";

describe("lost sound marks", () => {
  test("Any figures with entries in etymology data containing sound marks not present in components tree should be accounted for in `permittedLostSoundMarks`", async () => {
    const prisma = new PrismaClient();
    const potentiallyHelpfulLostSoundMarks =
      await getPotentiallyHelpfulLostSoundMarks(prisma);

    const unaccountedForLostSoundMarks: Record<string, string> = {};
    for (const [lostSoundMark, uses] of potentiallyHelpfulLostSoundMarks) {
      if (!permittedLostSoundMarks[lostSoundMark]) {
        unaccountedForLostSoundMarks[lostSoundMark] = uses;
      }
    }

    expect(unaccountedForLostSoundMarks).toEqual({
      于: "汚 雩",
      大: "榼 泰 溘 盍 盖 磕 蓋 闔 饁",
      天: "呑 忝",
      嬰: "桜 珱",
      朋: "萠",
      祭: "詧",
      羊: "鯗",
      將: "將",
      丞: "承",
      義: "羲",
      郭: "椁",
    });
  }, 30000);
});

async function getPotentiallyHelpfulLostSoundMarks(prisma: PrismaClient) {
  const allFiguresIds = (
    await prisma.kanjisenseFigureRelation.findMany({
      select: { id: true },
    })
  ).map(({ id }) => id);
  const allFiguresIdsSet = new Set(allFiguresIds);
  const { priorityCharactersAndTheirNonComponentVariants } =
    await getAllCharactersAndVariantFigures(prisma);
  const allPriorityCharactersAndVariantsIdsSet = new Set(
    priorityCharactersAndTheirNonComponentVariants.map(({ id }) => id),
  );

  const allLostSoundMarks: Record<string, Set<string>> = {};

  const figuresToActiveSoundMarks = new Map<string, string>();
  for (const figure of await prisma.kanjisenseFigure.findMany({
    select: { id: true, activeSoundMarkId: true },
    where: { activeSoundMarkId: { not: null } },
  })) {
    figuresToActiveSoundMarks.set(figure.id, figure.activeSoundMarkId!);
  }

  for (const {
    character,
    phoneticOrigins,
  } of await prisma.kanjiDbCharacterDerivation.findMany({
    where: {
      character: { in: allFiguresIds },
    },
  })) {
    const activeSoundMark = figuresToActiveSoundMarks.get(character);
    if (!activeSoundMark) {
      for (const phonetic of phoneticOrigins) {
        allLostSoundMarks[phonetic] = allLostSoundMarks[phonetic] || new Set();
        allLostSoundMarks[phonetic].add(character);
      }
    }
  }

  const potentiallyHelpfulLostSoundMarks = new Map<string, string>();

  for (const [lostSoundMark, uses] of Object.entries(allLostSoundMarks)) {
    if (
      await isSoundMarkUseful(
        prisma,
        allFiguresIdsSet,
        allPriorityCharactersAndVariantsIdsSet,
        lostSoundMark,
        uses,
      )
    ) {
      potentiallyHelpfulLostSoundMarks.set(lostSoundMark, [...uses].join(" "));
    }
  }

  return potentiallyHelpfulLostSoundMarks;
}

async function isSoundMarkUseful(
  prisma: PrismaClient,
  allFiguresIdsSet: Set<string>,
  allPriorityCharactersAndVariantsIdsSet: Set<string>,
  lostSoundMark: string,
  uses: Set<string>,
) {
  if (!allFiguresIdsSet.has(lostSoundMark)) return false;

  if (uses.size < 1) return false;

  if (!allPriorityCharactersAndVariantsIdsSet.has(lostSoundMark)) return false;

  const topLevelPriorityUsesCount = await prisma.kanjisenseComponentUse.count({
    where: {
      componentId: lostSoundMark,
      parent: {
        OR: [
          {
            isPriority: true,
          },
          {
            asComponent: null,
          },
        ],
      },
    },
  });
  if (topLevelPriorityUsesCount >= 2) return true;

  const someVariantIsStandalone = Boolean(
    await prisma.kanjisenseComponentUse.findFirst({
      where: {
        component: {
          variantGroup: {
            AND: [
              {
                figures: {
                  some: {
                    id: lostSoundMark,
                  },
                },
              },
              {
                figures: {
                  some: {
                    OR: [
                      {
                        listsAsCharacter: {
                          isEmpty: false,
                        },
                      },
                      {
                        firstClassUses: {
                          some: {
                            component: {
                              id: {
                                notIn: [],
                              },
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            ],
          },
        },
      },
    }),
  );

  if (!someVariantIsStandalone) return false;
}
