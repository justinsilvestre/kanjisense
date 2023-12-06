/* eslint-disable react/no-unescaped-entities */

import { isRouteErrorResponse, useRouteError } from "@remix-run/react";
import {
  ReactNode,
  useState,
  SetStateAction,
  PropsWithChildren,
  Fragment,
} from "react";

import A from "app/components/ExternalLink";
import css from "app/features/dictionary/middle-chinese.css";
import {
  MiddleChineseLink,
  MiddleChineseTranscriptionLink,
} from "~/components/AppLink";
import DictionaryLayout from "~/components/DictionaryLayout";
import { NavLi } from "~/components/NavLi";
import { useTocHighlighting } from "~/components/useTocHighlighting";
import {
  ConsonantHints,
  MedialHints,
  ToneHints,
  VowelHints,
} from "~/features/dictionary/QysHints";

import {
  IpaLink,
  IpaSymbols,
  ipaChartUrl,
} from "../features/dictionary/IpaLink";

export const links = () => [{ rel: "stylesheet", href: css }];

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <div>Figure not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}

interface Section {
  level: number;
  id: string;
  navText: ReactNode;
  children: Section[];
}
const section = (
  level: number,
  id: string,
  navText: ReactNode,
  children: Section[] = [],
): Section => ({
  level,
  id,
  navText,
  children,
});

const SectionIds = {
  "initial-consonants": "initial-consonants",
  "initial-consonants-like-english": "initial-consonants-like-english",
  "initial-consonants-like-english-2": "initial-consonants-like-english-2",
  sibilants: "sibilants",
  "initial-consonants-not-found-in-english":
    "initial-consonants-not-found-in-english",
  "dental-vs-retroflex-stops": "dental-vs-retroflex-stops",
  "on-sound-changes": "on-sound-changes",
  "a-note-on-voiced-sounds": "a-note-on-voiced-sounds",
  dentilabialization: "dentilabialization",
  denasalization: "denasalization",
  "final-consonants": "final-consonants",
  vowels: "vowels",
  "kan-on": "kan-on",
  "japanese-vowels": "japanese-vowels",
  caveats: "caveats",
  finals: "finals",
  "structure-of-finals": "structure-of-finals",
  medials: "medials",
  coda: "coda",
  "main-vowels": "main-vowels",
  tones: "tones",
  "a-finals": "a-finals",
  "e-finals": "e-finals",
  "i-finals": "i-finals",
  "o-finals": "o-finals",
  "u-finals": "u-finals",
  diacritics: "diacritics",
  "four-rows": "four-rows",
  "four-divisions": "four-divisions",
  "go-on": "go-on",
  "kan-on-diacritics": "kan-on-diacritics",
  baxter: "baxter",
  references: "references",
};
const sections = [
  section(0, SectionIds["initial-consonants"], "Initial consonants", [
    section(
      1,
      SectionIds["initial-consonants-like-english"],
      "Initial consonants like English (1)",
    ),
    section(
      1,
      SectionIds["initial-consonants-like-english-2"],
      "Initial consonants like English (2)",
    ),
    section(1, SectionIds["sibilants"], "Sibilant sounds"),
    section(
      1,
      SectionIds["initial-consonants-not-found-in-english"],
      "Initial consonants not found in English",
    ),
    section(
      1,
      SectionIds["dental-vs-retroflex-stops"],
      '"Tongue-head" vs. "tongue-up" sounds',
    ),
    section(
      1,
      SectionIds["on-sound-changes"],
      "Sound changes affecting initial consonants",
      [
        section(
          2,
          SectionIds["a-note-on-voiced-sounds"],
          "Voiced sounds and breathy sounds",
        ),
        section(2, SectionIds["dentilabialization"], "Dentilabialization"),
        section(2, SectionIds["denasalization"], "Denasalization"),
      ],
    ),
  ]),
  section(0, SectionIds["final-consonants"], "Final consonants"),
  section(0, SectionIds["vowels"], "Vowels", [
    section(
      1,
      SectionIds["kan-on"],
      <>
        {" "}
        Viewing Middle Chinese through the{" "}
        <span className="whitespace-nowrap">
          {" "}
          <i>Kan-on</i>{" "}
        </span>
      </>,
    ),
    section(
      1,
      SectionIds["japanese-vowels"],
      "From Japanese to Chinese vowels",
    ),
    section(1, SectionIds["caveats"], "Caveats"),
  ]),
  section(0, SectionIds["finals"], "Finals", [
    section(1, SectionIds["structure-of-finals"], "Structure of finals"),
    section(1, SectionIds["medials"], "Medials"),
    section(1, SectionIds["coda"], "Coda"),
    section(1, SectionIds["main-vowels"], '"Main vowels"'),
    section(1, SectionIds["tones"], "Tones"),
    section(1, SectionIds["a-finals"], <>Finals with main vowel A</>),
    section(1, SectionIds["e-finals"], <>Finals with main vowel E</>),
    section(1, SectionIds["i-finals"], <>Finals with main vowel I</>),
    section(1, SectionIds["o-finals"], <>Finals with main vowel O</>),
    section(1, SectionIds["u-finals"], <>Finals with main vowel U</>),
  ]),
  section(
    0,
    SectionIds["diacritics"],
    "Summary of diacritics used in this notation",
    [
      section(1, SectionIds["four-rows"], "The four rows of the rime tables"),
      section(
        1,
        SectionIds["four-divisions"],
        "Marks of the 'Four Divisions' of the rime tables",
      ),
      section(
        1,
        SectionIds["go-on"],
        "Marks of Kan-on/Go-on vowel alternation",
      ),
      section(
        1,
        SectionIds["kan-on-diacritics"],
        <>
          Marks of vowel alternation within <i>Kan-on</i>
        </>,
      ),
    ],
  ),
  section(0, SectionIds["baxter"], "Why not Baxter's transcription?"),
  section(0, SectionIds["references"], "References"),
];

