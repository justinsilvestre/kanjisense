import { SbgyXiaoyun } from "@prisma/client";
import { useFetcher } from "@remix-run/react";
import { convert as toRevisedKoreanRomanization } from "hangul-romanization";
import { Fragment, useRef, useState } from "react";

import { OnReadingToTypeToXiaoyuns } from "~/lib/OnReadingToTypeToXiaoyuns";
import { FigureSinoReadingsLoaderData } from "~/routes/dict.$figureId.sino";

import { Dialog, DialogContent, DialogTrigger } from "./Dialog";
import { DictionaryPageFigureWithPriorityUses } from "./getDictionaryPageFigure.server";
import { kanjidicKanaToRomaji } from "./kanjidicKanaToRomaji";
import { QysDialogContent } from "./QysDialogContent";
import { transcribeSbgyXiaoyun } from "./transcribeSbgyXiaoyun";

export function DictEntryReadings({
  figureId,
  readings,
  isStandaloneCharacter,
  className = "",
}: {
  figureId: string;
  readings: DictionaryPageFigureWithPriorityUses["reading"];
  isStandaloneCharacter?: boolean;
  className?: string;
}) {
  const [animationState, setAnimationState] = useState<
    "entering" | "entered" | "exiting" | "exited"
  >("exited");
  const timer = useRef<number | null>(null);
  function requestClose() {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    setAnimationState("exiting");
    timer.current = setTimeout(() => {
      setAnimationState("exited");
    }, 300) as unknown as number;
  }
  function requestOpen() {
    getSinoReadings();
    if (timer.current) {
      clearTimeout(timer.current);
    }
    setAnimationState("entering");
    timer.current = setTimeout(() => {
      setAnimationState("entered");
    }, 300) as unknown as number;
  }

  const {
    fetcher: { data: fetcherData },
    getSinoReadings,
  } = useSinoReadingsFetcher(figureId);

  if (!readings) return null;

  // const guangyun = readings?.guangyunYunjing
  //   ? parrseAndAbbreviateGuangyun({ guangyunJsons: readings.guangyunYunjing })
  //   : null;

  // const syllables = guangyun?.transcriptions.flatMap((x) =>
  //   x.syllableProfile ? x : [],
  // );

  const unihanReadings = fetcherData?.readings?.unihan15;
  const mandarinReadings = unihanReadings?.kMandarin?.length
    ? unihanReadings.kMandarin
    : unihanReadings?.kHanyuPinyin.map((pinyin) => pinyin.split(":")[1] || "");
  const hangulReadings = unihanReadings?.kHangul.map(
    (k) => k.split(":")[0] || "",
  );
  const cantoneseReadings = unihanReadings?.kCantonese;
  const vietnameseReadings = unihanReadings?.kVietnamese;

  const guangyunReadings = readings.sbgyXiaoyuns.map(
    (sbxy) => sbxy.sbgyXiaoyun,
  );

  return (
    <section
      className={`flex flex-col rounded-lg [box-shadow:3px_3px_12px_rgba(0,0,0,.3)] ${className}`}
    >
      <div className=" flex flex-row flex-wrap justify-evenly gap-4 px-4 py-4">
        <div className="text-left">
          <dt className="mb-1 text-sm text-gray-500">
            Japanese <i>on&apos;yomi</i>{" "}
            {isStandaloneCharacter &&
            readings.kanjidicEntry?.onReadings.length &&
            readings.kanjidicEntry.onReadings.length !== 1 &&
            !readings.selectedOnReadings.length ? (
              <> (rare or obsolete)</>
            ) : null}
          </dt>
          <dd className="text-center text-xl font-light leading-9">
            {!(
              readings?.selectedOnReadings.length ||
              readings?.kanjidicEntry?.onReadings.length
            ) ? (
              <UnavailableNote />
            ) : null}
            {readings?.selectedOnReadings?.map((onReading, i) => {
              return (
                <Fragment key={onReading}>
                  <OnReading onReading={onReading} i={i} />
                </Fragment>
              );
            })}
            {readings.kanjidicEntry?.onReadings?.map((onReading, i) => {
              if (readings.selectedOnReadings.includes(onReading)) return null;
              return (
                <Fragment key={onReading}>
                  <OnReading
                    onReading={onReading}
                    i={i + readings.selectedOnReadings.length}
                  />
                  {readings.selectedOnReadings.length ? "*" : ""}
                </Fragment>
              );
            })}
          </dd>
        </div>
        {guangyunReadings?.length ? (
          <Dialog>
            <DialogTrigger>
              <div className="text-left">
                <dt className="mb-1 text-sm text-gray-500">Middle Chinese</dt>
                <dd className="text-xl leading-9 text-gray-700 drop-shadow-md">
                  <div className="scallop text-center">
                    {abbreviateAndTranscribe(guangyunReadings)}
                  </div>
                </dd>
              </div>
            </DialogTrigger>
            <DialogContent className=" [border:2px inset #afafaf33] p-3 text-sm shadow-xl shadow-black/60 transition-opacity duration-300 [width:40v] [min-width:17rem] [max-width:80vw] [max-height:80vh]  [background-color:rgba(247,247,247,0.95)]  [border-radius:0.3em] [box-sizing:border-box]  [overflow-y:auto] md:max-w-xl">
              <QysDialogContent
                attestedOnReadings={
                  readings.selectedOnReadings.length
                    ? readings.selectedOnReadings
                    : readings.kanjidicEntry?.onReadings || []
                }
                syllables={guangyunReadings}
                inferredOnReadingCandidates={
                  readings.inferredOnReadingCandidates as OnReadingToTypeToXiaoyuns
                }
                sbgyXiaoyunsToExemplars={
                  readings.sbgyXiaoyunsMatchingExemplars as Record<
                    string,
                    string[]
                  >
                }
              />
            </DialogContent>
          </Dialog>
        ) : null}
        {animationState !== "exited" ? (
          <div
            className={`slideDown ${animationState}  flex flex-row flex-wrap justify-evenly gap-4 px-4 py-4`}
          >
            <div className="text-left [max-width:10em]">
              <dt className="mb-1 text-sm text-gray-500">Mandarin Chinese</dt>
              <dd className="text-xl font-light leading-9">
                {mandarinReadings?.join(" ")}
                {!mandarinReadings?.length ? <UnavailableNote /> : null}
              </dd>
            </div>
            <div className="text-left [max-width:10em]">
              <dt className="mb-1 text-sm text-gray-500">Cantonese</dt>
              <dd className="text-xl font-light leading-9">
                {!cantoneseReadings?.length ? <UnavailableNote /> : null}
                {cantoneseReadings
                  ? convertNumbersToSuperscript(cantoneseReadings?.join(", "))
                  : null}
              </dd>
            </div>
            <div className="text-left [max-width:10em]">
              <dt className="mb-1 text-sm text-gray-500">Korean</dt>
              <dd className="text-xl font-light leading-9">
                {!hangulReadings?.length ? <UnavailableNote /> : null}
                {hangulReadings?.map((k) => (
                  <span key={k} className="">
                    {k}{" "}
                    <span className="[font-variant:small-caps]">
                      {toRevisedKoreanRomanization(k)}
                    </span>{" "}
                  </span>
                ))}
              </dd>
            </div>
            <div className="text-left [max-width:10em]">
              <dt className="mb-1 text-sm text-gray-500">Vietnamese</dt>
              <dd className="text-xl font-light leading-9">
                {vietnameseReadings?.join(", ")}
                {!vietnameseReadings?.length ? <UnavailableNote /> : null}
              </dd>
            </div>
          </div>
        ) : null}

        <div
          tabIndex={0}
          role="button"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              animationState === "entered" || animationState === "entering"
                ? requestClose()
                : requestOpen();
            }
          }}
          className={`cursor-pointer px-4 pb-2 text-right hover:text-orange-700 hover:underline`}
          onClick={() =>
            animationState === "entered" || animationState === "entering"
              ? requestClose()
              : requestOpen()
          }
        >
          {animationState === "entered" || animationState === "entering"
            ? "less"
            : "more"}
        </div>
        <div className="border-t-solid fadeIn flex flex-row flex-wrap justify-evenly gap-4 border-t border-t-gray-600 border-opacity-30 px-4 py-4 text-center transition-all">
          <div>
            <dt className="mb-1 text-sm text-gray-500">
              Japanese <i>kun&apos;yomi</i>
            </dt>
            <dd className="text-center text-xl font-light leading-9">
              <div className="">
                {!readings?.kanjidicEntry?.kunReadings?.length ? (
                  <UnavailableNote />
                ) : null}
                {readings.kanjidicEntry?.kunReadings?.map((kana, i) => {
                  const [kanaBeforeDot, kanaAfterDot] = kana.split(".");
                  const [romaji, romajiAfterDot] = kanjidicKanaToRomaji(
                    kana.replaceAll("-", ""),
                    true,
                  ).split(".");

                  return (
                    <Fragment key={kana}>
                      <div
                        key={kana}
                        className="inline-block text-center [max-width:10em]"
                      >
                        <span className="block">
                          {i !== 0 ? "・" : ""}
                          {kanaBeforeDot}
                          {kanaAfterDot ? (
                            <span className=" text-yellow-900 text-opacity-70">
                              {kanaAfterDot}
                            </span>
                          ) : null}
                        </span>
                        <span
                          key={romaji + romajiAfterDot}
                          className="-mt-1 block text-sm"
                        >
                          {kana.startsWith("-") ? "-" : ""}
                          {romaji}
                          {romajiAfterDot ? (
                            <span className=" text-yellow-900 text-opacity-70">
                              {romajiAfterDot}
                            </span>
                          ) : null}
                          {kana.endsWith("-") ? "-" : ""}
                        </span>
                      </div>
                    </Fragment>
                  );
                })}
              </div>
            </dd>
          </div>
        </div>
      </div>
    </section>
  );
}

