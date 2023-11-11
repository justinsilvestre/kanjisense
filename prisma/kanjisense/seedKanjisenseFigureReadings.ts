import { KanjiDbVariantType, PrismaClient, SbgyXiaoyun } from "@prisma/client";

import {
  InferredOnyomiType,
  Kaihe,
  QysSyllableProfile,
  Tone,
  inferOnyomi,
  toModernKatakana,
} from "~/lib/qys/inferOnyomi";
import { QieyunRhymeCycleHead } from "~/lib/qys/QieyunRhymeCycleHead";
import { QysInitial } from "~/lib/qys/QysInitial";

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

    const kanjidicEntries = new Map(
      Array.from(
        await prisma.kanjidicEntry.findMany({
          select: { id: true, onReadings: true },
        }),
        (e) => [e.id, e],
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

    console.log(`allOldFiguresIds.has('者')`, allOldFiguresIds.has(`者`));

    const sbgyCharactersToXiaoyunNumbers = new Map<string, number[]>();
    for (const { xiaoyun, exemplars } of await prisma.sbgyXiaoyun.findMany()) {
      for (const exemplar of exemplars) {
        if (!sbgyCharactersToXiaoyunNumbers.has(exemplar)) {
          sbgyCharactersToXiaoyunNumbers.set(exemplar, []);
        }
        sbgyCharactersToXiaoyunNumbers.get(exemplar)!.push(xiaoyun);
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

    const figuresToXiaoyunsWithMatchingExemplars = await executeAndLogTime(
      "preparing guangyun entries",
      async () =>
        await prepareGuangyunEntries({
          figuresNeedingReadingsIds,
          prisma,
          newToOldFiguresIds,
          sbgyCharactersToXiaoyunNumbers,
          newToZVariants14,
        }),
    );

    console.log(
      "figuresToXiaoyunsWithMatchingExemplars",
      figuresToXiaoyunsWithMatchingExemplars,
    );

    console.log("creating entries");
    await prisma.kanjisenseFigureReadingToSbgyXiaoyun.deleteMany();
    await prisma.kanjisenseFigureReading.deleteMany();
    await prisma.kanjisenseFigureReading.createMany({
      data: Array.from(figuresNeedingReadingsIds, (readingFigureId) => {
        const inferredOnyomiFor = getInferredOnReadings(
          figuresToXiaoyunsWithMatchingExemplars,
          readingFigureId,
        );

        const inferredOnReadingCandidates: OnReadingToTypeToXiaoyuns = {};
        for (const [
          modernKatakanaOnReading,
          typeToXiaoyuns,
        ] of inferredOnyomiFor) {
          for (const [type, xiaoyuns] of typeToXiaoyuns) {
            for (const xiaoyun of xiaoyuns) {
              const classifications =
                inferredOnReadingCandidates[modernKatakanaOnReading] ||
                (inferredOnReadingCandidates[modernKatakanaOnReading] = {});
              classifications[type] ||= [] as number[];
              classifications[type].push(xiaoyun.xiaoyun.xiaoyun);
            }
          }
        }

        const sbgyXiaoyunsMatchingExemplars: Record<string, string[]> = {};
        for (const [
          xiaoyun,
          { matchingExemplars },
        ] of figuresToXiaoyunsWithMatchingExemplars
          .get(readingFigureId)
          ?.entries() || []) {
          sbgyXiaoyunsMatchingExemplars[xiaoyun] ||= [];
          sbgyXiaoyunsMatchingExemplars[xiaoyun].push(...matchingExemplars);
        }

        return {
          id: readingFigureId,
          kanjidicEntryId: kanjidicEntries.has(readingFigureId)
            ? readingFigureId
            : null,
          unihan15Id: unihan15Keys.has(readingFigureId)
            ? readingFigureId
            : null,
          inferredOnReadingCandidates,
          sbgyXiaoyunsMatchingExemplars,
        };
      }),
    });

    await executeAndLogTime("hooking up guangyun entries", async () => {
      await prisma.kanjisenseFigureReadingToSbgyXiaoyun.createMany({
        data: [...figuresToXiaoyunsWithMatchingExemplars].flatMap(
          ([figureId, xiaoyuns]) =>
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
function getInferredOnReadings(
  figuresToXiaoyunsWithMatchingExemplars: Map<
    string,
    Map<number, { xiaoyun: SbgyXiaoyun; matchingExemplars: Set<string> }>
  >,
  readingFigureId: string,
) {
  const inferredOnyomiModernKatakanaToTypeToXiaoyuns = new Map<
    string,
    Map<
      InferredOnyomiType,
      {
        xiaoyun: SbgyXiaoyun;
        matchingExemplars: Set<string>;
      }[]
    >
  >();
  for (const [
    ,
    xiaoyunWithMatchingExemplars,
  ] of figuresToXiaoyunsWithMatchingExemplars.get(readingFigureId) || []) {
    const { xiaoyun } = xiaoyunWithMatchingExemplars;
    const inferredOnReadings = inferOnyomi(
      sbgyXiaoyunToQysSyllableProfile(xiaoyun),
      toModernKatakana,
    );
    for (const [readingType, readingsForType] of inferredOnReadings) {
      for (const katakanaOnReading of readingsForType) {
        const typesToXiaoyuns: Map<
          InferredOnyomiType,
          {
            xiaoyun: SbgyXiaoyun;
            matchingExemplars: Set<string>;
          }[]
        > =
          inferredOnyomiModernKatakanaToTypeToXiaoyuns.get(katakanaOnReading) ||
          new Map();
        inferredOnyomiModernKatakanaToTypeToXiaoyuns.set(
          katakanaOnReading,
          typesToXiaoyuns,
        );
        const xiaoyunsForType = typesToXiaoyuns.get(readingType) || [];
        typesToXiaoyuns.set(readingType, xiaoyunsForType);
        xiaoyunsForType.push(xiaoyunWithMatchingExemplars);
      }
    }
  }

  return inferredOnyomiModernKatakanaToTypeToXiaoyuns;
}

async function prepareGuangyunEntries({
  figuresNeedingReadingsIds,
  prisma,
  newToOldFiguresIds,
  sbgyCharactersToXiaoyunNumbers,
  newToZVariants14,
}: {
  figuresNeedingReadingsIds: string[];
  prisma: PrismaClient;
  newToOldFiguresIds: Map<string, string[]>;
  sbgyCharactersToXiaoyunNumbers: Map<string, number[]>;
  newToZVariants14: Map<string, string[]>;
}) {
  const figuresToXiaoyunsWithMatchingExemplars = new Map<
    string,
    Map<
      number,
      {
        xiaoyun: SbgyXiaoyun;
        matchingExemplars: Set<string>;
      }
    >
  >();
  for (const figureId of figuresNeedingReadingsIds) {
    const guangyunEntries = await findGuangyunEntriesByShinjitai(
      prisma,
      newToOldFiguresIds,
      sbgyCharactersToXiaoyunNumbers,
      newToZVariants14,
      figureId,
    );
    for (const [
      xiaoyunNumber,
      { xiaoyun, matchingExemplars },
    ] of guangyunEntries) {
      const xiaoyunsToExemplars =
        figuresToXiaoyunsWithMatchingExemplars.get(figureId) ||
        new Map<
          number,
          {
            xiaoyun: SbgyXiaoyun;
            matchingExemplars: Set<string>;
          }
        >();
      figuresToXiaoyunsWithMatchingExemplars.set(figureId, xiaoyunsToExemplars);

      const xiaoyunExemplars: {
        xiaoyun: SbgyXiaoyun;
        matchingExemplars: Set<string>;
      } = xiaoyunsToExemplars.get(xiaoyunNumber) || {
        xiaoyun,
        matchingExemplars: new Set<string>(),
      };
      xiaoyunsToExemplars.set(xiaoyunNumber, xiaoyunExemplars);
      for (const char of matchingExemplars) {
        xiaoyunExemplars.matchingExemplars.add(char);
      }
    }
  }
  return figuresToXiaoyunsWithMatchingExemplars;
}

export type OnReadingToTypeToXiaoyuns = Record<
  string,
  Record<string, number[]>
>;

export function sbgyXiaoyunToQysSyllableProfile(
  xiaoyun: SbgyXiaoyun,
): QysSyllableProfile {
  const initial = xiaoyun.initial as QysInitial;
  return {
    initial,
    cycleHead: xiaoyun.cycleHead as QieyunRhymeCycleHead,
    tone: xiaoyun.tone as Tone,
    kaihe: xiaoyun.kaihe as Kaihe | null,
    dengOrChongniu:
      xiaoyun.dengOrChongniu as QysSyllableProfile["dengOrChongniu"],
  };
}
