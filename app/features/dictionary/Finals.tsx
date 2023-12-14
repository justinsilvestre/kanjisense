/* eslint-disable react/no-unescaped-entities */
import A from "app/components/ExternalLink";
import { MiddleChineseTranscriptionLink } from "~/components/AppLink";
import {
  MedialHints,
  ToneHints,
  VowelHints,
} from "~/features/dictionary/QysHints";

import { G } from "../qysInfo/G";
import { ScrollLink } from "../qysInfo/ScrollLink";
import { SectionIds } from "../qysInfo/SectionIds";

import { IpaLink, IpaSymbols } from "./IpaLink";

export function Finals({
  showContentsButton,
  vowelTableHeader,
}: {
  showContentsButton: () => React.ReactNode;
  vowelTableHeader: React.ReactNode;
}) {
  return (
    <section
      className="pb-2 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
      id={SectionIds["finals"]}
    >
      <h3>Finals {showContentsButton()}</h3>
      <p>
        The most important sources used for reconstructing Middle Chinese vowels
        don't treat vowels in isolation, but instead talk about <i>rhymes</i> or{" "}
        <i>finals</i>, i.e. the part of the syllable after any initial
        consonant. For this reason it's easiest to talk about vowels in the
        context of specific finals.
      </p>
      <section
        className="pb-2 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
        id={SectionIds["structure-of-finals"]}
      >
        <h5 className="mt-2">The structure of a final in this notation</h5>
        <p>
          The part of an <i>on'yomi</i> corresponding to the final in
          traditional Chinese phonology basically always consists of these
          elements, in this exact order:
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>
                  sound in{" "}
                  <ScrollLink hash="kan-on">
                    <i>Kan-on</i>
                  </ScrollLink>{" "}
                  (~Heian period)
                </th>
                <th>spelling</th>
              </tr>
            </thead>
            <tbody>
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
            </tbody>
          </table>
        </div>

        <section className="pb-2 pt-14  md:pt-0" id={SectionIds["medials"]}>
          <h5 className="mt-2">Medials</h5>
          <p>
            These "semivowel" sounds in <i>on'yomi</i> readings correspond to
            sounds which scholars of Chinese often call <b>"medials"</b>. They
            were recorded in <i>on'yomi</i> only after certain initials, but we
            will write them out consistently, in all syllables where Chinese
            sources indicate they were present. Reconstructions generally agree
            on the following with regard to these medial sounds:
          </p>
          <ul>
            <li>
              The sound written here <G g="w" /> corresponds to /w/ in{" "}
              <i>Kan'on</i>, which probably depicted a sound <MedialHints.W />
            </li>
            <li>
              The sound written here <G g="y" /> corresponds to{" "}
              <IpaLink broad sound="j" /> in <i>Kan'on</i>, which probably
              depicted a sound <MedialHints.Y />
            </li>
            <li>
              The sound written here <G g="ŷ" /> corresponds to a sound written
              like /wij/ in <i>Kan'on</i>, which probably depicted{" "}
              <MedialHints.Vy />
            </li>
          </ul>
          <p>
            As an exception, the <G g="w" /> in syllables <G g="ʾwo" />{" "}
            <G g="ʾwōng" /> <G g="ʾwōk" /> <G g="ʾwīk" /> likely does not
            correspond to a Chinese medial /w/, but represents{" "}
            <ScrollLink hash="vowel-alternation">vowel alternation</ScrollLink>{" "}
            in those finals.
          </p>
          <p>
            The <G g="y" /> written here{" "}
            <ScrollLink hash="e-chongniu">before E</ScrollLink> and{" "}
            <ScrollLink hash="i-chongniu">before I</ScrollLink> here is not
            exactly a medial, and is not a relic of <i>Kan-on</i>. This is a way
            of marking certain syllables in a category called <i>Chongniu IV</i>
            , which is discussed in more detail in the sections for those "main
            vowels" below. When these <i>Chongniu IV</i> syllables also had a
            [w]-like medial in Middle Chinese, they take the grave accent over
            the W <G g="ẁ" />, rather than an added <G g="y" />.
          </p>
        </section>
        <section className="pb-2 pt-14  md:pt-0" id={SectionIds["coda"]}>
          <h5 className="mt-2">Coda</h5>
          <p>
            As for the <b>coda</b> at the very end of the syllable,{" "}
            <i>on'yomi</i> are much less faithful to the original Chinese, since
            Japanese doesn't allow all the final consonants that Chinese does.
          </p>
          <ul>
            <li>
              Final /i/ in <i>Kan-on</i> usually corresponds to a final [i] in
              reconstructions, in which case we write it <G g="i" />. After main
              vowel /e/, it sometimes corresponds to a velar nasal consonant{" "}
              <IpaLink sound={IpaSymbols.eng} />, in which case we write it{" "}
              <G g="ng" />.
            </li>
            <li>
              Final /u/ in <i>Kan-on</i> often corresponds to a final [u] in
              reconstructions, in which case we write it <G g="u" />. Elsewhere,
              it corresponds to a velar nasal consonant{" "}
              <IpaLink sound={IpaSymbols.eng} />, in which case we write it{" "}
              <G g="ng" />, as in English.
            </li>
            <li>
              Final /n/ in <i>Kan-on</i> corresponds to a final [n] or [m] in
              reconstructions, here written <G g="n" /> and <G g="m" />{" "}
              respectively. (There is reason to believe that Japanese during
              this time had final /m/ in some places, but these sounds were not
              consistently distinguished in writing.)
            </li>
            <li>
              Final /ku/ and /ki/ in <i>Kan-on</i> corresponds to a final [k] in
              reconstructions, here written <G g="k" />.
            </li>
            <li>
              Final /tu/ and /ti/ in <i>Kan-on</i> corresponds to a final [t] in
              reconstructions, here written <G g="t" />.
            </li>
            <li>
              Final /pu/ in <i>Kan-on</i> corresponds to a final [p] in
              reconstructions, here written <G g="p" />.
            </li>
          </ul>
        </section>
        <section
          className="pb-2 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
          id={SectionIds["main-vowels"]}
        >
          <h5 className="mt-2">"Main vowels"</h5>
          <p>
            We'll call this mandatory vowel at the core the <b>"main vowel"</b>.
            This isn't a technical term, but as we continue to discuss what the
            vowels of Middle Chinese may have sounded like, it will be useful to
            have an easy way of referring to this part of the final. It's here
            where most of the open questions about Middle Chinese vowels are
            centered.
          </p>
          <p>
            The vast majority of <i>Kan-on</i> conform to this structure, but
            sometimes, <i>Kan-on</i> readings have the vowel sequences /iu/ and
            /ui/. In these cases, I've chosen to designate one of these vowels
            the "main" vowel solely on the basis of how I convenient I deemed
            the resulting groupings below.
          </p>
        </section>
      </section>
      <section
        className="pb-2 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
        id={SectionIds["tones"]}
      >
        <h4 className="mt-2">Tones {showContentsButton()}</h4>
        <p>
          After the consonants and vowels in this notation, some syllables are
          written with a <G g="ˬ" /> caron or a <G g="ˎ" /> grave accent at the
          bottom right. These are to mark{" "}
          <A href="https://en.wikipedia.org/wiki/Tone_(linguistics)">tone</A>,
          an important feature of Chinese languages. This feature is reminiscent
          of Japanese pitch accent, but it is not the same.
        </p>
        <p>
          If you are only interested in Middle Chinese sounds in relation to the{" "}
          <i>on'yomi</i>, you can ignore the tones to no ill effect. On the
          other hand, an awareness of Middle Chinese tones can be helpful for
          understanding the relationship between words in languages like
          Mandarin Chinese, Cantonese, and Vietnamese, which do have tones.
        </p>
        <p>
          The pronunciation of the Middle Chinese tones is not known with
          certainty, but it is well documented that there were initially four
          tones recognized in ancient times. These four tones correspond{" "}
          <em>only sometimes</em> with the tones of Modern mandarin.
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
          The four tones eventually split on the basis of the voicing of the
          initial consonant. Voiced consonants had the effect of lowering the
          pitch of the following vowel. (In this notation, voiced consonants are
          any consonants NOT written with letters P, T, K, or S, or the glottal
          stop <G g="ʾ" />
          .)
        </p>
        <p>
          This tonal split explains the split between the first and second tones
          of Mandarin—the first tone is the "high level-tone", and the second
          tone is the "low level-tone". This high-low split also explains
          instances where the "rising" tone of Middle Chinese became the 4th
          tone of Mandarin, which is usually the result of Middle Chinese
          "departing" tone. The "low rising" tone and the "low departing" tone
          of Middle Chinese ended up merging, perhaps because the of the similar
          rising contours of both tones.
        </p>
      </section>
      <section
        className="pb-2 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
        id={SectionIds["a-finals"]}
      >
        <h4 className="mt-2">
          Finals with main vowel A {showContentsButton()}
        </h4>
        <p>
          Finals with main vowel A are divided into three different categories
          by scholars of Middle Chinese.
        </p>
        <div className="overflow-x-auto">
          <table>
            {vowelTableHeader}
            <tbody>
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
            </tbody>
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
        className="pb-2 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
        id={SectionIds["e-finals"]}
      >
        <h4 className="mt-2">
          Finals with main vowel E {showContentsButton()}
        </h4>
        <p>
          Finals with main vowel E in this notation are divided into two
          different categories by scholars of Middle Chinese.
        </p>
        <div className="overflow-x-auto">
          <table>
            {vowelTableHeader}
            <tbody>
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
            </tbody>
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
          <h5 className="mt-2">Chongniu III finals vs. Chongniu IV finals</h5>
          <p>
            Those finals written here with bare <G g="e" /> are sometimes
            divided by scholars into two further groups, when they appear after
            certain initial consonants (those written here with symbols{" "}
            <G g="ʾ" /> <G g="k" /> <G g="g" /> <G g="p" /> <G g="b" />{" "}
            <G g="m" />
            ). This "Chongniu" distinction is denoted here by the presence of{" "}
            <G g="y" /> or <G g="ẁ" />.
          </p>
        </section>
        <div className="overflow-x-auto">
          <table>
            {vowelTableHeader}
            <tbody>
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
            </tbody>
          </table>
        </div>
        <p>
          When these finals are written the usual way, they are called "Chongniu
          III" finals. Some scholars believe these finals had a <i>velar</i>{" "}
          element before the vowel (the same as{" "}
          <MiddleChineseTranscriptionLink hash="division-ii">
            Division II finals
          </MiddleChineseTranscriptionLink>
          ). The <G g="y" /> of "Chongniu IV" finals is a nod to borrowings from
          Middle Chinese into Korean, where some Chongniu IV finals were
          depicted with a Y-sound. These were actually not distinguished from
          Chongniu III finals in <i>on'yomi</i>.
        </p>
      </section>
      <section
        className="pb-2 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
        id="i-finals"
      >
        <h4 className="mt-2">
          Finals with main vowel I {showContentsButton()}
        </h4>
        <p>
          Finals with main vowel I in this notation all belong to the category
          known to scholars as <b>Division III</b>.
        </p>
        <div className="overflow-x-auto">
          <table>
            {vowelTableHeader}
            <tbody>
              <tr>
                <th rowSpan={5}>Div. III</th>
              </tr>
              <tr>
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
            </tbody>
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
          <h5 className="mt-2">Chongniu III finals vs. Chongniu IV finals</h5>
          <p>
            Those finals written here with <G g="i" /> <G g="ī" /> <G g="ï" />{" "}
            are sometimes divided by scholars into two further groups, when they
            appear after certain initial consonants (those written here with
            symbols <G g="ʾ" /> <G g="k" /> <G g="g" /> <G g="p" /> <G g="b" />{" "}
            <G g="m" />
            ). This "Chongniu" distinction is denoted here by the presence of{" "}
            <G g="y" />, <G g="ẁ" />, or <G g="u" /> before the vowel.
          </p>
        </section>
        <div className="overflow-x-auto">
          <table>
            {vowelTableHeader}
            <tbody>
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
                  yīn/
                  <br />
                  ẁīn
                </td>
                <td>
                  yīt/
                  <br />
                  ẁīt
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
            </tbody>
          </table>
        </div>
        <p>
          When these finals are written the usual way, they are called "Chongniu
          III" finals. Some scholars believe these finals had a <i>velar</i>{" "}
          element before the vowel (the same as{" "}
          <MiddleChineseTranscriptionLink hash="division-ii">
            Division II finals
          </MiddleChineseTranscriptionLink>
          ). The <G g="y" /> of "Chongniu IV" finals is a nod to borrowings from
          Middle Chinese into Korean, where some Chongniu IV finals were
          depicted with a Y-sound. These were actually not distinguished from
          Chongniu III finals from in <i>on'yomi</i>, except in that Chongniu IV
          finals written with <G g="ẁ" /> tended to lose the /w/ element, and
          Chongniu IV finals written with <G g="y" /> <b>do not</b> alternate
          with <i>o</i> in{" "}
          <MiddleChineseTranscriptionLink hash="go-on">
            Go-on
          </MiddleChineseTranscriptionLink>{" "}
          readings.
        </p>
      </section>
      <section
        className="pb-2 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
        id={SectionIds["o-finals"]}
      >
        <h4 className="mt-2">
          Finals with main vowel O {showContentsButton()}
        </h4>
        <p>
          Finals with main vowel O in this notation are divided into two
          different categories by scholars of Middle Chinese.
        </p>
        <div className="overflow-x-auto">
          <table>
            {vowelTableHeader}
            <tbody>
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
            </tbody>
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
        className="pb-2 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
        id={SectionIds["u-finals"]}
      >
        <h4 className="mt-2">
          Finals with main vowel U {showContentsButton()}
        </h4>
        <p>
          Finals with main vowel U in this notation all belong to the category
          known to scholars as <b>Division III</b>. After{" "}
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
            <tbody>
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
            </tbody>
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
  );
}
