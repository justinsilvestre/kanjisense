import { KanjisenseFigureRelation, PrismaClient } from "@prisma/client";

const RADICAL_ENTRY_REGEX = /radical \(no\.|radical number/;
export async function getFigureMeaningsText(
  prisma: PrismaClient,
  figure: KanjisenseFigureRelation,
  mnemonicKeywords: ComponentMeaning | null,
) {
  const figureId = figure.id;
  const unihanDefinitionLookup = prisma.unihan15.findUnique({
    where: { id: figureId },
    select: { kDefinition: true },
  });
  const kanjidicEnglishLookup = prisma.kanjidicEntry.findUnique({
    where: { id: figureId },
    select: { definitions: true },
  });

  const historicalKeyword =
    mnemonicKeywords?.historical && mnemonicKeywords.historical !== "(various)"
      ? mnemonicKeywords.historical
      : null;
  let mnemonicSource = "";
  if (mnemonicKeywords?.reference)
    mnemonicSource = ` {{cf. ${mnemonicKeywords.reference}}}`;
  else if (mnemonicKeywords?.standin)
    mnemonicSource = ` {{via ${mnemonicKeywords.standin}}}`;

  const unihanDefinitionText =
    (await unihanDefinitionLookup)?.kDefinition || null;
  const kanjidicEnglish =
    (await kanjidicEnglishLookup)?.definitions?.filter(
      (e) => !RADICAL_ENTRY_REGEX.test(e),
    ) || [];
  const mnemonicKeyword = mnemonicKeywords?.mnemonic
    ? [mnemonicKeywords.mnemonic, mnemonicSource].join("")
    : null;
  const historicalKeywordOrDefinition =
    (historicalKeyword ||
      kanjidicEnglish?.[0] ||
      unihanDefinitionText?.split("; ")?.[0]) ??
    null;

  const meaning = {
    unihanDefinitionText,
    kanjidicEnglish,
    keyword: historicalKeywordOrDefinition || mnemonicKeyword,
    mnemonicKeyword: !historicalKeywordOrDefinition ? mnemonicKeyword : null,
  };

  if (
    !meaning.unihanDefinitionText &&
    !meaning.kanjidicEnglish.length &&
    !meaning.keyword &&
    !meaning.mnemonicKeyword
  )
    return null;
  return meaning;
}

export interface ComponentMeaning {
  /** historical meaning */
  historical?: string;
  /** mnemonic keyword, if historical meaning is absent or different */
  mnemonic?: string;
  /** for this component's mnemonic keyword, it borrows the meaning of a common kanji containing it. */
  standin?: string;
  /** this component derives its mnemonic keyword from a common kanji using it. */
  reference?: string;
  /** for grouping components by meaning */
  tag?: string | null;
}
