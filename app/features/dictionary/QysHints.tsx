/* eslint-disable react/no-unescaped-entities */
import { PropsWithChildren } from "react";

import { MiddleChineseTranscriptionLink } from "~/components/AppLink";
import { Kaihe, QysSyllableProfile } from "~/lib/qys/inferOnyomi";
import { QieyunRhymeCycleHead } from "~/lib/qys/QieyunRhymeCycleHead";
import { initialGroups } from "~/lib/qys/QysInitial";

import A from "../../components/ExternalLink";

const noMDentilabializationFinals = new Set<QieyunRhymeCycleHead>(["尤", "東"]);
const alwaysDentilabializationFinals = new Set<QieyunRhymeCycleHead>([
  "元",
  "陽",
  "凡",
  "廢",
  "虞",
  "微",
  "文",
  "鍾",
]);

function hasDentilabialization({ cycleHead, initial }: QysSyllableProfile) {
  if (!initialGroups.幫.has(initial)) return false;

  if (noMDentilabializationFinals.has(cycleHead)) {
    return initial !== "明";
  }

  return alwaysDentilabializationFinals.has(cycleHead);
}

export const ConsonantHint = ({
  syllable,
  initialRealization,
}: {
  syllable: QysSyllableProfile;
  initialRealization: string;
}) => {
  switch (syllable.initial) {
    case "幫":
      return hasDentilabialization(syllable) ? (
        <>
          <ConsonantHints.P /> Around the Tang dynasty, this sound was{" "}
          <MiddleChineseTranscriptionLink hash="dentilabialization">
            influenced by the following vowel
          </MiddleChineseTranscriptionLink>{" "}
          and shifted towards <ConsonantHints.Pv />
        </>
      ) : (
        <ConsonantHints.P />
      );
    case "滂":
      return hasDentilabialization(syllable) ? (
        <>
          <ConsonantHints.Px />. Around the Tang dynasty, this sound was{" "}
          <MiddleChineseTranscriptionLink hash="dentilabialization">
            influenced by the following vowel
          </MiddleChineseTranscriptionLink>{" "}
          and shifted towards <ConsonantHints.Pxv />
        </>
      ) : (
        <ConsonantHints.Px />
      );
    case "並":
      return hasDentilabialization(syllable) ? (
        <>
          <ConsonantHints.B /> In addition, this sound was{" "}
          <MiddleChineseTranscriptionLink hash="dentilabialization">
            influenced by the following vowel
          </MiddleChineseTranscriptionLink>{" "}
          and shifted towards <ConsonantHints.Bv />
        </>
      ) : (
        <>
          <ConsonantHints.B /> The result was a sound closer to [p] or [pʰ].
        </>
      );
    case "明":
      return hasDentilabialization(syllable) ? (
        <>
          <ConsonantHints.M />. In addition, under the influence of the
          following vowel sound, this sound shifted towards{" "}
          <ConsonantHints.Mv />
        </>
      ) : (
        <ConsonantHints.M />
      );
    case "端":
      return <ConsonantHints.T />;
    case "透":
      return <ConsonantHints.Tx />;
    case "定":
      return <ConsonantHints.D />;
    case "泥":
      return <ConsonantHints.N />;
    case "來":
      return <ConsonantHints.L />;
    case "知":
      return (
        <>
          here <ConsonantHints.Tr />
        </>
      );
    case "徹":
      return (
        <>
          here <ConsonantHints.Trx />
        </>
      );
    case "澄":
      return (
        <>
          here <ConsonantHints.Dr />
        </>
      );
    case "孃":
      return (
        <>
          here <ConsonantHints.Nr />
        </>
      );
    case "精":
      return <ConsonantHints.Ts />;
    case "清":
      return <ConsonantHints.Tsx />;
    case "從":
      return <ConsonantHints.Dz />;
    case "心":
      return <ConsonantHints.S />;
    case "邪":
      return <ConsonantHints.Z />;
    case "莊":
      return (
        <>
          almost like <ConsonantHints.Tsh /> It probably sounded a bit closer to{" "}
          <ConsonantHints.Tsr />
        </>
      );
    case "初":
      return (
        <>
          almost like <ConsonantHints.Tshx /> It probably sounded a bit closer
          to <ConsonantHints.Tsrx />
        </>
      );
    case "崇":
      return (
        <>
          almost like <ConsonantHints.Dzh /> At early stages of Middle Chinese,
          it would have sounded more like <ConsonantHints.Dzr.Early /> Later, it
          shifted towards <ConsonantHints.Dzr.Late />
        </>
      );
    case "生":
      return <ConsonantHints.Sr />;
    case "俟":
      return (
        <>
          almost like <ConsonantHints.Zh /> At early stages of Middle Chinese,
          it would have sounded more like <ConsonantHints.Zr.Early /> Later, it
          shifted towards <ConsonantHints.Zr.Late />
        </>
      );
    case "章":
      return (
        <>
          almost like <ConsonantHints.Tsh /> At early stages of Middle Chinese,
          it would have sounded more like <ConsonantHints.Tsj.Early /> Later, it
          shifted towards <ConsonantHints.Tsj.Late />
        </>
      );
    case "昌":
      return (
        <>
          almost like <ConsonantHints.Tsh /> At early stages of Middle Chinese,
          it would have sounded more like <ConsonantHints.Tsjx.Early /> Later,
          it shifted towards <ConsonantHints.Tsjx.Late />
        </>
      );
    case "常":
      return (
        <>
          almost like <ConsonantHints.Dzh /> At early stages of Middle Chinese,
          it would have sounded more like <ConsonantHints.Dzj.Early /> Later, it
          shifted towards <ConsonantHints.Dzj.Late />
        </>
      );
    case "書":
      return (
        <>
          almost like <ConsonantHints.Sh /> At early stages of Middle Chinese,
          it would have sounded more like <ConsonantHints.Sj.Early /> Later, it
          shifted towards <ConsonantHints.Sj.Late />
        </>
      );
    case "船":
      return (
        <>
          almost like <ConsonantHints.Sh /> At early stages of Middle Chinese,
          it would have sounded more like <ConsonantHints.Zj.Early /> Later, it
          shifted towards <ConsonantHints.Zj.Late />
        </>
      );
    case "日":
      return <ConsonantHints.Nj />;
    case "見":
      return <ConsonantHints.K />;
    case "溪":
      return <ConsonantHints.Kx />;
    case "羣":
      return <ConsonantHints.G />;
    case "疑":
      return <ConsonantHints.Ng />;
    case "影":
      return <ConsonantHints.Q />;
    case "曉":
      return <ConsonantHints.Kh />;
    case "匣":
      return <ConsonantHints.Gh />;
    case "云":
      return initialRealization === "w" ? (
        <ConsonantHints.W />
      ) : (
        <ConsonantHints.H />
      );
    case "以": {
      if (initialRealization === "y") return <ConsonantHints.Y />;
      if (initialRealization === "ŷ") return <ConsonantHints.Vy />;
      return <ConsonantHints.Yw />;
    }
  }
};