function abbreviateAndTranscribe(guangyunReadings: SbgyXiaoyun[]) {
  if (!guangyunReadings.length) return null;
  if (guangyunReadings.length === 1)
    return transcribeSbgyXiaoyun(guangyunReadings[0]);

  const tonelessTranscriptionsToTones = new Map<string, string[]>();
  for (const reading of guangyunReadings) {
    const transcription = transcribeSbgyXiaoyun(reading);
    const toneMark = /[ˬˎ]/.test(transcription.at(-1) || "")
      ? transcription.at(-1) || ""
      : "";
    const tonelessTranscription = toneMark
      ? transcription.slice(0, -1)
      : transcription;
    const tones =
      tonelessTranscriptionsToTones.get(tonelessTranscription) ?? [];
    tonelessTranscriptionsToTones.set(tonelessTranscription, tones);
    tones.push(toneMark);
  }
  const abbreviated: string[] = [];
  for (const [tonelessTranscription, tones] of tonelessTranscriptionsToTones) {
    if (tones.length === 1) {
      abbreviated.push(tonelessTranscription + tones[0]);
    } else {
      const withParens =
        tones.length > 1 && tones.includes("")
          ? (toneMarks: string) => `₍${toneMarks}₎`
          : (toneMarks: string) => toneMarks;

      abbreviated.push(`${tonelessTranscription}${withParens(tones.join(""))}`);
    }
  }

  return abbreviated.join(" ");
}

function OnReading({ onReading, i }: { onReading: string; i: number }) {
  return (
    <span key={onReading} className="inline-block">
      <span className="block">
        {i !== 0 ? "・" : ""}
        {onReading.replace(/[a-z0-9]*$/g, "")}{" "}
      </span>
      <span className=" block text-center text-sm uppercase">
        {kanjidicKanaToRomaji(onReading.replace(/[a-z0-9]*$/g, ""))}
      </span>
    </span>
  );
}

function UnavailableNote() {
  return (
    <div className=" text-sm text-gray-400 [line-height:inherit]">
      <span className="block text-center">not available</span>
    </div>
  );
}

const SUPERSCRIPT_NUMBERS = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
};
function convertNumbersToSuperscript(string: string) {
  return string.replace(
    /([0-9])/g,
    (match, p1) => SUPERSCRIPT_NUMBERS[p1 as keyof typeof SUPERSCRIPT_NUMBERS],
  );
}

function useSinoReadingsFetcher(figureId: string) {
  const fetcher = useFetcher<FigureSinoReadingsLoaderData>();
  return {
    fetcher,
    getSinoReadings() {
      if (fetcher.state === "idle") {
        fetcher.load(`/dict/${figureId}/sino`);
      }
    },
  };
}
