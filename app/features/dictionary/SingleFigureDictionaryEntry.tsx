/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { KanjisenseFigure, KanjisenseFigureImageType } from "@prisma/client";
import { useState, useRef, createElement, useEffect } from "react";

import { FigureBadge, kvgAttributes } from "~/components/FigureBadge";
import {
  IsPriorityComponentQueryFigure,
  StandaloneCharacterVariantQueryFigure,
  getBadgeProps,
  isPriorityComponent,
  isPrioritySoundMark,
  isStandaloneCharacterVariant,
} from "~/features/dictionary/badgeFigure";
import type { DictionaryPageFigureWithPriorityUses } from "~/features/dictionary/getDictionaryPageFigure.server";
import { getHeadingsMeanings } from "~/features/dictionary/getHeadingsMeanings";
import { transcribeSbgyXiaoyun } from "~/features/dictionary/transcribeSbgyXiaoyun";

import { DictEntryReadings } from "./DictEntryReadings";
import { DictionaryEntryComponentsTree } from "./DictionaryEntryComponentsTree";
import { DictionaryHeadingMeanings } from "./DictionaryHeadingMeanings";
import { FigurePriorityUses } from "./FigurePriorityUses";
import { FigureTags } from "./FigureTags";
import styles from "./kvg.css";
import { KvgJsonData } from "./KvgJsonData";

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

function FigureStrokesAnimation({
  kvg,
  className,
}: {
  kvg: KvgJsonData;

  className?: string;
}) {
  const [strokesProgress, setStrokesProgress] = useState(0);
  const maxProgress = (kvg?.p.length || 0) + 2;

  const pathLengths = useRef<number[]>([]);

  const showBackground = true;

  const animating = useRef<ReturnType<typeof setTimeout>>();
  const continueStrokesProgress = () =>
    setStrokesProgress((progress) =>
      progress >= maxProgress ? 0 : progress + 1,
    );

  function startAnimation() {
    continueStrokesProgress();
    animating.current = setTimeout(() => {
      if (animating) startAnimation();
    }, 700);
  }
  function stopAnimation() {
    clearTimeout(animating.current);
    animating.current = undefined;
  }

  useEffect(() => {
    startAnimation();
    return () => stopAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const strokeProgressForStrokeAtIndex = (index: number) => index + 2;
  const fadeTransition = {
    opacity: showBackground ? 1 : 0,
    transition: "all .5s",
  };
  return (
    <>
      {createElement(
        "svg",
        {
          className,
          ...kvgAttributes,
          viewBox: "0 0 109 109",

          style: {
            ...kvgAttributes.style,
            ...(showBackground
              ? {
                  // boxShadow: "5px 5px 10px 5px #00000033",
                }
              : null),
          },
          onMouseDown: (e) => {
            e.preventDefault();
          },
        },
        createElement("rect", {
          x: 0,
          y: 0,
          width: "100%",
          height: "100%",
          fill: "white",
          stroke: "#00000011",
          style: fadeTransition,
        }),
        createElement("line", {
          x1: "50%",
          y1: "0",
          x2: "50%",
          y2: "100%",
          stroke: "#3333aa55",
          strokeWidth: "2",
          strokeDasharray: "1,3.5",
          style: fadeTransition,
        }),
        createElement("line", {
          x1: "0%",
          y1: "50%",
          x2: "100%",
          y2: "50%",
          stroke: "#3333aa55",
          strokeWidth: "2",
          strokeDasharray: "1,3.5",
          style: fadeTransition,
        }),
        strokesProgress > 0 &&
          kvg.p
            .flatMap((d, strokeIndex) =>
              [
                createElement("path", {
                  d,
                  key: d,
                  style: {
                    stroke:
                      strokesProgress ===
                      strokeProgressForStrokeAtIndex(strokeIndex)
                        ? "#9f9d48"
                        : "#000000",
                  },
                }),
                createElement("path", {
                  d,
                  key: `${strokeIndex}-inside`,
                  style: {
                    stroke:
                      strokesProgress ===
                      strokeProgressForStrokeAtIndex(strokeIndex)
                        ? "#ffff00"
                        : "#ffffffbb",
                    strokeWidth: 2,
                  },
                }),
              ].reverse(),
            )
            .reverse(),
        kvg.p.map((d, strokeIndex) =>
          createElement("path", {
            d,
            key: d,
            ref: (el: SVGPathElement) =>
              (pathLengths.current[strokeIndex] = el?.getTotalLength()),
            style: {
              ...(strokesProgress >=
                strokeProgressForStrokeAtIndex(strokeIndex) || !strokesProgress
                ? undefined
                : { display: "none" }),
              "--kvg-stroke-dashoffset": `${pathLengths?.current[strokeIndex]}`,
              "--kvg-stroke-dasharray": `${pathLengths?.current[strokeIndex]} ${pathLengths?.current[strokeIndex]}`,
            },
            className:
              strokesProgress &&
              strokesProgress >= strokeProgressForStrokeAtIndex(strokeIndex)
                ? "kvg-stroke"
                : "",
          }),
        ),
      )}
    </>
  );
}