export const ConsonantHints = {
  Px: () => (
    <>
      [pʰ] as in{" "}
      <i>
        <B>p</B>ool
      </i>
      . The <G g="ʻ" /> marks{" "}
      <A href="https://en.wikipedia.org/wiki/Aspiration_(phonetics)">
        aspiration
      </A>
      .
    </>
  ),
  B: () => (
    <>
      [b] as in{" "}
      <i>
        <B>b</B>ig
      </i>
      . Around the Tang dynasty, this sound{" "}
      <MiddleChineseTranscriptionLink hash="a-note-on-voiced-sounds">
        lost its voiced quality
      </MiddleChineseTranscriptionLink>
      .
    </>
  ),
  M: () => (
    <>
      [m] as in{" "}
      <i>
        <B>m</B>uch
      </i>
      . Around the Tang dynasty, this sound shifted{" "}
      <MiddleChineseTranscriptionLink hash="denasalization">
        closer to a [b] sound{" "}
      </MiddleChineseTranscriptionLink>
      .
    </>
  ),
  Tx: () => (
    <>
      [tʰ] as in{" "}
      <i>
        <B>t</B>alk
      </i>
      , or more precisely, like Hindi{" "}
      <i>
        ha<B>th</B>i
      </i>{" "}
      or Mandarin{" "}
      <i>
        <B>t</B>òu
      </i>
      . The <G g="ʻ" /> marks{" "}
      <A href="https://en.wikipedia.org/wiki/Aspiration_(phonetics)">
        aspiration
      </A>
      .
    </>
  ),
  D: () => (
    <>
      [d] as in{" "}
      <i>
        <B>d</B>og
      </i>
      , or more precisely, like Spanish{" "}
      <i>
        an<B>d</B>a
      </i>
      . Around the Tang dynasty, this sound{" "}
      <MiddleChineseTranscriptionLink hash="a-note-on-voiced-sounds">
        lost its voiced quality
      </MiddleChineseTranscriptionLink>
      , thus shifting towards [t] or [tʰ].
    </>
  ),
  N: () => (
    <>
      [n] as in{" "}
      <i>
        <B>n</B>oodle
      </i>
      , or more precisely, like Spanish{" "}
      <i>
        a<B>n</B>da
      </i>{" "}
      or Mandarin{" "}
      <i>
        <B>n</B>ì
      </i>
      . Around the Tang dynasty, this sound shifted{" "}
      <MiddleChineseTranscriptionLink hash="denasalization">
        closer to a [d] sound
      </MiddleChineseTranscriptionLink>{" "}
      in some contexts.
    </>
  ),
  S: () => (
    <>
      [s] as in{" "}
      <i>
        <B>s</B>ong
      </i>
      .
    </>
  ),
  Z: () => (
    <>
      [z] as in{" "}
      <i>
        <B>z</B>oo
      </i>
      . Around the Tang dynasty, this sound{" "}
      <MiddleChineseTranscriptionLink hash="a-note-on-voiced-sounds">
        lost its voiced quality
      </MiddleChineseTranscriptionLink>
      , thus shifting towards [s] or [sʰ].
    </>
  ),
  Kx: () => (
    <>
      [kʰ] as in{" "}
      <i>
        <B>k</B>ite
      </i>
      . The <G g="ʻ" /> marks{" "}
      <A href="https://en.wikipedia.org/wiki/Aspiration_(phonetics)">
        aspiration
      </A>
      .
    </>
  ),
  G: () => (
    <>
      [g] as in{" "}
      <i>
        <B>g</B>o
      </i>
      , NOT as in <i>gem</i>. Around the Tang dynasty, this sound{" "}
      <MiddleChineseTranscriptionLink hash="a-note-on-voiced-sounds">
        lost its voiced quality
      </MiddleChineseTranscriptionLink>
      , thus shifting towards [k] or [kʰ].
    </>
  ),
  L: () => (
    <>
      [l] as in{" "}
      <i>
        <B>l</B>ion
      </i>
      .
    </>
  ),
  Y: () => (
    <>
      [j] as in{" "}
      <i>
        <B>y</B>es
      </i>
      . When this letter appears after another initial consonant letter, it
      technically constitutes part of the word's vowel.
    </>
  ),
  W: () => (
    <>
      [w] as in{" "}
      <i>
        <B>w</B>in
      </i>
      . This may have technically constituted part of a vowel sound, but
      regardless, where <G g="w" /> is written here at the start of a word, it
      denotes a sound very much the same as the English consonant W. However,
      especially before sounds written here with I and E (denoting{" "}
      <i>front vowels</i>), it may have been fronted like the <G g="hu" /> of
      French <i>huit</i>, <G g="yu" /> of Mandarin <i>yuán</i>, or the German Ü.
      Some scholars have attributed to this sound a{" "}
      <a href="https://en.wikipedia.org/wiki/Pharyngeal_consonant">
        pharyngeal
      </a>{" "}
      or <a href="https://en.wikipedia.org/wiki/Glottal_consonant">glottal</a>{" "}
      quality, something like [ɦ], a sort of breathy H-sound.
    </>
  ),
  H: () => (
    <>
      When a word begins with a vowel letter in this notation, that means there
      was no trace of a consonant in the <i>on'yomi</i>. But scholars generally
      believe that, at least in earlier stages of Chinese, these words started
      with a{" "}
      <a href="https://en.wikipedia.org/wiki/Pharyngeal_consonant">
        pharyngeal
      </a>{" "}
      or <a href="https://en.wikipedia.org/wiki/Glottal_consonant">glottal</a>{" "}
      consonant, something like [ɦ], a sort of breathy H-sound.
    </>
  ),
  P: () => (
    <>
      [p] as in{" "}
      <i>
        s<B>p</B>oon
      </i>
      .
    </>
  ),
  T: () => (
    <>
      [t] as in{" "}
      <i>
        s<B>t</B>op
      </i>
      , or more precisely, like Hindi{" "}
      <i>
        <B>t</B>abla
      </i>
      , Spanish{" "}
      <i>
        <B>t</B>u
      </i>{" "}
      or Mandarin{" "}
      <i>
        <B>d</B>uān
      </i>
      .
    </>
  ),
  K: () => (
    <>
      [k] as in{" "}
      <i>
        s<B>k</B>unk
      </i>
      .
    </>
  ),
  Ts: () => (
    <>
      [t͡s] as in{" "}
      <i>
        ca<B>ts</B>
      </i>
      , or Mandarin pinyin Z.
    </>
  ),
  Dz: () => (
    <>
      [d͡z]
      <i>
        {" "}
        as in a<B>dz</B>e
      </i>
      . Around the Tang dynasty, this sound{" "}
      <MiddleChineseTranscriptionLink hash="a-note-on-voiced-sounds">
        lost its voiced quality
      </MiddleChineseTranscriptionLink>
      , thus shifting towards [t͡s] or [t͡sʰ].
    </>
  ),
  Tsx: () => (
    <>
      [t͡sʰ] as in the consecutive <G g="ts h" bold /> in the phrase{" "}
      <i>
        hi<B>ts h</B>ard
      </i>
      , i.e. like the sound of German Z, or Mandarin pinyin C. The <G g="ʻ" />{" "}
      marks{" "}
      <A href="https://en.wikipedia.org/wiki/Aspiration_(phonetics)">
        aspiration
      </A>
      .
    </>
  ),
  Sh: () => (
    <>
      like the <G g="sh" /> in{" "}
      <i>
        <B>sh</B>oe
      </i>
      .
    </>
  ),
  Sr: () => (
    <>
      [ʂ] like Polish <G g="sz" /> or Mandarin <G g="sh" />.
    </>
  ),
  Sj: {
    Early: () => (
      <>
        [ɕ] like Polish <G g="ś" /> or Mandarin <G g="x" />.
      </>
    ),
    Late: () => (
      <>
        [ʂ] like Polish <G g="sz" /> or Mandarin <G g="sh" />.
      </>
    ),
  },
  Tshx: () => (
    <>
      like the <G g="ch" /> in{" "}
      <i>
        <B>ch</B>ildren
      </i>
      .
    </>
  ),
  Tsh: () => (
    <>
      like the <G g="tch" /> in{" "}
      <i>
        ki
        <B>tch</B>en
      </i>
      , NOT as in <i>children</i>. In other words, like English <G g="ch" />,{" "}
      <strong>
        but without{" "}
        <a href="https://en.wikipedia.org/wiki/Aspiration_(phonetics)">
          aspiration
        </a>
      </strong>
      .
    </>
  ),
  Tsr: () => (
    <>
      [t͡ʂ] like Mandarin <G g="zh" />.
    </>
  ),
  Tsj: {
    Early: () => (
      <>
        [t͡ɕ] like Mandarin <G g="j" />.
      </>
    ),
    Late: () => (
      <>
        [t͡ʂ] like Mandarin <G g="zh" />.
      </>
    ),
  },
  Tsrx: () => (
    <>
      [t͡ʂʰ] like Polish <G g="cz" /> or Mandarin <G g="ch" />.
    </>
  ),
  Tsjx: {
    Early: () => (
      <>
        [t͡ɕʰ] like Polish <G g="ć" /> or Mandarin <G g="q" />.
      </>
    ),
    Late: () => (
      <>
        <>
          [t͡ʂʰ] like Polish <G g="cz" /> or Mandarin <G g="ch" />.
        </>
      </>
    ),
  },
  Zh: () => (
    <>
      like the soft <G g="g" /> in{" "}
      <i>
        <B>g</B>enre
      </i>
      . Around the Tang dynasty, this sound{" "}
      <MiddleChineseTranscriptionLink hash="a-note-on-voiced-sounds">
        lost its voiced quality
      </MiddleChineseTranscriptionLink>
      .
    </>
  ),
  Zr: {
    Early: () => (
      <>
        [ȥ] like Polish <G g="ż" /> or <G g="rz" />, Russian <G g="ж" />, or
        Mandarin <G g="r" />.
      </>
    ),
    Late: () => (
      <>
        [ʂ] like Polish <G g="sz" /> or Mandarin <G g="sh" />
        , and sometimes [t͡ʂʰ] like Polish <G g="cz" /> or Mandarin <G g="ch" />.
        At some point, this sound likely had a{" "}
        <MiddleChineseTranscriptionLink hash="a-note-on-voiced-sounds">
          breathy
        </MiddleChineseTranscriptionLink>{" "}
        quality.
      </>
    ),
  },
  Zj: {
    Early: () => (
      <>
        [ʑ] like Polish <G g="ź" />.
      </>
    ),
    Late: () => (
      <>
        [ʂ] like Polish <G g="sz" /> or Mandarin <G g="sh" />
        , and sometimes [t͡ʂʰ] like Polish <G g="cz" /> or Mandarin <G g="ch" />.
        At some point, this sound likely had a{" "}
        <MiddleChineseTranscriptionLink hash="a-note-on-voiced-sounds">
          breathy
        </MiddleChineseTranscriptionLink>{" "}
        quality.
      </>
    ),
  },
  Dzh: () => (
    <>
      like the <G g="dg" /> in{" "}
      <i>
        ba<B>dg</B>e
      </i>
      . Around the Tang dynasty, this sound{" "}
      <MiddleChineseTranscriptionLink hash="a-note-on-voiced-sounds">
        lost its voiced quality
      </MiddleChineseTranscriptionLink>
      .
    </>
  ),
  Dzr: {
    Early: () => (
      <>
        [d͡ȥ] like Polish <G g="dż" /> or <G g="drz" />, or Russian <G g="дж" />.
      </>
    ),
    Late: () => (
      <>
        [t͡ʂʰ] like Polish <G g="cz" /> or Mandarin <G g="ch" />. At some point,
        this sound likely had a{" "}
        <MiddleChineseTranscriptionLink hash="a-note-on-voiced-sounds">
          breathy
        </MiddleChineseTranscriptionLink>{" "}
        quality.
      </>
    ),
  },
  Dzj: {
    Early: () => (
      <>
        [d͡ʑ] like Polish <G g="dź" />.
      </>
    ),
    Late: () => (
      <>
        [t͡ʂʰ] like Polish <G g="cz" /> or Mandarin <G g="ch" />. At some point,
        this sound likely had a{" "}
        <MiddleChineseTranscriptionLink hash="a-note-on-voiced-sounds">
          breathy
        </MiddleChineseTranscriptionLink>{" "}
        quality.
      </>
    ),
  },
  Ng: () => (
    <>
      [ŋ] as in{" "}
      <i>
        si<B>ng</B>er
      </i>
      . Around the Tang dynasty, this sound shifted{" "}
      <MiddleChineseTranscriptionLink hash="denasalization">
        closer to a [g] sound,{" "}
      </MiddleChineseTranscriptionLink>{" "}
      in some contexts.
    </>
  ),
  Q: () => (
    <>
      [ʔ] like the{" "}
      <A href="https://en.wikipedia.org/wiki/Glottal_stop">glottal stop</A> in
      the middle of "uh-oh". This sound is not usually recognized as a distinct
      consonant in English, but is written as a distinct consonant in other
      languages, like Arabic (<i>alef</i>) or Hawaiian (the <i>ʻokina</i>).
    </>
  ),
  Kh: () => (
    <>
      [x] as in the final sound of{" "}
      <i>
        lo<B>ch</B>
      </i>
      , or like Spanish J in{" "}
      <i>
        <B>j</B>amón
      </i>
      , or [χ] further back in the throat as in{" "}
      <i>
        Ba<B>ch</B>
      </i>
      .
    </>
  ),
  Gh: () => (
    <>
      [ɣ] something like Arabic letter ghayn or Flemish G, or perhaps [ʁ] even
      further back in the throat, as the R-sound of French or German, or [ɦ]
      like a sort of{" "}
      <a href="https://en.wikipedia.org/wiki/Voiced_glottal_fricative">
        breathy H-sound
      </a>
      . Around the Tang dynasty, this sound{" "}
      <MiddleChineseTranscriptionLink hash="a-note-on-voiced-sounds">
        lost its voiced quality
      </MiddleChineseTranscriptionLink>
      , thus shifting towards [x], something like{" "}
      <i>
        lo<B>ch</B>
      </i>{" "}
      or{" "}
      <i>
        Ba<B>ch</B>
      </i>
      .
    </>
  ),
  Nj: () => (
    <>
      [ɲ] like the Spanish Ñ sound, or the <G g="gn" /> of French and Italian.
      Around the Tang dynasty, this sound eventually moved closer towards [ɻ] a
      sound vaguely like a J- or R-sound, as in Mandarin 日 rì, the source of
      the first syllable of the English word "Japan". This spelling is meant to
      reflect how the sound might have been pronounced at an intermediary stage,
      something like [ɲʑ], i.e. vaguely like an N sound followed by a soft J
      sound (as in <B>J</B>
      acques).
    </>
  ),
  Yw: () => (
    <>
      [jw] or [ju] like a Y-sound followed immediately by a W-sound. This
      W-sound technically constituted part of the vowel, but this sequence of
      sounds may have eventually combined into something close to [y] like the
      French U or German Ü, or the Mandarin <G g="yu" /> in <G g="yuán" />. This
      initial consonant usually shows up as a plain /j/ sound in <i>on'yomi</i>,
      in which case it is written <G g="y" />. But where it shows up as a W-
      sound in <i>on'yomi</i>, we write it like this, with the grave accent{" "}
      <G g="`" /> there to distinguish it from <G g="w" />, which didn't involve
      an initial [j] Y-like glide.
    </>
  ),
  Vy: () => (
    <>
      [jw] or [ju] like a Y-sound followed immediately by a W-sound. This
      W-sound technically constituted part of the vowel, but this sequence of
      sounds may have eventually combined into something close to [y] like the
      French U or German Ü, or the Mandarin <G g="yu" /> in <G g="yuán" />.
    </>
  ),
  Tr: () => (
    <>
      [ʈ] like Hindi{" "}
      <i>
        <B>t</B>ikka
      </i>
      .
    </>
  ),
  Trx: () => (
    <>
      [ʈʰ] like Hindi{" "}
      <i>
        <B>th</B>eek
      </i>
      . The <G g="ʻ" /> marks{" "}
      <A href="https://en.wikipedia.org/wiki/Aspiration_(phonetics)">
        aspiration
      </A>
      .
    </>
  ),
  Dr: () => (
    <>
      [ɗ] like Hindi{" "}
      <i>
        <B>d</B>amru
      </i>{" "}
      or Swedish{" "}
      <i>
        jo<B>rd</B>
      </i>
      . Around the Tang dynasty, this sound{" "}
      <MiddleChineseTranscriptionLink hash="a-note-on-voiced-sounds">
        lost its voiced quality
      </MiddleChineseTranscriptionLink>
      , thus shifting towards [ʈ] or [ʈʰ].
    </>
  ),
  Nr: () => (
    <>
      [ɳ] like Swedish{" "}
      <i>
        ba<B>rn</B>
      </i>
      . Around the Tang dynasty, this sound shifted{" "}
      <MiddleChineseTranscriptionLink hash="denasalization">
        closer to a [ɗ] sound{" "}
      </MiddleChineseTranscriptionLink>{" "}
      in some contexts.
    </>
  ),
  Pv: () => (
    <>
      [f] as in{" "}
      <i>
        <B>f</B>ood
      </i>
      , perhaps at one point [pf] like German{" "}
      <i>
        <B>Pf</B>effer
      </i>
      .
    </>
  ),
  Pxv: () => (
    <>
      [f] as in{" "}
      <i>
        <B>f</B>ood
      </i>
      , perhaps at one point [pfʰ] like German{" "}
      <i>
        <B>Pf</B>effer
      </i>
      , but (possibly) with aspiration.
    </>
  ),
  Bv: () => (
    <>
      [f] as in{" "}
      <i>
        <B>f</B>ood
      </i>
      , perhaps at one point [pfʱ] like German{" "}
      <i>
        <B>Pf</B>effer
      </i>
      , (possibly) with breathy voice, or something like [bv] a B-sound followed
      by a V-sound.
    </>
  ),
  Mv: () => (
    <>
      [ʋ] like Dutch{" "}
      <i>
        <B>w</B>el
      </i>
      , perhaps at some point like [mv] an M-sound followed by a V-sound.
    </>
  ),
};

