import { readFileSync } from "fs";

import {
  KanjiDbVariantType,
  KanjidicEntry,
  PrismaClient,
  SbgyXiaoyun,
} from "@prisma/client";

import { serializeXiaoyunProfile } from "~/features/dictionary/getActiveSoundMarkValueText";
import { sbgyXiaoyunToQysSyllableProfile } from "~/features/dictionary/sbgyXiaoyunToQysSyllableProfile";
import { files } from "~/lib/files.server";
import { OnReadingToTypeToXiaoyuns } from "~/lib/OnReadingToTypeToXiaoyuns";
import {
  InferredOnyomiType,
  inferOnyomi,
  toModernKatakana,
} from "~/lib/qys/inferOnyomi";
import { FigureKey, getFigureId } from "~/models/figure";

import { runSetupStep } from "../seedUtils";

import { executeAndLogTime } from "./executeAndLogTime";
import { findGuangyunEntriesByShinjitai } from "./findGuangyunEntriesByShinjitai";

export async function seedKanjisenseFigureReadings(
  prisma: PrismaClient,
  version: number,
  force = false,
) {
  await runSetupStep({
    version,
    force,
    prisma,
    step: "KanjisenseFigureReading",
    async setup() {
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

      const figuresNeedingReadingsKeys = Array.from(
        await prisma.kanjisenseFigure.findMany({
          select: { key: true },
          where: {
            version,
            OR: [
              {
                isStandaloneCharacter: true,
              },
              {
                asComponent: {
                  soundMarkUses: {
                    some: {},
                  },
                },
              },
            ],
          },
        }),
        (f) => f.key,
      );

      console.log(
        `Will look up guangyun entries of ${figuresNeedingReadingsKeys.length} figures.`,
      );

      console.log("preparing variants...");
      const newToOldFiguresKeys = new Map<string, string[]>();
      const newToZVariants14 = new Map<string, string[]>();
      const allOldFiguresKeys = new Set<string>();
      for (const {
        base: newFigure,
        variant: oldFigure,
      } of await prisma.kanjiDbVariant.findMany({
        where: {
          variantType: KanjiDbVariantType.OldStyle,
          base: { in: figuresNeedingReadingsKeys },
        },
      })) {
        allOldFiguresKeys.add(oldFigure);
        if (!newToOldFiguresKeys.has(newFigure)) {
          newToOldFiguresKeys.set(newFigure, []);
        }
        newToOldFiguresKeys.get(newFigure)?.push(oldFigure);
      }

      const sbgyCharactersToXiaoyunNumbers = new Map<string, number[]>();
      for (const {
        xiaoyun,
        exemplars,
      } of await prisma.sbgyXiaoyun.findMany()) {
        for (const exemplar of exemplars) {
          if (!sbgyCharactersToXiaoyunNumbers.has(exemplar)) {
            sbgyCharactersToXiaoyunNumbers.set(exemplar, []);
          }
          sbgyCharactersToXiaoyunNumbers.get(exemplar)!.push(xiaoyun);
        }
      }

      for (const { id: newFigure, kZVariant } of await prisma.unihan14.findMany(
        {
          where: {
            kZVariant: { isEmpty: false },
            id: { in: figuresNeedingReadingsKeys },
          },
          select: { kZVariant: true, id: true },
        },
      )) {
        if (!newToZVariants14.has(newFigure)) {
          newToZVariants14.set(newFigure, []);
        }
        newToZVariants14.get(newFigure)?.push(...kZVariant);
      }

      const figuresKeysToXiaoyunsWithMatchingExemplars =
        await executeAndLogTime(
          "preparing guangyun entries",
          async () =>
            await prepareGuangyunEntries({
              figuresNeedingReadingsKeys,
              prisma,
              newToOldFiguresKeys,
              sbgyCharactersToXiaoyunNumbers,
              newToZVariants14,
            }),
        );

      const dbInput = await executeAndLogTime("preparing readings", () =>
        prepareReadings(
          version,
          figuresNeedingReadingsKeys,
          figuresKeysToXiaoyunsWithMatchingExemplars,
          kanjidicEntries,
          unihan15Keys,
        ),
      );

      await executeAndLogTime("deleting old readings", () =>
        prisma.kanjisenseFigureReading.deleteMany({
          where: { version },
        }),
      );

      await executeAndLogTime("creating readings", () =>
        prisma.kanjisenseFigureReading.createMany({
          data: dbInput,
        }),
      );

      await executeAndLogTime("hooking up figures", async () => {
        const readingsIds = await prisma.kanjisenseFigureReading
          .findMany({
            select: { id: true },
            where: { version },
          })
          .then((rs) => rs.map((r) => r.id));
        const figuresIds = await prisma.kanjisenseFigure
          .findMany({
            select: { id: true },
            where: {
              id: {
                in: readingsIds,
              },
            },
          })
          .then((fs) => fs.map((f) => f.id));

        for (const id of figuresIds) {
          await prisma.kanjisenseFigure.update({
            where: { id: id },
            data: { readingId: id },
          });
        }
      });

      await executeAndLogTime("hooking up guangyun entries", async () => {
        await prisma.kanjisenseFigureReadingToSbgyXiaoyun.createMany({
          data: [...figuresKeysToXiaoyunsWithMatchingExemplars].flatMap(
            ([figureKey, xiaoyuns]) =>
              Array.from(xiaoyuns.keys(), (sbgyXiaoyunId) => ({
                figureReadingId: getFigureId(version, figureKey),
                sbgyXiaoyunId,
              })),
          ),
        });
      });
    },
  });

  console.log(`KanjisenseFigureReading seeded. 🌱`);

  async function prepareReadings(
    version: number,
    figuresNeedingReadingsKeys: string[],
    figuresKeysToXiaoyunsWithMatchingExemplars: Map<
      string,
      Map<
        number,
        {
          xiaoyun: SbgyXiaoyun;
          matchingExemplars: Set<string>;
        }
      >
    >,
    kanjidicEntries: Map<string, Pick<KanjidicEntry, "id" | "onReadings">>,
    unihan15Keys: Set<string>,
  ) {
    const joyoWikipediaText = readFileSync(files.joyoWikipediaTsv, "utf-8");
    const joyoWikipedia = new Map(
      joyoWikipediaText
        .split("\n")
        .slice(1)
        .map((lineText) => {
          const line = lineText.split("\t");
          const kanji = line[1];
          const readings = line[8].split("、");
          const onyomi = readings
            .filter((r) => r.match(/^[ア-ン]+$/))
            .map((r) => r.replace(/[（）]|(\[\d+\])/g, ""));
          return [kanji, onyomi];
        }),
    );

    const dbInput: {
      id: string;
      key: string;
      version: number;
      kanjidicEntryId: string | null;
      unihan15Id: string | null;
      inferredOnReadingCandidates: OnReadingToTypeToXiaoyuns;
      sbgyXiaoyunsMatchingExemplars: Record<string, string[]>;
      selectedOnReadings: string[];
    }[] = [];
    for (const readingFigureKey of figuresNeedingReadingsKeys) {
      const inferredOnyomiForFigure = getInferredOnReadings(
        figuresKeysToXiaoyunsWithMatchingExemplars.get(readingFigureKey) ||
          null,
      );

      const inferredOnReadingCandidates: OnReadingToTypeToXiaoyuns = {};
      for (const [
        modernKatakanaOnReading,
        typeToXiaoyuns,
      ] of inferredOnyomiForFigure) {
        for (const [type, xiaoyunsWithExemplars] of typeToXiaoyuns) {
          for (const { xiaoyun } of xiaoyunsWithExemplars) {
            const classifications =
              inferredOnReadingCandidates[modernKatakanaOnReading] ||
              (inferredOnReadingCandidates[modernKatakanaOnReading] = {});
            const xiaoyunsByType = (classifications[type] ||= []);
            xiaoyunsByType.push({
              xiaoyun: xiaoyun.xiaoyun,
              profile: serializeXiaoyunProfile(xiaoyun),
            });
          }
        }
      }

      const selectedOnReadings: string[] = [];
      if (
        isSingleCharacter(readingFigureKey) &&
        (kanjidicEntries.get(readingFigureKey)?.onReadings?.length ?? 0) > 1
      ) {
        const joyoReadings = joyoWikipedia.get(readingFigureKey);
        if (joyoReadings?.length) {
          selectedOnReadings.push(...joyoReadings);
        } else {
          const jmdictEntriesWithKanjiArePresent =
            await prisma.jmDictEntry.count({
              where: { head: { contains: readingFigureKey } },
              take: 1,
            });
          if (jmdictEntriesWithKanjiArePresent) {
            const katakanaKanjidicOnReadings =
              kanjidicEntries.get(readingFigureKey)?.onReadings || [];
            const jmdictEntriesWithKanjidicOnReadings =
              await prisma.jmDictEntry.findMany({
                where: {
                  head: { contains: readingFigureKey },
                  OR: katakanaKanjidicOnReadings.map((katakanaReading) => ({
                    readingText: {
                      contains: katakanaOnyomiToHiragana(katakanaReading),
                    },
                  })),
                },
              });
            for (const katakanaKanjidicOnReading of katakanaKanjidicOnReadings) {
              if (
                jmdictEntriesWithKanjidicOnReadings.some((jmdictEntry) =>
                  jmdictEntry.readingText.includes(
                    katakanaOnyomiToHiragana(katakanaKanjidicOnReading),
                  ),
                )
              )
                selectedOnReadings.push(katakanaKanjidicOnReading);
            }
          }
        }
      }

      const sbgyXiaoyunsMatchingExemplars: Record<string, string[]> = {};
      for (const [
        xiaoyun,
        { matchingExemplars },
      ] of figuresKeysToXiaoyunsWithMatchingExemplars
        .get(readingFigureKey)
        ?.entries() || []) {
        sbgyXiaoyunsMatchingExemplars[xiaoyun] ||= [];
        sbgyXiaoyunsMatchingExemplars[xiaoyun].push(...matchingExemplars);
      }

      dbInput.push({
        id: getFigureId(version, readingFigureKey),
        key: readingFigureKey,
        version,
        kanjidicEntryId: kanjidicEntries.has(readingFigureKey)
          ? readingFigureKey
          : null,
        unihan15Id: unihan15Keys.has(readingFigureKey)
          ? readingFigureKey
          : null,
        inferredOnReadingCandidates,
        sbgyXiaoyunsMatchingExemplars,
        selectedOnReadings,
      });
    }
    return dbInput;
  }
}
function isSingleCharacter(readingFigureKey: string) {
  return [...readingFigureKey].length === 1;
}

