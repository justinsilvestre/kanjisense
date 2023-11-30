/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { KanjisenseFigure, KanjisenseFigureImageType } from "@prisma/client";
import { useState } from "react";

import { DictLink } from "~/components/AppLink";
import { FigureBadge } from "~/components/FigureBadge";
import { FigurePopoverBadge } from "~/components/FigurePopover";
import {
  BadgeProps,
  IsPriorityComponentQueryFigure,
  StandaloneCharacterVariantQueryFigure,
  getBadgeProps,
  isPrioritySoundMark,
  isStandaloneCharacterVariant,
} from "~/features/dictionary/badgeFigure";
import type { DictionaryPageFigureWithPriorityUses } from "~/features/dictionary/getDictionaryPageFigure.server";
import { getHeadingsMeanings } from "~/features/dictionary/getHeadingsMeanings";

import { AncientCharacterFormSection } from "./AncientCharacterFormSection";
import {
  DictEntryReadings,
  links as readingsStyles,
} from "./DictEntryReadings";
import { DictionaryEntryComponentsTree } from "./DictionaryEntryComponentsTree";
import { DictionaryHeadingMeanings } from "./DictionaryHeadingMeanings";
import { ExternalDictionaryLinks } from "./ExternalDictionaryLinks";
import { FigurePriorityUses } from "./FigurePriorityUses";
import { FigureStrokesAnimation } from "./FigureStrokesAnimation";
import { FigureTags } from "./FigureTags";
import { GlyphsJson } from "./GlyphsJson";
import { kangxiRadicals } from "./kangxiRadicals";
import kvgStyles from "./kvg.css";
import type { KvgJsonData } from "./KvgJsonData";

