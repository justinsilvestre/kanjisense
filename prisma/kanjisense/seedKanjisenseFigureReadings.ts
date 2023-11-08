import { KanjiDbVariantType, PrismaClient, SbgyXiaoyun } from "@prisma/client";

import { registerSeeded } from "../seedUtils";

import { executeAndLogTime } from "./executeAndLogTime";
import { findGuangyunEntriesByShinjitai } from "./findGuangyunEntriesByShinjitai";
import { getAllCharacters } from "./getAllCharacters";

export async function seedKanjisenseFigureReadings(
  prisma: PrismaClient,
  force = false,
) {
  console.log(
    "sound mark figures",
    Array.from(
      await prisma.kanjisenseFigure.findMany({
        select: { id: true },
        where: {
          OR: [
            {
              asComponent: {
                soundMarkUses: {
                  some: {
                    id: {
                      notIn: [],
                    },
                  },
                },
              },
            },
          ],
        },
      }),
      (f) => f.id,
    ),
  );

  const seeded = await prisma.setup.findUnique({
    where: { step: "KanjisenseFigureReading" },
  });
  if (seeded && !force)
    console.log(`KanjisenseFigureReading already seeded. 🌱`);
  else {
    console.log(`seeding KanjisenseFigureReading...`);

    const kanjidicEntriesKeys = new Set(
      Array.from(
        await prisma.kanjidicEntry.findMany({
          select: { id: true },
        }),
        (e) => e.id,
      ),
    );
    const unihan15Keys = new Set(
      Array.from(
        await prisma.unihan15.findMany({
          select: { id: true },
        }),
        (e) => e.id,
      ),
    );

    const figuresNeedingReadingsIds = Array.from(
      await prisma.kanjisenseFigure.findMany({
        select: { id: true },
        where: {
          OR: [
            {
              id: {
                in: (
                  await getAllCharacters(prisma)
                ).allStandaloneCharacters.map((c) => c.id),
              },
            },
            {
              asComponent: {
                soundMarkUses: {
                  some: {
                    id: {
                      notIn: [],
                    },
                  },
                },
              },
            },
          ],
        },
      }),
      (f) => f.id,
    );

    console.log(
      `Will look up guangyun entries of ${figuresNeedingReadingsIds.length} figures.`,
    );

    console.log("preparing variants...");
    const newToOldFiguresIds = new Map<string, string[]>();
    const newToZVariants14 = new Map<string, string[]>();
    const allOldFiguresIds = new Set<string>();
    for (const {
      base: newFigure,
      variant: oldFigure,
    } of await prisma.kanjiDbVariant.findMany({
      where: {
        variantType: KanjiDbVariantType.OldStyle,
        base: { in: figuresNeedingReadingsIds },
      },
    })) {
      allOldFiguresIds.add(oldFigure);
      if (!newToOldFiguresIds.has(newFigure)) {
        newToOldFiguresIds.set(newFigure, []);
      }
      newToOldFiguresIds.get(newFigure)?.push(oldFigure);
    }
    const oldFiguresToXiaoYuns = new Map<string, SbgyXiaoyun[]>();

    for (const xiaoyun of await prisma.sbgyXiaoyun.findMany({
      where: {
        exemplars: {
          hasSome: [...new Set(Array.from(newToOldFiguresIds.values()).flat())],
        },
      },
    })) {
      for (const exemplar of xiaoyun.exemplars) {
        if (allOldFiguresIds.has(exemplar)) {
          const oldFigures = oldFiguresToXiaoYuns.get(exemplar) || [];
          oldFiguresToXiaoYuns.set(exemplar, oldFigures);
          oldFigures.push(xiaoyun);
        }
      }
    }

    for (const { id: newFigure, kZVariant } of await prisma.unihan14.findMany({
      where: {
        kZVariant: { isEmpty: false },
        id: { in: figuresNeedingReadingsIds },
      },
      select: { kZVariant: true, id: true },
    })) {
      if (!newToZVariants14.has(newFigure)) {
        newToZVariants14.set(newFigure, []);
      }
      newToZVariants14.get(newFigure)?.push(...kZVariant);
    }

    const figuresToXiaoyuns = await executeAndLogTime(
      "preparing guangyun entries",
      async () =>
        await prepareGuangyunEntries(
          figuresNeedingReadingsIds,
          prisma,
          newToOldFiguresIds,
          oldFiguresToXiaoYuns,
          newToZVariants14,
        ),
    );

    console.log("creating entries");
    await prisma.kanjisenseFigureReadingToSbgyXiaoyun.deleteMany();
    await prisma.kanjisenseFigureReading.deleteMany();
    await prisma.kanjisenseFigureReading.createMany({
      data: Array.from(figuresNeedingReadingsIds, (id) => ({
        id,
        kanjidicEntryId: kanjidicEntriesKeys.has(id) ? id : null,
        unihan15Id: unihan15Keys.has(id) ? id : null,
        sbgyXiaoyunsMatchingExemplars: Object.fromEntries(
          Array.from(
            figuresToXiaoyuns.get(id)?.entries() || [],
            ([xiaoyun, matchingExemplars]) => [xiaoyun, [...matchingExemplars]],
          ),
        ),
      })),
    });

    await executeAndLogTime("hooking up guangyun entries", async () => {
      await prisma.kanjisenseFigureReadingToSbgyXiaoyun.createMany({
        data: [...figuresToXiaoyuns].flatMap(([figureId, xiaoyuns]) =>
          Array.from(xiaoyuns.keys(), (sbgyXiaoyunId) => ({
            figureReadingId: figureId,
            sbgyXiaoyunId,
          })),
        ),
      });
    });

    await registerSeeded(prisma, "KanjisenseFigureReading");
  }

  console.log(`KanjisenseFigureReading seeded. 🌱`);
}
async function prepareGuangyunEntries(
  figuresNeedingReadingsIds: string[],
  prisma: PrismaClient,
  newToOldFiguresIds: Map<string, string[]>,
  oldFiguresToXiaoYuns: Map<
    string,
    {
      xiaoyun: number;
      exemplars: string[];
      fanqie: string;
      initial: string;
      cycleHead: string;
      tone: string;
      kaihe: string | null;
      note: string | null;
      dengOrChongniu: string | null;
    }[]
  >,
  newToZVariants14: Map<string, string[]>,
) {
  const figuresToXiaoyuns = new Map<string, Map<number, Set<string>>>();
  for (const figureId of figuresNeedingReadingsIds) {
    const guangyunEntries = await findGuangyunEntriesByShinjitai(
      prisma,
      newToOldFiguresIds,
      oldFiguresToXiaoYuns,
      newToZVariants14,
      figureId,
    );
    for (const [
      xiaoyun,
      { matchingExemplars: matchingExemplars },
    ] of guangyunEntries) {
      const xiaoyunsToExemplars =
        figuresToXiaoyuns.get(figureId) || new Map<number, Set<string>>();
      figuresToXiaoyuns.set(figureId, xiaoyunsToExemplars);
      const xiaoyunExemplars =
        xiaoyunsToExemplars.get(xiaoyun) || new Set<string>();
      xiaoyunsToExemplars.set(xiaoyun, xiaoyunExemplars);
      for (const char of matchingExemplars) {
        xiaoyunExemplars.add(char);
      }
    }
  }
  return figuresToXiaoyuns;
}
