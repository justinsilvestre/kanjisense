/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { KanjisenseFigure, KanjisenseFigureImageType } from "@prisma/client";
import { useState } from "react";

import { FigureBadge } from "~/components/FigureBadge";
import {
  IsPriorityComponentQueryFigure,
  StandaloneCharacterVariantQueryFigure,
  getBadgeProps,
  isPrioritySoundMark,
  isStandaloneCharacterVariant,
} from "~/features/dictionary/badgeFigure";
import type { DictionaryPageFigureWithPriorityUses } from "~/features/dictionary/getDictionaryPageFigure.server";
import { getHeadingsMeanings } from "~/features/dictionary/getHeadingsMeanings";

import { DictEntryReadings } from "./DictEntryReadings";
import { DictionaryEntryComponentsTree } from "./DictionaryEntryComponentsTree";
import { DictionaryHeadingMeanings } from "./DictionaryHeadingMeanings";
import { ExternalDictionaryLinks } from "./ExternalDictionaryLinks";
import { FigurePriorityUses } from "./FigurePriorityUses";
import { FigureStrokesAnimation } from "./FigureStrokesAnimation";
import { FigureTags } from "./FigureTags";
import styles from "./kvg.css";
import type { KvgJsonData } from "./KvgJsonData";

export const links = () => [{ rel: "stylesheet", href: styles }];

export function SingleFigureDictionaryEntry({
  figure,
}: {
  figure: DictionaryPageFigureWithPriorityUses;
}) {
  const badgeProps = getBadgeProps(figure);
  const figureIsStandaloneCharacter = badgeProps.isStandaloneCharacter;
  const figureIsPrioritySoundMark = isPrioritySoundMark(figure);

  const [animationIsShowing, setAnimationIsShowing] = useState(false);

  return (
    <section className={`${figure.isPriority ? "" : "bg-gray-200"}`}>
      <h1>
        {figure.id}: <FigureKeywordDisplay figure={figure} />
      </h1>
      <div
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        className="relative [width:10.05em] [height:10.05em] cursor-pointer group"
        onClick={() => setAnimationIsShowing((b) => !b)}
        role="img"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setAnimationIsShowing((b) => !b);
          }
        }}
      >
        <FigureBadge id={figure.id} badgeProps={badgeProps} width={10} />
        {animationIsShowing &&
        figure.image?.type === KanjisenseFigureImageType.Kvg ? (
          <>
            <FigureStrokesAnimation
              className="[width:100%] [height:100%] absolute top-0 left-0 bottom-0 right-0 border-solid border border-black"
              kvg={figure.image.content as unknown as KvgJsonData}
            />
          </>
        ) : (
          <></>
        )}
        <button className="absolute bottom-1 p-1 right-1 text-sm bg-slate-300 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100">
          {animationIsShowing ? (
            <>
              <span role="img">◾️</span> stop
            </>
          ) : (
            <>
              <span role="img">▶</span> stroke order
            </>
          )}
        </button>
      </div>

      <DictionaryHeadingMeanings
        headingsMeanings={getHeadingsMeanings(figure)}
      />
      <DictionaryEntryComponentsTree figure={figure} />

      <FigureTags
        badgeProps={badgeProps}
        isSoundMark={figureIsPrioritySoundMark}
        isAtomic={figureIsAtomic(figure)}
      />

      <DictEntryReadings
        figureId={figure.id}
        readings={figure.reading}
        isStandaloneCharacter={figureIsStandaloneCharacter}
      />
      {[...figure.id].length === 1 ? (
        <ExternalDictionaryLinks figureId={figure.id} />
      ) : null}
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
