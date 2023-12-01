import type { SbgyXiaoyun } from "@prisma/client";
import { PropsWithChildren, useState } from "react";
import * as MdIcons from "react-icons/md";

import {
  MiddleChineseLink,
  MiddleChineseTranscriptionLink,
} from "~/components/AppLink";
import { sbgyXiaoyunToQysSyllableProfile } from "~/features/dictionary/sbgyXiaoyunToQysSyllableProfile";
import type { OnReadingToTypeToXiaoyuns } from "~/lib/OnReadingToTypeToXiaoyuns";
import {
  InferredOnyomiType,
  inferKanOn,
  toKatakana,
  toModernKatakana,
} from "~/lib/qys/inferOnyomi";
import { transcribeSyllableProfile } from "~/lib/qys/transcribeXiaoyun";

import { kanjidicKanaToRomaji } from "./kanjidicKanaToRomaji";
import { ConsonantHint, MedialHint, ToneHint, VowelHint } from "./QysHints";
import { transcribeSbgyXiaoyun } from "./transcribeSbgyXiaoyun";

const KAN_TYPES_PRIORITY = [
  InferredOnyomiType.AttestedKan,
  InferredOnyomiType.AttestedKanRare,
  InferredOnyomiType.SpeculatedKan,
];

export const QysDialogContent = ({
  syllables,
  sbgyXiaoyunsToExemplars,
  inferredOnReadingCandidates,
  attestedOnReadings,
  onClickClose,
}: {
  syllables: SbgyXiaoyun[];
  sbgyXiaoyunsToExemplars: Record<string, string[]>;
  inferredOnReadingCandidates: OnReadingToTypeToXiaoyuns;
  attestedOnReadings: string[];
  onClickClose: () => void;
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const getSetActiveTab = (index: number) => () => {
    setActiveTab(index);
  };

  const xiaoyunsToInferredKanCandidatesToTypes = new Map<
    number,
    Record<string, InferredOnyomiType[]>
  >();
  for (const [onReading, typesToXiaoyuns] of Object.entries(
    inferredOnReadingCandidates,
  )) {
    for (const [type, xiaoyuns] of Object.entries(typesToXiaoyuns)) {
      for (const { xiaoyun } of xiaoyuns) {
        if (xiaoyunsToInferredKanCandidatesToTypes.has(xiaoyun)) {
          xiaoyunsToInferredKanCandidatesToTypes.get(xiaoyun)![onReading] ||=
            [];
          xiaoyunsToInferredKanCandidatesToTypes
            .get(xiaoyun)!
            [onReading].push(type as InferredOnyomiType);
        } else {
          xiaoyunsToInferredKanCandidatesToTypes.set(xiaoyun, {
            [onReading]: [type as InferredOnyomiType],
          });
        }
      }
    }
  }

  const characterHasMultipleEntries = syllables.length > 1;

  return (
    <>
      <div className="float-right">
        <button onClick={onClickClose}>
          <MdIcons.MdClose />
        </button>
      </div>
      <h1 className="text-center text-lg">Middle Chinese pronunciation</h1>

      <div className="mb-4 flex flex-col p-0">
        <div className="mt-0 flex items-stretch justify-items-stretch gap-1 rounded-t-lg bg-slate-800 p-1">
          {syllables.map((xiaoyun, i) => {
            return (
              <span
                key={xiaoyun.fanqie}
                className={`flex-1 rounded-3xl p-1 text-center text-lg transition-colors ${
                  characterHasMultipleEntries ? "cursor-pointer" : ""
                } ${
                  characterHasMultipleEntries && i === activeTab
                    ? "bg-slate-100"
                    : `bg-slate-700  text-white`
                }`}
                role={characterHasMultipleEntries ? "button" : undefined}
                tabIndex={characterHasMultipleEntries ? 0 : undefined}
                onClick={
                  characterHasMultipleEntries ? getSetActiveTab(i) : undefined
                }
                onKeyDown={
                  characterHasMultipleEntries
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          getSetActiveTab(i)();
                        }
                      }
                    : undefined
                }
              >
                {sbgyXiaoyunsToExemplars[xiaoyun.xiaoyun].join(" ")}{" "}
                {transcribeSbgyXiaoyun(xiaoyun)}
              </span>
            );
          })}
        </div>

        <div className="rounded-b-lg border-2 border-solid border-slate-500 bg-white p-2">
          {syllables.map((syllable, i) => {
            const syllableProfile = sbgyXiaoyunToQysSyllableProfile(syllable);
            const transcription = transcribeSyllableProfile(syllableProfile);
            const asciiTranscription = transcribeSyllableProfile(
              syllableProfile,
              { ascii: true },
            );
            const [initial, final] = transcribeSyllableProfile(
              syllableProfile,
              { separator: " " },
            ).split(" ");

            const medial = /^[yŷẁw]/.test(initial)
              ? null
              : final.match(/^[yŷẁẃw]/);
            console.log({ initial, medial: medial?.[0], final });
            const medialHint = medial ? (
              <MedialHint medial={medial[0]} final={final} />
            ) : null;

            const inferredKanCandidatesToTypes =
              xiaoyunsToInferredKanCandidatesToTypes.get(syllable.xiaoyun);
            const attestedOnReadingsMatchingGuangyun =
              inferredKanCandidatesToTypes &&
              attestedOnReadings
                .filter(
                  (katakanaOn) =>
                    inferredKanCandidatesToTypes?.[katakanaOn]?.some((t) =>
                      KAN_TYPES_PRIORITY.includes(t),
                    ),
                )
                .sort((a, b) => {
                  return (
                    Math.min(
                      ...inferredKanCandidatesToTypes[b].map((type) =>
                        KAN_TYPES_PRIORITY.indexOf(type),
                      ),
                    ) -
                    Math.min(
                      ...inferredKanCandidatesToTypes[a].map((type) =>
                        KAN_TYPES_PRIORITY.indexOf(type),
                      ),
                    )
                  );
                });

            return (
              <div
                key={asciiTranscription}
                className={`mb-3 mt-0 ${activeTab === i ? "" : "hidden"}`}
              >
                <KanOnDevelopment
                  className="mb-3 mt-0 text-center"
                  transcription={transcription}
                  finalTranscription={final}
                  xiaoyun={syllable}
                  modernKatakanaMatchingInference={
                    attestedOnReadingsMatchingGuangyun?.[0] || null
                  }
                />
                <p className="mx-4 mb-3 mt-0 ">
                  This is a <strong>rough sketch</strong> of how this character
                  may have been pronounced in the{" "}
                  <MiddleChineseLink>
                    historical variety of Chinese
                  </MiddleChineseLink>{" "}
                  which forms the primary basis of the <i>on&apos;yomi</i>. The
                  letters in this notation are based on{" "}
                  <MiddleChineseTranscriptionLink hash="kan-on">
                    <i>on&apos;yomi</i> readings borrowed into Japanese sometime
                    around the Tang dynasty
                  </MiddleChineseTranscriptionLink>
                  , with diacritics and other symbols added to represent
                  distinctions not recorded in those <i>on&apos;yomi</i>.
                </p>
                <hr className="my-2"></hr>
                <p className={`mb-3 mt-0 text-center`}>
                  <b>syllable initial</b>: {syllable.initial} ⟨{initial}⟩
                </p>
                <p className="mb-3 mt-0 ">
                  {initial ? (
                    <>
                      The initial ⟨{initial}⟩ was probably pronounced{" "}
                      <ConsonantHint
                        syllable={syllableProfile}
                        initialRealization={initial}
                      />{" "}
                    </>
                  ) : null}
                  {!initial ? (
                    <ConsonantHint
                      syllable={syllableProfile}
                      initialRealization={initial}
                    />
                  ) : null}{" "}
                  (Symbols in [] square brackets are from the International
                  Phonetic Alphabet.){" "}
                  <MiddleChineseTranscriptionLink hash="initial-consonants">
                    More on the consonants of Middle Chinese
                  </MiddleChineseTranscriptionLink>
                </p>
                <p className="mb-3 mt-0 text-center">
                  <b>syllable final</b>: {syllable.cycleHead}
                  {syllable.dengOrChongniu} ⟨{final}⟩
                </p>
                {medialHint ? <p className="mb-3 mt-0">{medialHint}</p> : null}
                <p className="mb-3 mt-0">
                  <VowelHint
                    syllable={syllableProfile}
                    asciiTranscription={asciiTranscription}
                  />{" "}
                  <MiddleChineseTranscriptionLink hash="finals">
                    More on the finals of Middle Chinese
                  </MiddleChineseTranscriptionLink>
                </p>
                <p className="mb-3 mt-0 text-center">
                  <b>tone</b>:{" "}
                  {syllable.tone === "平" ? '平 "level" tone' : null}
                  {syllable.tone === "上" ? '上 "rising" tone ⟨ˬ⟩' : null}
                  {syllable.tone === "去" ? '去 "departing" tone ⟨ˎ⟩' : null}
                  {syllable.tone === "入" ? '入 "entering" tone' : null}
                </p>
                <p className="mb-3 mt-0">
                  <ToneHint syllable={syllableProfile} />{" "}
                  <MiddleChineseTranscriptionLink hash="finals">
                    More on the tones of Middle Chinese
                  </MiddleChineseTranscriptionLink>
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <PopoverBottom>
        <MiddleChineseLink>
          More on Middle Chinese pronunciation and the <i>on&apos;yomi</i>
        </MiddleChineseLink>
      </PopoverBottom>
    </>
  );
};

function PopoverBottom({ children }: PropsWithChildren) {
  return <div className={" text-right"}>{children}</div>;
}

function KanOnDevelopment({
  xiaoyun,
  transcription,
  finalTranscription: finalTranscription,
  modernKatakanaMatchingInference,
  className,
}: {
  xiaoyun: SbgyXiaoyun;
  transcription: string;
  finalTranscription: string;
  modernKatakanaMatchingInference: string | null;
  className?: string;
}) {
  const kanCandidates = inferKanOn(sbgyXiaoyunToQysSyllableProfile(xiaoyun));
  const matchingKanCandidates = [...kanCandidates].flatMap(
    ([inferredOnyomiType, latinOn]) => {
      return latinOn.flatMap((latinOn) => {
        if (
          modernKatakanaMatchingInference &&
          toModernKatakana(latinOn) !== modernKatakanaMatchingInference
        )
          return [];
        return {
          type: inferredOnyomiType,
          katakana: toKatakana(
            latinOn
              .replace(/p/g, "h")
              .replace("Y", "y")
              .replace("W", "w")
              .replace(/^iy/, "y")
              .replace(/^uw/, "w"),
          ),
          ipaKanon: toIPAKanon(latinOn, finalTranscription),
        };
      });
    },
  );

  const modernOnyomi = modernKatakanaMatchingInference
    ? [modernKatakanaMatchingInference]
    : [
        ...new Set(
          [
            ...inferKanOn(
              sbgyXiaoyunToQysSyllableProfile(xiaoyun),
              toModernKatakana,
            ).values(),
          ].flat(),
        ),
      ];

  return (
    <div
      className={`${className} my-4 flex flex-row flex-wrap items-end justify-center gap-4`}
    >
      <span className="inline-flex flex-col text-center align-middle">
        <span className="mb-2 basis-full text-xs [line-height:1em]">
          Middle Chinese
        </span>
        <span>{transcription}</span>
      </span>
      <span className="inline-block text-center">→</span>
      <span className="inline-flex flex-col text-center align-middle">
        <span className="mb-2 basis-full text-xs [line-height:1em]">
          {modernKatakanaMatchingInference ? null : <>expected </>} historical{" "}
          <i>on&apos;yomi</i>
        </span>
        <span>
          {matchingKanCandidates
            ?.map((x) => `${x.katakana} *${x.ipaKanon}`)
            .join(" or ")}
        </span>
      </span>
      <span className="inline-block text-center">→</span>
      <span className="inline-flex flex-col text-center align-middle">
        <span className="mb-2 basis-full text-xs [line-height:1em]">
          {modernKatakanaMatchingInference ? null : <>expected </>}modern{" "}
          <i>on&apos;yomi</i>
        </span>
        <span>
          {modernOnyomi
            .map(
              (kana) => `${kana} ${kanjidicKanaToRomaji(kana).toUpperCase()}`,
            )
            .join(" or ")}
        </span>
      </span>
    </div>
  );
}

export function toIPAKanon(
  historicalOnyomiNotation: string,
  finalTranscription: string,
) {
  const velarNasalEnding = finalTranscription.endsWith("ng");
  return (
    historicalOnyomiNotation
      .replace(/(?<=[aou])u$/, velarNasalEnding ? "ũ" : "u")
      .replace(/ei$/, velarNasalEnding ? "eĩ" : "ei")
      .replace(/(?<!w)iY/, "y")
      .replace(/uW/i, "w")
      .replace(/wiY/, "wiy")
      .replace(/tu$/, "t")
      // .replace(/y/i, "j")
      .replace(/Mu$/, finalTranscription.endsWith("m") ? "m" : "n")
  );
}