export default function MiddleChinese() {
  const [isOpen, setIsOpen] = useState(false);
  const vowelTableHeader = (
    <thead className="vowelTableHeader">
      <th></th>
      <th>-∅</th>
      <th>-ng</th>
      <th>-k</th>
      <th>-i</th>
      <th>-n</th>
      <th>-t</th>
      <th>-u</th>
      <th>-m</th>
      <th>-p</th>
    </thead>
  );
  const showContentsButton = (
    <button
      className="float-right text-sm font-normal [line-height:2.4rem] md:hidden"
      onClick={() => setIsOpen((o) => !o)}
    >
      [{isOpen ? "hide" : "show"} contents]
    </button>
  );

  useTocHighlighting();

  return (
    <DictionaryLayout>
      <div className="container">
        <main id="top" className=" leading-7">
          <h2>A rough guide to Middle Chinese pronunciation</h2>

          <section>
            <p>
              The truth is that no one knows exactly how{" "}
              <MiddleChineseLink>Middle Chinese</MiddleChineseLink> used to
              sound. That's why, throughout Kanjisense, I've presented Middle
              Chinese readings using a notation meant only to give you a{" "}
              <b>rough picture of their pronunciation</b>.
            </p>
            <p>
              The International Phonetic Alphabet (IPA) would have afforded more
              precision, but a rough picture like this does a better job at
              reflecting the actual state of our knowledge. Many different
              scholars have come up with many different ways of depicting Middle
              Chinese sounds using the IPA, and all these reconstructions are
              fraught with controversy. It would be impossible for me to choose
              one scholar's reconstruction without forcing the users of this
              dictionary to confront all sorts contentious details of Middle
              Chinese phonology, which, in all likelihood, they're probably not
              interested in.
            </p>
            <p>
              But in case you actually are interested in those contentious
              details, here's a rundown of what all these symbols actually
              represent, using the sounds of English and Japanese as a reference
              point.
            </p>

            <Nav isOpen={true} className="md:hidden" />
          </section>

          <section
            className="mb-10 pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
            id={SectionIds["initial-consonants"]}
          >
            <h3>Initial consonants {showContentsButton}</h3>
            <p>
              Despite the many unknowns of Middle Chinese pronunciation, we do
              happen to know quite a lot about the consonants of Middle Chinese.
              That makes them a good starting point as any for talking about
              Middle Chinese sounds.
            </p>
            <p>
              These consonants were actually documented in detail by scholars in
              premodern China, and even given names. Technically speaking, the
              names here apply to <i>initials</i>, meaning syllable onsets, and
              not consonants in general. But since only a small handful of
              consonants can appear at the end of a syllable in Chinese, we will
              cover all the most important ground in our discussion of initials.
            </p>
            <section
              className="pb-0 pt-14 md:pt-0"
              id={SectionIds["initial-consonants-like-english"]}
            >
              <h4>Initial consonants like English {showContentsButton}</h4>
              <p>
                <strong>Most consonant letters</strong> used in this notation
                represent sounds that are roughly equivalent to common English
                sounds, as far as we know. The symbols in [] brackets enclose
                scholars' reconstructions, in the International Phonetic
                Alphabet. For a chart of IPA symbols with sound recordings, you
                can visit{" "}
                <A href={ipaChartUrl}>
                  the International Phonetic Association website
                </A>
                .
              </p>
              <div className="overflow-x-auto">
                <table className={"pronunciationTable"}>
                  <thead>
                    <tr>
                      <th>name</th>
                      <th>symbol</th>
                      <th>pronunciation</th>
                    </tr>
                  </thead>
                  <tr>
                    <td className="[width:5em]">滂 pʻang</td>
                    <td className="text-center">
                      <G g="pʻ" bold />
                    </td>
                    <td>
                      <IpaLink sound={IpaSymbols.pAspirated} /> as in{" "}
                      <i>
                        <B>p</B>ool
                      </i>
                      . The <G g="ʻ" /> marks{" "}
                      <A href="https://en.wikipedia.org/wiki/Aspiration_(phonetics)">
                        aspiration
                      </A>
                      . Around the Tang dynasty, this sound shifted{" "}
                      <MiddleChineseTranscriptionLink hash="dentilabialization">
                        closer to an [f] sound
                      </MiddleChineseTranscriptionLink>{" "}
                      before certain vowels.
                    </td>
                  </tr>
                  <tr>
                    <td className="[width:5em]">並 bèngˬ</td>
                    <td className="text-center">
                      <G g="b" bold />
                    </td>
                    <td>
                      <IpaLink sound="b" /> as in{" "}
                      <i>
                        <B>b</B>ig
                      </i>
                      . Around the Tang dynasty, this sound{" "}
                      <MiddleChineseTranscriptionLink hash="a-note-on-voiced-sounds">
                        lost its voiced quality
                      </MiddleChineseTranscriptionLink>
                      , and shifted{" "}
                      <MiddleChineseTranscriptionLink hash="dentilabialization">
                        closer to an [f] sound
                      </MiddleChineseTranscriptionLink>{" "}
                      before certain vowels.
                    </td>
                  </tr>
                  <tr>
                    <td className="[width:5em]">明 mẹng</td>
                    <td className="text-center">
                      <G g="m" bold />
                    </td>
                    <td>
                      <IpaLink sound="m" /> as in{" "}
                      <i>
                        <B>m</B>uch
                      </i>
                      . Around the Tang dynasty, this sound shifted{" "}
                      <MiddleChineseTranscriptionLink hash="denasalization">
                        closer to a <IpaLink sound="b" /> sound{" "}
                      </MiddleChineseTranscriptionLink>
                      or{" "}
                      <MiddleChineseTranscriptionLink hash="dentilabialization">
                        a <IpaLink sound={IpaSymbols.vWithHook} /> sound
                      </MiddleChineseTranscriptionLink>
                      , depending on the following vowel.
                    </td>
                  </tr>
                  <tr>
                    <td className="[width:5em]">透 tʻouˎ</td>
                    <td className="text-center">
                      <G g="tʻ" bold />
                    </td>
                    <td>
                      <ConsonantHints.Tx />
                    </td>
                  </tr>
                  <tr>
                    <td className="[width:5em]">定 dèngˎ</td>
                    <td className="text-center">
                      <G g="d" bold />
                    </td>
                    <td>
                      <ConsonantHints.D />
                    </td>
                  </tr>
                  <tr>
                    <td className="[width:5em]">泥 nèiˎ</td>
                    <td className="text-center">
                      <G g="n" bold />
                    </td>
                    <td>
                      <ConsonantHints.N />
                    </td>
                  </tr>
                  <tr>
                    <td className="[width:5em]">心 sim</td>
                    <td className="text-center">
                      <G g="s" bold />
                    </td>
                    <td>
                      <ConsonantHints.S />
                    </td>
                  </tr>
                  <tr>
                    <td className="[width:5em]">邪 zyạ</td>
                    <td className="text-center">
                      <G g="z" bold />
                    </td>
                    <td>
                      <ConsonantHints.Z />
                    </td>
                  </tr>
                  <tr>
                    <td className="[width:5em]">溪 kʻèi</td>
                    <td className="text-center">
                      <G g="kʻ" bold />
                    </td>
                    <td>
                      <ConsonantHints.Kx />
                    </td>
                  </tr>
                  <tr>
                    <td className="[width:5em]">群 gun</td>
                    <td className="text-center">
                      <G g="g" bold />
                    </td>
                    <td>
                      <ConsonantHints.G />
                    </td>
                  </tr>

                  <tr>
                    <td className="[width:5em]">來 lai</td>
                    <td className="text-center">
                      <G g="l" bold />
                    </td>
                    <td>
                      <ConsonantHints.L />
                    </td>
                  </tr>

                  <tr>
                    <td className="[width:5em]">喻 yuˎ</td>
                    <td className="text-center">
                      <G g="y" bold />
                    </td>
                    <td>
                      <ConsonantHints.Y />
                    </td>
                  </tr>
                  <tr>
                    <td className="[width:5em]">喻 yuˎ</td>
                    <td style={{ textAlign: "center" }}>
                      <G g="w" bold />
                    </td>
                    <td style={{ textAlign: "left" }}>
                      <ConsonantHints.W />
                    </td>
                  </tr>
                </table>
              </div>
            </section>

            <section
              className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
              id={SectionIds["initial-consonants-like-english-2"]}
            >
              <h5>
                Initial consonants like English <i>non-initial</i> consonants
              </h5>
              <p>
                Some consonants that only appear in the middle or at the end of
                utterances in English could appear{" "}
                <strong>at the start of words</strong> in Middle Chinese.
              </p>
              <div className="overflow-x-auto">
                <table className={"pronunciationTable"}>
                  <thead>
                    <tr>
                      <th>name</th>
                      <th>symbol</th>
                      <th>pronunciation</th>
                    </tr>
                  </thead>
                  <tr>
                    <td>疑 ngi</td>
                    <td>
                      <G g="ng" bold />
                    </td>
                    <td>
                      <ConsonantHints.Ng />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      幫 pang
                      <br />
                      端 twan
                      <br />見 kènˎ
                    </td>
                    <td>
                      <G g="p" bold /> <br /> <G g="t" bold /> <br />{" "}
                      <G g="k" bold />
                    </td>
                    <td>
                      <>
                        <IpaLink sound="p" /> as in{" "}
                        <i>
                          s<B>p</B>oon
                        </i>
                        .
                      </>
                      . Around the Tang dynasty, this sound shifted{" "}
                      <MiddleChineseTranscriptionLink hash="dentilabialization">
                        closer to an [f] sound
                      </MiddleChineseTranscriptionLink>{" "}
                      before certain vowels.
                      <br />
                      <ConsonantHints.T />
                      <br />
                      <ConsonantHints.K />
                      <br />
                      In other words,{" "}
                      <strong>
                        these consonants don't have{" "}
                        <A href="https://www.britannica.com/topic/aspirate">
                          aspiration
                        </A>
                      </strong>
                      .
                    </td>
                  </tr>
                  <tr>
                    <td>清 tsʻeng</td>
                    <td>
                      <G g="tsʻ" bold />
                    </td>
                    <td>
                      <ConsonantHints.Tsx />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      精 tseng
                      <br />從 dzŷong
                    </td>
                    <td>
                      <G g="ts" bold />
                      <br />
                      <G g="dz" bold />
                    </td>

                    <td>
                      <ConsonantHints.Ts />
                      <br />
                      <ConsonantHints.Dz />
                    </td>
                  </tr>
                  <tr>
                    <td>影 ʾẹngˬ</td>
                    <td>
                      <G g="ʾ" bold />
                    </td>
                    <td>
                      <ConsonantHints.Q />
                    </td>
                  </tr>
                </table>
              </div>
            </section>
            <section
              className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
              id={SectionIds["sibilants"]}
            >
              <h4>Sibilant sounds {showContentsButton}</h4>
              <p>
                Here are some sounds with reasonably close English equivalents,
                though they are spelled in an unfamiliar way. They fall under
                the broad category of <i>sibilant</i> sounds, like English /s/
                and /z/.
              </p>
              <div className="overflow-x-auto">
                <table className={"pronunciationTable"}>
                  <thead>
                    <tr>
                      <th>name</th>
                      <th>symbol</th>
                      <th>pronunciation</th>
                    </tr>
                  </thead>
                  <tr>
                    <td>審 śimˬ</td>
                    <td>
                      <G g="ṣ" bold />
                      <G g="ś" bold />
                    </td>
                    <td>
                      <ConsonantHints.Sh />
                    </td>
                  </tr>

                  <tr>
                    <td>禪 dźenˎ</td>
                    <td>
                      <G g="ẓ" bold />
                      <G g="ź" bold />
                    </td>
                    <td>
                      <ConsonantHints.Zh />
                    </td>
                  </tr>
                  <tr>
                    <td>穿 tśʻwen</td>
                    <td>
                      <G g="tṣʻ" bold />
                      <G g="tśʻ" bold />
                    </td>
                    <td>
                      <ConsonantHints.Tshx />
                    </td>
                  </tr>
                  <tr>
                    <td>牀 dẓâng</td>
                    <td>
                      <G g="dẓ" bold />
                      <G g="dź" bold />
                    </td>
                    <td>
                      <ConsonantHints.Dzh />
                    </td>
                  </tr>
                  <tr>
                    <td>照 tśeuˎ</td>
                    <td>
                      <G g="tṣ" bold />
                      <G g="tś" bold />
                    </td>
                    <td>
                      <ConsonantHints.Tsh />
                    </td>
                  </tr>
                </table>
              </div>

              <p>
                When Chinese scholars first gave names to all these consonants,
                these pairs were all indistinct. But earlier sources distinguish
                them clearly, and so they have two different spellings here. One
                set is spelled with an <i>underdot</i> <G g="◌̣" /> to indicate{" "}
                <A href="https://en.wikipedia.org/wiki/Retroflex_consonant">
                  retroflex
                </A>{" "}
                articulation (pronounced with the tongue curled back), and the
                other set is spelled with with an <i>acute accent</i>{" "}
                <G g="◌́" />, to indicate{" "}
                <A href="https://en.wikipedia.org/wiki/Palatal_consonant">
                  palatal
                </A>{" "}
                articulation (pronounced with the tongue raised towards the
                palate). Such a distinction does not occur in English, but some
                approximations in other languages are given below.
              </p>
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>name</th>
                      <th>spelling</th>
                      <th>earlier pronunciation</th>
                      <th>later pronunciation</th>
                    </tr>
                  </thead>
                  <tr>
                    <td rowSpan={2}>審 śimˬ</td>
                    <td className="text-center">
                      <G g="ṣ" bold />
                    </td>
                    <td>
                      <ConsonantHints.Sr />
                    </td>
                    <td rowSpan={2}>
                      <ConsonantHints.Sr />
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center">
                      <G g="ś" bold />
                    </td>
                    <td>
                      <ConsonantHints.Sj.Early />
                    </td>
                  </tr>
                  <tr>
                    <td rowSpan={2}>照 tśeuˎ</td>
                    <td className="text-center">
                      <G g="tṣ" bold />
                    </td>
                    <td>
                      <ConsonantHints.Tsr />
                    </td>
                    <td rowSpan={2}>
                      <ConsonantHints.Tsr />
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center">
                      <G g="tś" bold />
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td rowSpan={2}>穿 tśʻwen</td>
                    <td className="text-center">
                      <G g="tṣʻ" bold />
                    </td>
                    <td>
                      <ConsonantHints.Tsrx />
                    </td>
                    <td rowSpan={2}>
                      <ConsonantHints.Tsrx />
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center">
                      <G g="tśʻ" bold />
                    </td>
                    <td>
                      <ConsonantHints.Tsjx.Early />
                    </td>
                  </tr>
                  <tr>
                    <td rowSpan={2}>牀 dẓâng</td>
                    <td className="text-center">
                      <G g="dẓ" bold />
                    </td>
                    <td>
                      <ConsonantHints.Dzr.Early />
                    </td>
                    <td rowSpan={2}>
                      <ConsonantHints.Dzr.Late />
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center">
                      <G g="dź" bold />
                    </td>
                    <td>
                      <ConsonantHints.Dzj.Early />
                    </td>
                  </tr>
                  <tr>
                    <td rowSpan={2}>禪 dźenˎ</td>

                    <td className="text-center">
                      <G g="ẓ" bold />
                    </td>
                    <td>
                      <ConsonantHints.Zr.Early />
                    </td>
                    <td rowSpan={2}>
                      <ConsonantHints.Zr.Late />
                    </td>
                  </tr>

                  <tr>
                    <td className="text-center">
                      <G g="ź" bold />
                    </td>
                    <td>
                      <ConsonantHints.Zj.Early />
                    </td>
                  </tr>
                </table>
              </div>
            </section>
            <section
              className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
              id={SectionIds["initial-consonants-not-found-in-english"]}
            >
              <h4>
                Initial consonants not found in English {showContentsButton}
              </h4>
              <p>
                The consonant inventory of Middle Chinese also included some{" "}
                <b>
                  sounds with no equivalent in most standard English varieties
                </b>
                .
              </p>
              <div className="overflow-x-auto">
                <table className={"pronunciationTable"}>
                  <thead>
                    <tr>
                      <th>name</th>
                      <th>symbol</th>
                      <th>pronunciation</th>
                    </tr>
                  </thead>
                  <tr>
                    <td>曉 khèuˬ</td>
                    <td>
                      <G g="kh" bold />{" "}
                    </td>
                    <td>
                      <ConsonantHints.Kh />
                    </td>
                  </tr>
                  <tr>
                    <td>匣 ghạp</td>
                    <td>
                      <G g="gh" bold />
                    </td>
                    <td>
                      <ConsonantHints.Gh />
                    </td>
                  </tr>
                  <tr>
                    <td>日 njīt</td>
                    <td>
                      <G g="nj" bold />
                    </td>
                    <td>
                      <ConsonantHints.Nj />
                    </td>
                  </tr>
                  <tr>
                    <td>喻 yuˎ</td>
                    <td>
                      <G g="ẁ" bold />
                    </td>
                    <td>
                      <ConsonantHints.Yw />
                    </td>
                  </tr>
                  <tr>
                    <td>喻 yuˎ</td>
                    <td>
                      <G g="∅" bold />
                    </td>
                    <td>
                      <ConsonantHints.H />
                    </td>
                  </tr>
                </table>
              </div>
            </section>

            <section
              className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
              id={SectionIds["dental-vs-retroflex-stops"]}
            >
              <h4>"Tongue-head" vs. "tongue-up" sounds {showContentsButton}</h4>
              <p>
                The consonants written <G g="tʻ" /> <G g="t" /> <G g="d" />{" "}
                <G g="n" /> can each be pronounced one of two ways, depending on
                the following sounds. Chinese scholars distinguished one set as
                舌頭 "tongue-head" sounds, and the other as 舌上 "tongue-up"
                sounds.
              </p>
              <p>
                In general, before any vowel sound written with the{" "}
                <strong>underdot</strong> <G g="◌̣" />, and before the{" "}
                <strong>letters Y, I, E, and U</strong>, these letters represent
                the "tongue-up" sounds, which were likely pronounced with{" "}
                <A href="https://en.wikipedia.org/wiki/Retroflex_consonant">
                  retroflex
                </A>{" "}
                articulation, i.e. with the tongue more curled back. Modern
                scholars originally thought that these were{" "}
                <A href="https://en.wikipedia.org/wiki/Palatal_consonant">
                  palatal
                </A>{" "}
                sounds. Nowadays, it's widely accepted that retroflex
                articulation is more likely, but there's a chance that these
                "tongue-up" sounds may have been pronounced slightly differently
                in different environments.
              </p>
              <p>
                Before <strong>other vowels</strong>, and before the vowel{" "}
                <G g="è" /> <strong>with grave accent</strong>, these letters
                represent the "tongue-head" sounds, which were likely pronounced
                with{" "}
                <A href="https://en.wikipedia.org/wiki/Dental_consonant">
                  dental
                </A>{" "}
                articulation, i.e. with the tongue closer to the teeth.
              </p>
              <div className="overflow-x-auto">
                <table>
                  <tr>
                    <td rowSpan={2} className="text-center">
                      <G g="t" bold />
                    </td>
                    <td className="[width:5em]">知 tï</td>
                    <td>
                      <ConsonantHints.Tr />
                    </td>
                  </tr>
                  <tr>
                    <td className="[width:5em]">端 twan</td>
                    <td>
                      <ConsonantHints.T />
                    </td>
                  </tr>
                  <tr>
                    <td rowSpan={2} className="text-center">
                      <G g="tʻ" bold />
                    </td>
                    <td className="[width:5em]">徹 tʻet</td>
                    <td>
                      <ConsonantHints.Trx />
                    </td>
                  </tr>
                  <tr>
                    <td className="[width:5em]">透 tʻouˎ</td>
                    <td>
                      <ConsonantHints.Tx />
                    </td>
                  </tr>
                  <tr>
                    <td rowSpan={2} className="text-center">
                      <G g="d" bold />
                    </td>
                    <td className="[width:5em]">澄 dạng</td>
                    <td>
                      <ConsonantHints.Dr />
                    </td>
                  </tr>
                  <tr>
                    <td className="[width:5em]">定 dèngˎ</td>
                    <td>
                      <ConsonantHints.D />
                    </td>
                  </tr>
                  <tr>
                    <td rowSpan={2} className="text-center">
                      <G g="n" bold />
                    </td>
                    <td className="[width:5em]">孃 nyang</td>
                    <td>
                      <ConsonantHints.Nr />
                    </td>
                  </tr>
                  <tr>
                    <td className="[width:5em]">泥 nèiˎ</td>
                    <td>
                      <ConsonantHints.N />
                    </td>
                  </tr>
                </table>
              </div>
              <p>
                In general, the vowel determines whether to choose between
                "tongue-head" or "tongue-up" sounds. (Linguists might describe
                these sounds as being in <i>nearly</i>{" "}
                <A href="https://en.wikipedia.org/wiki/Complementary_distribution">
                  complementary distribution
                </A>
                .) There are only a couple cases in the whole language where a
                "tongue-head" (dental) sound shows up where you would expect a
                "tongue-up" (retroflex) sound. In these exceptional cases, the
                dental sounds are distinguished with a following <G g="h" />.
              </p>
              <div className="overflow-x-auto">
                <table className=" text-center">
                  <thead>
                    <tr>
                      <th>retroflex</th>
                      <th>dental</th>
                    </tr>
                  </thead>
                  <tr>
                    <td>
                      盯 tạngˬ
                      <br />
                      <i>stare</i>
                    </td>
                    <td>
                      打 thạngˬ
                      <br />
                      <i>hit</i>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      緻 dīˎ
                      <br />
                      <i>delicate, fine</i>
                    </td>
                    <td>
                      地 dhīˎ
                      <br />
                      <i>earth</i>
                    </td>
                  </tr>
                  <tr>
                    <td className="align-middle">(no such word)</td>
                    <td>
                      伱 nhiˬ
                      <br />
                      <i>you (colloquial)</i>
                    </td>
                  </tr>
                </table>
              </div>
            </section>

            <section
              className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
              id={SectionIds["on-sound-changes"]}
            >
              <h4>
                Sound changes affecting initial consonants {showContentsButton}
              </h4>
              <section>
                <p>
                  Here are a couple more sound changes in addition to those
                  affecting <ScrollLink hash="sibilants">sibilants</ScrollLink>{" "}
                  mentioned above.
                </p>
                <p>
                  While linguists broadly agree about all the sound changes
                  mentioned here,{" "}
                  <strong>
                    there is no universally accepted timeline for them
                  </strong>
                  . These changes probably did not happen at exactly the same
                  time or at the same rate. That means, in order to precisely
                  represent the sound of any of these more unstable consonants
                  at any point past the earliest stages of Middle Chinese (just
                  before the Tang dynasty), we would have to first answer the
                  question of how fast these sound changes happened. When
                  dealing with a consonant like <G g="b" /> or <G g="dź" /> that
                  was affected by multiple sound changes, it would get even more
                  complicated.
                </p>
                <p>
                  These are difficult questions, and judging by the lack of
                  agreement over so many other questions in historical Chinese
                  phonology, I would guess that there is no answer that would
                  satisfy everyone. This is why I will discuss these sound
                  changes without giving any specific dates.
                </p>
                <p>
                  Herein lies one of the advantages of this notation over the
                  IPA. As these letters don't represent precise phonetic values
                  at any given stage of Middle Chinese, we can avoid the issue
                  of reconciling the various timelines of all these sound
                  changes.
                </p>
              </section>
              <section
                className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
                id={SectionIds["a-note-on-voiced-sounds"]}
              >
                <h4>Voiced sounds and breathy sounds {showContentsButton}</h4>
                <p>
                  Some scholars think a few initial consonants that started as{" "}
                  <A href="https://en.wikipedia.org/wiki/Voiced_consonant">
                    voiced sounds
                  </A>{" "}
                  eventually gained a quality called{" "}
                  <A href="https://en.wikipedia.org/wiki/Breathy_consonant">
                    breathiness
                  </A>{" "}
                  before they merged with their unvoiced counterparts (sometimes
                  with aspiration, sometimes without).
                </p>
                <div className="overflow-x-auto">
                  <table>
                    <thead>
                      <th>name</th>
                      <th>spelling</th>
                      <th>earlier pronunciation</th>
                      <th>later pronunciation</th>
                    </thead>
                    <tr>
                      <td className="[width:5em]">並 bèngˬ</td>
                      <td className="text-center">
                        <G g="b" bold />
                      </td>
                      <td>
                        <IpaLink sound="b" /> as in{" "}
                        <i>
                          <B>b</B>ig
                        </i>
                      </td>
                      <td>
                        <IpaLink sound={IpaSymbols.pBreathy} /> like Korean{" "}
                        <i>
                          <B>b</B>ap
                        </i>
                        , or something like Hindi{" "}
                        <i>
                          <B>bh</B>akti
                        </i>
                      </td>
                    </tr>
                    <tr>
                      <td className="[width:5em]">定 dèngˎ</td>
                      <td className="text-center">
                        <G g="d" bold />
                      </td>
                      <td>
                        <IpaLink sound="d" /> as in{" "}
                        <i>
                          <B>d</B>og
                        </i>
                      </td>
                      <td>
                        <IpaLink sound={IpaSymbols.tBreathy} /> like Korean{" "}
                        <i>
                          <B>d</B>oenjang
                        </i>
                        , or something like Hindi{" "}
                        <i>
                          <B>d</B>harma
                        </i>
                      </td>
                    </tr>
                    <tr>
                      <td className="[width:5em]">邪 zyạ</td>
                      <td className="text-center">
                        <G g="z" bold />
                      </td>
                      <td>
                        <IpaLink sound="z" /> as in{" "}
                        <i>
                          <B>z</B>oo
                        </i>
                      </td>
                      <td>
                        <IpaLink sound={IpaSymbols.sBreathy} /> something like
                        Korean{" "}
                        <i>
                          <B>S</B>eoul
                        </i>
                      </td>
                    </tr>
                    <tr>
                      <td className="[width:5em]">群 gun</td>
                      <td className="text-center">
                        <G g="g" bold />
                      </td>
                      <td>
                        <IpaLink sound={IpaSymbols.scriptG} /> as in{" "}
                        <i>
                          <B>g</B>o
                        </i>
                      </td>
                      <td>
                        <IpaLink sound={IpaSymbols.kBreathy} /> like Korean{" "}
                        <i>
                          <B>g</B>im
                        </i>
                        , or something like Hindi{" "}
                        <i>
                          <B>gh</B>ee
                        </i>
                      </td>
                    </tr>
                    <tr>
                      <td>從 dzŷong</td>{" "}
                      <td className="text-center">
                        <G g="dz" bold />
                      </td>
                      <td>
                        <IpaLink sound="dz" /> as in{" "}
                        <i>
                          a<B>dz</B>e
                        </i>
                      </td>
                      <td>
                        <IpaLink sound={IpaSymbols.tsBreathy} /> like{" "}
                        <G g="ts" />, but with a{" "}
                        <A href="https://en.wikipedia.org/wiki/Breathy_consonant">
                          breathy
                        </A>{" "}
                        quality
                      </td>
                    </tr>
                    <tr>
                      <td className="[width:5em]">牀 dẓâng</td>
                      <td className="text-center">
                        <G g="dẓ" bold />
                        <G g="dź" bold />
                      </td>
                      <td>
                        <IpaLink sound={IpaSymbols.dZWithLoop} />{" "}
                        <IpaLink sound={IpaSymbols.dZWithCurl} /> as in{" "}
                        <i>
                          <B>j</B>udge
                        </i>{" "}
                        (see above)
                      </td>
                      <td rowSpan={2}>
                        <IpaLink sound={IpaSymbols.tCWithCurlBreathy} /> like
                        Korean{" "}
                        <i>
                          <B>j</B>apchae
                        </i>
                        , or something like Hindi{" "}
                        <i>
                          <B>jh</B>arna
                        </i>
                      </td>
                    </tr>
                    <tr>
                      <td className="[width:5em]">禪 dźenˎ</td>
                      <td className="text-center">
                        <G g="ẓ" bold />
                        <G g="ź" bold />
                      </td>
                      <td>
                        <IpaLink sound={IpaSymbols.zWithLoop} />{" "}
                        <IpaLink sound={IpaSymbols.zWithCurl} /> as in{" "}
                        <i>
                          <B>J</B>acques
                        </i>{" "}
                        (see above)
                      </td>
                    </tr>
                  </table>
                </div>
                <p>
                  These voiced sounds also had an effect on the pitch of the
                  following vowel, causing some{" "}
                  <ScrollLink hash="tones">tonal splits and mergers</ScrollLink>
                  . The comparison to Korean consonants may be especially apt,
                  as these Korean "voiced" or "breathy" also have the effect of
                  lowering the pitch of following vowels, and have merged
                  recently with their unvoiced aspirated counterparts.
                </p>
              </section>
              <section
                className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
                id={SectionIds["dentilabialization"]}
              >
                <h4>Dentilabialization {showContentsButton}</h4>
                <p>
                  The sounds written <G g="p" /> <G g="pʻ" /> <G g="b" />{" "}
                  eventually all became an F-like sound before certain sounds.
                  This phenomenon is called <i>dentilabialization</i> (since
                  this F-sound is pronounced <i>labiodentally</i>, with the
                  teeth and the lips). These new sounds were not represented
                  distinctly in <i>on'yomi</i>, but they feature prominently in
                  modern Chinese languages like Mandarin. For instance, 風{" "}
                  <G g="pūng" />, 菲 <G g="pʻî" />, 房 <G g="bâng" /> became{" "}
                  <i>fēng</i>, <i>fēi</i>, and <i>fáng</i> in Mandarin.
                </p>
                <div className="overflow-x-auto">
                  <table>
                    <thead>
                      <tr>
                        <th>spelling</th>
                        <th>names</th>
                        <th>earlier pronunciation</th>
                        <th>later pronunciation</th>
                      </tr>
                    </thead>
                    <tr>
                      <td rowSpan={2}>
                        <G g="p" />
                      </td>
                      <td>幫 pang</td>
                      <td colSpan={2}>
                        <IpaLink sound="p" /> as in{" "}
                        <i>
                          s<B>p</B>oon
                        </i>
                      </td>
                    </tr>
                    <tr>
                      <td>非 pî</td>
                      <td>(same as above)</td>
                      <td>
                        <ConsonantHints.Pv />
                      </td>
                    </tr>
                    <tr>
                      <td rowSpan={2}>
                        <G g="pʻ" />
                      </td>
                      <td>滂 pʻang</td>
                      <td colSpan={2}>
                        <IpaLink sound={IpaSymbols.pAspirated} /> as in{" "}
                        <i>
                          <B>p</B>ool
                        </i>
                      </td>
                    </tr>
                    <tr>
                      <td>敷 pʻu</td>
                      <td>(same as above)</td>
                      <td>
                        <ConsonantHints.Pxv />
                      </td>
                    </tr>
                    <tr>
                      <td rowSpan={2}>
                        <G g="b" />
                      </td>
                      <td>並 bèngˬ</td>
                      <td colSpan={2}>
                        <IpaLink sound="b" /> as in{" "}
                        <i>
                          <B>b</B>ig
                        </i>
                      </td>
                    </tr>
                    <tr>
                      <td>奉 bôngˬ</td>
                      <td>(same as above)</td>
                      <td>
                        <ConsonantHints.Bv />
                      </td>
                    </tr>
                  </table>
                </div>
                <p>
                  Linguists have competing theories about the exact phonological
                  triggers of these changes. In this notation, vowels triggering
                  dentilabialization are written either with the letter U or
                  with the circumflex accent, i.e. one of the vowels <G g="â" />
                  , <G g="ê" />
                  , <G g="î" />, or <G g="ô" />.
                </p>

                <p>
                  Dentilabialization also affected the sound written <G g="m" />
                  , which eventually became something like a W or V sound in
                  English. So, words like 物 <G g="mut" /> became <i>wù</i> in
                  Mandarin. All the same vowel sounds caused dentilabialization
                  of <G g="m" />, with the exception of sounds written here with
                  the macron <G g="ū" />. 目 <G g="mūk" /> became <i>mù</i>{" "}
                  instead of <i>wù</i>.
                </p>

                <div className="overflow-x-auto">
                  <table>
                    <thead>
                      <tr>
                        <th>spelling</th>
                        <th>names</th>
                        <th>earlier pronunciation</th>
                        <th>later pronunciation</th>
                      </tr>
                    </thead>
                    <tr>
                      <td rowSpan={2}>
                        <G g="m" />
                      </td>
                      <td>明 mẹng</td>
                      <td colSpan={2}>
                        <IpaLink sound="m" /> as in{" "}
                        <i>
                          <B>m</B>uch
                        </i>
                      </td>
                    </tr>
                    <tr>
                      <td>微 mî</td>
                      <td>(same as above)</td>
                      <td>
                        <ConsonantHints.Mv />
                      </td>
                    </tr>
                  </table>
                </div>
              </section>
              <section
                className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
                id={SectionIds["denasalization"]}
              >
                <h4>
                  "Denasalization" of <G g="m" /> <G g="n" /> <G g="ng" />
                  {showContentsButton}
                </h4>
                <p>
                  Perhaps in parallel with the shift of <G g="b" /> <G g="d" />{" "}
                  <G g="g" /> towards <G g="pʻ" /> <G g="tʻ" /> <G g="kʻ" />,
                  the nasal consonants <G g="m" /> <G g="n" /> <G g="ng" />{" "}
                  underwent a change in which they appeared to lose their nasal
                  quality before certain vowels, judging by their representation
                  in <i>on'yomi</i>. For instance, the the character 無 in{" "}
                  <A href="https://en.wikipedia.org/wiki/Go-on">
                    earlier borrowings
                  </A>{" "}
                  into Japanese was pronounced /mu/, and then in{" "}
                  <A href="https://en.wikipedia.org/wiki/Kan-on">
                    later borrowings
                  </A>{" "}
                  it became /bu/. One explanation is that they became{" "}
                  <i>prenasalized stops</i>—retaining a nasal quality, but
                  without a nasal release.
                </p>
                <p>
                  This seems to have been a short-lived phenomenon, which was
                  limited to the capital of the Tang dynasty, Chang'an. In
                  modern Chinese languages, there is little trace of these
                  "denasalized" sounds.
                </p>
              </section>
            </section>
          </section>

          <section
            className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
            id={SectionIds["final-consonants"]}
          >
            <h3>Final consonants {showContentsButton}</h3>
            <p>
              As mentioned above, the traditional consonant names of Middle
              Chinese given above technically apply to <i>initial</i>{" "}
              consonants, i.e. those at the start of a syllable. But it's beyond
              any doubt that a subset of these consonants could also appear at
              the end of a syllable. These are the <i>stop consonants</i>{" "}
              <G g="p" /> <G g="t" /> <G g="k" /> and the{" "}
              <i>nasal consonants</i> <G g="m" /> <G g="n" /> <G g="ng" />. It's
              possible that these syllable-endings involved more distinctions,
              like{" "}
              <A href="https://en.wikipedia.org/Palatalization">palatalized</A>{" "}
              or <A href="https://en.wikipedia.org/Labialization">labialized</A>{" "}
              variants. But these are not widely agreed upon, and so they are
              not represented in this notation.
            </p>
          </section>

          <section
            className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
            id={SectionIds["vowels"]}
          >
            <h3>Vowels {showContentsButton}</h3>
            <h5 id="the-problem-with-reconstructions">
              The problem with Middle Chinese reconstructions
            </h5>
            <p>
              Compared with the consonants, little is known for certain with
              regard to the vowels of Middle Chinese. Various scholars have come
              up with various ways of reconstructing them. They don't even agree
              on how many distinct vowels there were in the language.
            </p>
            <p>
              This situation is very different from that of other ancient
              languages like Latin, Greek, or Sanskrit. As you might expect,
              this difference is largely because there is nothing like a native
              Chinese alphabetic writing system for us to learn from. The
              Chinese characters do have some phonetic elements (contrary to
              popular belief), but not enough to help scholars recover any exact
              values for the ancient vowel sounds with total certainty. So it
              makes sense that scholars of Chinese make use of drastically
              different techniques for their reconstructions compared with those
              available to scholars of Latin, Greek, and Sanskrit. In fact,
              their techniques differ so much that some suggest that all
              scholarly reconstructions of Middle Chinese aren't really proper
              "reconstructions" at all.
            </p>
            <p>
              This has to do with the peculiar nature of the most central pieces
              of evidence in Middle Chinese reconstructions, the <i>Qieyun</i>{" "}
              rhyme dictionary and the so-called "rime tables". These sources
              are of unquestionable importance for anyone interested in
              historical Chinese pronunciation, and yet they they offer little
              in the way of <b>direct evidence</b> for reconstructing Chinese
              sounds. What they <em>do</em> offer us is a wealth of information
              about historical Chinese pronunciation that is, unfortunately,
              impossible to sum up briefly. Or at least, it's impossible to sum
              up in a way that's easy for the non-specialist to understand, so I
              won't bother trying here.
            </p>
            <p>
              Suffice it to say, these sources are not like the kind of
              dictionaries you or I are used to today, which aim to represent,
              for the most part, the words of a language in one particular time
              and place. So, seeing as the very concept of "Middle Chinese" is
              so intimately tied to these sources, this leads many scholars to
              flat-out deny the existence of "Middle Chinese" as a single
              coherent spoken language. In light of this, it only makes sense
              that they would also question the validity of any reconstruction
              of "Middle Chinese" that treats it as such.
            </p>
            <p>
              It's an altogether complicated, messy situation. So let's leave
              reconstructions aside for a moment, and instead, let's work
              through a little thought experiment.
            </p>
            <div id="a-thought-experiment">
              <h5>A thought experiment</h5>
              <p>
                Say we were to travel back in time to around the Heian period in
                Japan, circa 800 C.E., give or take a century or two—in other
                words, the same time as the Tang/Song dynasties. If we came
                across one of the many Japanese speakers at the time who were
                familiar with Chinese, and asked them to{" "}
                <strong>
                  learn the Latin alphabet and try writing down Chinese in it
                </strong>
                , what kind of system might they come up with?
              </p>
              <p>
                This might seem like a strange question, but in answering it, we
                can go actually a long way towards answering questions about
                Middle Chinese sounds in a satisfying way.
              </p>
              <p>
                So let's think. Our new Japanese friend from 800 C.E. probably
                would come up with a rather flawed system for writing Chinese
                sounds. With no training in modern linguistics, they might
                represent some consonants and vowels ambiguously. There would
                also be some interference from their native Early Middle
                Japanese, causing them to confuse some sounds, and leave out
                some sounds altogether. But despite these shortcomings, they
                would likely represent the sounds of Middle Chinese more
                faithfully than you or I could possibly manage to. After all,
                this is a living, breathing contemporary of Tang China—some
                Japanese people at the time actually traveled to China and
                joined the upper ranks of society there. So this person would
                have learned the language from actual speakers of Tang-era
                Chinese, giving them such insight into the language as we could
                only dream of.
              </p>
            </div>
            <section
              className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
              id="kan-on"
            >
              <h4>
                Viewing Middle Chinese through the lens&nbsp;of&nbsp;the&nbsp;
                <i>Kan-on</i>
                {showContentsButton}
              </h4>
              <p>
                I invite you to think of the Middle Chinese notation used here
                as something like{" "}
                <ScrollLink hash="a-thought-experiment">
                  our imaginary friend from Heian Japan
                </ScrollLink>{" "}
                might have come up with. It doesn't reconstruct specific
                consonants and vowels, but it's designed to bring you{" "}
                <b>closer to the source</b> than any scholarly reconstruction.
              </p>
              <p>
                This is possible in large part thanks to the <i>on'yomi</i>{" "}
                tradition. These character readings may come from Japan, but
                they represent the attempts of real-life speakers of Tang-era
                Chinese to write down the sounds of the language. This has made
                the <i>on'yomi</i> an invaluable resource for scholars and
                anyone else trying to understand the sounds of Middle Chinese.
                Therefore, this notation uses the <i>on'yomi</i> as a starting
                point—in particular, those <i>on'yomi</i> which were recorded by
                Japanese speakers around the Tang dynasty, known as{" "}
                <b>
                  <i>Kan-on</i>
                </b>
                .
              </p>
              <p>
                The foundation of this notation consists of a rendition of the{" "}
                <i>Kan-on</i> using ordinary Latin letters taken from the
                standard conventions of romanized Japanese. Additional symbols
                are introduced in order to represent other distinctions which
                were not recorded in the <i>Kan-on</i> tradition,{" "}
                <b>without committing to precise phonetic values</b>. To
                illustrate, let's take an example of a few characters which are
                read with the <i>on'yomi</i> カ <i>ka</i>. In our notation, each
                of them is written like <G g="ka" />, but with slight
                variations.
              </p>
              <ul>
                <li>歌 ka</li>
                <li>家 kạ</li>
                <li>佳 kạ̈</li>
              </ul>
              <p>
                The different diacritic marks on A are a sign that these vowels
                were <i>somehow</i> different from each other, though the exact
                nature of these differences is not universally agreed upon. The
                specific usage of these diacritics is meant to tell us a few
                things.
              </p>
              <ul>
                <li>
                  Both <G g="kạ" /> and <G g="kạ̈" /> share the underdot mark as
                  a way of signalling that scholars put them{" "}
                  <MiddleChineseTranscriptionLink hash="division-ii">
                    together in a group
                  </MiddleChineseTranscriptionLink>{" "}
                  separate from bare <G g="ka" />. This group is generally
                  reconstructed with more <i>front vowels</i>, like{" "}
                  <IpaLink sound="a" /> <IpaLink sound={IpaSymbols.ash} />{" "}
                  <IpaLink sound={IpaSymbols.epsilon} /> (closer to the A in{" "}
                  <i>cat</i> or the E in <i>bed</i>), as opposed to the more{" "}
                  <i>back vowel</i> in <G g="ka" />{" "}
                  <IpaLink sound={IpaSymbols.alpha} /> (closer to the A in{" "}
                  <i>father</i>). In addition, scholars sometimes reconstruct
                  these syllables with a <i>velar</i> or <i>palatal</i> element
                  before the vowel like <IpaLink sound={IpaSymbols.gamma} /> or{" "}
                  <IpaLink sound="j" />.
                </li>
                <li>
                  Between <G g="kạ" /> and <G g="kạ̈" />, the double-dot is a way
                  of signalling another difference&mdash;namely, it's likely
                  that the <G g="kạ̈" /> had a <i>higher</i> or more <i>front</i>{" "}
                  vowel. So scholars posit for 家 <G g="kạ" /> sounds like{" "}
                  <IpaLink broad sound="kɣæ" />, <IpaLink broad sound="kjaː" />,
                  etc., whereas 佳 <G g="kạ̈" /> gets something like{" "}
                  <IpaLink broad sound="kɣɛ" />, <IpaLink broad sound="kjaːj" />{" "}
                  etc.
                </li>
              </ul>

              <p>
                Hopefully now you can see why it's not so easy to represent
                Middle Chinese vowels in the International Phonetic Alphabet.
                The IPA only allows us to represent one scholar's reconstruction
                at a time. It allows us to do so with great precision, but such
                precision isn't always desirable. The inherent imprecision of a
                notation like ours actually has its advantages. By avoiding
                precise phonetic symbols, we avoid committing to{" "}
                <i>one single</i> scholar's vision, and we can instead express{" "}
                <strong>
                  patterns that are common to many scholars' visions
                </strong>
                . This works because this notation was built on the foundation
                of the <i>Kan-on</i> tradition and other important sources which
                form the arsenal of{" "}
                <i>
                  all scholarly reconstructions of Middle Chinese ever published
                </i>
                .
              </p>
            </section>
            <section
              className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
              id={SectionIds["japanese-vowels"]}
            >
              <h4>From Japanese to Chinese vowels {showContentsButton}</h4>
              <p>
                From here on out, we will be talking about Chinese vowels with
                reference to the vowels of Japanese, so let's talk briefly about
                Japanese vowels. At the time of <i>Kan-on</i>, the Japanese
                vowel system was not very different than it is today. The
                so-called "Early Middle Japanese" of this period had a
                five-vowel system much like those of many other world languages,
                such as Spanish, Swahili, Hawaiian, and so on.
              </p>
              <ul>
                <li>
                  /a/ Much like the A in <i>father</i>, as in modern Japanese.
                </li>
                <li>
                  /i/ Much like the I in <i>machine</i>, as in modern Japanese.
                </li>
                <li>
                  /u/ Much like the U in <i>rule</i>. This sound may have been
                  more rounded than the corresponding sound in modern Japanese,
                  which is often transcribed as{" "}
                  <IpaLink broad sound={IpaSymbols.turnedM} />.
                </li>
                <li>
                  /e/ Narrowly transcribed <IpaLink sound="ʲe" />, much like the{" "}
                  <G g="ye"></G> in <i>yes</i>. So the same as in modern
                  Japanese, except with an initial glide like a Y sound.
                </li>
                <li>
                  /o/ Narrowly transcribed <IpaLink sound="ʷo" />, much like the{" "}
                  <G g="wo"></G> in <i>worn</i>. So the same as in modern
                  Japanese, except with an initial glide like a W sound.
                </li>
              </ul>
              <p>
                (At the beginning of the Early Middle Japanese period, there was
                actually an additional vowel{" "}
                <IpaLink broad sound={IpaSymbols.schwa} />. But this merged with
                the <IpaLink broad sound="o" /> sound some time after 1000 C.E.
                So it still makes sense to say that the fivefold vowel system
                above remained intact throughout the shared history of Early
                Middle Japanese and Middle Chinese.)
              </p>
              <p>
                Five-vowel systems like this just so happen to be a great match
                for the Latin alphabet—a coincidence which turns out to be great
                news for our thought experiment. Remember, we're trying to
                imagine how someone from Heian-era Japan might use the Latin
                alphabet to represent Middle Chinese sounds. And the vowels pose
                the biggest challenge by far because of the lack of direct
                evidence for Middle Chinese vowels (as opposed to the
                consonants, which scholars back in the day so kindly{" "}
                <ScrollLink hash="consonants">
                  named and listed out for us
                </ScrollLink>
                ).
              </p>
              <p>
                So while we may never know exactly what the vowels of Middle
                Chinese sounded like, we <i>can</i> answer this different, also
                compelling question. That is, how might one{" "}
                <strong>best approximate</strong> the Middle Chinese vowels
                given just five vowel symbols? We need only to look to the{" "}
                <i>on'yomi</i> for the answer. For practically every syllable of
                Middle Chinese, we know exactly how Japanese speakers of the
                Heian period interpreted it in their own five-vowel system.
                These <i>Kan-on</i> readings will allow us to actually bring our
                thought experiment to a pretty satisfying conclusion, no time
                machine needed.
              </p>
              <p>
                All games aside, there is a real-world lesson here for us who
                are trying to spell out the sounds of Middle Chinese using the
                Latin alphabet. There's no need to wrack our brains trying to
                think of the best way to write out Middle Chinese vowels in a
                five-vowel system. The work has already been done for us by the
                compilers of the <i>Kan-on</i> readings. These people were real
                contemporaries of Tang China, who knew these vowel sounds more
                intimately than we could ever hope to.
              </p>
            </section>
            <section
              className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
              id={SectionIds["caveats"]}
            >
              <h4>Caveats {showContentsButton}</h4>
              <p>
                The{" "}
                <ScrollLink hash="kan-on">
                  <i>Kan-on</i>
                </ScrollLink>{" "}
                are a good starting point for understanding the sounds of Middle
                Chinese, because, <i>in the vast majority of cases</i>, the
                compilers of <i>Kan-on</i> wrote down Middle Chinese sounds in a
                manner that was nice and consistent. But there are exceptions to
                this general rule. After all, the <i>Kan-on</i> aren't the work
                of one specific person like our imaginary friend from Heian
                Japan. They're simply a collection of character readings that
                happened to get recorded during this particular period of time.
                We can't expect them to depict the sounds of Middle Chinese in a
                totally systematic way.
              </p>
              <p>
                On the other hand, the whole point of this notation is to depict
                Middle Chinese sounds in a systematic way. For that reason,
                there are some places where it deviates from <i>Kan-on</i>.
                Thankfully, these cases are few, since the <i>Kan-on</i> are
                mostly consistent. In the following section on the{" "}
                <ScrollLink hash="finals">finals</ScrollLink>, I go into
                specific cases of inconsistencies within the <i>Kan-on</i>. But
                here's the general idea of how this writing system handles these
                inconsistencies.
              </p>
              <h5>
                Plain old inconsistencies in <i>Kan-on</i>
              </h5>
              <p>
                Take the character 佳. It is known to have a single Middle
                Chinese reading, but it has multiple <i>Kan-on</i> readings:{" "}
                /ka/ and /kai/. These are both legitimate <i>Kan-on</i>, since
                they were both recorded sometime around the Heian period. In
                cases like this, where there are multiple <i>Kan-on</i>{" "}
                available, this notation{" "}
                <strong>reflects only one of these readings</strong> in the
                vowel letters. So in the case of 佳, we will always write{" "}
                <G g="kạ̈" />, instead of something like <G g="kạ̈i" />. (The
                reasoning behind these design decisions are too complicated to
                go into here, but they were generally taken to keep different
                vowels visually distinct, and sometimes take general trends in
                reconstructions into account.)
              </p>
              <h5 id="vowel-alternation">
                Predictable vowel alternation in <i>Kan-on</i>
              </h5>
              <p>
                Sometimes, one Middle Chinese vowel is rendered in a couple
                different ways in <i>Kan-on</i>, but the variation happens in a
                pretty consistent way. For example, the characters 水 and 軌 had
                the same final in Chinese, but in <i>Kan-on</i>, they are
                rendered with different vowels as 水 /sui/ and 軌 /kwi/. This
                appears at first glance to be an inconsistency, but when we look
                at other words in the same category, there are clear patterns.
                It turns out that, for words with this final, we can usually
                predict the <i>Kan-on</i> vowel{" "}
                <strong>based on the initial consonant</strong>. The consonant
                in 軌 is a <i>velar</i> consonant <G g="k" />, and whenever the
                initial is a velar consonant (i.e. any of <G g="kʻ" />{" "}
                <G g="kh" /> <G g="g" /> <G g="gh" />
                ), this vowel is always represented as /(w)i/ in <i>Kan-on</i>,
                as opposed to /ui/. This is just one of a few such patterns.
              </p>
              <p>
                It's possible that these variations represent real changes in
                pronunciation at later stages of Middle Chinese, but that's not
                necessarily the case. In any event, this notation incorporates
                some of these patterns, above all when they are especially
                conspicuous and easy to explain with a general rule. This helps
                maintain some consistency with <i>Kan-on</i>, and keeps us from{" "}
                <ScrollLink hash="the-problem-with-reconstructions">
                  encroaching on the territory of reconstructions
                </ScrollLink>
                . Thus, we write those example characters' readings as 水{" "}
                <G g="śuīˬ" /> and 軌 <G g="kwīˬ" /> You may consider the{" "}
                <ScrollLink hash="kan-on-diacritics">
                  diacritics on the vowel
                </ScrollLink>{" "}
                in such cases as a hint that the vowel in question might exhibit
                alternation like this.
              </p>
              <p>
                Other times, vowel alternations may be easy to explain with a
                general rule, but they still aren't incorporated into this
                notation. For example, the vowel sound in 高 is usually rendered
                as /au/ in <i>Kan-on</i>. But there's a consistent rule that,
                after <i>labial</i> consonants like /p/, the vowel is rendered
                /ou/, as in 宝 /pou/. Despite that, we will consistently write
                that vowel as <G g="au" />, giving 髙 <G g="kau" /> and 宝{" "}
                <G g="pauˬ" />. This lets us keep words like 宝 <G g="pauˬ" />{" "}
                and 掊 <G g="pouˬ" /> visually distinct, without resorting to
                diacritics.
              </p>
              <p>
                Many different considerations went into the decisions around
                which vowel alternations to honor or ignore in this writing
                system. Unfortunately there isn't an easy way to list them all
                here, so some decisions may seem kind of arbitrary. But these
                inconsistencies in <i>Kan-on</i> are rare enough that they
                shouldn't impact the usefulness of this notation too much—at
                least, this is my hope.
              </p>
            </section>
          </section>

          <section
            className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
            id={SectionIds["finals"]}
          >
            <h3>Finals {showContentsButton}</h3>
            <p>
              The most important sources used for reconstructing Middle Chinese
              vowels don't treat vowels in isolation, but instead talk about{" "}
              <i>rhymes</i> or <i>finals</i>, i.e. the part of the syllable
              after any initial consonant. For this reason it's easiest to talk
              about vowels in the context of specific finals.
            </p>
            <section
              className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
              id={SectionIds["structure-of-finals"]}
            >
              <h5>The structure of a final in this notation</h5>
              <p>
                The part of an <i>on'yomi</i> corresponding to the final in
                traditional Chinese phonology basically always consists of these
                elements, in this exact order:
              </p>
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <th>
                      sound in{" "}
                      <ScrollLink hash="kan-on">
                        <i>Kan-on</i>
                      </ScrollLink>{" "}
                      (~Heian period)
                    </th>
                    <th>spelling</th>
                  </thead>
                  <tr>
                    <td>
                      an optional "semivowel" /w/ <IpaLink broad sound="j" /> or
                      /wij/
                    </td>
                    <td>
                      <G g="w" />
                      <G g="y" />
                      <G g="ŷ" />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      a <strong>mandatory</strong> vowel /a/ /e/ /i/ /o/ or /u/
                    </td>
                    <td>
                      <G g="a" />
                      <G g="e" />
                      <G g="i" />
                      <G g="o" />
                      <G g="u" />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      an optional "coda", one of: <br />
                      vowel /i/ /u/ <br />
                      nasal consonant or vowel /i/ /u/ /n/
                      <br />
                      stop /ku/ /ki/ /tu/ /ti/ /pu/
                      <br />
                    </td>
                    <td>
                      <br />
                      <G g="i" />
                      <G g="u" />
                      <br />
                      <G g="ng" />
                      <G g="n" />
                      <G g="m" />
                      <br />
                      <G g="k" />
                      <G g="t" />
                      <G g="p" />
                    </td>
                  </tr>
                </table>
              </div>

              <section
                className="pb-0 pt-14  md:pt-0"
                id={SectionIds["medials"]}
              >
                <h5>Medials</h5>
                <p>
                  These "semivowel" sounds in <i>on'yomi</i> readings correspond
                  to sounds which scholars of Chinese often call{" "}
                  <b>"medials"</b>. They were recorded in <i>on'yomi</i> only
                  after certain initials, but we will write them out
                  consistently, in all syllables where Chinese sources indicate
                  they were present. Reconstructions generally agree on the
                  following with regard to these medial sounds:
                </p>
                <ul>
                  <li>
                    The sound written here <G g="w" /> corresponds to /w/ in{" "}
                    <i>Kan'on</i>, which probably depicted a sound{" "}
                    <MedialHints.W />
                  </li>
                  <li>
                    The sound written here <G g="y" /> corresponds to{" "}
                    <IpaLink broad sound="j" /> in <i>Kan'on</i>, which probably
                    depicted a sound <MedialHints.Y />
                  </li>
                  <li>
                    The sound written here <G g="ŷ" /> corresponds to a sound
                    written like /wij/ in <i>Kan'on</i>, which probably depicted{" "}
                    <MedialHints.Vy />
                  </li>
                </ul>
                <p>
                  As an exception, the <G g="w" /> in syllables <G g="ʾwo" />{" "}
                  <G g="ʾwōng" /> <G g="ʾwōk" /> <G g="ʾwīk" /> likely does not
                  correspond to a Chinese medial /w/, but represents{" "}
                  <ScrollLink hash="vowel-alternation">
                    vowel alternation
                  </ScrollLink>{" "}
                  in those finals.
                </p>
                <p>
                  The <G g="y" /> written here{" "}
                  <ScrollLink hash="e-chongniu">before E</ScrollLink> and{" "}
                  <ScrollLink hash="i-chongniu">before I</ScrollLink> here is
                  not exactly a medial, and is not a relic of <i>Kan-on</i>.
                  This is a way of marking certain syllables in a category
                  called <i>Chongniu IV</i>, which is discussed in more detail
                  in the sections for those "main vowels" below. When these{" "}
                  <i>Chongniu IV</i> syllables also had a [w]-like medial in
                  Middle Chinese, they take the grave accent over the W{" "}
                  <G g="ẁ" />, rather than an added <G g="y" />.
                </p>
              </section>
              <section className="pb-0 pt-14  md:pt-0" id={SectionIds["coda"]}>
                <h5>Coda</h5>
                <p>
                  As for the <b>coda</b> at the very end of the syllable,{" "}
                  <i>on'yomi</i> are much less faithful to the original Chinese,
                  since Japanese doesn't allow all the final consonants that
                  Chinese does.
                </p>
                <ul>
                  <li>
                    Final /i/ in <i>Kan-on</i> usually corresponds to a final
                    [i] in reconstructions, in which case we write it{" "}
                    <G g="i" />. After main vowel /e/, it sometimes corresponds
                    to a velar nasal consonant{" "}
                    <IpaLink sound={IpaSymbols.eng} />, in which case we write
                    it <G g="ng" />.
                  </li>
                  <li>
                    Final /u/ in <i>Kan-on</i> often corresponds to a final [u]
                    in reconstructions, in which case we write it <G g="u" />.
                    Elsewhere, it corresponds to a velar nasal consonant{" "}
                    <IpaLink sound={IpaSymbols.eng} />, in which case we write
                    it <G g="ng" />, as in English.
                  </li>
                  <li>
                    Final /n/ in <i>Kan-on</i> corresponds to a final [n] or [m]
                    in reconstructions, here written <G g="n" /> and <G g="m" />{" "}
                    respectively. (There is reason to believe that Japanese
                    during this time had final /m/ in some places, but these
                    sounds were not consistently distinguished in writing.)
                  </li>
                  <li>
                    Final /ku/ and /ki/ in <i>Kan-on</i> corresponds to a final
                    [k] in reconstructions, here written <G g="k" />.
                  </li>
                  <li>
                    Final /tu/ and /ti/ in <i>Kan-on</i> corresponds to a final
                    [t] in reconstructions, here written <G g="t" />.
                  </li>
                  <li>
                    Final /pu/ in <i>Kan-on</i> corresponds to a final [p] in
                    reconstructions, here written <G g="p" />.
                  </li>
                </ul>
              </section>
              <section
                className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
                id={SectionIds["main-vowels"]}
              >
                <h5>"Main vowels"</h5>
                <p>
                  We'll call this mandatory vowel at the core the{" "}
                  <b>"main vowel"</b>. This isn't a technical term, but as we
                  continue to discuss what the vowels of Middle Chinese may have
                  sounded like, it will be useful to have an easy way of
                  referring to this part of the final. It's here where most of
                  the open questions about Middle Chinese vowels are centered.
                </p>
                <p>
                  The vast majority of <i>Kan-on</i> conform to this structure,
                  but sometimes, <i>Kan-on</i> readings have the vowel sequences
                  /iu/ and /ui/. In these cases, I've chosen to designate one of
                  these vowels the "main" vowel solely on the basis of how I
                  convenient I deemed the resulting groupings below.
                </p>
              </section>
            </section>
            <section
              className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
              id={SectionIds["tones"]}
            >
              <h4>Tones {showContentsButton}</h4>
              <p>
                After the consonants and vowels in this notation, some syllables
                are written with a <G g="ˬ" /> caron or a <G g="ˎ" /> grave
                accent at the bottom right. These are to mark{" "}
                <A href="https://en.wikipedia.org/wiki/Tone_(linguistics)">
                  tone
                </A>
                , an important feature of Chinese languages. This feature is
                reminiscent of Japanese pitch accent, but it is not the same.
              </p>
              <p>
                If you are only interested in Middle Chinese sounds in relation
                to the <i>on'yomi</i>, you can ignore the tones to no ill
                effect. On the other hand, an awareness of Middle Chinese tones
                can be helpful for understanding the relationship between words
                in languages like Mandarin Chinese, Cantonese, and Vietnamese,
                which do have tones.
              </p>
              <p>
                The pronunciation of the Middle Chinese tones is not known with
                certainty, but it is well documented that there were initially
                four tones recognized in ancient times. These four tones
                correspond <em>only sometimes</em> with the tones of Modern
                mandarin.
              </p>
              <ul>
                <li>
                  <ToneHints.Level />
                </li>
                <li>
                  <ToneHints.Rising />
                </li>
                <li>
                  <ToneHints.Departing />
                </li>
                <li>
                  <ToneHints.Entering />
                </li>
              </ul>
              <p>
                The four tones eventually split on the basis of the voicing of
                the initial consonant. Voiced consonants had the effect of
                lowering the pitch of the following vowel. (In this notation,
                voiced consonants are any consonants NOT written with letters P,
                T, K, or S, or the glottal stop <G g="ʾ" />
                .)
              </p>
              <p>
                This tonal split explains the split between the first and second
                tones of Mandarin—the first tone is the "high level-tone", and
                the second tone is the "low level-tone". This high-low split
                also explains instances where the "rising" tone of Middle
                Chinese became the 4th tone of Mandarin, which is usually the
                result of Middle Chinese "departing" tone. The "low rising" tone
                and the "low departing" tone of Middle Chinese ended up merging,
                perhaps because the of the similar rising contours of both
                tones.
              </p>
            </section>
            <section
              className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
              id={SectionIds["a-finals"]}
            >
              <h4>Finals with main vowel A {showContentsButton}</h4>
              <p>
                Finals with main vowel A are divided into three different
                categories by scholars of Middle Chinese.
              </p>
              <div className="overflow-x-auto">
                <table>
                  {vowelTableHeader}
                  <tr>
                    <th rowSpan={2}>Div. I</th>
                    <td>(w)a</td>
                    <td>(w)ang</td>
                    <td>(w)ak</td>
                    <td>(w)ai</td>
                    <td>(w)an</td>
                    <td>(w)at</td>
                    <td>au</td>
                    <td>am</td>
                    <td>ap</td>
                  </tr>
                  <tr>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td>(w)āi</td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td>ām</td>
                    <td>āp</td>
                  </tr>
                  <tr>
                    <th rowSpan={3}>
                      Div. II
                      <br />
                      ◌̣
                    </th>
                    <td>(w)ạ</td>
                    <td>(w)ạng</td>
                    <td>(w)ạk</td>
                    <td>(w)ại</td>
                    <td>(w)ạn</td>
                    <td>(w)ạt</td>
                    <td>ạu</td>
                    <td>ạm</td>
                    <td>ạp</td>
                  </tr>
                  <tr>
                    <td>(w)ạ̈</td>
                    <td>(w)ạ̈ng</td>
                    <td>(w)ạ̈k</td>
                    <td className="bg-gray-400"></td>
                    <td>(w)ạ̈n</td>
                    <td>(w)ạ̈t</td>
                    <td className="bg-gray-400"></td>
                    <td>ạ̈m</td>
                    <td>ạ̈p</td>
                  </tr>
                  <tr>
                    <td className="bg-gray-400"></td>
                    <td>ạ̊ng</td>
                    <td>ạ̊k</td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                  </tr>
                  <tr>
                    <th rowSpan={3}>
                      Div. III
                      <br />
                      y- ẃ- ◌̂
                    </th>
                    <td>ya/ẃa</td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                  </tr>
                  <tr>
                    <td>yạ</td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                  </tr>
                  <tr>
                    <td className="bg-gray-400"></td>
                    <td>(w/y/ŷ)âng</td>
                    <td>(w/y)âk</td>
                    <td>(w)âi</td>
                    <td>ân</td>
                    <td>ât</td>
                    <td className="bg-gray-400"></td>
                    <td>âm</td>
                    <td>âp</td>
                  </tr>
                </table>
              </div>
              <ul>
                <li>
                  <VowelHints.A1 />
                  <ul>
                    <li>
                      <VowelHints.AMacron />
                    </li>
                    <li>
                      <VowelHints.AWai />
                    </li>
                  </ul>
                </li>
                <li id="division-ii">
                  <VowelHints.A2 />
                  <ul>
                    <li>
                      <VowelHints.A2DoubleDot />
                    </li>
                    <li>
                      <VowelHints.A2Ring />
                    </li>
                  </ul>
                </li>

                <li>
                  <VowelHints.A3Y />
                  <ul>
                    <li>
                      <VowelHints.A3Circumflex />
                    </li>
                  </ul>
                </li>
              </ul>
            </section>
            <section
              className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
              id={SectionIds["e-finals"]}
            >
              <h4>Finals with main vowel E {showContentsButton}</h4>
              <p>
                Finals with main vowel E in this notation are divided into two
                different categories by scholars of Middle Chinese.
              </p>
              <div className="overflow-x-auto">
                <table>
                  {vowelTableHeader}
                  <tr>
                    <th rowSpan={3}>Div. III</th>
                    <td className="bg-gray-400"></td>
                    <td>(w/y/ẁ)eng</td>
                    <td>(w/y/ẁ)ek</td>
                    <td>(w/y/ẁ)ei</td>
                    <td>(w/y/ẁ)en</td>
                    <td>(w/y/ẁ)et</td>
                    <td>(y)eu</td>
                    <td>(y)em</td>
                    <td>(y)ep</td>
                  </tr>{" "}
                  <tr>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td>(w)ên</td>
                    <td>(w)êt</td>
                    <td className="bg-gray-400"></td>
                    <td>êm</td>
                    <td>êp</td>
                  </tr>
                  <tr>
                    <td className="bg-gray-400"></td>
                    <td>(w)ẹng</td>
                    <td>(w)ẹk</td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                  </tr>
                  <tr>
                    <th rowSpan={1}>
                      Div. IV
                      <br />
                      ◌̀
                    </th>
                    <td className="bg-gray-400"></td>
                    <td>(w)èng</td>
                    <td>(w)èk</td>
                    <td>(w)èi</td>
                    <td>(w)èn</td>
                    <td>(w)èt</td>
                    <td>èu</td>
                    <td>èm</td>
                    <td>èp</td>
                  </tr>
                </table>
              </div>
              <ul>
                <li>
                  <VowelHints.E3 />
                  <ul>
                    <li>
                      <VowelHints.E3Circumflex />
                    </li>
                    <li>
                      <VowelHints.E3Underdot />
                    </li>
                  </ul>
                  <li>
                    <VowelHints.E4 />
                  </li>
                </li>
              </ul>
              <section id="e-chongniu">
                <h5>Chongniu III finals vs. Chongniu IV finals</h5>
                <p>
                  Those finals written here with bare <G g="e" /> are sometimes
                  divided by scholars into two further groups, when they appear
                  after certain initial consonants (those written here with
                  symbols <G g="ʾ" /> <G g="k" /> <G g="g" /> <G g="p" />{" "}
                  <G g="b" /> <G g="m" />
                  ). This "Chongniu" distinction is denoted here by the presence
                  of <G g="y" /> or <G g="ẁ" />.
                </p>
              </section>
              <div className="overflow-x-auto">
                <table>
                  {vowelTableHeader}
                  <tr>
                    <th rowSpan={1}>Chongniu III</th>
                    <td className="bg-gray-400"></td>
                    <td>(w)eng</td>
                    <td>(w)ek</td>
                    <td>(w)ei</td>
                    <td>(w)en</td>
                    <td>(w)et</td>
                    <td>eu</td>
                    <td>em</td>
                    <td>ep</td>
                  </tr>{" "}
                  <tr>
                    <th rowSpan={1}>
                      Chongniu IV
                      <br />
                      y- ẁ-
                    </th>
                    <td className="bg-gray-400"></td>
                    <td>
                      yeng/
                      <br />
                      ẁeng
                    </td>
                    <td>
                      yek/
                      <br />
                      ẁek
                    </td>
                    <td>
                      yei/
                      <br />
                      ẁei
                    </td>
                    <td>
                      yen/
                      <br />
                      ẁen
                    </td>
                    <td>
                      yet/
                      <br />
                      ẁet
                    </td>
                    <td>yeu</td>
                    <td>yem</td>
                    <td>yep</td>
                  </tr>
                </table>
              </div>
              <p>
                When these finals are written the usual way, they are called
                "Chongniu III" finals. Some scholars believe these finals had a{" "}
                <i>velar</i> element before the vowel (the same as{" "}
                <MiddleChineseTranscriptionLink hash="division-ii">
                  Division II finals
                </MiddleChineseTranscriptionLink>
                ). The <G g="y" /> of "Chongniu IV" finals is a nod to
                borrowings from Middle Chinese into Korean, where some Chongniu
                IV finals were depicted with a Y-sound. These were actually not
                distinguished from Chongniu III finals in <i>on'yomi</i>.
              </p>
            </section>
            <section
              className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
              id="i-finals"
            >
              <h4>Finals with main vowel I {showContentsButton}</h4>
              <p>
                Finals with main vowel I in this notation all belong to the
                category known to scholars as <b>Division III</b>.
              </p>
              <div className="overflow-x-auto">
                <table>
                  {vowelTableHeader}
                  <tr>
                    <th rowSpan={5}>Div. III</th>
                    <td>i</td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td>in</td>
                    <td>it</td>
                    <td>iu</td>
                    <td>(y)im</td>
                    <td>(y)ip</td>
                  </tr>
                  <tr>
                    <td>(w/y/ẁ/u)ī</td>
                    <td className="bg-gray-400"></td>
                    <td>wīk</td>
                    <td className="bg-gray-400"></td>
                    <td>(w/y/ẁ)īt</td>
                    <td>(w/y/ẁ)īn</td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                  </tr>
                  <tr>
                    <td>(w/y/ẁ/u)ï</td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                  </tr>
                  <tr>
                    <td>(w)î</td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                  </tr>{" "}
                  <tr>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td>wĭk</td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                  </tr>
                </table>
              </div>
              <ul>
                <li>
                  <VowelHints.I />
                </li>
                <li>
                  <VowelHints.IMacron /> <VowelHints.IWikWin />
                </li>
                <li>
                  <VowelHints.IDoubleDot />
                </li>
                <li>
                  <VowelHints.ICircumflex />
                </li>
                <li>
                  <VowelHints.IBreve />
                </li>
              </ul>
              <section id="i-chongniu">
                <h5>Chongniu III finals vs. Chongniu IV finals</h5>
                <p>
                  Those finals written here with <G g="i" /> <G g="ī" />{" "}
                  <G g="ï" /> are sometimes divided by scholars into two further
                  groups, when they appear after certain initial consonants
                  (those written here with symbols <G g="ʾ" /> <G g="k" />{" "}
                  <G g="g" /> <G g="p" /> <G g="b" /> <G g="m" />
                  ). This "Chongniu" distinction is denoted here by the presence
                  of <G g="y" />, <G g="ẁ" />, or <G g="u" /> before the vowel.
                </p>
              </section>
              <div className="overflow-x-auto">
                <table>
                  {vowelTableHeader}
                  <tr>
                    <th rowSpan={3}>Chongniu III</th>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td>im</td>
                    <td>ip</td>
                  </tr>

                  <tr>
                    <td>(w)ī</td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td>(w)īt</td>
                    <td>(w)īn</td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                  </tr>
                  <tr>
                    <td>(w)ï</td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                  </tr>

                  <tr>
                    <th rowSpan={3}>
                      Chongniu IV
                      <br />
                      y- ẁ- u-
                    </th>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td>yim</td>
                    <td>yip</td>
                  </tr>

                  <tr>
                    <td>
                      yī/
                      <br />
                      ẁī/uī
                    </td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td>
                      yīt/
                      <br />
                      ẁīt
                    </td>
                    <td>
                      yīn/
                      <br />
                      ẁīn
                    </td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                  </tr>
                  <tr>
                    <td>
                      yï/
                      <br />
                      ẁï/uï
                    </td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                  </tr>
                </table>
              </div>
              <p>
                When these finals are written the usual way, they are called
                "Chongniu III" finals. Some scholars believe these finals had a{" "}
                <i>velar</i> element before the vowel (the same as{" "}
                <MiddleChineseTranscriptionLink hash="division-ii">
                  Division II finals
                </MiddleChineseTranscriptionLink>
                ). The <G g="y" /> of "Chongniu IV" finals is a nod to
                borrowings from Middle Chinese into Korean, where some Chongniu
                IV finals were depicted with a Y-sound. These were actually not
                distinguished from Chongniu III finals from in <i>on'yomi</i>,
                except in that Chongniu IV finals written with <G g="ẁ" />{" "}
                tended to lose the /w/ element, and Chongniu IV finals written
                with <G g="y" /> <b>do not</b> alternate with <i>o</i> in{" "}
                <MiddleChineseTranscriptionLink hash="go-on">
                  Go-on
                </MiddleChineseTranscriptionLink>{" "}
                readings.
              </p>
            </section>
            <section
              className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
              id={SectionIds["o-finals"]}
            >
              <h4>Finals with main vowel O {showContentsButton}</h4>
              <p>
                Finals with main vowel O in this notation are divided into two
                different categories by scholars of Middle Chinese.
              </p>
              <div className="overflow-x-auto">
                <table>
                  {vowelTableHeader}
                  <tr>
                    <th rowSpan={3}>Div. I</th>
                    <td>(w)o</td>
                    <td>ong</td>
                    <td>ok</td>
                    <td className="bg-gray-400"></td>
                    <td>(w)on</td>
                    <td>(w)ot</td>
                    <td>ou</td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                  </tr>
                  <tr>
                    <td className="bg-gray-400"></td>
                    <td>(w)ōng</td>
                    <td>(w)ōk</td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                  </tr>
                  <tr>
                    <td className="bg-gray-400"></td>
                    <td>(w)ŏng</td>
                    <td>(w)ŏk</td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                  </tr>

                  <tr>
                    <th rowSpan={3}>
                      Div. III
                      <br />
                      y- ◌̂
                    </th>
                    <td>yo</td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                  </tr>
                  <tr>
                    <td className="bg-gray-400"></td>
                    <td>yŏng/ŷŏng</td>
                    <td>yŏk/ŷŏk </td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                  </tr>
                  <tr>
                    <td className="bg-gray-400"></td>
                    <td>(ŷ)ông</td>
                    <td>(ŷ)ôk</td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                  </tr>
                </table>
              </div>
              <ul>
                <li>
                  <VowelHints.O1 />
                  <ul>
                    <li>
                      <VowelHints.OMacron />
                    </li>
                    <li>
                      <VowelHints.O1Breve />
                    </li>
                  </ul>
                </li>
                <li>
                  <VowelHints.O3 />
                  <ul>
                    <li>
                      <VowelHints.O3Breve />
                    </li>
                    <li>
                      <VowelHints.OCircumflex />
                    </li>
                  </ul>
                </li>
              </ul>
            </section>
            <section
              className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
              id={SectionIds["u-finals"]}
            >
              <h4>Finals with main vowel U {showContentsButton}</h4>
              <p>
                Finals with main vowel U in this notation all belong to the
                category known to scholars as <b>Division III</b>. After{" "}
                <i>labial consonants</i> <G g="p" /> <G g="pʻ" /> <G g="b" />{" "}
                <G g="m" />, they trigger{" "}
                <MiddleChineseTranscriptionLink hash="dentilabialization">
                  dentilabialization
                </MiddleChineseTranscriptionLink>
                .
              </p>
              <div className="overflow-x-auto">
                <table>
                  {vowelTableHeader}
                  <tr>
                    <th rowSpan={2}>Div. III</th>
                    <td>(y)u</td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td>un</td>
                    <td>ut</td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                  </tr>
                  <tr>
                    <td>(i)ū</td>
                    <td>(i)ūng</td>
                    <td>(y)ūk</td>
                    <td className="bg-gray-400"></td>
                    <td>yūn</td>
                    <td>yūt</td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                  </tr>
                </table>
              </div>
              <ul>
                <li>
                  <VowelHints.UYu />
                </li>
                <li>
                  <VowelHints.UUnUt />
                </li>
                <li>
                  <VowelHints.UMacron />
                  <ul>
                    <li>
                      <VowelHints.UIuu />
                    </li>
                    <li>
                      <VowelHints.UIuung />
                    </li>
                    <li>
                      <VowelHints.UYuunYuut />
                    </li>
                  </ul>
                </li>
              </ul>
            </section>
          </section>

          <section
            className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
            id={SectionIds["diacritics"]}
          >
            <h3>
              Summary of diacritics used in this notation {showContentsButton}
            </h3>
            <p>
              We don't know exactly how many vowel sounds there were in Middle
              Chinese, but there were certainly more than five. So this notation
              makes heavy use of diacritic marks to represent vowel distinctions
              that were not recorded in the{" "}
              <ScrollLink hash="kan-on">
                <i>Kan-on</i>
              </ScrollLink>{" "}
              tradition. As this isn't a precise phonetic notation, these
              diacritic marks are applied in a way that is to some extent
              arbitrary. But there are some general principles that are worth
              noting.
            </p>
            <section
              className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
              id={SectionIds["four-rows"]}
            >
              <h4>The four rows of the rime tables {showContentsButton}</h4>
              <p>
                I briefly mentioned above that one of the foundational sources
                for Middle Chinese phonology was something called the "rime
                tables". These tables were basically a tool used for looking up
                words' pronunciations, much like you might use a dictionary for
                today. But instead of writing out pronunciations somehow in
                phonetic symbols, the compilers of these tables invented a
                sophisticated <i>grid system</i>. They took every Chinese
                syllable they could think of, and chose one representative
                character for each. Then, they arranged these characters on a
                series of grids, grouping similar-sounding characters close
                together. It may sound complicated, but it was actually an
                ingenious system. It made it possible for any Chinese speaker at
                the time to easily look up character readings, without having to
                learn any new writing system.
              </p>
              <p>
                Of course, for us moderns, the principles behind this grid
                system are not always clear. We know that the <i>23 columns</i>{" "}
                of each grid corresponded to characters' initial consonants. But
                the <i>four rows</i> in this grid system are perhaps the biggest
                mystery of Middle Chinese phonology. Scholars agree that they
                relate simultaneously to the initial consonants and the vowels
                of the various syllables in the rime tables. But beyond that,
                there's endless controversy around these rows. Where two
                scholars differ greatly in their reconstructions of a given
                syllable, it usually boils down to a difference in how they
                interpret the four rows.
              </p>
              <p>
                The four rows of the rime tables feature in this notation in a
                few different ways, including the usage of diacritic marks.
              </p>
              <ul>
                <li>
                  The <b>underdot</b> <G g="◌̣" /> always shows up in syllables
                  placed in the second row.
                </li>
                <li>
                  The <b>acute accent</b> <G g="◌́" /> and <b>circumflex</b>{" "}
                  <G g="◌̂" /> only show up in syllables placed in the third row.
                </li>
                <li>
                  The <b>grave accent</b> <G g="◌̀" /> only shows up in syllables
                  placed in the fourth row.
                </li>
              </ul>
              <p>
                There are many more ways that the various symbols in this
                notation relate to the four rows. But which row a syllable
                belongs to is not as important as another kind of grouping based
                on the rime tables, which is intimately connected to the four
                rows.
              </p>
            </section>
            <section
              className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
              id={SectionIds["four-divisions"]}
            >
              <h4>
                Marks of the "Four Divisions" of the rime tables{" "}
                {showContentsButton}
              </h4>
              <p>
                Modern-day scholars studying the rime tables found some patterns
                relating to these four rows. Using these patterns, they grouped
                all the syllables of Middle Chinese into four categories,
                usually called the "Four Divisions" in English. (Confusingly,
                the four rows of the rime tables are also sometimes called
                divisions, but I will refer to them distinctly as "rows" and
                "Divisions" here.)
              </p>
              <p>
                The details of these Four Divisions are complicated, but what's
                important to know is that two syllables belonging to the same
                Division probably had similar vowel sounds. Likewise, two
                syllables belonging to different Divisions probably had
                different vowel sounds. More is said on the possible phonetic
                features of these Four Divisions in the individual{" "}
                <MiddleChineseTranscriptionLink hash="finals">
                  "finals" sections
                </MiddleChineseTranscriptionLink>{" "}
                above.
              </p>
              <p>
                Here is a summary of all the characteristic marks of the Four
                Divisions in this notation. Where a cell is greyed out, that
                means there are no syllables with that{" "}
                <MiddleChineseTranscriptionLink hash="finals">
                  main vowel
                </MiddleChineseTranscriptionLink>{" "}
                for that Division.
              </p>
              <div className="overflow-x-auto">
                <table className="text-center">
                  <thead>
                    <th>
                      main vowel in{" "}
                      <ScrollLink hash="kan-on">
                        <i>Kan-on</i>
                      </ScrollLink>
                    </th>
                    <th className="">Div. I</th>
                    <th className="">Div. II</th>
                    <th className="">Div. III</th>
                    <th className="">Div. IV</th>
                  </thead>
                  <tr>
                    <td>/a/</td>
                    <td className="italic text-gray-900">default</td>
                    <td>◌̣</td>
                    <td>y- ẃ- ◌̂</td>
                    <td className="bg-gray-400"></td>
                  </tr>

                  <tr>
                    <td>/e/</td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="italic text-gray-900">default</td>
                    <td>◌̀</td>
                  </tr>

                  <tr>
                    <td>/i/</td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="italic text-gray-900">default</td>
                    <td className="bg-gray-400"></td>
                  </tr>
                  <tr>
                    <td>/o/</td>
                    <td className="italic text-gray-900">default</td>
                    <td className="bg-gray-400"></td>
                    <td>y- ◌̂</td>
                    <td className="bg-gray-400"></td>
                  </tr>
                  <tr>
                    <td>/u/</td>
                    <td className="bg-gray-400"></td>
                    <td className="bg-gray-400"></td>
                    <td className="italic text-gray-900">default</td>
                    <td className="bg-gray-400"></td>
                  </tr>
                </table>
              </div>
              <p>
                As you can see, there are some features of the Four Divisions
                that are clearly manifest in the <i>Kan-on</i> vowel. For
                instance, syllables containing <IpaLink broad sound="j" /> a Y-
                sound in <i>Kan-on</i>, or one of the vowels /i/ /u/, are
                invariably in Division III. Therefore, these syllables don't
                need a diacritic mark to distinguish them as such.
              </p>
            </section>
            <section
              className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
              id={SectionIds["go-on"]}
            >
              <h4>
                Marks of <i>Kan-on</i>/<i>Go-on</i> vowel alternation
                {showContentsButton}
              </h4>
              <p>
                Earlier, we saw that the character 家 <G g="kạ" /> has the{" "}
                <i>on'yomi</i> カ <i>ka</i>. This reading shows up in common
                words like 家族 <i>kazoku</i> "family". But there is another
                common reading ケ <i>ke</i> which predates カ <i>ka</i>, for
                example in the word 家来 <i>kerai</i> "servant". Older readings
                like this are called{" "}
                <b>
                  <i>Go-on</i>
                </b>
                .
              </p>
              <p>
                <i>Go-on</i> originate from a wave of borrowings into Japanese
                that happened early on in the Middle Chinese period. The{" "}
                <i>Go-on</i> readings were largely replaced by the{" "}
                <ScrollLink hash="kan-on">
                  <i>Kan-on</i>
                </ScrollLink>{" "}
                which form the basis for the vowels in this notation. Not all
                characters have an attested <i>Go-on</i> reading, but some{" "}
                <i>Go-on</i> readings are used in very common words, and are
                even more commonly used than their <i>Kan-on</i> counterparts in
                some cases.
              </p>
              <p>
                As a Japanese learner, you don't need to know how to identify{" "}
                <i>Kan-on</i> vs. <i>Go-on</i> readings. This distinction is
                something that many Japanese speakers today are not aware of.
                However, when the <i>Kan-on</i> and <i>Go-on</i> readings of a
                character differ, you can often predict this variation by
                looking at the vowel in this Middle Chinese notation. For
                example:
              </p>
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>vowel</th>
                      <th>Kan-on</th>
                      <th>Go-on (most frequent first)</th>
                    </tr>
                  </thead>
                  <tr>
                    <td>
                      <G g="a" /> <G g="ạ̊" />
                    </td>
                    <td>/a/</td>
                    <td>/a/ /o/</td>
                  </tr>
                  <tr>
                    <td>
                      <G g="ā" />
                    </td>
                    <td>/a/</td>
                    <td>/a/ (no variation)</td>
                  </tr>
                  <tr>
                    <td>
                      <G g="ạ" /> <G g="ạ̈" />
                    </td>
                    <td>/a/</td>
                    <td>/e/ /a/</td>
                  </tr>{" "}
                  <tr>
                    <td>
                      <G g="â" />
                    </td>
                    <td>/a/</td>
                    <td>/o/ /a/ /e/</td>
                  </tr>
                  <tr>
                    <td>
                      <G g="e" /> <G g="è" />
                    </td>
                    <td>/e/</td>
                    <td>/e/ /a/</td>
                  </tr>
                  <tr>
                    <td>
                      <G g="ê" />
                    </td>
                    <td>/e/</td>
                    <td>/o/ /a/ /e/</td>
                  </tr>
                  <tr>
                    <td>
                      <G g="i" />
                    </td>
                    <td>/i/</td>
                    <td>/o/ /i/</td>
                  </tr>
                  <tr>
                    <td>
                      <G g="ï" /> <G g="î" />
                    </td>
                    <td>/i/</td>
                    <td>/i/ /e/</td>
                  </tr>
                  <tr>
                    <td>
                      <G g="ī" />
                    </td>
                    <td>/i/</td>
                    <td>/i/ /o/</td>
                  </tr>
                </table>
              </div>
              <p>
                There are even more patterns than these. This table is here not
                for you to memorize, but to illustrate a point: whenever you
                encounter a kanji whose <i>on'yomi</i> has a variable vowel
                sound, you can take a look at the kanji's Middle Chinese
                reading, and you can reasonably guess that{" "}
                <strong>
                  other kanji with a similar-looking Middle Chinese reading{" "}
                  <i>just might</i> exhibit the same kind of vowel alternation
                </strong>
                .
              </p>
              <p>
                Most of the above diacritics serve other functions besides
                marking <i>Kan-on</i>/<i>Go-on</i> vowel alternations. You'll
                notice that many of the vowels above double as marks of the Four
                Divisions. For instance, <G g="ạ" /> with underdot is a
                characteristic mark of Division II, and <G g="â" /> with
                circumflex is a characteristic mark of Division III. The
                circumflex on <G g="î" /> doesn't mark Division III (since that
                job is done by the main vowel I), but it doubles as a mark of{" "}
                <ScrollLink hash="dentilabialiation">
                  dentilabialization
                </ScrollLink>{" "}
                on preceding labial consonants <G g="p" /> <G g="pʻ" />{" "}
                <G g="b" /> <G g="m" />.
              </p>
            </section>
            <section
              className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
              id={SectionIds["kan-on-diacritics"]}
            >
              <h4>
                Marks of vowel alternation within <i>Kan-on</i>
                {showContentsButton}
              </h4>
              <p>
                Sometimes, one Middle Chinese final is rendered in a couple
                different ways in <i>Kan-on</i>. For example, the characters 筠
                and 春 both probably had the exact same final at early stages of
                Middle Chinese, but in <i>Kan-on</i>, they are rendered with
                different vowels as 筠 /win/ and 春 /syun/. This might be
                because, at the time of borrowing, the original Chinese vowel
                had split into two different vowels, or it may have been that
                the compilers of <i>Kan-on</i> just interpreted the vowel
                differently in these different instances. In any case, this sort
                of <i>vowel alternation</i> is sometimes incorporated into this
                notation. When this happens, the vowels subject to alternation
                are usually marked with some kind of diacritic—in the case of
                our example, the macron is used, giving 筠 <G g="wīn" /> and 春{" "}
                <G g="tśʻyūn" />.
              </p>
              <p>
                Here are all the patterns of <i>Kan-on</i> vowel alternation
                that were incorporated into this notation.
              </p>
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <th>vowels</th>
                    <th>traditional final category</th>
                    <th>examples</th>
                  </thead>
                  <tr>
                    <td rowSpan={2}>
                      <G g="iū" /> <G g="ū" />
                    </td>
                    <td>東(三)</td>
                    <td>
                      中 <G g="tiūng" /> 風 <G g="pūng" />
                    </td>
                  </tr>
                  <tr>
                    <td>尤</td>
                    <td>
                      尤 <G g="iū" /> 浮 <G g="bū" />
                    </td>
                  </tr>
                  <tr>
                    <td rowSpan={3}>
                      <G g="yū" /> <G g="ū" /> <G g="wī" />
                    </td>
                    <td>屋(三)</td>
                    <td>
                      縮 <G g="ṣyūk" /> 福 <G g="pūk" /> 彧 <G g="ʾwīk" />
                    </td>
                  </tr>
                  <tr>
                    <td>眞(合口)/諄</td>
                    <td>
                      諄 <G g="tśyūn" /> 均 <G g="kẁīn" />
                    </td>
                  </tr>
                  <tr>
                    <td>質(合口)/術</td>
                    <td>
                      術 <G g="źyūt" /> 橘 <G g="kẁīt" />
                    </td>
                  </tr>

                  <tr>
                    <td rowSpan={2}>
                      <G g="wï" /> <G g="uï" />
                      <br />
                      <G g="wī" /> <G g="uī" />
                    </td>
                    <td>支(合口)</td>
                    <td>
                      逶 <G g="ʾwï" /> 衰 <G g="tṣʻuï" />
                    </td>
                  </tr>
                  <tr>
                    <td>脂(合口)</td>
                    <td>
                      龜 <G g="kwī" /> 追 <G g="tuī" />
                    </td>
                  </tr>

                  <tr>
                    <td rowSpan={2}>
                      <G g="wê" /> <G g="â" />
                    </td>
                    <td>元(合口)</td>
                    <td>
                      元 <G g="ngwên" /> 番 <G g="bân" />
                    </td>
                  </tr>
                  <tr>
                    <td>月(合口)</td>
                    <td>
                      月 <G g="ngwêt" /> 伐 <G g="bât" />
                    </td>
                  </tr>

                  <tr>
                    <td rowSpan={3}>
                      <G g="ō" /> <G g="wō" />
                      <br />
                      <G g="o" /> <G g="wo" />
                    </td>
                    <td>東(一)</td>
                    <td>
                      東 <G g="tōng" /> 翁 <G g="ʾwōng" />
                    </td>
                  </tr>

                  <tr>
                    <td>屋(一)</td>
                    <td>
                      穀 <G g="kōk" /> 屋 <G g="ʾwōk" />
                    </td>
                  </tr>

                  <tr>
                    <td>模</td>
                    <td>
                      模 <G g="mo" /> 烏 <G g="ʾwo" />
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <G g="u" /> <G g="yu" />
                    </td>
                    <td>虞</td>
                    <td>
                      虞 <G g="ngu" /> 朱 <G g="syu" />
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <G g="ô" /> <G g="ŷo" />
                    </td>
                    <td>鍾</td>
                    <td>
                      奉 <G g="bông" /> 鍾 <G g="tśŷong" />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <G g="â" /> <G g="wâ" /> <G g="ŷa" />
                    </td>
                    <td>陽(合口)</td>
                    <td>
                      望 <G g="mâng" /> 王 <G g="wâng" /> 狂 <G g="gŷang" />
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <G g="wĭ" /> <G g="ŷŏ" />
                    </td>
                    <td>蒸</td>
                    <td>
                      域 <G g="wĭk" /> 洫 <G g="khŷŏk" />
                    </td>
                  </tr>
                </table>
              </div>
            </section>
          </section>
          <section id="baxter">
            <h3>Why not Baxter's transcription?</h3>
            <p>
              Above, I touched my major reasons for using a notation like this{" "}
              <a href="#the-problem-with-reconstructions">
                instead of scholarly reconstructions of Chinese
              </a>
              . But if you've already come across discussions about Chinese
              historical phonology before, you may be wondering why I didn't
              just use one of the existing notations for Middle Chinese.
            </p>
            <p>
              Eventually, I'd like to publish a more detailed description of
              this system, one which goes into more depth about the motivations
              behind it, and the various design decisions that were made,
              including detailed comparisons with other systems. For now, I'll
              just talk about the one Middle Chinese transcription system that's
              most widely used today, the notation developed by William Baxter.
            </p>
            <h4>Baxter's transcription: a misleading design</h4>
            <p>
              Baxter's transcription was first published alongside a full-on
              reconstruction of the Old Chinese sound system. It's used not only
              in linguistics circles, but even in works like Kroll's{" "}
              <em>Student's Dictionary of Medieval Chinese</em>, and Cai's{" "}
              <em>How to Read Chinese Poetry</em>. Its big advantages are:
            </p>
            <ol className="mb-4">
              <li>
                It's "typeable", in a modified form. (This was crucial in 1992
                when the system was first created, but in the era of Unicode,
                it's less important now. Plus, it's even possible to publish{" "}
                <A href="https://nk2028.shn.hk/qieyun-autoderiver/">nifty</A>{" "}
                <A href="https://edoc.uchicago.edu/edoc2013/digitaledoc_index.php">
                  tools
                </A>{" "}
                for transcribing Middle Chinese sounds for cheap.)
              </li>
              <li>
                It's not a phonemic <em>or</em> phonetic reconstruction at all.
                It's a <em>transcription</em> of data from the rhyme
                dictionaries and rime tables; a representation of{" "}
                <strong>abstract categories</strong> assigned to Middle Chinese
                syllables based on their entries in the <em>Qieyun</em> and the
                rime tables.
              </li>
            </ol>

            <p>
              I owe Baxter the idea of a <em>transcription</em> for Middle
              Chinese. I clearly think there's huge value in a system like his
              that lets us refer to Middle Chinese syllables without assigning
              exact sounds. But I'm highly dissatisfied with Baxter's choice of
              symbols. His design works actively against one of his stated
              intentions, which was to convey these abstract categories to
              non-specialists.
            </p>
            <p>
              The problem is that, while Baxter's transcription technically does
              not <em>denote</em> particular sounds, it certainly{" "}
              <em>connotes</em> them, and Baxter failed to realize just how
              important those connotations are. When these{" "}
              <strong>abstract categories</strong> are represented using letters
              borrowed from the International Phonetic Alphabet, users can't
              help but associate them with <strong>concrete sounds</strong>.
              These concrete associations are in constant conflict with the
              underlying message. In short, it's a <em>misleading design</em>.
            </p>
            <p>
              You might not consider this to be a <em>design</em> problem. You
              might think it should be fine as long as you warn folks not to
              mistake Baxter's transcription for a phonetic or phonological
              analysis. To his credit, Cai does so in{" "}
              <em>How to Read Chinese Poetry</em> (in fact, Cai gives Baxter the
              space to do so himself). But how many readers will actually direct
              their eyes to the footnotes where these warnings are relegated,
              and then <em>heed</em> them, let alone <em>understand</em> them?
              The very concept of an alphabetic transcription of abstract
              phonological categories will always be too abstract to mean
              anything to the uninitiated.
            </p>
            <p>
              And{" "}
              <strong>
                it's not just non-specialists who have been confused about
                Baxter's intentions
              </strong>
              . In <em>A Student's Dictionary of Medieval Chinese</em>, the
              eminent scholar of medieval Chinese literature Kroll actually
              explicitly calls Baxter's notation a <em>reconstruction</em>, and
              touts it as a <em>widely accepted</em> one. Even Edwin Pulleyblank
              was confused&mdash;one of the most famous scholars in the exact
              same subfield Baxter works in, who Baxter cites constantly in his
              own work. He criticized Baxter's notation on the grounds that it
              expresses distinctions between syllables without commiting to
              exact phonetic values&mdash;which is exactly what Baxter meant for
              it to do. When you create a tool such as this notation, and{" "}
              <em>even the most capable users</em> misunderstand its purpose,
              you're faced with a choice. You can either blame the user for not{" "}
              <em>just reading the manual</em>, or you can admit that there is,
              after all, a design problem here.
            </p>
            <p>
              This problem is essentially one that Baxter shares with all actual
              reconstructions of Middle Chinese: the selection of symbols is
              largely arbitrary. In the case of actual phonetic reconstructions,
              this is inescapable, since there are so many grey areas in these
              reconstructions, yet you've got to choose <em>some</em> particular
              symbols if you're going to put your ideas to paper. But at least
              in an actual reconstruction, that arbitrariness in symbol choice
              is mitigated by a <strong>strong guiding principle</strong>: the
              reconstructor's motivation to put forth a clear, internally
              consistent argument about the sounds of the language. Since Baxter
              had no such argument to make, he thought it right to dispense with
              any strong guiding principle. But a good design just can't do
              without one, as the examples above have made clear.
            </p>
            <p>
              I hope to have improved on Baxter's notation by reintroducing a{" "}
              <em>mitigating force</em> against the arbitrariness of my symbol
              choices, in the form of{" "}
              <A href="#kan-on">
                that guiding principle behind my vowel choices
              </A>
              . This may not guard against users' mistaking my intentions, but
              in the event that they do, they will be better off than users of
              Baxter's system. We can use the{" "}
              <strong>lower level of abstraction</strong> built into the design
              to correct their understanding.
            </p>
            <p>Let me explain what I mean by this.</p>
            <h4>
              Improving on Baxter's notation by{" "}
              <strong>lowering the level of abstraction</strong>
            </h4>
            <p>
              Say you were to come across user of Baxter's notation, maybe
              someone who's been using Kroll's dictionary for a while. They've
              made a comment that reveals they've mistaken Baxter's
              transcription for a reconstruction. Over the past few weeks or
              months they've already started internalizing the symbols of his
              notation in terms of discrete consonants, medials, vowels,
              diphthongs. If you wanted to correct this person's understanding,
              what could you possibly say to them?
            </p>
            <p>
              The simplest, most concise non-technical explanation you could
              offer would be along the lines of, "Actually, these symbols don't
              correspond consistently to any sounds in particular." But would
              that satisfy someone who, up till now, imagined these symbols were
              providing them with a concrete depiction of Middle Chinese
              pronunciation? If the letters in <em>kaewk</em> and <em>mjie</em>{" "}
              and <em>pjuwng</em> don't represent particular sounds, they'll
              wonder, then what exactly <strong>do</strong> they represent?
              Unfortunately,{" "}
              <A href="#the-problem-with-reconstructions">
                there is no concise, simple answer to <em>that</em> question
              </A>
              . Therefore the time they've invested in Baxter's system won't
              provide any payoff until they've wrapped their head around the
              basics of the <i>Qieyun</i> system. And remember&mdash;this
              notation is meant to be accessible to{" "}
              <strong>non-specialists</strong>.
            </p>
            <p>
              On the other hand, if a user of my system mistakes the symbols for
              a reconstruction, I can correct their understanding in an instant
              with a simple rule-of-thumb explanation that "the vowels are based
              on the Japanese <em>on'yomi</em> pronunciation, and the diacritics
              distinguish different rhymes". This answer leaves out the finer
              details, but <em>at the level of detail on which it operates</em>,
              it is easy to understand. They will still need to learn the{" "}
              <em>Qieyun</em> system to <em>fully</em> understand what they're
              looking at, but the <em>on'yomi</em> principle provides{" "}
              <strong>
                a different level on which to understand the notation
              </strong>
              . It's a lower level of abstraction to work with before learning
              the <em>Qieyun</em> system&mdash;should they ever choose to put in
              the requisite time to do so.
            </p>
          </section>
          <section id="references">
            <h3>References {showContentsButton}</h3>

            <p>
              For general information on the traditional initial/final
              categories, the source texts of Middle Chinese phonology, the
              reconstructed Middle Chinese of Pan Wuyun, and Old Chinese
              reconstructions:
            </p>
            <ul>
              <li>
                Shen, Zhongwei. (2020). <i>A Phonological History of Chinese</i>
                . Cambridge University Press.
              </li>
            </ul>
            <p>
              The cited reconstructed forms of initials and finals were chosen
              to show variety, and were not intended as an endorsement of
              specific reconstructions. Besides those forms taken from Pan
              Wuyun, some were taken Bernhard Karlgren's and Zhengzhang
              Shangfeng's reconstructions via{" "}
              <A href="http://en.wiktionary.org">Wiktionary</A> and the{" "}
              <A href="https://nk2028.shn.hk/qieyun-autoderiver/">
                Qieyun Autoderiver
              </A>
              , as well as the sources below:
            </p>
            <ul>
              <li>
                Coblin, W. S. (1994). A Compendium of Phonetics in Northwest
                Chinese.{" "}
                <i>Journal of Chinese Linguistics Monograph Series, 7</i>.
              </li>{" "}
              <a href="http://www.jstor.org/stable/23825696">
                http://www.jstor.org/stable/23825696
              </a>
              <li>
                Pulleyblank, Edwin G. (1991).{" "}
                <i>
                  Lexicon of Reconstructed Pronunciation in Early Middle
                  Chinese, Late Middle Chinese and Early Mandarin
                </i>
                . UBC Press.
              </li>
              <li>
                Pulleyblank, Edwin G. (1984).{" "}
                <i>Middle Chinese: A Study in Historical Phonology</i>. UBC
                Press.
              </li>
            </ul>

            <p>For descriptions of Middle Chinese tones:</p>
            <ul>
              <li>
                Mei, Tsu-Lin. (1970). Tones and Prosody in Middle Chinese and
                The Origin of The Rising Tone.{" "}
                <i>Harvard Journal of Asiatic Studies, 30</i>, 86–110.
              </li>
            </ul>

            <p>For the characterization of Korean "voiced" sounds:</p>
            <ul>
              <li>
                Chang, Charles B. (2006).{" "}
                <A href="https://www.researchgate.net/publication/259743465_Tense_consonants_in_Korean_revisited_A_crosslinguistic_perceptual_study">
                  Tense consonants in Korean revisited: A crosslinguistic
                  perceptual study
                </A>
                . In Charles B. Chang et al. (Eds.), CamLing 2006: Proceedings
                of the Fourth University of Cambridge Postgraduate Conference in
                Language Research (pp. 35-42). Cambridge, UK: Cambridge
                Institute of Language Research.
              </li>
            </ul>

            <p>For reconstructed Japanese sounds:</p>
            <ul>
              <li>
                Frellesvig, B. (2010). <i>A History of the Japanese Language</i>
                . Cambridge University Press.
              </li>
            </ul>

            <p>
              The correspondences between Middle Chinese finals and{" "}
              <i>on'yomi</i> were taken from this document, which draws from the
              dictionaries 五十音引き漢和辞典 and 全訳 漢辞海 from Sanseido. In
              some cases, 全訳 漢辞海 was consulted directly.
            </p>
            <ul>
              <li>
                Koide, Atsushi. (2007).{" "}
                <a href="https://ksu.repo.nii.ac.jp/?action=repository_action_common_download&item_id=1280&item_no=1&attribute_id=22&file_no=1">
                  日本漢字音・中国中古音対照表 (Contrastive tables of
                  Sino-Japanese and Ancient Chinese phonology)
                </a>
                . <i>Kyoto Sangyo University essays. Humanities series</i>.
              </li>
            </ul>
            <p>
              For inspiration, and information on historical Chinese rhyming
              practices:
            </p>
            <ul>
              <li>
                Branner, David Prager. (1999).{" "}
                <A href="https://www.researchgate.net/publication/233505841_A_Neutral_Transcription_System_for_Teaching_Medieval_Chinese">
                  A Neutral Transcription System for Teaching Medieval Chinese
                </A>
                . <i>T'ang Studies</i>, 1999. 1-169.
              </li>
            </ul>
          </section>
        </main>

        <Nav
          {...{ isOpen, setIsOpen }}
          className="nav shadow-lg md:shadow-none"
        />
      </div>
    </DictionaryLayout>
  );
}

