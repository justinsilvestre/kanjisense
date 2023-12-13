import { KanjisenseFigureRelation, PrismaClient } from "@prisma/client";

const RADICAL_ENTRY_REGEX = /radical \(no\.|radical number/;
export async function getFigureMeaningsText(
  prisma: PrismaClient,
  figure: KanjisenseFigureRelation,
  componentMeaning: ComponentMeaning | null,
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
    componentMeaning?.historical && componentMeaning.historical !== "(various)"
      ? componentMeaning.historical
      : null;
  let mnemonicSource = "";
  if (componentMeaning?.reference)
    mnemonicSource = ` {{cf. ${componentMeaning.reference}}}`;
  else if (componentMeaning?.standin)
    mnemonicSource = ` {{via ${componentMeaning.standin}}}`;
  else if (componentMeaning?.full)
    mnemonicSource = ` {{cf. ${componentMeaning.full}}}`;
  const unihanDefinitionText =
    (await unihanDefinitionLookup)?.kDefinition || null;
  const kanjidicEnglish =
    (await kanjidicEnglishLookup)?.definitions?.filter(
      (e) => !RADICAL_ENTRY_REGEX.test(e),
    ) || [];
  const mnemonicKeyword =
    componentMeaning?.mnemonic || (componentMeaning && mnemonicSource)
      ? [
          componentMeaning.mnemonic || componentMeaning.historical,
          mnemonicSource,
        ].join("")
      : null;
  const historicalKeywordOrDefinition =
    (historicalKeyword ||
      kanjidicEnglish?.[0] ||
      unihanDefinitionText?.split("; ")?.[0]) ??
    null;

  const keyword = historicalKeywordOrDefinition || mnemonicKeyword;
  const meaning = {
    unihanDefinitionText,
    kanjidicEnglish,
    keyword: keyword,
    mnemonicKeyword: mnemonicKeyword || null,
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
  /** this component is no longer used as a character in favor of this standalone character with added components */
  full?: string;
  /** this component derives its mnemonic keyword from a common kanji using it. */
  reference?: string;
  /** for grouping components by meaning */
  tag?: string | null;
}
