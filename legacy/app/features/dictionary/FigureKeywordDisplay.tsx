import { KanjisenseFigure } from "@prisma/client";

import {
  IsPriorityComponentQueryFigure,
  StandaloneCharacterVariantQueryFigure,
  isStandaloneCharacterVariant,
} from "~/features/dictionary/badgeFigure";

export function FigureKeywordDisplay({
  figure,
}: {
  figure: KeywordDisplayFigure;
}) {
  if (!figure.mnemonicKeyword) return <>{figure.keyword}</>;

  const mnemonicKeywordWithoutReference =
    figure.mnemonicKeyword.split(" {{")[0];

  if (figure.mnemonicKeyword === figure.keyword)
    return <i>&quot;{mnemonicKeywordWithoutReference}&quot;</i>;

  if (isStandaloneCharacterVariant(figure))
    return (
      <>
        {figure.keyword} <i>&quot;{mnemonicKeywordWithoutReference}&quot;</i>
      </>
    );

  return <i>&quot;{mnemonicKeywordWithoutReference}&quot;</i>;
}
export type KeywordDisplayFigure = Pick<
  KanjisenseFigure,
  "keyword" | "mnemonicKeyword" | "listsAsCharacter"
> &
  IsPriorityComponentQueryFigure &
  StandaloneCharacterVariantQueryFigure;
