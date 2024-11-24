import { SbgyXiaoyun } from "@prisma/client";
import { LinksFunction } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { convert as toRevisedKoreanRomanization } from "hangul-romanization";
import { Fragment, useRef, useState } from "react";

import { OnReadingToTypeToXiaoyuns } from "~/lib/OnReadingToTypeToXiaoyuns";
import { FigureSinoReadingsLoaderData } from "~/routes/dict.$figureKey.sino";

import { abbreviateTranscriptions } from "./abbreviateTranscriptions";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  useDialogContext,
} from "./Dialog";
import { DictionaryPageFigureWithPriorityUses } from "./getDictionaryPageFigure.server";
import { kanjidicKanaToRomaji } from "./kanjidicKanaToRomaji";
import { QysDialogContent } from "./QysDialogContent";
import scallopBorder from "./scallopBorder.css?url";
import slideDownStyles from "./slideDown.module.css";
import { transcribeSbgyXiaoyun } from "./transcribeSbgyXiaoyun";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: scallopBorder },
];

export function DictEntryReadings({
  figureKey,
  readings,
  isStandaloneCharacter,
  className = "",
}: {
  figureKey: string;
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
    fetcher: { data: fetcherData, state: fetcherState },
    getSinoReadings,
  } = useSinoReadingsFetcher(figureKey);

  if (!readings) return null;

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
      className={`flex flex-col rounded-lg bg-gray-50 shadow-md shadow-black/20 md:flex-row ${className}`}
    >
      <div className="flex basis-full  flex-row flex-wrap content-between justify-evenly gap-4 px-3 py-8 md:basis-7/12">
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
              <UnavailableNote loading={fetcherState !== "idle"} />
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
                    rare={readings.selectedOnReadings.length !== 0}
                    onReading={onReading}
                    i={i + readings.selectedOnReadings.length}
                  />
                </Fragment>
              );
            })}
          </dd>
        </div>
        {guangyunReadings?.length ? (
          <Dialog>
            <QysDialog
              guangyunReadings={guangyunReadings}
              readings={readings}
            />
          </Dialog>
        ) : null}

        <div
          className={`${slideDownStyles.slideDown} ${animationState} w-full`}
        >
          <div className={` flex flex-row flex-wrap justify-evenly gap-4 `}>
            <div className="text-left [max-width:10em]">
              <dt className="mb-1 text-sm text-gray-500">Mandarin Chinese</dt>
              <dd className="text-xl font-light leading-9">
                {mandarinReadings?.join(" ")}
                {!mandarinReadings?.length ? (
                  <UnavailableNote loading={fetcherState !== "idle"} />
                ) : null}
              </dd>
            </div>
            <div className="text-left [max-width:10em]">
              <dt className="mb-1 text-sm text-gray-500">Cantonese</dt>
              <dd className="text-xl font-light leading-9">
                {!cantoneseReadings?.length ? (
                  <UnavailableNote loading={fetcherState !== "idle"} />
                ) : null}
                {cantoneseReadings
                  ? convertNumbersToSuperscript(cantoneseReadings?.join(", "))
                  : null}
              </dd>
            </div>
            <div className="text-left [max-width:10em]">
              <dt className="mb-1 text-sm text-gray-500">Korean</dt>
              <dd className="text-xl font-light leading-9">
                {!hangulReadings?.length ? (
                  <UnavailableNote loading={fetcherState !== "idle"} />
                ) : null}
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
                {!vietnameseReadings?.length ? (
                  <UnavailableNote loading={fetcherState !== "idle"} />
                ) : null}
              </dd>
            </div>
          </div>
        </div>

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
          className={`ml-10 basis-full cursor-pointer text-left  hover:text-orange-700 hover:underline`}
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
      </div>
      <div className="border-l-solid fadeIn flex flex-row flex-wrap justify-evenly gap-4 border-t border-t-gray-600/40 p-4 text-center transition-all md:basis-5/12 md:border-l md:border-t-0 md:border-l-gray-600/40">
        <div className="py-4">
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
    </section>
  );
}

function QysDialog({
  guangyunReadings,
  readings,
}: {
  guangyunReadings: SbgyXiaoyun[];
  readings: NonNullable<DictionaryPageFigureWithPriorityUses["reading"]>;
}) {
  const { setOpen } = useDialogContext();
  return (
    <>
      <DialogTrigger className="flex">
        <div className="text-left">
          <dt className="mb-1 text-sm text-gray-500">Middle Chinese</dt>
          <dd className="text-xl leading-9 text-gray-700 drop-shadow-[0_2px_2px_rgb(0_0_0_/_.4)]">
            <div className="scallop text-center">
              {abbreviateTranscriptions(
                guangyunReadings.map((g) => transcribeSbgyXiaoyun(g)),
              )}
            </div>
          </dd>
        </div>
      </DialogTrigger>
      <DialogContent className=" [border:2px inset #afafaf33] p-3 text-sm shadow-xl shadow-black/60 transition-opacity duration-300 [background-color:rgba(247,247,247,0.95)]  [border-radius:0.3em] [box-sizing:border-box] [max-height:95vh] [max-width:95vw] [min-width:17rem] [overflow-y:auto]  [width:40v] md:max-w-xl  md:[max-height:95vh] ">
        <QysDialogContent
          onClickClose={() => setOpen(false)}
          attestedOnReadings={
            readings.kanjidicEntry?.onReadings.length
              ? readings.kanjidicEntry?.onReadings
              : readings.selectedOnReadings || []
          }
          syllables={guangyunReadings}
          inferredOnReadingCandidates={
            readings.inferredOnReadingCandidates as OnReadingToTypeToXiaoyuns
          }
          sbgyXiaoyunsToExemplars={
            readings.sbgyXiaoyunsMatchingExemplars as Record<string, string[]>
          }
        />
      </DialogContent>
    </>
  );
}

function OnReading({
  onReading,
  i,
  rare = false,
}: {
  onReading: string;
  i: number;
  rare?: boolean;
}) {
  return (
    <span key={onReading} className="inline-block">
      <span className={`block ${rare ? "text-yellow-950/60" : ""}`}>
        {i !== 0 ? "・" : ""}
        {rare ? <span className="text-yellow-950/30">(</span> : null}
        {onReading.replace(/-/g, "")}
        {rare ? <span className="text-yellow-950/30">)</span> : null}{" "}
      </span>
      <span className=" block text-center text-sm uppercase">
        {rare ? <span className="text-yellow-950/50">(</span> : null}
        <span className={rare ? "text-yellow-950/70" : ""}>
          {kanjidicKanaToRomaji(onReading.replace(/-/g, ""))}
        </span>
        {rare ? <span className="text-yellow-950/50">)</span> : null}{" "}
      </span>
    </span>
  );
}

function UnavailableNote({ loading = false }: { loading?: boolean }) {
  return (
    <div className=" text-sm [line-height:inherit] [width:5rem]">
      {loading ? (
        <span className="block animate-pulse text-center italic text-gray-600">
          loading...
        </span>
      ) : (
        <span className=" block text-center text-gray-400">not available</span>
      )}
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

function useSinoReadingsFetcher(figureKey: string) {
  const fetcher = useFetcher<FigureSinoReadingsLoaderData>();
  return {
    fetcher,
    getSinoReadings() {
      if (fetcher.state === "idle") {
        fetcher.load(`/dict/${figureKey}/sino`);
      }
    },
  };
}