export const MedialHint = ({
  medial,
  final,
}: {
  medial: string;
  final: string;
}) => {
  if (/y[iïīe]/.test(final)) {
    return (
      <MedialHints.YChongniu
        chongniuLinkHash={final.includes("ye") ? "e-chongniu" : "i-chongniu"}
      />
    );
  }
  if (medial === "ẁ")
    return (
      <>
        The <G g="w" /> in this notation was probably pronounced{" "}
        <MedialHints.Yw
          chongniuLinkHash={final.includes("ẁe") ? "e-chongniu" : "i-chongniu"}
        />
      </>
    );
  if (medial === "y")
    return (
      <>
        The <G g="y" /> in this notation was probably pronounced{" "}
        <MedialHints.Y />
      </>
    );
  if (medial === "w" || medial === "ẃ")
    return (
      <>
        The <G g="w" /> in this notation was probably pronounced{" "}
        <MedialHints.W />
      </>
    );
  if (medial === "ŷ")
    return (
      <>
        The <G g="ŷ" /> in this notation was probably pronounced{" "}
        <MedialHints.Vy />
      </>
    );

  return null;
};

export const MedialHints = {
  W: () => (
    <>
      like [w] or [u]. It may have been fronted to something like [y] or [ʉ] in
      certain contexts, especially before <i>front vowels</i> (written here{" "}
      <G g="e" /> and <G g="i" />) and when written with the acute accent as{" "}
      <G g="ẃ" />.
    </>
  ),
  Y: () => (
    <>
      like [j] or [i]. In some finals, it may have been closer to a more central
      [ɨ].
    </>
  ),
  Vy: () => (
    <>
      a sequence of a <G g="w" /> sound followed by a <G g="y" /> sound, so
      something like [wj]. Alternatively, it may have been something in between
      those two sounds, so something like [ʉ] or [y].
    </>
  ),
  Yw: ({ chongniuLinkHash }: { chongniuLinkHash: string }) => (
    <>
      like [w] or [u]. It may have been fronted to something like [y] or [ʉ] in
      certain contexts, especially before <i>front vowels</i> (written here{" "}
      <G g="e" /> and <G g="i" />. The grave accent <G g="`" /> marks that this
      final belongs to the category{" "}
      <i>
        <MiddleChineseTranscriptionLink hash={chongniuLinkHash}>
          Chongniu IV
        </MiddleChineseTranscriptionLink>
      </i>
      , which had some phonetic feature that scholars don't widely agree on. In
      Korean borrowings, these finals sometimes involve a Y-sound before the
      vowel.
    </>
  ),
  YChongniu: ({ chongniuLinkHash }: { chongniuLinkHash: string }) => (
    <>
      This <G g="y" /> marks that this final belongs to the category{" "}
      <i>
        <MiddleChineseTranscriptionLink hash={chongniuLinkHash}>
          Chongniu IV
        </MiddleChineseTranscriptionLink>
      </i>
      , which had some phonetic feature that scholars don't widely agree on. In
      Korean borrowings, these finals sometimes involve a Y-sound before the
      vowel.
    </>
  ),
};

export const VowelHint = ({
  syllable,
  asciiTranscription: transcription,
}: {
  syllable: QysSyllableProfile;
  asciiTranscription: string;
}) => {
  const cycleHead = syllable.cycleHead;
  switch (cycleHead) {
    case "東": {
      if (syllable.dengOrChongniu === "一") {
        return <VowelHints.OMacron />;
      }
      if (transcription.includes("ii")) return <VowelHints.IWikWin />;
      return <VowelHints.UIuung />;
    }
    case "冬":
      return <VowelHints.O1 />;
    case "鍾": {
      if (transcription.includes("v")) return <VowelHints.OCircumflex />;
      return <VowelHints.O3 />;
    }

    case "江":
      return (
        <>
          <VowelHints.A2 />
          <br />
          <VowelHints.A2Ring />
        </>
      );

    case "支":
      return <VowelHints.IDoubleDot />;
    case "脂":
      return <VowelHints.IMacron />;
    case "之":
      return <VowelHints.I />;
    case "微":
      return <VowelHints.ICircumflex />;
    case "魚":
      return <VowelHints.O3 />;
    case "虞":
      return <VowelHints.UYu />;
    case "模":
      return <VowelHints.O1 />;
    case "齊":
      return <VowelHints.E4 />;
    case "佳":
      return (
        <>
          <VowelHints.A2 />
          <br />
          <VowelHints.A2DoubleDot />
        </>
      );
    case "皆":
      return <VowelHints.A2 />;

    case "灰":
      return (
        <>
          <VowelHints.A1 /> <VowelHints.AMacron />
          <br />
          <VowelHints.AWai />
        </>
      );
    case "咍":
      return (
        <>
          <VowelHints.A1 /> <VowelHints.AMacron />
        </>
      );

    case "眞":
      return /i[nt].?$/.test(transcription) ? (
        <VowelHints.IMacron />
      ) : (
        <VowelHints.UMacron />
      );
    case "臻":
      return <VowelHints.IUnderdot />;

    case "文":
      return <VowelHints.UUnUt />;

    case "欣":
      return <VowelHints.I />;

    case "元": {
      const initial = syllable.initial;
      return initial === "幫" ||
        initial === "滂" ||
        initial === "並" ||
        initial === "明" ? (
        <VowelHints.A3Circumflex />
      ) : (
        <VowelHints.E3Circumflex />
      );
    }

    case "魂":
    case "痕":
      return <VowelHints.O1 />;

    case "寒":
      return <VowelHints.A1 />;

    case "刪":
      return <VowelHints.A2 />;
    case "山":
      return (
        <>
          <VowelHints.A2 />
          <br />
          <VowelHints.A2DoubleDot />
        </>
      );
    case "先":
      return <VowelHints.E4 />;
    case "仙":
      return <VowelHints.E3 />;
    case "蕭":
      return <VowelHints.E4 />;
    case "宵":
      return <VowelHints.E3 />;
    case "肴":
      return <VowelHints.A2 />;
    case "豪":
      return <VowelHints.A1 />;
    case "歌":
      if (syllable.kaihe === Kaihe.Closed)
        return syllable.dengOrChongniu === "一" ? (
          <VowelHints.A1 />
        ) : (
          <VowelHints.A2 />
        );
      return <VowelHints.A1 />;
    case "麻":
      return syllable.dengOrChongniu === "二" ? (
        <VowelHints.A2 />
      ) : (
        <VowelHints.A3Y />
      );
    case "陽":
      return (
        <>
          <VowelHints.A3Y /> <VowelHints.A3Circumflex />
        </>
      );
    case "唐":
      return <VowelHints.A1 />;
    case "庚":
      return syllable.dengOrChongniu === "二" ? (
        <VowelHints.A2 />
      ) : (
        <VowelHints.E3Underdot />
      );
    case "耕":
      return (
        <>
          <VowelHints.A2 />
          <br />
          <VowelHints.A2DoubleDot />
        </>
      );
    case "清":
      return <VowelHints.E3 />;
    case "青":
      return <VowelHints.E4 />;
    case "蒸":
      return <VowelHints.O3Breve />;
    case "登":
      return <VowelHints.O1Breve />;
    case "尤":
      return <VowelHints.UIuu />;
    case "侯":
      return <VowelHints.O1 />;
    case "幽":
      return <VowelHints.I />;
    case "侵":
      return <VowelHints.I />;
    case "覃":
      return (
        <>
          <VowelHints.A1 /> <VowelHints.AMacron />
        </>
      );
    case "談":
      return (
        <>
          <VowelHints.A1 /> <VowelHints.AMacron />
        </>
      );
    case "鹽":
      return <VowelHints.E3 />;
    case "添":
      return <VowelHints.E4 />;
    case "咸":
      return (
        <>
          <VowelHints.A2 />
          <br />
          <VowelHints.A2DoubleDot />
        </>
      );
    case "銜":
      return <VowelHints.A2 />;
    case "嚴":
    case "凡": {
      const initial = syllable.initial;
      return initial === "幫" ||
        initial === "滂" ||
        initial === "並" ||
        initial === "明" ? (
        <VowelHints.A3Circumflex />
      ) : (
        <VowelHints.E3Circumflex />
      );
    }

    case "祭":
      return <VowelHints.E3 />;
    case "泰":
      return (
        <>
          <VowelHints.A1 /> <VowelHints.AMacron />
        </>
      );
    case "夬":
      return <VowelHints.A2 />;
    case "廢":
      return <VowelHints.A3Circumflex />;
  }
};
export const VowelHints = {
  A1: () => (
    <>
      Bare <G g="a" /> in this notation marks finals in the category{" "}
      <b>Division I</b>. Scholars tend to reconstruct the vowel of these finals
      as a back vowel [ɑ], versus the more front vowels of Division II. These
      finals are overwhelmingly rendered as /a/ in <i>on'yomi</i>. The final{" "}
      <G g="au" /> is sometimes interpreted as /ou/ in <i>on'yomi</i>, but here
      it is consistently represented as <G g="au" /> to maintain a visual
      distinction with <G g="ou" />.
    </>
  ),
  // for those with macron OR distinguished from macron
  AMacron: () => (
    <>
      The <strong>macron</strong> <G g="¯" /> is used to distinguish{" "}
      <G g="āi" /> <G g="ām" /> <G g="āp" /> from bare <G g="ai" /> <G g="am" />{" "}
      <G g="ap" />. These groups eventually merged, but at the start, the group
      with bare <G g="a" /> may have had vowels that were relatively more
      central or shorter (variously [ʌ], [ə], [ă] in reconstructions). In some{" "}
      <MiddleChineseTranscriptionLink hash="go-on">
        early Japanese borrowings
      </MiddleChineseTranscriptionLink>
      , <G g="am" /> <G g="ap" /> were interpreted with the Japanese vowel{" "}
      <R>-o</R> rather than <R>-a</R>. While the two endings <G g="am" />{" "}
      <G g="ap" /> were consistently permitted to rhyme with <G g="ām" />{" "}
      <G g="āp" /> in poetry throughout the Middle Chinese period, <G g="ai" />{" "}
      and <G g="āi" /> were not considered good rhymes until later.
    </>
  ),
  AWai: () => (
    <>
      The finals <G g="ai" /> and <G g="wai" /> may have been distinguished by a
      leading /w/-like sound before the vowel, but at least at earlier stages of
      Middle Chinese, some scholars attribute to <G g="wai" /> an entirely
      different vowel, like /o/. If that is the case, it would explain why in
      some{" "}
      <MiddleChineseTranscriptionLink hash="go-on">
        early borrowings into Japanese
      </MiddleChineseTranscriptionLink>
      , <G g="wai" /> is interpreted with <R>-ui</R> (rather than the expected{" "}
      <R>-wai</R> or <R>-we</R>).
    </>
  ),
  A2: () => (
    <>
      The <strong>underdot</strong> <G g=" ̣" /> in this notation marks finals in
      the category <b>Division II</b>. Scholars tend to reconstruct these finals
      with a more front vowel than Division I, so something like [a], [æ], or
      even [aɨ]. It's widely agreed that these finals had an R-like or L-like
      sound before the vowel in Old Chinese, which may have survived into the
      Middle Chinese period as something like a velar glide (something like [ɣ]
      or [ɯ]), or a palatal glide (like [j]). In some{" "}
      <MiddleChineseTranscriptionLink hash="go-on">
        earlier Japanese borrowings
      </MiddleChineseTranscriptionLink>
      , the vowel is interpreted as <R>-e</R> or <R>-ya</R> rather than{" "}
      <R>-a</R>. Division II finals have an affinity with retroflex consonants,
      which are also marked by the underdot in this notation. (The underdot was
      chosen for its historical association with retroflex consonants, cf.
      Sanskrit.)
    </>
  ),
  A2DoubleDot: () => (
    <>
      The <strong>double-dot</strong> <G g="¨" /> in this notations marks finals
      that were likely pronounced with a more front or higher vowel compared to
      finals with only the underdot, something like [ɛ] or [ai], though some
      scholars have posited a distinction of vowel length between these finals.
      (In an admittedly biased move, I chose the double-dots for their
      historical association with frontness, cf. German Umlaut). Finals ending
      in <G g="ạ̈" /> were usually interpreted with Japanese /ai/, but sometimes
      with /a/; the spelling <G g="ạ̈" /> was chosen to keep a visual distinction
      with <G g="ạ̈i" /> finals, which are more consistently interpreted with
      /ai/. With the exception of those finals ending in <G g="ạ̈" />, members of
      this group were not usually distinguished in <i>on'yomi</i> from their
      counterparts without double-dots. Both groups were often interpreted with
      Japanese <R>-e</R> in{" "}
      <MiddleChineseTranscriptionLink hash="go-on">
        earlier borrowings
      </MiddleChineseTranscriptionLink>
      . (As with all the other vowels with the underdot, these likely had a
      preceding velar or palatal element.)
    </>
  ),
  A2Ring: () => (
    <>
      The <strong>ring</strong> <G g="°" /> in this notation is used in finals
      ending in <G g="ạ̊ng" /> and <G g="ạ̊k" />, which scholars tend to
      reconstruct with an element of roundedness or height, like [ɔ] or [aɨw].
      As with all the other vowels with the underdot, these may have had a
      preceding velar or palatal element at some earlier stages of Middle
      Chinese. In some{" "}
      <MiddleChineseTranscriptionLink hash="go-on">
        earlier Japanese borrowings
      </MiddleChineseTranscriptionLink>
      , <G g="ạ̊ng" /> <G g="ạ̊k" /> were interpreted with the Japanese vowel{" "}
      <R>-o</R> rather than <R>-a</R>. (The ring was chosen for its historical
      association with the letter O, cf. Danish.) These two finals are the only
      ones bearing the ring diacritic, reflecting the fact that they
      consistently formed a distinct rhyme group in Chinese poetry.
    </>
  ),
  A3Y: () => (
    <>
      In finals with main vowel A in this notation, the category{" "}
      <b>Division III</b> is usually marked by leading <G g="y" />. These are
      usually reconstructed with an onset something like [i] or [j]. The finals{" "}
      <G g="yang" /> <G g="yak" /> are the form taken by the finals elsewhere
      written <G g="âng" /> <G g="âk" />,{" "}
      <MiddleChineseTranscriptionLink hash="kan-on">
        when a /j/ sound is present in the corresponding <i>Kan-on</i> reading
      </MiddleChineseTranscriptionLink>
      . Finals in <G g="ya" /> and <G g="yạ" /> are known to have rhymed with
      finals in <G g="a" /> and <G g="ạ" /> respectively. Division III also
      includes the final <G g="ẃa" />, which differs from Division I{" "}
      <G g="wa" /> is that this Division III final had some kind of front
      element, which may have been pronounced before, after, or in combination
      with the element rendered /w/ in <i>on'yomi</i>. Scholars reconstruct this
      final variously as /ɨuɑ/ /ʷiɑ/ /ya/, etc.
    </>
  ),
  A3Circumflex: () => (
    <>
      The <strong>circumflex accent</strong> <G g="^" /> is used in this
      notation to mark finals <G g="âng" /> <G g="âk" /> <G g="âi" />{" "}
      <G g="ân" /> <G g="ât" /> <G g="âm" /> <G g="âp" />. These finals may have
      had a Y-like sound before the vowel, and where this is reflected in{" "}
      <i>on'yomi</i>, a Y is included in this notation. Scholars tend to
      reconstruct these finals with a central vowel, like [ɐ]. (The circumflex
      accent was chosen for its historical association with central vowels, cf.
      Romanian, Vietnamese.) In{" "}
      <MiddleChineseTranscriptionLink hash="go-on">
        earlier Japanese borrowings
      </MiddleChineseTranscriptionLink>{" "}
      , this vowel was often interpreted with Japanese <R>-o</R> rather than{" "}
      <R>-a</R>. Before <i>labial consonants</i> <G g="p" /> <G g="pʻ" />{" "}
      <G g="b" /> <G g="m" />, these vowels triggered{" "}
      <MiddleChineseTranscriptionLink hash="dentilabialization">
        dentilabialization
      </MiddleChineseTranscriptionLink>
      .
    </>
  ),
  E3: () => (
    <>
      Bare <G g="e" /> marks finals in the category <b>Division III</b> in this
      notation. Scholars tend to reconstruct the vowel of these finals with an
      onset something like /i/ or /j/, and a main vowel like [ɛ] or [e].
    </>
  ),
  E3Circumflex: () => (
    <>
      The <strong>circumflex</strong> accent <G g="^" /> is used in this
      notation to mark finals <G g="(w)ên" /> <G g="(w)êt" /> <G g="(w)êm" />{" "}
      <G g="(w)êp" />
      , which modern scholars generally agree had the same respective vowels as
      in <G g="ân" /> <G g="ât" /> <G g="âm" /> <G g="âp" />, i.e. probably a
      central vowel like [ɐ], which triggered{" "}
      <MiddleChineseTranscriptionLink hash="dentilabialization">
        dentilabialization
      </MiddleChineseTranscriptionLink>{" "}
      in preceding <i>labial consonants</i>. In some early Japanese borrowings,{" "}
      these were normally interpreted with the Japanese vowel <R>-o</R> rather
      than <R>-e</R>.
    </>
  ),
  E3Underdot: () => (
    <>
      The <strong>underdot</strong> <G g=" ̣" /> is used to mark some finals in
      this notation <G g="ẹng" /> <G g="ẹk" /> which, at least at an early stage
      of Middle Chinese, were probably identical to the{" "}
      <a href="#division-ii">Division II</a> finals <G g="ạng" /> <G g="ạk" />,
      except with an added /i/-like glide before the vowel, which was a front
      vowel along the lines of [æ].
    </>
  ),
  E4: () => (
    <>
      The <strong>grave accent</strong> <G g="`" /> over E in this notation
      marks finals in the category <b>Division IV</b>. At earlier stages of
      Middle Chinese, these finals were probably pronounced with a vowel
      something like [ɛ] or [e]. That is, they were identical to the
      corresponding finals of Division III (with bare <G g="e" />
      ), but without the /i/-like glide before the vowel. Eventually, this
      Division IV series also was pronounced with a glide, and most (if not all)
      of these pairs merged.
    </>
  ),
  I: () => (
    <>
      The bare <G g="i" /> is used in this notation mostly to mark finals which
      scholars tend to reconstruct with relatively lower or more central vowels
      (like [ɨ]) relative to their counterparts with the macron <G g="ī" />{" "}
      (often reconstructed with [i]). In{" "}
      <MiddleChineseTranscriptionLink hash="go-on">
        earlier borrowings
      </MiddleChineseTranscriptionLink>{" "}
      into Japanese, <G g="iu" /> was sometimes interpreted as Japanese{" "}
      <R>-eu</R> rather than <R>-iu</R>, and <G g="i" /> <G g="in" />{" "}
      <G g="it" /> <G g="im" /> <G g="ip" /> were sometimes interpreted with{" "}
      <R>-o</R> rather than <R>-i</R>. However, finals with Y- (
      <MiddleChineseTranscriptionLink hash="i-chongniu">
        Chongniu IV
      </MiddleChineseTranscriptionLink>{" "}
      finals) did <i>not</i> get interpreted with <R>-o</R>. All these finals
      were eventually to merge with their counterparts having macron <G g="ī" />{" "}
      and double-dot <G g="ï" />. Finals in <G g="iu" /> were sometimes
      interpreted as /eu/ even in the{" "}
      <MiddleChineseTranscriptionLink hash="kan-on">
        later <i>Kan-on</i> borrowings
      </MiddleChineseTranscriptionLink>{" "}
      which form the basis of this notation, but they are consistently written{" "}
      <G g="iu" /> here in order to maintain a visual distinction with{" "}
      <G g="eu" />.
    </>
  ),
  IMacron: () => (
    <>
      The <strong>macron</strong> <G g="ī" /> is used in this notation to mark
      finals which scholars sometimes reconstruct with relatively higher or more
      front vowels like [i] (compared to their counterparts with bare I, often
      reconstructed with [ɨ]). These finals were more consistently interpreted
      with Japanese <R>-i</R> (rather than <R>-o</R>) in{" "}
      <MiddleChineseTranscriptionLink hash="go-on">
        earlier borrowings
      </MiddleChineseTranscriptionLink>
      . The finals <G g="wī" /> and <G g="uī" /> were considered one and the
      same, but the recorders of <i>on'yomi</i> tended to{" "}
      <MiddleChineseTranscriptionLink hash="vowel-alternation">
        write them differently depending on the initial consonant
      </MiddleChineseTranscriptionLink>
      , so we follow suit here.
    </>
  ),
  IWikWin: () => (
    <>
      The final <G g="wīk" /> is usually written <G g="(y)ūk" />, but{" "}
      <MiddleChineseTranscriptionLink hash="vowel-alternation">
        after certain consonants
      </MiddleChineseTranscriptionLink>{" "}
      it was depicted as /wi/ or /i/ in <i>on'yomi</i>, and we write it like so,
      though scholars consistently reconstruct these finals consistently as
      something along the lines of [ɨuk], [iuk], or [iwk]. Likewise, the finals{" "}
      <G g="wīn" /> <G g="wīt" /> are identified with finals <G g="yūn" />{" "}
      <G g="yūt" />, and these were all pronounced with vowels something like
      [iuɪn] or [win], and in later stages may have moved towards something like
      [yn].
    </>
  ),
  IDoubleDot: () => (
    <>
      The <strong>double-dot</strong> <G g="ï" /> in this notation marks some
      vowels which scholars generally agree to have started out as an [e]-like
      sound in the early stages of Middle Chinese, which changed to something
      closer to [i]. In{" "}
      <MiddleChineseTranscriptionLink hash="go-on">
        earlier borrowings
      </MiddleChineseTranscriptionLink>{" "}
      into Japanese, <G g="ï" /> was sometimes interpreted with Japanese{" "}
      <R>-e</R> rather than <R>-i</R>. (The double-dots were chosen for their
      historical association with the letter E, cf. German Umlaut.) This vowel
      eventually gained a [i]-like onset, and then the [e]-like element
      disappeared. The finals <G g="wï" /> and <G g="uï" /> were considered one
      and the same to the Chinese, but the recorders of <i>Kan-on</i> tended to
      write them differently{" "}
      <MiddleChineseTranscriptionLink hash="vowel-alternation">
        depending on the initial consonant
      </MiddleChineseTranscriptionLink>
      , so we follow suit here.
    </>
  ),
  ICircumflex: () => (
    <>
      The <strong>circumflex accent</strong> <G g="î" /> in this notation marks
      finals which scholars tend to reconstruct as a diphthong, with a more
      central or back onset, something like [ɨi]. In{" "}
      <MiddleChineseTranscriptionLink hash="go-on">
        earlier borrowings
      </MiddleChineseTranscriptionLink>{" "}
      into Japanese, <G g="î" /> was sometimes interpreted with Japanese{" "}
      <R>-e</R> rather than <R>-i</R>. Before <i>labial consonants</i>{" "}
      <G g="p" /> <G g="pʻ" /> <G g="b" /> <G g="m" />, this vowel triggered{" "}
      <MiddleChineseTranscriptionLink hash="dentilabialization">
        dentilabialization
      </MiddleChineseTranscriptionLink>
      .
    </>
  ),
  IBreve: () => (
    <>
      The <strong>breve</strong> <G g="ĭ" /> in this notation is used only in
      the final <G g="wĭk" /> (usually reconstructed something like [wɨk], with
      a rounded element before a central vowel), which was considered to rhyme
      with <G g="yŏk" /> (usually reconstructed something like [ɨk], the same as{" "}
      <G g="wĭk" /> without the rounded element).
    </>
  ),
  IUnderdot: () => (
    <>
      The <strong>underdot</strong> <G g=" ̣" /> in this notation is used for
      finals <G g="ịn" /> and <G g="ịt" />, which scholars suspect were
      originally identical to those written here <G g="īn" /> and <G g="īt" />,
      i.e. with a high, front vowel like [i]. But at an early stage of Middle
      Chinese, preceding <i>retroflex consonants</i> (also written with the
      underdot in this notation) slightly changed the vowel to something lower,
      more like [ɪ]. These finals were still usually considered good rhymes, and
      they would merge back together again in later stages of Chinese.
    </>
  ),
  O1: () => (
    <>
      Bare <G g="o" /> in this notation marks finals in the category{" "}
      <b>Division I</b>. Scholars tend to reconstruct the vowel of these finals
      as a back, rounded vowel like [o]. It's likely that the finals{" "}
      <G g="on" /> <G g="ot" /> <G g="ou" /> were pronounced with a less
      rounded, more central vowel, something like [ə]. The final <G g="o" />{" "}
      with zero coda was likely rounded, and in Japanese sometimes was written
      as /wo/.
    </>
  ),
  OMacron: () => (
    <>
      The <strong>macron</strong> <G g="ō" /> in this notation is on finals{" "}
      <G g="ōng" /> <G g="ōk" /> to reflect a distinction between their
      counterparts without macron in the earlier stages of Middle Chinese.
      Scholars generally agree that this set with macron were pronounced with a
      greater degree of height, so for <G g="ōng" />, something more like [uŋ]
      or [əwŋ], versus <G g="ong" /> [oŋ] or [awŋ]. In{" "}
      <MiddleChineseTranscriptionLink hash="go-on">
        earlier borrowings
      </MiddleChineseTranscriptionLink>{" "}
      into Japanese, these finals were sometimes interpreted with Japanese{" "}
      <R>-u</R> rather than <R>-o</R>. These finals rhymed with finals in{" "}
      <G g="(i)ūng" /> and <G g="(y)ūk" />.
    </>
  ),
  O1Breve: () => (
    <>
      The <strong>breve</strong> <G g="ŏ" /> in this notation is used to mark
      finals <G g="ŏng" /> <G g="ŏk" /> which were pronounced with a more
      central vowel than their counterparts without breve, something like [ə].
      These finals with O-breve remained a distinct group after the merger of{" "}
      <G g="ōng" /> <G g="ōk" /> with <G g="ong" /> <G g="ok" />.
    </>
  ),
  O3: () => (
    <>
      In finals with main vowel O in this notation, a leading <G g="y" /> is the
      usual mark of the category <b>Division III</b>, which scholars usually
      reconstruct with an initial glide leading into a back or rounded vowel. In{" "}
      <G g="yo" />, this meant a diphthong something like [ɨʌ] [iɔ] or [ɨu̯o̝].
    </>
  ),
  O3Breve: () => (
    <>
      The <strong>breve</strong> <G g="ŏ" /> in this notation is used to mark
      finals <G g="yŏng/ŷŏng" /> <G g="yŏk/ŷŏk" /> which rhymed with their
      counterparts without Y in Division I <G g="ŏng" /> <G g="ŏk" />. As in
      those finals, the element rendered as O here was probably a central,
      unrounded vowel, something like [ə]. At an earlier stage of Middle
      Chinese, these probably were more like a sequence composed of an /i/-like
      sound followed by /k/ or /ŋ/, and this is reflected in{" "}
      <MiddleChineseTranscriptionLink hash="go-on">
        earlier Japanese borrowings
      </MiddleChineseTranscriptionLink>
      . The final spelled <G g="ŷŏk" /> is used in a single syllable{" "}
      <G g="kŷŏk" />, which was attested in <i>Kan-on</i> as <i>kyoku</i> (not{" "}
      <i>kwiyoku</i> as suggested by the <G g="ŷ" />
      ), but it is spelled with <G g="ŷ" /> to keep it visually distinct from{" "}
      <G g="kyŏk" />.
    </>
  ),
  OCircumflex: () => (
    <>
      The <strong>circumflex accent</strong> <G g="ô" /> in this notation is
      used to mark finals <G g="(ŷ)ông" /> <G g="(ŷ)ôk" />. Especially in{" "}
      <MiddleChineseTranscriptionLink hash="go-on">
        earlier borrowings
      </MiddleChineseTranscriptionLink>{" "}
      into Japanese, these finals could be interpreted with Japanese <R>-u</R>{" "}
      rather than <R>-io</R>. Here we are consistently writing them with O to
      reflect the fact that they rhymed with finals in <G g="ong" />{" "}
      <G g="ok" /> with bare <G g="o" />. As in those finals, the element
      rendered as O here probably had a back, rounded element, something like
      [o] or [aw]. These finals triggered{" "}
      <MiddleChineseTranscriptionLink hash="dentilabialization">
        dentilabialization
      </MiddleChineseTranscriptionLink>{" "}
      in preceding <i>labial consonants</i> <G g="p" /> <G g="pʻ" /> <G g="b" />{" "}
      <G g="m" />.
    </>
  ),
  UYu: () => (
    <>
      The finals written <G g="u" /> and <G g="yu" /> in this notation are
      usually reconstructed by scholars with a back, rounded vowel like [u].
      These two finals were considered one and the same in Middle Chinese, but
      they are written differently here depending on the initial consonant to{" "}
      <MiddleChineseTranscriptionLink hash="vowel-alternation">
        reflect their rendering in <i>Kan-on</i>
      </MiddleChineseTranscriptionLink>
      . After <G g="t" /> <G g="tʻ" /> <G g="d" /> <G g="n" />, this final is
      rendered consistently as /iu/ in <i>Kan-on</i>, but it is written here as{" "}
      <G g="yu" /> to maintain a visual distinction with <G g="iu" />. This
      final is rendered more inconsistently in <i>Kan-on</i> than perhaps any
      other, sometimes even as /uu/ or /ou/, but these two variations are less
      frequent. The bare <G g="u" /> marks that this final always triggers{" "}
      <MiddleChineseTranscriptionLink hash="dentilabialization">
        dentilabialization
      </MiddleChineseTranscriptionLink>
      .
    </>
  ),
  UUnUt: () => (
    <>
      {" "}
      The finals written <G g="un" /> and <G g="ut" /> in this notation are are
      usually reconstructed by scholars with a back and/or rounded vowel like
      [u]. They are usually rendered with <R>-o</R> instead of <R>-u</R> in{" "}
      <MiddleChineseTranscriptionLink hash="go-on">
        earlier Japanese borrowings
      </MiddleChineseTranscriptionLink>
      . These were considered good rhymes with the finals written here{" "}
      <G g="in" /> <G g="it" />, also <i>without</i> the macron. The bare{" "}
      <G g="u" /> marks that these finals always trigger{" "}
      <MiddleChineseTranscriptionLink hash="dentilabialization">
        dentilabialization
      </MiddleChineseTranscriptionLink>
      .
    </>
  ),
  UMacron: () => (
    <>
      {" "}
      All the finals written with <strong>macron</strong> <G g="ū" /> in this
      notation exhibit{" "}
      <MiddleChineseTranscriptionLink hash="vowel-alternation">
        vowel alternation in <i>Kan-on</i>
      </MiddleChineseTranscriptionLink>
      . Like other finals written with U, they trigger{" "}
      <MiddleChineseTranscriptionLink hash="dentilabialization">
        dentilabialization
      </MiddleChineseTranscriptionLink>
      , but not with initial <G g="m" />.
    </>
  ),
  UIuu: () => (
    <>
      The final <G g="(i)ū" /> is usually reconstructed by scholars as a
      diphthong with some element of backness and roundedness, like [ɨu], [iu],
      or [iw]. The leading /i/ in <i>on'yomi</i> consistently disappears after{" "}
      <i>labial consonants</i> <G g="p" /> <G g="pʻ" /> <G g="b" /> <G g="m" />,{" "}
      so they are accordingly not written in these places. Like the{" "}
      <G g="(y)u" /> finals, the vowel in these finals can be rendered
      unpredictably in <i>Kan-on</i>. In the syllable <G g="mū" />, the vowel
      becomes /o/ in <i>on'yomi</i>, but it is written with U here to keep it
      visually distinct from <G g="mou" />.
    </>
  ),
  UIuung: () => (
    <>
      The finals <G g="(i)ūng" /> <G g="(y)ūk" /> are usually reconstructed by
      scholars with some element of frontness combined with some element of
      roundedness, such as [ɨuŋ], [iuŋ], or [iwŋ]. The leading /i/ and /j/ in{" "}
      <i>on'yomi</i> consistently disappear after <i>labial consonants</i>{" "}
      <G g="p" /> <G g="pʻ" /> <G g="b" /> <G g="m" />, so they are accordingly
      not written in these places. In the syllables <G g="mūng" /> <G g="mūk" />
      , the vowel becomes /o/ i <i>on'yomi</i>, but it is written with U here to
      keep it visually distinct from <G g="mōng" /> and <G g="mōk" />.
    </>
  ),
  UYuunYuut: () => (
    <>
      The finals <G g="yūn" /> and <G g="yūt" /> are in alternation with{" "}
      <G g="wīn" /> and <G g="wīt" /> respectively. These two finals are usually
      reconstructed by scholars with some element of frontness combined with
      some element of roundedness, as in [iuɪn] or [win], and in later stages of
      Middle Chinese, they involved a simple vowel that was simultaneously
      fronted and rounded, as in [yn].
    </>
  ),
};

export const ToneHint = ({ syllable }: { syllable: QysSyllableProfile }) => {
  switch (syllable.tone) {
    case "平":
      return <ToneHints.Level />;
    case "上":
      return <ToneHints.Rising />;
    case "去":
      return <ToneHints.Departing />;
    case "入":
      return <ToneHints.Entering />;
  }
  return null;
};
export const ToneHints = {
  Level: () => (
    <>
      Syllables with no tone mark in in this notation belong to the 平{" "}
      <strong>"level" tone</strong>, the most common tone in the language.
      During the Tang dynasty, level-tone words may have had a high, falling
      pitch, or perhaps a low, steady pitch. This usually corresponds to the
      modern Mandarin first and second tones.
    </>
  ),
  Rising: () => (
    <>
      Syllables ending with a caron <G g="ˬ" /> in this notation belong to the
      上 <strong>"rising" tone</strong>. They may have had a high pitch or a
      rising pitch during the Tang dynasty. This usually corresponds to modern
      Mandarin third tone, which is also marked with a caron (but over the
      vowel).
    </>
  ),
  Departing: () => (
    <>
      Syllables ending with a grave accent <G g="ˎ" /> in this notation belong
      to the 去 <strong>"departing" tone</strong>. They may have had a rising
      pitch during the Tang dynasty, like the "rising" tone, but perhaps more
      drawn out. This usually corresponds to modern Mandarin fourth tone, which
      is also marked with a grave accent (but over the vowel).
    </>
  ),
  Entering: () => (
    <>
      All syllables ending with <i>stop consonants</i> <G g="p" /> <G g="t" />{" "}
      <G g="k" /> were classified as 入 <strong>"entering" tone</strong>{" "}
      syllables in Middle Chinese. These final consonants were lost in Mandarin,
      where these syllables may take on any of the four modern Mandarin tones.
    </>
  ),
};

export function G({ g, bold }: { g: string; bold?: boolean }) {
  return bold ? (
    <>
      ⟨<b>{g}</b>⟩
    </>
  ) : (
    <>⟨{g}⟩</>
  );
}

function R({ children }: PropsWithChildren) {
  return <i>{children}</i>;
}

export function B({ children }: PropsWithChildren) {
  return (
    <strong>
      <u>{children}</u>
    </strong>
  );
}
