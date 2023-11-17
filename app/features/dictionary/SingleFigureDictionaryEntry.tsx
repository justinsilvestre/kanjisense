import { KanjisenseFigure } from "@prisma/client";

import { FigureBadge } from "~/components/FigureBadge";
import {
  IsPriorityComponentQueryFigure,
  StandaloneCharacterVariantQueryFigure,
  getBadgeProps,
  getLists,
  isPriorityComponent,
  isPrioritySoundMark,
  isStandaloneCharacterVariant,
} from "~/features/dictionary/badgeFigure";
import type { DictionaryPageFigureWithPriorityUses } from "~/features/dictionary/getDictionaryPageFigure.server";
import { getHeadingsMeanings } from "~/features/dictionary/getHeadingsMeanings";
import { transcribeSbgyXiaoyun } from "~/features/dictionary/transcribeSbgyXiaoyun";

import { DictionaryEntryComponentsTree } from "./DictionaryEntryComponentsTree";
import { DictionaryHeadingMeanings } from "./DictionaryHeadingMeanings";
import { FigurePriorityUses } from "./FigurePriorityUses";
import { FigureTags } from "./FigureTags";

export function SingleFigureDictionaryEntry({
  figure,
}: {
  figure: DictionaryPageFigureWithPriorityUses;
}) {
  const badgeProps = getBadgeProps(figure);
  const figureIsStandaloneCharacter = badgeProps.isStandaloneCharacter;
  const figureIsPrioritySoundMark = isPrioritySoundMark(figure);
  return (
    <section className={`${figure.isPriority ? "" : "bg-gray-200"}`}>
      <h1>
        {figure.id}: <FigureKeywordDisplay figure={figure} />
      </h1>
      <div>
        <FigureBadge id={figure.id} badgeProps={badgeProps} width={10} />
      </div>

      <DictionaryHeadingMeanings
        headingsMeanings={getHeadingsMeanings(figure)}
      />
      <DictionaryEntryComponentsTree figure={figure} />

      <FigureTags
        badgeProps={badgeProps}
        lists={getLists(figureIsStandaloneCharacter, figure)}
        isSoundMark={figureIsPrioritySoundMark}
        isAtomic={figureIsAtomic(figure)}
      />

      <h2>{figure.reading?.selectedOnReadings?.join(" ") || "-"}</h2>
      <h2>{figure.reading?.kanjidicEntry?.onReadings?.join(" ")}</h2>
      <h2>{figure.reading?.kanjidicEntry?.kunReadings?.join(" ")}</h2>
      <h2>
        {figure.reading?.sbgyXiaoyuns
          ?.map((x) => transcribeSbgyXiaoyun(x.sbgyXiaoyun))
          ?.join(" ")}
      </h2>

      <h2>priority: {figure.isPriority ? "yes" : "no"}</h2>
      <h2>standalone: {figureIsStandaloneCharacter ? "yes" : "no"}</h2>
      <h2>priority sound mark: {isPrioritySoundMark(figure) ? "yes" : "no"}</h2>
      <h2>priority component: {isPriorityComponent(figure) ? "yes" : "no"}</h2>
      <h2>active sound mark value: {figure.activeSoundMarkValue}</h2>
      <FigurePriorityUses
        componentFigure={figure}
        priorityUses={figure.firstClassUses}
      />
    </section>
  );
}

type KeywordDisplayFigure = Pick<
  KanjisenseFigure,
  "keyword" | "mnemonicKeyword" | "listsAsCharacter"
> &
  IsPriorityComponentQueryFigure &
  StandaloneCharacterVariantQueryFigure;

function figureIsAtomic(figure: DictionaryPageFigureWithPriorityUses): boolean {
  return Array.isArray(figure.componentsTree)
    ? figure.componentsTree.length === 0
    : false;
}

export function FigureKeywordDisplay({
  figure,
}: {
  figure: KeywordDisplayFigure;
}) {
  if (!figure.mnemonicKeyword) return <>{figure.keyword}</>;

  const mnemonicKeywordWithoutReference =
    figure.mnemonicKeyword.split(" {{")[0];

  if (figure.mnemonicKeyword === figure.keyword)
    return <>&quot;{mnemonicKeywordWithoutReference}&quot;</>;

  if (isStandaloneCharacterVariant(figure))
    return (
      <>
        {figure.keyword} &quot;{mnemonicKeywordWithoutReference}&quot;
      </>
    );

  return <>&quot;{mnemonicKeywordWithoutReference}&quot;</>;
}
