/* eslint-disable react/no-unescaped-entities */
import A from "app/components/ExternalLink";
import { MiddleChineseTranscriptionLink } from "~/components/AppLink";
import { ConsonantHints } from "~/features/dictionary/QysHints";
import { G, B } from "~/features/qysInfo/G";
import { ScrollLink } from "~/features/qysInfo/ScrollLink";
import { SectionIds } from "~/features/qysInfo/SectionIds";

import { IpaLink, IpaSymbols, ipaChartUrl } from "../dictionary/IpaLink";

export function InitialConsonants({
  showContentsButton,
}: {
  showContentsButton: () => React.ReactNode;
}) {
  return (
    <section
      className="mb-10 pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
      id={SectionIds["initial-consonants"]}
    >
      <h3>Initial consonants {showContentsButton()}</h3>
      <p>
        Despite the many unknowns of Middle Chinese pronunciation, we do happen
        to know quite a lot about the consonants of Middle Chinese. That makes
        them a good starting point as any for talking about Middle Chinese
        sounds.
      </p>
      <p>
        These consonants were actually documented in detail by scholars in
        premodern China, and even given names. Technically speaking, the names
        here apply to <i>initials</i>, meaning syllable onsets, and not
        consonants in general. But since only a small handful of consonants can
        appear at the end of a syllable in Chinese, we will cover all the most
        important ground in our discussion of initials.
      </p>
      <section
        className="pb-0 pt-14 md:pt-0"
        id={SectionIds["initial-consonants-like-english"]}
      >
        <h4>Initial consonants like English {showContentsButton()}</h4>
        <p>
          <strong>Most consonant letters</strong> used in this notation
          represent sounds that are roughly equivalent to common English sounds,
          as far as we know. The symbols in [] brackets enclose scholars'
          reconstructions, in the International Phonetic Alphabet. For a chart
          of IPA symbols with sound recordings, you can visit{" "}
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
            <tbody>
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
                    closer to a [b] sound
                  </MiddleChineseTranscriptionLink>
                  or a <IpaLink sound={IpaSymbols.vWithHook} /> sound ,
                  depending on the following vowel.
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
            </tbody>
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
            <tbody>
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
            </tbody>
          </table>
        </div>
      </section>
      <section
        className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
        id={SectionIds["sibilants"]}
      >
        <h4>Sibilant sounds {showContentsButton()}</h4>
        <p>
          Here are some sounds with reasonably close English equivalents, though
          they are spelled in an unfamiliar way. They fall under the broad
          category of <i>sibilant</i> sounds, like English /s/ and /z/.
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
            <tbody>
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
            </tbody>
          </table>
        </div>

        <p>
          When Chinese scholars first gave names to all these consonants, these
          pairs were all indistinct. But earlier sources distinguish them
          clearly, and so they have two different spellings here. One set is
          spelled with an <i>underdot</i> <G g="◌̣" /> to indicate{" "}
          <A href="https://en.wikipedia.org/wiki/Retroflex_consonant">
            retroflex
          </A>{" "}
          articulation (pronounced with the tongue curled back), and the other
          set is spelled with with an <i>acute accent</i> <G g="◌́" />, to
          indicate{" "}
          <A href="https://en.wikipedia.org/wiki/Palatal_consonant">palatal</A>{" "}
          articulation (pronounced with the tongue raised towards the palate).
          Such a distinction does not occur in English, but some approximations
          in other languages are given below.
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
            <tbody>
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
            </tbody>
          </table>
        </div>
      </section>
      <section
        className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
        id={SectionIds["initial-consonants-not-found-in-english"]}
      >
        <h4>Initial consonants not found in English {showContentsButton()}</h4>
        <p>
          The consonant inventory of Middle Chinese also included some{" "}
          <b>sounds with no equivalent in most standard English varieties</b>.
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
            <tbody>
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
            </tbody>
          </table>
        </div>
      </section>

      <section
        className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
        id={SectionIds["dental-vs-retroflex-stops"]}
      >
        <h4>"Tongue-head" vs. "tongue-up" sounds {showContentsButton()}</h4>
        <p>
          The consonants written <G g="tʻ" /> <G g="t" /> <G g="d" />{" "}
          <G g="n" /> can each be pronounced one of two ways, depending on the
          following sounds. Chinese scholars distinguished one set as 舌頭
          "tongue-head" sounds, and the other as 舌上 "tongue-up" sounds.
        </p>
        <p>
          In general, before any vowel sound written with the{" "}
          <strong>underdot</strong> <G g="◌̣" />, and before the{" "}
          <strong>letters Y, I, E, and U</strong>, these letters represent the
          "tongue-up" sounds, which were likely pronounced with{" "}
          <A href="https://en.wikipedia.org/wiki/Retroflex_consonant">
            retroflex
          </A>{" "}
          articulation, i.e. with the tongue more curled back. Modern scholars
          originally thought that these were{" "}
          <A href="https://en.wikipedia.org/wiki/Palatal_consonant">palatal</A>{" "}
          sounds. Nowadays, it's widely accepted that retroflex articulation is
          more likely, but there's a chance that these "tongue-up" sounds may
          have been pronounced slightly differently in different environments.
        </p>
        <p>
          Before <strong>other vowels</strong>, and before the vowel <G g="è" />{" "}
          <strong>with grave accent</strong>, these letters represent the
          "tongue-head" sounds, which were likely pronounced with{" "}
          <A href="https://en.wikipedia.org/wiki/Dental_consonant">dental</A>{" "}
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
          "tongue-head" or "tongue-up" sounds. (Linguists might describe these
          sounds as being in <i>nearly</i>{" "}
          <A href="https://en.wikipedia.org/wiki/Complementary_distribution">
            complementary distribution
          </A>
          .) There are only a couple cases in the whole language where a
          "tongue-head" (dental) sound shows up where you would expect a
          "tongue-up" (retroflex) sound. In these exceptional cases, the dental
          sounds are distinguished with a following <G g="h" />.
        </p>
        <div className="overflow-x-auto">
          <table className=" text-center">
            <thead>
              <tr>
                <th>retroflex</th>
                <th>dental</th>
              </tr>
            </thead>
            <tbody>
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
            </tbody>
          </table>
        </div>
      </section>

      <section
        className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
        id={SectionIds["on-sound-changes"]}
      >
        <h4>
          Sound changes affecting initial consonants {showContentsButton()}
        </h4>
        <section>
          <p>
            Here are a couple more sound changes in addition to those affecting{" "}
            <ScrollLink hash="sibilants">sibilants</ScrollLink> mentioned above.
          </p>
          <p>
            While linguists broadly agree about all the sound changes mentioned
            here,{" "}
            <strong>there is no universally accepted timeline for them</strong>
            . These changes probably did not happen at exactly the same time or
            at the same rate. That means, in order to precisely represent the
            sound of any of these more unstable consonants at any point past the
            earliest stages of Middle Chinese (just before the Tang dynasty), we
            would have to first answer the question of how fast these sound
            changes happened. When dealing with a consonant like <G g="b" /> or{" "}
            <G g="dź" /> that was affected by multiple sound changes, it would
            get even more complicated.
          </p>
          <p>
            These are difficult questions, and judging by the lack of agreement
            over so many other questions in historical Chinese phonology, I
            would guess that there is no answer that would satisfy everyone.
            This is why I will discuss these sound changes without giving any
            specific dates.
          </p>
          <p>
            Herein lies one of the advantages of this notation over the IPA. As
            these letters don't represent precise phonetic values at any given
            stage of Middle Chinese, we can avoid the issue of reconciling the
            various timelines of all these sound changes.
          </p>
        </section>
        <section
          className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
          id={SectionIds["a-note-on-voiced-sounds"]}
        >
          <h4>Voiced sounds and breathy sounds {showContentsButton()}</h4>
          <p>
            Some scholars think a few initial consonants that started as{" "}
            <A href="https://en.wikipedia.org/wiki/Voiced_consonant">
              voiced sounds
            </A>{" "}
            eventually gained a quality called{" "}
            <A href="https://en.wikipedia.org/wiki/Breathy_consonant">
              breathiness
            </A>{" "}
            before they merged with their unvoiced counterparts (sometimes with
            aspiration, sometimes without).
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
              <tbody>
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
                    <IpaLink sound={IpaSymbols.tsBreathy} /> like <G g="ts" />,
                    but with a{" "}
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
                    <IpaLink sound={IpaSymbols.tCWithCurlBreathy} /> like Korean{" "}
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
              </tbody>
            </table>
          </div>
          <p>
            These voiced sounds also had an effect on the pitch of the following
            vowel, causing some{" "}
            <ScrollLink hash="tones">tonal splits and mergers</ScrollLink>. The
            comparison to Korean consonants may be especially apt, as these
            Korean "voiced" or "breathy" also have the effect of lowering the
            pitch of following vowels, and have merged recently with their
            unvoiced aspirated counterparts.
          </p>
        </section>
        <section
          className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
          id={SectionIds["dentilabialization"]}
        >
          <h4>Dentilabialization {showContentsButton()}</h4>
          <p>
            The sounds written <G g="p" /> <G g="pʻ" /> <G g="b" /> eventually
            all became an F-like sound before certain sounds. This phenomenon is
            called <i>dentilabialization</i> (since this F-sound is pronounced{" "}
            <i>labiodentally</i>, with the teeth and the lips). These new sounds
            were not represented distinctly in <i>on'yomi</i>, but they feature
            prominently in modern Chinese languages like Mandarin. For instance,
            風 <G g="pūng" />, 菲 <G g="pʻî" />, 房 <G g="bâng" /> became{" "}
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
              <tbody>
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
              </tbody>
            </table>
          </div>
          <p>
            Linguists have competing theories about the exact phonological
            triggers of these changes. In this notation, vowels triggering
            dentilabialization are written either with the letter U or with the
            circumflex accent, i.e. one of the vowels <G g="â" />
            , <G g="ê" />
            , <G g="î" />, or <G g="ô" />.
          </p>

          <p>
            Dentilabialization also affected the sound written <G g="m" />
            , which eventually became something like a W or V sound in English.
            So, words like 物 <G g="mut" /> became <i>wù</i> in Mandarin. All
            the same vowel sounds caused dentilabialization of <G g="m" />, with
            the exception of sounds written here with the macron <G g="ū" />. 目{" "}
            <G g="mūk" /> became <i>mù</i> instead of <i>wù</i>.
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
              <tbody>
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
              </tbody>
            </table>
          </div>
        </section>
        <section
          className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
          id={SectionIds["denasalization"]}
        >
          <h4>
            "Denasalization" of <G g="m" /> <G g="n" /> <G g="ng" />
            {showContentsButton()}
          </h4>
          <p>
            Perhaps in parallel with the shift of <G g="b" /> <G g="d" />{" "}
            <G g="g" /> towards <G g="pʻ" /> <G g="tʻ" /> <G g="kʻ" />, the
            nasal consonants <G g="m" /> <G g="n" /> <G g="ng" /> underwent a
            change in which they appeared to lose their nasal quality before
            certain vowels, judging by their representation in <i>on'yomi</i>.
            For instance, the the character 無 in{" "}
            <A href="https://en.wikipedia.org/wiki/Go-on">earlier borrowings</A>{" "}
            into Japanese was pronounced /mu/, and then in{" "}
            <A href="https://en.wikipedia.org/wiki/Kan-on">later borrowings</A>{" "}
            it became /bu/. One explanation is that they became{" "}
            <i>prenasalized stops</i>—retaining a nasal quality, but without a
            nasal release.
          </p>
          <p>
            This seems to have been a short-lived phenomenon, which was limited
            to the capital of the Tang dynasty, Chang'an. In modern Chinese
            languages, there is little trace of these "denasalized" sounds.
          </p>
        </section>
      </section>
    </section>
  );
}
