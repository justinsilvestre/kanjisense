import {
  FigureSearchPropertyType,
  KanjidicEntry,
  KanjisenseFigure,
  KanjisenseFigureMeaning,
  KanjisenseFigureReading,
} from "@prisma/client";

import { getHeadingsMeanings } from "~/features/dictionary/getHeadingsMeanings";
import { kanjidicKanaToRomaji } from "~/features/dictionary/kanjidicKanaToRomaji";

import { SearchPropertySpecs } from "./SearchPropertySpecs";
export const kanjidicReadingNonKanaChars = /-/g;
export const readingCodes = /[a-z0-9]+$/;

type SearchPropertiesFigure = KanjisenseFigure & {
  reading:
    | (KanjisenseFigureReading & {
        kanjidicEntry: KanjidicEntry | null;
      })
    | null;
  meaning: KanjisenseFigureMeaning | null;
};

export function getFigureSearchProperties(
  figureKey: string,
  sources: ReturnType<typeof getFigureSearchPropertySources>,
) {
  const { kunyomi, onyomi, english, mnemonic, variants } = sources;
  const searchProperties: {
    [key in FigureSearchPropertyType]?: SearchPropertySpecs[];
  } = {
    [FigureSearchPropertyType.KEY]: [
      SearchPropertySpecs.create(FigureSearchPropertyType.KEY, figureKey, 0),
    ],
  };
  function addSearchProperty(...newProperties: SearchPropertySpecs[]) {
    for (const searchProperty of newProperties) {
      if (searchProperties[searchProperty.type]) {
        searchProperties[searchProperty.type]!.push(searchProperty);
      } else {
        searchProperties[searchProperty.type] = [searchProperty];
      }
    }
  }

  try {
    if (kunyomi?.length) {
      let kunIndex = 0;
      for (const rawReading of kunyomi) {
        const reading = rawReading.replaceAll(kanjidicReadingNonKanaChars, "");
        const readingWithoutDot = reading.replace(".", "");
        const inflected = reading !== readingWithoutDot;
        if (!inflected) {
          addSearchProperty(
            SearchPropertySpecs.create(
              FigureSearchPropertyType.KUNYOMI_KANA,
              readingWithoutDot,
              kunIndex,
            ),
            SearchPropertySpecs.create(
              FigureSearchPropertyType.KUNYOMI_LATIN,
              kanjidicKanaToRomaji(readingWithoutDot),
              kunIndex,
            ),
          );
        } else {
          const [segmentBeforeDot, segmentAfterdot] = reading.split(".");
          addSearchProperty(
            SearchPropertySpecs.create(
              FigureSearchPropertyType.KUNYOMI_KANA_WITH_OKURIGANA,
              readingWithoutDot,
              kunIndex,
              segmentAfterdot,
            ),
            SearchPropertySpecs.create(
              FigureSearchPropertyType.KUNYOMI_KANA_MINUS_OKURIGANA,
              segmentBeforeDot,
              kunIndex,
            ),
            SearchPropertySpecs.create(
              FigureSearchPropertyType.KUNYOMI_LATIN_WITH_OKURIGANA,
              kanjidicKanaToRomaji(reading),
              kunIndex,
              kanjidicKanaToRomaji(segmentAfterdot),
            ),
            SearchPropertySpecs.create(
              FigureSearchPropertyType.KUNYOMI_LATIN_MINUS_OKURIGANA,
              kanjidicKanaToRomaji(segmentBeforeDot),
              kunIndex,
            ),
          );
        }
        kunIndex++;
      }
    }

    if (onyomi?.length) {
      let onIndex = 0;
      for (const readingWithCodes of onyomi) {
        const reading = readingWithCodes
          .replace(readingCodes, "")
          .replaceAll(kanjidicReadingNonKanaChars, "");
        addSearchProperty(
          SearchPropertySpecs.create(
            FigureSearchPropertyType.ONYOMI_KANA,
            katakanaToHiragana(reading),
            onIndex,
          ),
          SearchPropertySpecs.create(
            FigureSearchPropertyType.ONYOMI_LATIN,
            kanjidicKanaToRomaji(reading),
            onIndex,
          ),
        );
        onIndex++;
      }
    }

    let enIndex = 0;
    if (english?.length) {
      for (const meaning of english) {
        addSearchProperty(
          SearchPropertySpecs.create(
            FigureSearchPropertyType.TRANSLATION_ENGLISH,
            meaning,
            enIndex++,
          ),
        );
      }
    }
    if (mnemonic) {
      addSearchProperty(
        SearchPropertySpecs.create(
          FigureSearchPropertyType.MNEMONIC_ENGLISH,
          mnemonic,
          enIndex,
        ),
      );
    }

    if (variants?.length) {
      let variantIndex = 0;
      for (const variant of variants) {
        addSearchProperty(
          SearchPropertySpecs.create(
            FigureSearchPropertyType.VARIANT,
            variant.id,
            variantIndex++,
          ),
        );
      }
    }

    return searchProperties;
  } catch (e) {
    console.error(figureKey, e);
    throw new Error(
      `Error while processing figure search properties for ${figureKey}`,
    );
  }
}

export function getFigureSearchPropertySources(
  figure: SearchPropertiesFigure,
  variants: SearchPropertiesFigure[],
) {
  const kunyomi = figure.isStandaloneCharacter
    ? figure.reading?.kanjidicEntry?.kunReadings
    : null;
  const onyomi = figure.reading?.selectedOnReadings?.length
    ? figure.reading.selectedOnReadings
    : figure.reading?.kanjidicEntry?.onReadings;
  const mnemonic = figure.mnemonicKeyword ?? null;

  const kanjidicEnglish =
    (figure.isStandaloneCharacter || null) && figure.meaning?.kanjidicEnglish;
  const english: string[] = [];

  const headingsMeanings = getHeadingsMeanings(figure);

  const nonObsoleteKanjisenseHistoricalMeaning =
    // (figure.isStandaloneCharacter || !figure.mnemonicKeyword) &&
    // figure.meaning?.kanjisenseHistorical;
    headingsMeanings.currentCharacter ||
    (headingsMeanings.componentHistoricalMeaning
      ? [headingsMeanings.componentHistoricalMeaning]
      : null);
  if (nonObsoleteKanjisenseHistoricalMeaning) {
    english.push(...nonObsoleteKanjisenseHistoricalMeaning);
  }

  english.push(...(kanjidicEnglish ?? []).filter((e) => !english.includes(e)));
  // if (new Set("显㬎艹").has(figure.key)) {
  //   console.log(figure.key, {
  //     kunyomi,
  //     onyomi,
  //     english,
  //     mnemonic,
  //     variants,
  //   });
  // }

  return {
    kunyomi,
    onyomi,
    english,
    mnemonic,
    variants,
  };
}

export function katakanaToHiragana(str: string) {
  return str.replace(/[\u30a1-\u30f6]/g, (match) =>
    String.fromCharCode(match.charCodeAt(0) - 0x60),
  );
}
