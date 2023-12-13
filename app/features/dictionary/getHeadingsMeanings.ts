import {
  StandaloneCharacterVariantQueryFigure,
  isStandaloneCharacterVariant,
} from "~/features/dictionary/badgeFigure";
import type { DictionaryPageFigureWithPriorityUses } from "~/features/dictionary/getDictionaryPageFigure.server";

export function parseAnnotatedKeywordText(
  annotatedKeywordText: string,
): HeadingComponentMnemonic {
  if (!annotatedKeywordText.includes("{{"))
    return {
      text: annotatedKeywordText,
      reference: null,
      referenceTypeText: null,
    };
  const match =
    annotatedKeywordText?.match(/^(.+?)( \{\{(cf\.|via) (.)}})?$/) ?? [];
  if (!match)
    throw new Error(
      "Invalid annotated keyword text " + JSON.stringify(annotatedKeywordText),
    );
  const [, text, , referenceTypeText, reference] = match;
  return {
    text,
    reference: reference || null,
    referenceTypeText:
      (referenceTypeText as HeadingComponentMnemonic["referenceTypeText"]) ||
      null,
  };
}

export function getHeadingsMeanings(
  figure: Pick<
    DictionaryPageFigureWithPriorityUses,
    "keyword" | "mnemonicKeyword" | "meaning" | "isPriority"
  > &
    StandaloneCharacterVariantQueryFigure,
): HeadingMeanings {
  const mnemonicKeyword = figure.mnemonicKeyword;
  const componentMnemonic = mnemonicKeyword
    ? parseAnnotatedKeywordText(mnemonicKeyword)
    : null;

  if (isStandaloneCharacterVariant(figure)) {
    const currentCharacterMeanings: string[] = [];
    currentCharacterMeanings.push(figure.keyword);
    if (figure.meaning?.kanjidicEnglish?.length)
      currentCharacterMeanings.push(
        ...figure.meaning.kanjidicEnglish.filter((m) => m !== figure.keyword),
      );
    if (!currentCharacterMeanings.length && figure.meaning?.unihanDefinition)
      currentCharacterMeanings.push(figure.meaning.unihanDefinition);

    return {
      currentCharacter: currentCharacterMeanings,
      componentMnemonic,
    };
  }

  if (!figure.mnemonicKeyword)
    return { componentHistoricalMeaning: figure.keyword };

  const characterMeanings: string[] = [];
  if (figure.meaning?.kanjidicEnglish?.length)
    characterMeanings.push(
      ...figure.meaning.kanjidicEnglish.filter((m) => m !== figure.keyword),
    );
  if (!characterMeanings.length && figure.meaning?.unihanDefinition)
    characterMeanings.push(figure.meaning.unihanDefinition);

  return {
    componentMnemonic: componentMnemonic || {
      text: figure.keyword,
      reference: null,
      referenceTypeText: null,
    },
    obsoleteCharacter: characterMeanings.length ? characterMeanings : null,
  };
}
type HeadingMeanings =
  | {
      currentCharacter: string[];
      componentMnemonic: HeadingComponentMnemonic | null;
      obsoleteCharacter?: null;
      componentHistoricalMeaning?: null;
    }
  | {
      componentMnemonic: HeadingComponentMnemonic;
      obsoleteCharacter: string[] | null;
      currentCharacter?: null;
      componentHistoricalMeaning?: null;
    }
  | {
      componentHistoricalMeaning: string;
      componentMnemonic?: null;
      obsoleteCharacter?: null;
      currentCharacter?: null;
    };
interface HeadingComponentMnemonic {
  text: string;
  reference?: string | null;
  referenceTypeText?: "cf." | "via" | null;
}