function getInferredOnReadings(
  xiaoyunsWithMatchingExemplars: Map<
    number,
    { xiaoyun: SbgyXiaoyun; matchingExemplars: Set<string> }
  > | null,
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
  if (!xiaoyunsWithMatchingExemplars)
    return inferredOnyomiModernKatakanaToTypeToXiaoyuns;
  for (const [
    ,
    xiaoyunWithMatchingExemplars,
  ] of xiaoyunsWithMatchingExemplars) {
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
  figuresNeedingReadingsKeys,
  prisma,
  newToOldFiguresKeys,
  sbgyCharactersToXiaoyunNumbers,
  newToZVariants14,
}: {
  figuresNeedingReadingsKeys: string[];
  prisma: PrismaClient;
  newToOldFiguresKeys: Map<string, string[]>;
  sbgyCharactersToXiaoyunNumbers: Map<string, number[]>;
  newToZVariants14: Map<string, string[]>;
}) {
  const figuresKeysToXiaoyunsWithMatchingExemplars = new Map<
    FigureKey,
    Map<
      number,
      {
        xiaoyun: SbgyXiaoyun;
        matchingExemplars: Set<string>;
      }
    >
  >();
  for (const figureKey of figuresNeedingReadingsKeys) {
    const guangyunEntries = await findGuangyunEntriesByShinjitai(
      prisma,
      newToOldFiguresKeys,
      sbgyCharactersToXiaoyunNumbers,
      newToZVariants14,
      figureKey,
    );
    for (const [
      xiaoyunNumber,
      { xiaoyun, matchingExemplars },
    ] of guangyunEntries) {
      const xiaoyunsToExemplars =
        figuresKeysToXiaoyunsWithMatchingExemplars.get(figureKey) ||
        new Map<
          number,
          {
            xiaoyun: SbgyXiaoyun;
            matchingExemplars: Set<string>;
          }
        >();
      figuresKeysToXiaoyunsWithMatchingExemplars.set(
        figureKey,
        xiaoyunsToExemplars,
      );

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
  return figuresKeysToXiaoyunsWithMatchingExemplars;
}

const katakanaToHiraganaOnCache = new Map<string, string>();
function katakanaOnyomiToHiragana(katakanaOnReading: string) {
  const cached = katakanaToHiraganaOnCache.get(katakanaOnReading);
  if (cached) return cached;
  const hiragana = katakanaOnReading
    .split("")
    .map((c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .join("");
  katakanaToHiraganaOnCache.set(katakanaOnReading, hiragana);
  return hiragana;
}