export const links = () => [
  { rel: "stylesheet", href: kvgStyles },
  ...readingsStyles(),
];
export function SingleFigureDictionaryEntry({
  figure,
  variants = [],
}: {
  figure: DictionaryPageFigureWithPriorityUses;
  variants?: BadgeProps[];
}) {
  const badgeProps = getBadgeProps(figure);
  const figureIsStandaloneCharacter = badgeProps.isStandaloneCharacter;
  const figureIsPrioritySoundMark = isPrioritySoundMark(figure);

  const [animationIsShowing, setAnimationIsShowing] = useState(false);

  const kvgImage =
    figure.image?.type === KanjisenseFigureImageType.Kvg ? figure.image : null;
  const isUnicodeCharacter = [...figure.id].length === 1;
  const figureIsAtomic = isFigureAtomic(figure);

  const glyphsJson = figure.glyphImage
    ? (figure.glyphImage.json as GlyphsJson)
    : null;

  const radicalIndexes = figure.reading?.unihan15?.kRSUnicode?.flatMap(
    (text) => parseRadicalNumbers(text) || [],
  );

  return (
    <section
      className={`flex gap-4 flex-row flex-wrap lg:flex-nowrap items-start`}
      key={figure.id}
    >
      <div className="SingleFigureDictionaryEntry_left max-lg:basis-full [min-width:calc(100%-20rem)] flex gap-4 flex-col flex-grow ">
        <div className="SingleFigureDictionaryEntry_top flex flex-row flex-wrap gap-4 justify-center ">
          <div className="SingleFigureDictionaryEntry_topLeft flex-col flex gap-4 [min-width:15.05rem]  items-center basis-1/3 flex-grow">
            <div
              // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
              tabIndex={0}
              className="relative [width:15.05em] [height:15.05em] cursor-pointer group"
              onClick={() => setAnimationIsShowing((b) => !b)}
              role="img"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setAnimationIsShowing((b) => !b);
                }
              }}
            >
              <FigureBadge id={figure.id} badgeProps={badgeProps} width={15} />
              {animationIsShowing && kvgImage ? (
                <>
                  <FigureStrokesAnimation
                    className="[width:100%] [height:100%] absolute top-0 left-0 bottom-0  right-0 border-solid border border-black"
                    kvg={kvgImage.content as unknown as KvgJsonData}
                  />
                </>
              ) : (
                <></>
              )}
              {kvgImage ? (
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
              ) : null}
            </div>

            <DictionaryHeadingMeanings
              className="flex-1 text-xl flex-col"
              headingsMeanings={getHeadingsMeanings(figure)}
            />

            <FigureTags
              badgeProps={badgeProps}
              isSoundMark={figureIsPrioritySoundMark}
              isAtomic={figureIsAtomic}
            />
          </div>

          <div className="flex flex-grow-[9999] flex-col gap-4">
            {
              <div className="SingleFigureDictionaryEntry_topRight basis-full flex-1 [min-height:5rem] border-4 border-solid border-black/10 rounded-lg p-2 [min-width:15rem] flex gap-4 flex-col">
                <div className="flex-1 flex flex-col justify-center gap-4">
                  {figureIsAtomic ? (
                    <div className="text-center">atomic component</div>
                  ) : (
                    <>
                      <h2 className="text-center text-gray-500">components</h2>
                      <DictionaryEntryComponentsTree
                        figure={figure}
                        className="basis-0"
                      />
                    </>
                  )}
                </div>
              </div>
            }
            {isUnicodeCharacter && (glyphsJson || figure.shuowenImage) ? (
              <div className="flex flex-row flex-wrap flex-grow p-4  justify-evenly">
                {glyphsJson ? (
                  <div className="">
                    <div className="flex-1 flex flex-row justify-center flex-wrap gap-4">
                      {glyphsJson.ns ? (
                        <svg
                          viewBox="0 -870 1000 1000"
                          className="inline-block [width:2.5rem] [height:2.5rem]"
                        >
                          <path d={glyphsJson.ns} />
                        </svg>
                      ) : null}
                      {glyphsJson.gw ? (
                        <svg
                          viewBox="0 0 200 200"
                          className="inline-block [width:2.5rem] [height:2.5rem]"
                        >
                          <path d={glyphsJson.gw} />
                        </svg>
                      ) : null}
                      {glyphsJson.twk ? (
                        <svg
                          viewBox="0 -870 1000 1000"
                          className="inline-block [width:2.5rem] [height:2.5rem]"
                        >
                          <path d={glyphsJson.twk} />
                        </svg>
                      ) : null}
                      {glyphsJson.kk ? (
                        <svg
                          viewBox="0 -870 1000 1000"
                          className="inline-block [width:2.5rem] [height:2.5rem]"
                        >
                          <path d={glyphsJson.kk} />
                        </svg>
                      ) : null}
                    </div>
                  </div>
                ) : null}
                {figure.shuowenImage ? (
                  <AncientCharacterFormSection
                    className=""
                    svgPaths={figure.shuowenImage.paths}
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {figure.reading &&
        (figure.reading.selectedOnReadings?.length ||
          figure.reading.kanjidicEntry?.onReadings?.length ||
          figure.reading.kanjidicEntry?.kunReadings?.length) &&
        !(
          !figureIsStandaloneCharacter &&
          figure.isPriority &&
          !isPrioritySoundMark(figure)
        ) ? (
          <div className="SingleFigureDictionaryEntry_middle flex flex-col gap-4">
            <DictEntryReadings
              figureId={figure.id}
              readings={figure.reading}
              isStandaloneCharacter={figureIsStandaloneCharacter}
              className=""
            />
          </div>
        ) : null}
        <div className="SingleFigureDictionaryEntry_bottom flex flex-row gap-4">
          <FigurePriorityUses
            componentFigure={figure}
            priorityUses={figure.firstClassUses}
            count={figure._count.firstClassUses}
            className="border-4 border-solid border-black/10 rounded-lg p-2 flex-1 "
          />
        </div>
      </div>

      {isUnicodeCharacter || variants?.length ? (
        <div className="lg:[max-height:100vh] flex flex-row flex-wrap gap-4 mb-4 lg:flex-col lg:items-center self-stretch flex-shrink flex-grow ">
          {variants?.length ? (
            <section className="flex-grow-[9999] [min-width:14rem] lg:[min-width:none] flex justify-center items-center ">
              <div className="lg:overflow-auto lg:[max-height:57vh] p-4 justify-center  bg-black/10 shadow-inner shadow-black/25">
                <h3 className="text-center text-gray-600 mb-4">
                  <strong>
                    {variants.findIndex((v) => v.id === figure.id) + 1}
                  </strong>{" "}
                  of <strong>{variants.length}</strong> variants
                </h3>
                <div className="flex flex-wrap lg:flex-col justify-center">
                  {variants.map((v) => {
                    return v.id === figure.id ? (
                      <span
                        key={v.id}
                        className=" border-solid rounded-xl bg-white shadow-md shadow-black/20"
                      >
                        <FigureBadge
                          width={6}
                          key={v.id}
                          id={v.id}
                          badgeProps={v}
                          className={`inline-block m-2 hover:opacity-100 `}
                        />
                      </span>
                    ) : (
                      <FigurePopoverBadge
                        width={6}
                        key={v.id}
                        id={v.id}
                        badgeProps={v}
                        className={`inline-block m-2 hover:opacity-100 opacity-80`}
                      />
                    );
                  })}
                </div>
              </div>
            </section>
          ) : (
            <div className=""> </div>
          )}
          {isUnicodeCharacter ? (
            <div className="[min-width:19rem] flex-wrap gap-4 flex-grow flex lg:flex-col lg:flex-nowrap lg:justify-end max-lg:justify-between">
              <p className="px-4 [min-width:10rem]">
                in your browser: <span className="text-2xl">{figure.id}</span>{" "}
                U+{figure.id.codePointAt(0)?.toString(16).toUpperCase()}
                <br />{" "}
                {radicalIndexes?.length ? (
                  <section>
                    traditional radical:{" "}
                    {radicalIndexes?.map((radicalIndex) => (
                      <span key={radicalIndex?.radical.character}>
                        <DictLink
                          figureId={radicalIndex.radical.character}
                          className="no-underline hover:underline"
                        >
                          {radicalIndex.radical.number}&nbsp;
                          <span className="">
                            {radicalIndex.radical.character}
                          </span>
                          &nbsp; (+{radicalIndex.remainder})
                        </DictLink>{" "}
                      </span>
                    ))}
                  </section>
                ) : null}
              </p>

              {figureIsStandaloneCharacter || figure.isPriority ? (
                <ExternalDictionaryLinks
                  figureId={figure.id}
                  className="[min-width:19rem] text-sm"
                />
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

type KeywordDisplayFigure = Pick<
  KanjisenseFigure,
  "keyword" | "mnemonicKeyword" | "listsAsCharacter"
> &
  IsPriorityComponentQueryFigure &
  StandaloneCharacterVariantQueryFigure;

function isFigureAtomic(
  figure: Pick<KanjisenseFigure, "componentsTree">,
): boolean {
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
    return <i>&quot;{mnemonicKeywordWithoutReference}&quot;</i>;

  if (isStandaloneCharacterVariant(figure))
    return (
      <>
        {figure.keyword} <i>&quot;{mnemonicKeywordWithoutReference}&quot;</i>
      </>
    );

  return <i>&quot;{mnemonicKeywordWithoutReference}&quot;</i>;
}

function parseRadicalNumbers(unicodeRadicalText: string) {
  try {
    // one apostrophe: chinese-simplified radical
    // two apostrophes: other-simplified radical
    const [radicalNumber, remainder] = unicodeRadicalText.split(/'*\./);
    return {
      radical: {
        number: +radicalNumber,
        character: kangxiRadicals[+radicalNumber - 1][0],
      },
      remainder: +remainder,
    };
  } catch (e) {
    return null;
  }
}
