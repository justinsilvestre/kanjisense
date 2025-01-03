/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { KanjisenseFigureImageType } from "@prisma/client";
import { clsx } from "clsx";
import { useState } from "react";

import { FigureBadge } from "~/components/FigureBadge";
import { FigurePopoverBadge } from "~/components/FigurePopover";
import {
  BadgeProps,
  getBadgeProps,
  isAtomicFigure,
  isPrioritySoundMark,
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
import { GlyphsImagesSection } from "./GlyphsImagesSection";
import { GlyphsJson } from "./GlyphsJson";
import { kangxiRadicals } from "./kangxiRadicals";
import kvgStyles from "./kvg.css?url";
import type { KvgJsonData } from "./KvgJsonData";
import { RadicalSection } from "./RadicalSection";

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
  const figureIsStandaloneCharacter = figure.isStandaloneCharacter;

  const [animationIsShowing, setAnimationIsShowing] = useState(false);

  const kvgImage =
    figure.image?.type === KanjisenseFigureImageType.Kvg ? figure.image : null;
  const isUnicodeCharacter = [...figure.key].length === 1;
  const figureIsAtomic = isAtomicFigure(figure);

  const glyphsJson = figure.glyphImage
    ? (figure.glyphImage.json as GlyphsJson)
    : null;

  const radicalIndexes = figure.reading?.unihan15?.kRSUnicode?.flatMap(
    (text) => parseRadicalNumbers(text) || [],
  );

  return (
    <section
      className={`flex flex-row flex-wrap items-start gap-4 lg:flex-nowrap`}
      key={figure.id}
    >
      <div className="SingleFigureDictionaryEntry_left flex flex-grow flex-col gap-4 [min-width:calc(100%-20rem)] max-lg:basis-full ">
        <div className="SingleFigureDictionaryEntry_top flex flex-row flex-wrap  justify-center gap-4 md:flex-nowrap ">
          <div className="SingleFigureDictionaryEntry_topLeft flex flex-grow basis-1/3 flex-col  items-center gap-4 [min-width:15.25rem]">
            <div
              // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
              tabIndex={kvgImage ? 0 : -1}
              className={clsx(
                "group relative  [height:15.25em] [width:15.25em]",
                kvgImage ? "cursor-pointer" : null,
              )}
              onClick={() => setAnimationIsShowing((b) => !b)}
              role="img"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setAnimationIsShowing((b) => !b);
                }
              }}
            >
              <FigureBadge badgeProps={badgeProps} width={15} />
              {animationIsShowing && kvgImage ? (
                <>
                  <FigureStrokesAnimation
                    className="absolute bottom-0 left-0 right-0 top-0 border  border-solid border-black [height:100%] [width:100%]"
                    kvg={kvgImage.content as unknown as KvgJsonData}
                  />
                </>
              ) : (
                <></>
              )}
              {kvgImage ? (
                <button className="absolute bottom-1 right-1 rounded-md bg-slate-300 p-1 text-sm opacity-0 focus:opacity-100 group-hover:opacity-100">
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
              className="flex flex-1 flex-col  gap-4 text-xl"
              headingsMeanings={getHeadingsMeanings(figure)}
            />

            <FigureTags badgeProps={badgeProps} isAtomic={figureIsAtomic} />
          </div>

          <div className="flex flex-grow-[9999] flex-col gap-4">
            {
              <div className="SingleFigureDictionaryEntry_topRight flex flex-1 basis-full flex-col gap-4 rounded-lg border-4 border-solid border-black/10 p-2 [min-height:5rem] [min-width:15rem]">
                <div className="flex flex-1 flex-col justify-center gap-4">
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
              <div className="flex flex-grow flex-row flex-wrap justify-evenly  p-4">
                {glyphsJson ? (
                  <GlyphsImagesSection glyphsJson={glyphsJson} />
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
              figureKey={figure.key}
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
            className="flex-1 rounded-lg border-4 border-solid border-black/10 p-2 "
          />
        </div>
      </div>

      {isUnicodeCharacter || variants?.length ? (
        // <div className="mb-4 flex flex-shrink flex-grow flex-row gap-4 self-stretch max-lg:flex-wrap lg:max-h-[80vh] lg:flex-col lg:items-center  ">
        <div className="mb-4 flex flex-shrink flex-grow flex-row gap-4 max-lg:flex-wrap lg:max-h-[calc(100vh_-_12rem)] lg:flex-col lg:items-center lg:self-stretch  ">
          {variants?.length ? (
            <section className="  flex flex-grow-[9999] items-center justify-center [min-width:14rem]  lg:[min-width:none] ">
              <div className=" items-center justify-center  bg-black/10 p-4 shadow-inner shadow-black/25 lg:max-h-[50vh] lg:overflow-auto">
                <h3 className="mb-4 text-center text-gray-600">
                  <strong>
                    {variants.findIndex((v) => v.id === figure.id) + 1}
                  </strong>{" "}
                  of <strong>{variants.length}</strong> variants
                </h3>
                <div className="flex flex-wrap justify-center lg:flex-col">
                  {variants.map((v) => {
                    return v.id === figure.id ? (
                      <span
                        key={v.id}
                        className=" rounded-xl border-solid bg-white shadow-md shadow-black/20"
                      >
                        <FigureBadge
                          width={6}
                          key={v.id}
                          badgeProps={v}
                          className={`m-2 inline-block hover:opacity-100 `}
                        />
                      </span>
                    ) : (
                      <FigurePopoverBadge
                        width={6}
                        key={v.id}
                        badgeProps={v}
                        className={`m-2 inline-block opacity-80 hover:opacity-100`}
                      />
                    );
                  })}
                </div>
              </div>
            </section>
          ) : (
            <div className="flex flex-grow-[9999] justify-center [min-width:14rem] [align-items:normal]  lg:[min-width:none] ">
              {" "}
            </div>
          )}
          {isUnicodeCharacter ? (
            <div className="flex flex-grow flex-wrap gap-4 [min-width:19rem] max-lg:justify-between lg:flex-col lg:flex-nowrap lg:justify-end">
              <div className="flex flex-col gap-2 px-4 [min-width:10rem]">
                <span>
                  in your browser:{" "}
                  <span className="text-2xl">{figure.key}</span> U+
                  {figure.key.codePointAt(0)?.toString(16).toUpperCase()}
                </span>
                <div>
                  {radicalIndexes?.length ? (
                    <RadicalSection radicalIndexes={radicalIndexes} />
                  ) : null}
                </div>
              </div>

              {figureIsStandaloneCharacter || figure.isPriority ? (
                <ExternalDictionaryLinks
                  figureKey={figure.key}
                  className="text-sm [min-width:19rem]"
                  figureIsStandaloneCharacter={figureIsStandaloneCharacter}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
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