function Nav({
  isOpen,
  setIsOpen,
  className = "",
}: {
  isOpen: boolean;
  setIsOpen?: React.Dispatch<SetStateAction<boolean>>;
  className?: string;
}) {
  return (
    <nav className={`${isOpen ? "" : "hiddenNav"} md:block ${className}`}>
      <h5 className="leading-6">
        <ScrollLink hash="top">
          A rough guide to Middle Chinese pronunciation
        </ScrollLink>{" "}
      </h5>
      <ul>
        {sections.map(({ level, id, navText, children }) => (
          <NavLi key={id} level={level} hash={id} text={navText}>
            {children.length > 0 ? (
              <ul>
                {children.map(({ level, id, navText, children }) => (
                  <Fragment key={id}>
                    <NavLi key={id} level={level} hash={id} text={navText} />
                    {children.length > 0 ? (
                      <ul>
                        {children.map(({ level, id, navText, children }) => (
                          <NavLi
                            key={id}
                            level={level}
                            hash={id}
                            text={navText}
                          >
                            {children.length > 0 ? (
                              <ul>
                                {children.map(
                                  ({ level, id, navText, children }) => {
                                    if (children.length)
                                      throw new Error(`Too deep`);
                                    return (
                                      <NavLi
                                        key={id}
                                        level={level}
                                        hash={id}
                                        text={navText}
                                      />
                                    );
                                  },
                                )}
                              </ul>
                            ) : null}
                          </NavLi>
                        ))}
                      </ul>
                    ) : null}
                  </Fragment>
                ))}
              </ul>
            ) : null}
          </NavLi>
        ))}
      </ul>

      {setIsOpen ? (
        <button
          className="text-sm font-normal md:hidden"
          onClick={() => setIsOpen((o) => !o)}
        >
          [{isOpen ? "hide" : "show"} contents]
        </button>
      ) : null}
    </nav>
  );
}

export function G({ g, bold }: { g: string; bold?: boolean }) {
  return bold ? (
    <>
      ⟨<b>{g}</b>⟩
    </>
  ) : (
    <>⟨{g}⟩</>
  );
}
export function B({ children }: PropsWithChildren) {
  return (
    <strong>
      <u>{children}</u>
    </strong>
  );
}

function ScrollLink({ hash, children }: PropsWithChildren<{ hash: string }>) {
  const handleClick = (e: React.MouseEvent) => {
    const browserIsFirefox =
      navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
    console.log({ browserIsFirefox });
    if (browserIsFirefox) {
      e.preventDefault();
      document.querySelector(`#${hash}`)?.scrollIntoView({
        behavior: "smooth",
      });
    }
  };
  return (
    <a href={`#${hash}`} onClick={handleClick}>
      {children}
    </a>
  );
}
