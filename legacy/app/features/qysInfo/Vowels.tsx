/* eslint-disable react/no-unescaped-entities */
import { MiddleChineseTranscriptionLink } from "~/components/AppLink";
import { G } from "~/features/qysInfo/G";
import { ScrollLink } from "~/features/qysInfo/ScrollLink";
import { SectionIds } from "~/features/qysInfo/SectionIds";

import { IpaLink, IpaSymbols } from "../dictionary/IpaLink";

export function Vowels({
  showContentsButton,
}: {
  showContentsButton: () => React.ReactNode;
}) {
  return (
    <section
      className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
      id={SectionIds["vowels"]}
    >
      <h3>Vowels {showContentsButton()}</h3>
      <h5 className="mt-6" id="the-problem-with-reconstructions">
        The problem with Middle Chinese reconstructions
      </h5>
      <p>
        Compared with the consonants, little is known for certain with regard to
        the vowels of Middle Chinese. Various scholars have come up with various
        ways of reconstructing them. They don't even agree on how many distinct
        vowels there were in the language.
      </p>
      <p>
        This situation is very different from that of other ancient languages
        like Latin, Greek, or Sanskrit. As you might expect, this difference is
        largely because there is nothing like a native Chinese alphabetic
        writing system for us to learn from. The Chinese characters do have some
        phonetic elements (contrary to popular belief), but not enough to help
        scholars recover any exact values for the ancient vowel sounds with
        total certainty. So it makes sense that scholars of Middle Chinese make
        use of drastically different techniques for their reconstructions
        compared with those available to scholars of Latin, Greek, and Sanskrit.
        In fact, their techniques differ so much that some suggest that all
        scholarly reconstructions of Middle Chinese aren't really proper
        "reconstructions" at all.
      </p>
      <p>
        This has to do with the peculiar nature of the most central pieces of
        evidence in Middle Chinese reconstructions, the <i>Qieyun</i> rhyme
        dictionary and the so-called "rime tables". These sources are of
        unquestionable importance for anyone interested in historical Chinese
        pronunciation, and yet they they offer little in the way of{" "}
        <b>direct evidence</b> for reconstructing Chinese sounds. What they{" "}
        <em>do</em> offer us is a wealth of information about historical Chinese
        pronunciation that is, unfortunately, impossible to sum up briefly. Or
        at least, it's impossible to sum up in a way that's easy for the
        non-specialist to understand, so I won't bother trying here.
      </p>
      <p>
        Suffice it to say, these sources are not like the kind of dictionaries
        you or I are used to today. Modern dictionaries aim to represent, for
        the most part, the words of a language in one particular time and place,
        but the <i>Qieyun</i> and the rime dictionaries do not. Seeing as the
        very concept of "Middle Chinese" is so intimately tied to these sources,
        this leads many scholars to flat-out deny the existence of "Middle
        Chinese" as a single coherent spoken language. In light of this, it's no
        wonder they would also question the validity of any reconstruction of
        "Middle Chinese" that treats it as such.
      </p>
      <p>
        It's an altogether complicated, messy situation. So let's leave
        reconstructions aside for a moment, and instead, let's work through a
        little thought experiment.
      </p>
      <div id="a-thought-experiment">
        <h5 className="mt-6">A thought experiment</h5>
        <p>
          Say we were to travel back in time to around the Heian period in
          Japan, circa 800 C.E., give or take a century or two—in other words,
          the same time as the Tang/Song dynasties. If we came across one of the
          many Japanese speakers at the time who were familiar with Chinese, and
          asked them to{" "}
          <strong>
            learn the Latin alphabet and try writing down Chinese in it
          </strong>
          , what kind of system might they come up with?
        </p>
        <p>
          This might seem like a strange question, but in answering it, we can
          go actually a long way towards answering questions about Middle
          Chinese sounds in a satisfying way.
        </p>
        <p>
          So let's think. Our new Japanese friend from 800 C.E. probably would
          come up with a rather flawed system for writing Chinese sounds. With
          no training in modern linguistics, they might represent some
          consonants and vowels ambiguously. There would also be some
          interference from their native Early Middle Japanese, causing them to
          confuse some sounds, and leave out some sounds altogether. But despite
          these shortcomings, they would likely represent the sounds of Middle
          Chinese more faithfully than you or I could possibly manage to. After
          all, this is a living, breathing contemporary of Tang China—some
          Japanese people at the time actually traveled to China and joined the
          upper ranks of society there. So this person would have learned the
          language from actual speakers of Tang-era Chinese, giving them such
          insight into the language as we could only dream of.
        </p>
      </div>
      <section
        className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
        id="kan-on"
      >
        <h4>
          Viewing Middle Chinese through the lens&nbsp;of&nbsp;the&nbsp;
          <i>Kan-on</i>
          {showContentsButton()}
        </h4>
        <p>
          I invite you to think of the Middle Chinese notation used here as
          something like{" "}
          <ScrollLink hash="a-thought-experiment">
            our imaginary friend from Heian Japan
          </ScrollLink>{" "}
          might have come up with. It doesn't reconstruct specific consonants
          and vowels, but it's designed to bring you <b>closer to the source</b>{" "}
          than any scholarly reconstruction.
        </p>
        <p>
          This is possible in large part thanks to the <i>on'yomi</i> tradition.
          These character readings may come from Japan, but they represent the
          attempts of real-life speakers of Tang-era Chinese to write down the
          sounds of the language. This has made the <i>on'yomi</i> an invaluable
          resource for scholars and anyone else trying to understand the sounds
          of Middle Chinese. Therefore, this notation uses the <i>on'yomi</i> as
          a starting point—in particular, those <i>on'yomi</i> which were
          recorded by Japanese speakers around the Tang dynasty, known as{" "}
          <b>
            <i>Kan-on</i>
          </b>
          .
        </p>
        <p>
          The foundation of this notation consists of a rendition of the{" "}
          <i>Kan-on</i> using ordinary Latin letters taken from the standard
          conventions of romanized Japanese. Additional symbols are introduced
          in order to represent other distinctions which were not recorded in
          the <i>Kan-on</i> tradition,{" "}
          <b>without committing to precise phonetic values</b>. To illustrate,
          let's take an example of a few characters which are read with the{" "}
          <i>on'yomi</i> カ <i>ka</i>. In our notation, each of them is written
          like <G g="ka" />, but with slight variations.
        </p>
        <ul>
          <li>歌 ka</li>
          <li>家 kạ</li>
          <li>佳 kạ̈</li>
        </ul>
        <p>
          The different diacritic marks on A are a sign that these vowels were{" "}
          <i>somehow</i> different from each other, though the exact nature of
          these differences is not universally agreed upon. The specific usage
          of these diacritics is meant to tell us a few things.
        </p>
        <ul>
          <li>
            Both <G g="kạ" /> and <G g="kạ̈" /> share the underdot mark as a way
            of signalling that scholars put them{" "}
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
            <i>father</i>). In addition, scholars sometimes reconstruct these
            syllables with a <i>velar</i> or <i>palatal</i> element before the
            vowel like <IpaLink sound={IpaSymbols.gamma} /> or{" "}
            <IpaLink sound="j" />.
          </li>
          <li>
            Between <G g="kạ" /> and <G g="kạ̈" />, the double-dot is a way of
            signalling another difference&mdash;namely, it's likely that the{" "}
            <G g="kạ̈" /> had a <i>higher</i> or more <i>front</i> vowel. So
            scholars posit for 家 <G g="kạ" /> sounds like{" "}
            <IpaLink broad sound="kɣæ" />, <IpaLink broad sound="kjaː" />, etc.,
            whereas 佳 <G g="kạ̈" /> gets something like{" "}
            <IpaLink broad sound="kɣɛ" />, <IpaLink broad sound="kjaːj" /> etc.
          </li>
        </ul>

        <p>
          Hopefully now you can see why it's not so easy to represent Middle
          Chinese vowels in the International Phonetic Alphabet. The IPA only
          allows us to represent one scholar's reconstruction at a time. It
          allows us to do so with great precision, but such precision isn't
          always desirable. The inherent imprecision of a notation like ours
          actually has its advantages. By avoiding precise phonetic symbols, we
          avoid committing to <i>one single</i> scholar's vision, and we can
          instead express{" "}
          <strong>patterns that are common to many scholars' visions</strong>.
          This works because this notation was built on the foundation of the{" "}
          <i>Kan-on</i> tradition and other important sources which form the
          arsenal of{" "}
          <i>all scholarly reconstructions of Middle Chinese ever published</i>.
        </p>
      </section>
      <section
        className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
        id={SectionIds["japanese-vowels"]}
      >
        <h4>From Japanese to Chinese vowels {showContentsButton()}</h4>
        <p>
          From here on out, we will be talking about Chinese vowels with
          reference to the vowels of Japanese, so let's talk briefly about
          Japanese vowels. At the time of <i>Kan-on</i>, the Japanese vowel
          system was not very different than it is today. The so-called "Early
          Middle Japanese" of this period had a five-vowel system much like
          those of many other world languages, such as Spanish, Swahili,
          Hawaiian, and so on.
        </p>
        <ul>
          <li>
            /a/ Much like the A in <i>father</i>, as in modern Japanese.
          </li>
          <li>
            /i/ Much like the I in <i>machine</i>, as in modern Japanese.
          </li>
          <li>
            /u/ Much like the U in <i>rule</i>. This sound may have been more
            rounded than the corresponding sound in modern Japanese, which is
            often transcribed as <IpaLink broad sound={IpaSymbols.turnedM} />.
          </li>
          <li>
            /e/ Narrowly transcribed <IpaLink sound="ʲe" />, much like the{" "}
            <G g="ye"></G> in <i>yes</i>. So the same as in modern Japanese,
            except with an initial glide like a Y sound.
          </li>
          <li>
            /o/ Narrowly transcribed <IpaLink sound="ʷo" />, much like the{" "}
            <G g="wo"></G> in <i>worn</i>. So the same as in modern Japanese,
            except with an initial glide like a W sound.
          </li>
        </ul>
        <p>
          (At the beginning of the Early Middle Japanese period, there was
          actually an additional vowel{" "}
          <IpaLink broad sound={IpaSymbols.schwa} />. But this merged with the{" "}
          <IpaLink broad sound="o" /> sound some time after 1000 C.E. So it
          still makes sense to say that the fivefold vowel system above remained
          intact throughout the shared history of Early Middle Japanese and
          Middle Chinese.)
        </p>
        <p>
          Five-vowel systems like this just so happen to be a great match for
          the Latin alphabet—a coincidence which turns out to be great news for
          our thought experiment. Remember, we're trying to imagine how someone
          from Heian-era Japan might use the Latin alphabet to represent Middle
          Chinese sounds. And the vowels pose the biggest challenge by far
          because of the lack of direct evidence for Middle Chinese vowels (as
          opposed to the consonants, which scholars back in the day so kindly{" "}
          <ScrollLink hash="consonants">named and listed out for us</ScrollLink>
          ).
        </p>
        <p>
          So while we may never know exactly what the vowels of Middle Chinese
          sounded like, we <i>can</i> answer this different, also compelling
          question. That is, how might one <strong>best approximate</strong> the
          Middle Chinese vowels given just five vowel symbols? We need only to
          look to the <i>on'yomi</i> for the answer. For practically every
          syllable of Middle Chinese, we know exactly how Japanese speakers of
          the Heian period interpreted it in their own five-vowel system. These{" "}
          <i>Kan-on</i> readings will allow us to actually bring our thought
          experiment to a pretty satisfying conclusion, no time machine needed.
        </p>
        <p>
          All games aside, there is a real-world lesson here for us who are
          trying to spell out the sounds of Middle Chinese using the Latin
          alphabet. There's no need to wrack our brains trying to think of the
          best way to write out Middle Chinese vowels in a five-vowel system.
          The work has already been done for us by the compilers of the{" "}
          <i>Kan-on</i> readings. These people were real contemporaries of Tang
          China, who knew these vowel sounds more intimately than we could ever
          hope to.
        </p>
      </section>
      <section
        className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
        id={SectionIds["caveats"]}
      >
        <h4>Caveats {showContentsButton()}</h4>
        <p>
          The{" "}
          <ScrollLink hash="kan-on">
            <i>Kan-on</i>
          </ScrollLink>{" "}
          are a good starting point for understanding the sounds of Middle
          Chinese, because, <i>in the vast majority of cases</i>, the compilers
          of these <i>on'yomi</i> wrote down Middle Chinese sounds in a manner
          that was nice and consistent. But there are exceptions to this general
          rule. After all, the <i>Kan-on</i> aren't the work of one specific
          person like our imaginary friend from Heian Japan. They're simply a
          collection of character readings that happened to get recorded during
          this particular period of time. We can't expect them to depict the
          sounds of Middle Chinese in a totally systematic way.
        </p>
        <p>
          On the other hand, the whole point of this notation is to depict
          Middle Chinese sounds in a systematic way. For that reason, there are
          some places where it deviates from <i>Kan-on</i>. Thankfully, these
          cases are few, since the <i>Kan-on</i> are mostly consistent. In the
          following section on the <ScrollLink hash="finals">finals</ScrollLink>
          , I go into specific cases of inconsistencies within the <i>Kan-on</i>
          . But here's the general idea of how this writing system handles these
          inconsistencies.
        </p>
        <h5 className="mt-6">
          Plain old inconsistencies in <i>Kan-on</i>
        </h5>
        <p>
          Take the character 佳. It is known to have a single Middle Chinese
          reading, but it has multiple <i>Kan-on</i> readings: /ka/ and /kai/.
          These are both legitimate <i>Kan-on</i>, since they were both recorded
          sometime around the Heian period. In cases like this, where there are
          multiple <i>Kan-on</i> available, this notation{" "}
          <strong>reflects only one of these readings</strong> in the vowel
          letters. So in the case of 佳, we will always write <G g="kạ̈" />,
          instead of something like <G g="kạ̈i" />. (The reasoning behind these
          design decisions are too complicated to go into here, but they were
          generally taken to keep different vowels visually distinct, and
          sometimes take general trends in reconstructions into account.)
        </p>
        <h5 className="mt-6" id="vowel-alternation">
          Predictable vowel alternation in <i>Kan-on</i>
        </h5>
        <p>
          Sometimes, one Middle Chinese vowel is rendered in a couple different
          ways in <i>Kan-on</i>, but the variation happens in a pretty
          consistent way. For example, the characters 水 and 軌 had the same
          final in Chinese, but in <i>Kan-on</i>, they are rendered with
          different vowels as 水 /sui/ and 軌 /kwi/. This appears at first
          glance to be an inconsistency, but when we look at other words in the
          same category, there are clear patterns. It turns out that, for words
          with this final, we can usually predict the <i>Kan-on</i> vowel{" "}
          <strong>based on the initial consonant</strong>. The consonant in 軌
          is a <i>velar</i> consonant <G g="k" />, and whenever the initial is a
          velar consonant (i.e. any of <G g="kʻ" /> <G g="kh" /> <G g="g" />{" "}
          <G g="gh" />
          ), this vowel is always represented as /(w)i/ in <i>Kan-on</i>, as
          opposed to /ui/. This is just one of a few such patterns.
        </p>
        <p>
          It's possible that these variations represent real changes in
          pronunciation at later stages of Middle Chinese, but that's not
          necessarily the case. In any event, this notation incorporates some of
          these patterns, above all when they are especially conspicuous and
          easy to explain with a general rule. This helps maintain some
          consistency with <i>Kan-on</i>, and keeps us from{" "}
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
          Other times, vowel alternations may be easy to explain with a general
          rule, but they still aren't incorporated into this notation. For
          example, the vowel sound in 高 is usually rendered as /au/ in{" "}
          <i>Kan-on</i>. But there's a consistent rule that, after <i>labial</i>{" "}
          consonants like /p/, the vowel is rendered /ou/, as in 宝 /pou/.
          Despite that, we will consistently write that vowel as <G g="au" />,
          giving 髙 <G g="kau" /> and 宝 <G g="pauˬ" />. This lets us keep words
          like 宝 <G g="pauˬ" /> and 掊 <G g="pouˬ" /> visually distinct,
          without resorting to diacritics.
        </p>
        <p>
          Many different considerations went into the decisions around which
          vowel alternations to honor or ignore in this writing system.
          Unfortunately there isn't an easy way to list them all here, so some
          decisions may seem kind of arbitrary. But these inconsistencies in{" "}
          <i>Kan-on</i> are rare enough that they shouldn't impact the
          usefulness of this notation too much—at least, this is my hope.
        </p>
      </section>
    </section>
  );
}
