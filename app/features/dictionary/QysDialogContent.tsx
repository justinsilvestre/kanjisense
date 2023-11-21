import type { SbgyXiaoyun } from "@prisma/client";
import { PropsWithChildren, useState } from "react";

import {
  MiddleChineseLink,
  MiddleChineseTranscriptionLink,
} from "~/components/AppLink";
import { sbgyXiaoyunToQysSyllableProfile } from "~/features/dictionary/sbgyXiaoyunToQysSyllableProfile";
import { transcribeSyllableProfile } from "~/lib/qys/transcribeXiaoyun";

import { ConsonantHint, MedialHint, ToneHint, VowelHint } from "./QysHints";
import { transcribeSbgyXiaoyun } from "./transcribeSbgyXiaoyun";

export const QysDialogContent = ({
  syllables,
  sbgyXiaoyunsToExemplars,
}: {
  syllables: SbgyXiaoyun[];
  sbgyXiaoyunsToExemplars: Record<string, string[]>;
}) => {
  // const syllables = guangyunYunjing.map((syllableJson) =>
  //   SyllableProfile.fromJSON(syllableJson)
  // );

  const [activeTab, setActiveTab] = useState(0);
  const getSetActiveTab = (index: number) => () => {
    setActiveTab(index);
  };

  return (
    <>
      <p className="mt-0 mb-3">
        This is a <strong>rough sketch</strong> of how this character may have
        been pronounced in the{" "}
        <MiddleChineseLink>historical variety of Chinese</MiddleChineseLink>{" "}
        which forms the primary basis of the <i>on&apos;yomi</i>. The letters in
        this notation are based on{" "}
        <MiddleChineseTranscriptionLink hash="kan-on">
          <i>on&apos;yomi</i> readings borrowed into Japanese sometime around
          the Tang dynasty
        </MiddleChineseTranscriptionLink>
        , with diacritics and other symbols added to represent distinctions not
        recorded in those <i>on&apos;yomi</i>.
      </p>
      <div className="mb-4 flex flex-col p-0">
        <div className="mt-0 flex items-stretch justify-items-stretch gap-1 rounded-t-lg bg-slate-800 p-1">
          {syllables.map((xiaoyun, i) => {
            return (
              <span
                key={xiaoyun.fanqie}
                className={`flex-1 rounded-3xl p-1 text-center text-lg transition-colors ${
                  syllables.length > 1 ? "cursor-pointer" : ""
                } ${
                  syllables.length > 1 && i === activeTab
                    ? "bg-slate-100"
                    : `bg-slate-700  text-white`
                }`}
                role="button"
                tabIndex={0}
                onClick={syllables.length > 1 ? getSetActiveTab(i) : undefined}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (syllables.length > 1) getSetActiveTab(i)();
                  }
                }}
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
            const asciiTranscription = transcribeSyllableProfile(
              syllableProfile,
              { ascii: true },
            );
            const [initial, final] = transcribeSyllableProfile(
              syllableProfile,
              { separator: " " },
            ).split(" ");
            console.log({ syllableProfile, initial, final });

            const medial = /^[yŷẁw]/.test(initial)
              ? null
              : final.match(/^[yŷẁẃw]/);
            console.log({ initial, medial: medial?.[0], final });
            const medialHint = medial ? (
              <MedialHint medial={medial[0]} final={final} />
            ) : null;
            // const matchingKanOn = readings.getKanjidicOnForGuangyun(i, "kan");
            return (
              <div
                key={asciiTranscription}
                className={`mt-0 mb-3 ${activeTab === i ? "" : "hidden"}`}
              >
                {/* <KanOnDevelopment
                  className="mb-3 mt-0 text-center"
                  syllableProfile={syllableProfile}
                  matchingAttestedKanOn={
                    !matchingKanOn ||
                    matchingKanOn?.tags.includes(OnyomiTypes.INFERRED_KAN)
                      ? null
                      : matchingKanOn?.reading
                  }
                /> */}
                <p className={`mb-3 mt-0 text-center`}>
                  <b>syllable initial</b>: {syllable.initial} ⟨{initial}⟩
                </p>
                <p className="mt-0 mb-3 ">
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
                <p className="mt-0 mb-3 text-center">
                  <b>syllable final</b>: {syllable.cycleHead}
                  {syllable.dengOrChongniu} ⟨{final}⟩
                </p>
                {medialHint ? <p className="mt-0 mb-3">{medialHint}</p> : null}
                <p className="mt-0 mb-3">
                  <VowelHint
                    syllable={syllableProfile}
                    asciiTranscription={asciiTranscription}
                  />{" "}
                  <MiddleChineseTranscriptionLink hash="finals">
                    More on the finals of Middle Chinese
                  </MiddleChineseTranscriptionLink>
                </p>
                <p className="mt-0 mb-3 text-center">
                  <b>tone</b>:{" "}
                  {syllable.tone === "平" ? '平 "level" tone' : null}
                  {syllable.tone === "上" ? '上 "rising" tone ⟨ˬ⟩' : null}
                  {syllable.tone === "去" ? '去 "departing" tone ⟨ˎ⟩' : null}
                  {syllable.tone === "入" ? '入 "entering" tone' : null}
                </p>
                <p className="mt-0 mb-3">
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
