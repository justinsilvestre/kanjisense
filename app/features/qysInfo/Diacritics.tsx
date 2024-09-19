/* eslint-disable react/no-unescaped-entities */
import { ReactNode } from "react";

import { MiddleChineseTranscriptionLink } from "~/components/AppLink";
import { G } from "~/features/qysInfo/G";
import { ScrollLink } from "~/features/qysInfo/ScrollLink";
import { SectionIds } from "~/features/qysInfo/SectionIds";

import { IpaLink } from "../dictionary/IpaLink";

export function Diacritics({
  showContentsButton,
}: {
  showContentsButton: () => ReactNode;
}) {
  return (
    <section
      className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
      id={SectionIds["diacritics"]}
    >
      <h3>
        Summary of diacritics used in this notation {showContentsButton()}
      </h3>
      <p>
        We don't know exactly how many vowel sounds there were in Middle
        Chinese, but there were certainly more than five. So this notation makes
        heavy use of diacritic marks to represent vowel distinctions that were
        not recorded in the{" "}
        <ScrollLink hash="kan-on">
          <i>Kan-on</i>
        </ScrollLink>{" "}
        tradition. As this isn't a precise phonetic notation, these diacritic
        marks are applied in a way that is to some extent arbitrary. But there
        are some general principles that are worth noting.
      </p>
      <section
        className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
        id={SectionIds["four-rows"]}
      >
        <h4>The four rows of the rime tables {showContentsButton()}</h4>
        <p>
          I briefly mentioned above that one of the foundational sources for
          Middle Chinese phonology was something called the "rime tables". These
          tables were basically a tool used for looking up words'
          pronunciations, much like you might use a dictionary for today. But
          instead of writing out pronunciations somehow in phonetic symbols, the
          compilers of these tables invented a sophisticated <i>grid system</i>.
          They took every Chinese syllable they could think of, and chose one
          representative character for each. Then, they arranged these
          characters on a series of grids, grouping similar-sounding characters
          close together. It was a complex system, much more complex than you'll
          in dictionaries today, but it was an ingenious system for the time. It
          made it possible for any Chinese speaker at the time to easily look up
          character readings, without having to learn any new writing system.
        </p>
        <a
          href="https://commons.wikimedia.org/wiki/File:Yunjing.jpg"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            className="m-2"
            src="https://upload.wikimedia.org/wikipedia/commons/4/49/Yunjing.jpg"
            alt="A page from the Yunjing rime tables"
          />
        </a>
        <p>
          Of course, for us moderns, the principles behind this grid system are
          not always clear. We know that the <i>23 columns</i> of each grid
          corresponded to characters' initial consonants. But the{" "}
          <i>four rows</i> in this grid system are perhaps the biggest mystery
          of Middle Chinese phonology. Scholars agree that they relate
          simultaneously to the initial consonants and the vowels of the various
          syllables in the rime tables. But beyond that, there's endless
          controversy around these rows. Where two scholars differ greatly in
          their reconstructions of a given syllable, it usually boils down to a
          difference in how they interpret the four rows.
        </p>
        <p>
          The four rows of the rime tables feature in this notation in a few
          different ways, including the usage of diacritic marks.
        </p>
        <ul>
          <li>
            The <b>underdot</b> <G g="◌̣" /> always shows up in syllables placed
            in the second row.
          </li>
          <li>
            The <b>acute accent</b> <G g="◌́" /> and <b>circumflex</b>{" "}
            <G g="◌̂" /> only show up in syllables placed in the third row.
          </li>
          <li>
            The <b>grave accent</b> <G g="◌̀" /> and the <b>bare letter E</b>{" "}
            only show up in syllables placed in the fourth row.
          </li>
        </ul>
        <p>
          There are many more ways that the various symbols in this notation
          relate to the four rows. But which row a syllable belongs to is not as
          important as another kind of grouping based on the rime tables, which
          is intimately connected to the four rows.
        </p>
      </section>
      <section
        className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
        id={SectionIds["four-divisions"]}
      >
        <h4>
          Marks of the "Four Divisions" of the rime tables{" "}
          {showContentsButton()}
        </h4>
        <p>
          Modern-day scholars studying the rime tables found some patterns
          relating to these four rows. Using these patterns, they grouped all
          the syllables of Middle Chinese into four categories, usually called
          the "Four Divisions" in English. (Confusingly, the four rows of the
          rime tables are also sometimes called divisions, but I will refer to
          them distinctly as "rows" and "Divisions" here.)
        </p>
        <p>
          The details of these Four Divisions are complicated, but what's
          important to know is that two syllables belonging to the same Division
          probably had similar vowel sounds. Likewise, two syllables belonging
          to different Divisions probably had different vowel sounds. More is
          said on the possible phonetic features of these Four Divisions in the
          individual{" "}
          <MiddleChineseTranscriptionLink hash="finals">
            "finals" sections
          </MiddleChineseTranscriptionLink>{" "}
          above.
        </p>
        <p>
          Here is a summary of all the characteristic marks of the Four
          Divisions in this notation. Where a cell is greyed out, that means
          there are no syllables with that{" "}
          <MiddleChineseTranscriptionLink hash="finals">
            main vowel
          </MiddleChineseTranscriptionLink>{" "}
          for that Division.
        </p>
        <div className="overflow-x-auto">
          <table className="text-center">
            <thead>
              <tr>
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
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>/a/</td>
                <td className="italic text-gray-900">default</td>
                <td>◌̣</td>
                <td>y- ◌̇ ◌̂</td>
                <td className="bg-gray-400"></td>
              </tr>
              <tr>
                <td>/e/</td>
                <td className="bg-gray-400"></td>
                <td className="bg-gray-400"></td>
                <td>◌̇</td>
                <td className="italic text-gray-900">default</td>
              </tr>
              <tr>
                <td>/i/</td>
                <td className="bg-gray-400"></td>
                <td className="bg-gray-400"></td>
                <td className="italic text-gray-900">invariant</td>
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
                <td className="italic text-gray-900">invariant</td>
                <td className="bg-gray-400"></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          As you can see, there are some features of the Four Divisions that are
          clearly manifest in the <i>Kan-on</i> vowel. For instance, syllables
          containing <IpaLink broad sound="j" /> a Y- sound in <i>Kan-on</i>, or
          one of the main vowels /i/ /u/, are invariably in Division III.
          Therefore, these syllables don't need a diacritic mark to distinguish
          them as such.
        </p>
      </section>
      <section
        className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
        id={SectionIds["go-on"]}
      >
        <h4>
          Marks of <i>Kan-on</i>/<i>Go-on</i> vowel alternation
          {showContentsButton()}
        </h4>
        <p>
          Earlier, we saw that the character 家 <G g="kạ" /> has the{" "}
          <i>on'yomi</i> カ <i>ka</i>. This reading shows up in common words
          like 家族 <i>kazoku</i> "family". But there is another common reading
          ケ <i>ke</i> which predates カ <i>ka</i>, for example in the word 家来{" "}
          <i>kerai</i> "servant". The readings belonging to this older set are
          called{" "}
          <b>
            <i>Go-on</i>
          </b>
          .
        </p>
        <p>
          <i>Go-on</i> originate from a wave of borrowings into Japanese that
          happened early on in the Middle Chinese period. The <i>Go-on</i>{" "}
          readings were largely replaced by the{" "}
          <ScrollLink hash="kan-on">
            <i>Kan-on</i>
          </ScrollLink>{" "}
          which form the basis for the vowels in this notation. Not all
          characters have an attested <i>Go-on</i> reading, but some{" "}
          <i>Go-on</i> readings are used in very common words, and are even more
          commonly used than their <i>Kan-on</i> counterparts in some cases.
        </p>
        <p>
          As a Japanese learner, you don't need to know how to identify{" "}
          <i>Kan-on</i> vs. <i>Go-on</i> readings. This distinction is something
          that many Japanese speakers today are not aware of. However, when the{" "}
          <i>Kan-on</i> and <i>Go-on</i> readings of a character differ, you can
          often predict this variation by looking at the vowel in this Middle
          Chinese notation. For example:
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
            <tbody>
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
                  <G g="ė" /> <G g="e" />
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
            </tbody>
          </table>
        </div>
        <p>
          There are even more patterns than these. This table is here not for
          you to memorize, but to illustrate a point: whenever you encounter a
          kanji whose <i>on'yomi</i> has a variable vowel sound, you can take a
          look at the kanji's Middle Chinese reading, and you can reasonably
          guess that{" "}
          <strong>
            other kanji with a similar-looking Middle Chinese reading{" "}
            <i>just might</i> exhibit the same kind of vowel alternation
          </strong>
          .
        </p>
        <p>
          Most of the above diacritics serve other functions besides marking{" "}
          <i>Kan-on</i>/<i>Go-on</i> vowel alternations. You'll notice that many
          of the vowels above double as marks of the Four Divisions. For
          instance, <G g="ạ" /> with underdot is a characteristic mark of
          Division II, and <G g="â" /> with circumflex is a characteristic mark
          of Division III. The circumflex doubles as a mark of{" "}
          <ScrollLink hash="dentilabialiation">dentilabialization</ScrollLink>{" "}
          on preceding labial consonants <G g="p" /> <G g="pʻ" /> <G g="b" />{" "}
          <G g="m" />.
        </p>
      </section>
      <section
        className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
        id={SectionIds["kan-on-diacritics"]}
      >
        <h4>
          Marks of vowel alternation within <i>Kan-on</i>
          {showContentsButton()}
        </h4>
        <p>
          Sometimes, one Middle Chinese final is rendered in a couple different
          ways in <i>Kan-on</i>. For example, the characters 筠 and 春 both
          probably had the exact same final at early stages of Middle Chinese,
          but in <i>Kan-on</i>, they are rendered with different vowels as 筠{" "}
          <i>win</i> and 春 <i>syun</i>. This might be because, at the time of
          borrowing, the original Chinese vowel had split into two different
          vowels, or it may have been that the compilers of <i>Kan-on</i> just
          interpreted the vowel differently in these different instances. In any
          case, this sort of <i>vowel alternation</i> is sometimes incorporated
          into this notation. When this happens, the vowels subject to
          alternation are usually marked with some kind of diacritic—in the case
          of our example, the macron is used, giving 筠 <G g="wīn" /> and 春{" "}
          <G g="tśʻyūn" />.
        </p>
        <p>
          Here are all the patterns of <i>Kan-on</i> vowel alternation that were
          incorporated into this notation.
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>vowels</th>
                <th>traditional final category</th>
                <th>examples</th>
              </tr>
            </thead>
            <tbody>
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
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
