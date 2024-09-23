import { readFileSync } from "fs";

import { KanjidicEntry, PrismaClient, SbgyXiaoyun } from "@prisma/client";

import { getSeedInterface, SeedInterface } from "prisma/SeedInterface";
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
    seedInterface: getSeedInterface(prisma),
    step: "KanjisenseFigureReading",
    async setup(seedInterface) {
      const kanjidicEntries = new Map(
        Array.from(
          await seedInterface.kanjidicEntry.findManyHavingOnReadings(),
          (e) => [e.id, e],
        ),
      );
      const unihan15Keys = new Set(
        Array.from(await seedInterface.unihan15.findMany(), (e) => e.id),
      );

      const figuresNeedingReadingsKeys = Array.from(
        await seedInterface.kanjisenseFigure.findManyBeingStandaloneCharacterOrSoundComponent(
          version,
        ),
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
      } of await seedInterface.kanjiDbVariant.findManyBeingOldVariantOf(
        figuresNeedingReadingsKeys,
      )) {
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
      } of await seedInterface.sbgyXiaoyun.findManyAll()) {
        for (const exemplar of exemplars) {
          if (!sbgyCharactersToXiaoyunNumbers.has(exemplar)) {
            sbgyCharactersToXiaoyunNumbers.set(exemplar, []);
          }
          sbgyCharactersToXiaoyunNumbers.get(exemplar)!.push(xiaoyun);
        }
      }

      for (const {
        id: newFigure,
        kZVariant,
      } of await seedInterface.unihan14.findManyHavingKZVariantWithin(
        figuresNeedingReadingsKeys,
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
              seedInterface,
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
          seedInterface,
        ),
      );

      await executeAndLogTime("deleting old readings", () =>
        seedInterface.kanjisenseFigureReading.deleteMany(version),
      );

      await executeAndLogTime("creating readings", () =>
        seedInterface.kanjisenseFigureReading.createMany(dbInput),
      );

      await executeAndLogTime("hooking up figures", async () => {
        const readingsIds = await seedInterface.kanjisenseFigureReading
          .findManySelectIds(version)
          .then((rs) => rs.map((r) => r.id));
        const figuresIds = await seedInterface.kanjisenseFigure
          .findManyByIdsSelectIds(version, readingsIds)
          .then((fs) => fs.map((f) => f.id));

        for (const id of figuresIds) {
          await seedInterface.kanjisenseFigureReading.updateKanjisenseFigureReadingId(
            id,
            id,
          );
        }
      });

      await executeAndLogTime("hooking up guangyun entries", async () => {
        await seedInterface.kanjisenseFigureReadingToSbgyXiaoyun.createMany(
          [...figuresKeysToXiaoyunsWithMatchingExemplars].flatMap(
            ([figureKey, xiaoyuns]) =>
              Array.from(xiaoyuns.keys(), (sbgyXiaoyunId) => ({
                figureReadingId: getFigureId(version, figureKey),
                sbgyXiaoyunId,
              })),
          ),
        );
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
    seedInterface: SeedInterface,
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

      const katakanaKanjidicOnReadings =
        kanjidicEntries.get(readingFigureKey)?.onReadings;

      if (
        katakanaKanjidicOnReadings &&
        katakanaKanjidicOnReadings.length > 1 &&
        isSingleCharacter(readingFigureKey)
      ) {
        const joyoReadings = joyoWikipedia.get(readingFigureKey);
        if (joyoReadings?.length) {
          selectedOnReadings.push(...joyoReadings);
        } else {
          const jmdictEntriesWithKanjidicOnReadings =
            await seedInterface.jmDictEntry.findManyWithHeadContainingStringAndOnReadingMatching(
              readingFigureKey,
              katakanaKanjidicOnReadings,
              katakanaOnyomiToHiragana,
            );
          for (const katakanaKanjidicOnReading of katakanaKanjidicOnReadings) {
            const hiraganaOnReading = katakanaOnyomiToHiragana(
              katakanaKanjidicOnReading,
            );
            if (
              jmdictEntriesWithKanjidicOnReadings.some((jmdictEntry) =>
                jmdictEntry.readingText.includes(hiraganaOnReading),
              )
            )
              selectedOnReadings.push(katakanaKanjidicOnReading);
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
  seedInterface,
  newToOldFiguresKeys,
  sbgyCharactersToXiaoyunNumbers,
  newToZVariants14,
}: {
  figuresNeedingReadingsKeys: string[];
  seedInterface: SeedInterface;
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
      seedInterface,
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
  const hiragana = Array.from(katakanaOnReading, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0x60),
  ).join("");
  katakanaToHiraganaOnCache.set(katakanaOnReading, hiragana);
  return hiragana;
}
