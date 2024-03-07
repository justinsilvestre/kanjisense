/* eslint-disable react/no-unescaped-entities */
import { MetaFunction } from "@remix-run/node";
import { PropsWithChildren, ReactNode, SetStateAction, useState } from "react";

import {
  BrowseSoundComponentsLink,
  MiddleChineseTranscriptionLink,
} from "~/components/AppLink";
import DictionaryLayout from "~/components/DictionaryLayout";
import { useTocHighlighting } from "~/components/useTocHighlighting";
import css from "~/features/dictionary/middle-chinese.css";
import { G } from "~/features/dictionary/QysHints";
import { NavLi } from "~/features/qysInfo/NavLi";

export const meta: MetaFunction = () => [
  { title: "What do I care about Middle Chinese? | Kanjisense" },
];
export const links = () => [{ rel: "stylesheet", href: css }];

const SectionId = {
  why: "why",
  onyomi: "onyomi",
  katakana: "katakana",
  "understand-the-onyomi": "understand-the-onyomi",
  "practical-benefits": "practical-benefits",
};

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
const sections = [
  section(0, SectionId.why, "The hidden logic behind kanji readings"),
  section(
    0,
    SectionId.onyomi,
    <>
      The Chinese origins of <i>on'yomi</i>
    </>,
  ),
  section(
    0,
    SectionId.katakana,
    <>
      <i>On'yomi</i>: the <i>katakana</i> loanwards of yesterday?
    </>,
  ),
  section(
    0,
    SectionId["understand-the-onyomi"],
    <>
      Using Kanjisense to trace the history of <i>on'yomi</i>
    </>,
  ),
  section(0, SectionId["practical-benefits"], "On practical benefits"),
];

export default function MiddleChinese() {
  const [isOpen, setIsOpen] = useState(false);
  useTocHighlighting();
  return (
    <DictionaryLayout>
      <div className="container">
        <main id="top" className=" leading-7">
          <h2>
            What do <em>I</em> care about Middle Chinese?
          </h2>
          <Nav isOpen={true} className="md:hidden" />

          <section className="mb-10">
            <p>
              You probably know the kanji came to Japan from China. But you may
              not know that, when writing was first introduced to the islands,
              the Japanese adopted not only the Chinese writing system, but also
              the Chinese language itself. The first written language of Japan
              was not Japanese&mdash;it was Chinese!
            </p>
            <p>
              The historical variety of Chinese usually known as{" "}
              <i>Middle Chinese</i> had an especially huge impact on Japan.
              Around{" "}
              <strong>half the words in the modern Japanese lexicon</strong> are
              derived from Middle Chinese roots, dating back to around the time
              of the Tang and Song dynasties (ca. 800-1200 C.E.).
            </p>

            <p>
              Despite from what you may have heard, the kanji are far from being
              a purely ideographic script. They were designed to represent the{" "}
              <strong>sounds</strong> of Chinese. So it follows that, in order
              to fully understand the kanji, you need to learn at least a little
              about those sounds. To this end, in Kanjisense, kanji are
              presented with romanized Middle Chinese readings alongside the
              Japanese <i>on'yomi</i> readings derived from the Chinese.
            </p>
          </section>
          <section id="why" className="mb-10">
            <h3>The hidden logic behind kanji readings</h3>

            <p>
              The Middle Chinese readings shown throughout Kanjisense aren't
              there for you to memorize. Rather, they're there to help answer
              some questions that might arise as you start noticing some
              patterns in kanji and their <i>on'yomi</i>, like the following.
            </p>
            <ul>
              <li>
                <strong>
                  Why do some kanji have slightly varying <i>on'yomi</i>?
                </strong>
                <br />人 can be read as <i>nin</i> or <i>jin</i>, 女 can be read
                as <i>nyo</i> or <i>jo</i>, 入 can be read as <i>nyū</i> or{" "}
                <i>jū</i>, or even <i>ji</i>, etc.
              </li>
              <li>
                <strong>
                  Why are the <i>on'yomi</i> all sort of similar?
                </strong>{" "}
                <br />
                They're always one or two syllables long, and the second
                syllable is always <i>ku/ki</i> or <i>tsu/chi</i>, etc.
              </li>
              <li>
                <strong>Why do so many kanji stand for the same sound?</strong>
                <br /> Why should 口, 工, 交, and 高 all have the same reading{" "}
                <i>kō</i>?
              </li>
              <li>
                <strong>
                  Why do so many{" "}
                  <BrowseSoundComponentsLink>
                    sound components
                  </BrowseSoundComponentsLink>{" "}
                  stand for the same sound?
                </strong>
                <br />
                In the character 校 <i>school</i>, the sound component 交 gives
                the reading <i>kō</i>. But in other characters with the same
                reading <i>kō</i>, the sound component is 工, as in 紅{" "}
                <i>red</i>, 功 <i>achievement</i>, 項 <i>paragraph</i>. So why
                can't we just write 校 <i>school</i> with the simpler sound
                component, like 杠?
              </li>
            </ul>
            <p>
              Of course, none these questions are central to learning Japanese.
              If you try posing them to a Japanese teacher, they will likely
              tell you, <i>That's just how it is!</i> and have you go back to
              grammar and vocabulary drills. But knowing the reasons behind
              these patterns can help to{" "}
              <strong>reveal the hidden logic</strong> behind some of these
              knottier parts of the Japanese writing system.
            </p>
            <p>
              If you're interested in knowing the hidden logic behind the{" "}
              <i>on'yomi</i>, the key lies in the ancient sounds of Chinese.
              Knowing even a little about them helps to illuminate the{" "}
              <BrowseSoundComponentsLink>
                relationships between characters, <i>on'yomi</i>, and sound
                components
              </BrowseSoundComponentsLink>
              .
            </p>
            <p>
              What's more, if you have any interest in learning modern Chinese,
              these patterns can also help you understand{" "}
              <b>the relationships between Japanese and modern Chinese words</b>
              . In fact, the same goes for <b>Korean and Vietnamese</b>, as both
              of those languages take around half of their entire vocabularies
              from Chinese, just as Japanese does. In other words, by answering
              these questions, you can gain the ability to take any Japanese
              word written in kanji and <b>guess how it's pronounced</b> in
              Chinese, Korean, or Vietnamese! (This can work vice-versa, as
              well.)
            </p>
          </section>
          <section id="onyomi" className="mb-10">
            <h3>
              The Chinese origins of <i>on'yomi</i>
            </h3>
            <p>
              The first step to understanding all these quirks about the kanji
              and their <i>on'yomi</i> is to realize the following:
            </p>
            <ul>
              <li>
                <strong>
                  The <i>on'yomi</i> are Japanese corruptions of Chinese sounds
                </strong>
                . Just like the more recent <i>katakana</i> loanwords words
                borrowed into Japanese, the <i>on'yomi</i> represent Japanese
                speakers' attempts at pronouncing foreign words within the
                comparatively tight restrictions of their native sound
                inventory.
              </li>
              <li>
                <strong>
                  The Japanese language has changed over the centuries
                </strong>
                . This shouldn't come as a surprise; all languages change over
                time. Since the <i>on'yomi</i> were imported into Japanese so
                long ago, we can't understand them without also understanding
                the gradual shifts in Japanese pronunciation over the centuries.
              </li>
            </ul>
            <h2 className="text-base">
              Modern Chinese vs. Japanese <i>on'yomi</i>
            </h2>
            <p>
              Knowing that <i>on'yomi</i> readings come from Chinese, you might
              think that the logic behind the <i>on'yomi</i> would become clear,
              if only you spoke Chinese. But if you happen to speak a modern
              Chinese language like Mandarin, you'll know that this is not
              necessarily the case. In fact, Chinese speakers learning Japanese
              may find themselves perplexed by different questions:
            </p>
            <ul>
              <li>
                <strong>
                  Why do some Chinese characters with different pronunciations
                  have the same pronunciation in Japanese?
                </strong>
                <br />
                The characters 口, 工, 交, and 高 are all pronounced <i>
                  kō
                </i>{" "}
                in Japanese <i>on'yomi</i>, but they are pronounced <i>kǒu</i>,{" "}
                <i>gōng</i>, <i>jiāo</i>, and <i>gāo</i> respectively in
                Mandarin. Only the first one sounds anything like the Japanese
                pronunciation!
              </li>
              <li>
                <strong>
                  Why do some Chinese characters with the similar pronunciations
                  have wildly different pronunciations in Japanese?
                </strong>
                <br />
                For example, the character 雪 is pronounced <i>xuě</i> in
                Mandarin, and 学 is pronounced <i>xué</i>. The consonants and
                vowels are exactly the same. But in Japanese, the corresponding{" "}
                <i>on'yomi</i> hardly bear any relation to one another&mdash;雪
                is pronounced <i>setsu</i> and 学 is pronounced <i>gaku</i>.
              </li>
            </ul>
            <p>
              These questions can only be answered by going back in time, and
              looking at the sounds of Chinese during the period when the{" "}
              <i>on'yomi</i> were imported into Japanese.
            </p>
          </section>
          <section id={SectionId["katakana"]} className="mb-10">
            <h3>
              <i>On'yomi</i>: the <i>katakana</i> loanwards of yesterday?
            </h3>
            <p>
              Now, if you've been studying Japanese for a while, you might
              already know all this. But unless you've studied some historical
              linguistics, you may not realize that the processes which led to
              the divergence of the various <i>on'yomi</i>, the modern Chinese
              readings, as well as the kanji readings of Korean and Vietnamese
              happen to unfold according to a{" "}
              <strong>highly consistent set of rules</strong>. This means that,
              with a little bit of knowledge of the original Chinese sources of
              the on'yomi, you can largely predict how any given kanji's{" "}
              <i>on'yomi</i> will sound.{" "}
              <strong>
                Even for those tricky kanji with varying <i>on'yomi</i>
              </strong>
              , there are often patterns governing exactly how their{" "}
              <i>on'yomi</i> can vary.
            </p>
            <p>
              You can look at <i>on'yomi</i> in the same way as the many English
              loanwords in Japanese. If you've been studying Japanese for a
              while, you'll know that, sometimes, you can take an English word
              and predict exactly how the Japanese translation sounds. Take a
              word like <i>computer</i>, <i>internet</i>, or <i>smartphone</i>.
              If you know how a few patterns, it takes little effort to remember
              the words コンピューター <i>konpyūtā</i>, インターネット{" "}
              <i>intānetto</i>, and スマートフォン <i>sumātofon</i>. Of course,
              this only works with words that happen to have been borrowed from
              English, but it's still extremely helpful for a language-learner,
              especially when you're dealing with words like these that were
              invented recently. If you're at the beginning of your Japanese
              studies, and that sounds like some kind of wizardry, rest
              assured&mdash;you will gain this skill soon enough. It's just a
              matter of{" "}
              <strong>
                being exposed to enough English loanwords for the patterns to
                become clear
              </strong>
              .
            </p>
            <p>
              It's the same with Middle Chinese and the <i>on'yomi</i>. Once you
              understand the patterns, you can usually predict all the
              possibilities of how any given character's <i>on'yomi</i> might
              sound, and thus remember words more easily. The difference is that
              you probably don't speak Middle Chinese, so the patterns governing
              the the <i>on'yomi</i> won't easily reveal themselves so readily
              simply through exposure to lots of kanji. This is where the Middle
              Chinese reading in Kanjisense come in.
            </p>
          </section>
          <section id={SectionId["understand-the-onyomi"]} className="mb-10">
            <h3>
              Using Kanjisense to trace the&nbsp;history&nbsp;of&nbsp;
              <i>on'yomi</i>
            </h3>

            <p>
              Throughout Kanjisense, you will see Middle Chinese readings near
              the <i>on'yomi</i>, like this:
            </p>
            <p>PICTURE</p>
            <p>
              If you click on them, you will find some information about the
              Middle Chinese pronunciation, and how it developed into the modern{" "}
              <i>on'yomi</i>.
            </p>
            <p>PICTURE</p>
            <p>
              Let's use these to investigate some of the questions we asked
              above. First, let's take a look at those characters which all
              share the same reading <i>kō</i>. With this information on hand,
              can we answer the question of why all these different kanji share
              this one reading?
            </p>

            <table>
              <thead>
                <th>kanji</th>
                <th>Middle Chinese</th>
                <th>
                  historical <i>on'yomi</i>
                </th>
                <th>
                  modern <i>on'yomi</i>
                </th>
              </thead>
              <tr>
                <td>口</td>
                <td>kʻouˬ</td>
                <td>コウ *kou</td>
                <td>コウ KŌ</td>
              </tr>
              <tr>
                <td>工</td>
                <td>kōng</td>
                <td>コウ *koũ</td>
                <td>コウ KŌ</td>
              </tr>
              <tr>
                <td>交</td>
                <td>kạu</td>
                <td>カウ *kau</td>
                <td>コウ KŌ</td>
              </tr>
              <tr>
                <td>高</td>
                <td>kau</td>
                <td>カウ *kau</td>
                <td>コウ KŌ</td>
              </tr>
            </table>

            <p>
              (The asterisk marks reconstructed Early Middle Japanese
              pronunciation. The <G g="ũ" /> represents a <i>nasal</i> /u/
              sound, which was possibly pronounced, but not written distinctly
              from /u/.)
            </p>

            <p>
              You don't need to know how exactly how to pronounce Middle Chinese
              in order to see that these readings are all quite different. You
              can see for yourself that these readings were all distinct in
              Chinese, and you can even see exactly how the Japanese of old
              adapted these Chinese sounds as best they could in their native
              sound system. Just like with <i>katakana</i> loan words, some
              distinctions were lost along the way. But still, back at the time
              of borrowing, these words were not all pronounced exactly the same
              in Japanese. 交 ⟨kạu⟩ and 高 ⟨kau⟩ ended up sounding something
              like /kau/, while 口 ⟨kʻouˬ⟩ and 工 ⟨kōng⟩ sounded something like
              /kou/.
            </p>
            <p>
              The last piece of the puzzle lies in the sound changes that
              happened within the Japanese language. These "historical{" "}
              <i>on'yomi</i>" here give you an approximation of the Japanese
              pronunciation around the Heian period, when a huge portion of the
              Middle Chinese readings were first introduced to Japan. It's the
              language of this period that served as the basis of Japanese
              spelling all the way up until 1945, when the writing system
              underwent its last major reform. So if you were to take a kanji
              and write out its <i>on'yomi</i> in kana this way, then you'd end
              up with something that looks a lot like pre-war Japanese.
            </p>
            <p>
              This spelling isn't used in everyday life anymore, but it's still
              something that Japanese people learn in school, when they study
              classical literature. So an awareness of sound changes like this,
              where the /au/ became pronounced like /ou/, is actually something
              that could eventually come in handy, if you have any interest in
              reading some very old texts.
            </p>
            <p>
              Of course, I can't pretend like the real reason you should be
              interested in all this stuff is for some kind of practical
              benefit&mdash;I'll be the first to admit that the practical
              benefits are few. But when you're learning a language, should it
              always be about the practical benefits?
            </p>
          </section>
          <section id={SectionId["practical-benefits"]} className="mb-10">
            <h3>On practical benefits</h3>
            <p>
              At least for me, a huge motivating factor for learning Japanese
              has been the experience of getting to know a new culture and its
              history. A huge part of that is closely observing artifacts of
              this culture, like the writing system, and asking how they got to
              be that way. In that process, I find that that the initial
              fascination, based largely on the allure of novelty, soon develops
              into something deeper.
            </p>
            <p>
              Now, instead of simply marvelling at the complexity of these
              characters, I can appreciate them on another level. Knowing a bit
              about the history of characters and their readings helps one feel,
              on an almost visceral level, that this isn't just a writing
              system; it's an ancient tradition, with roots going back thousands
              of years. From this perspective, all the inbuilt complexity, or
              even the <i>impracticality</i> of the Japanese writing system
              isn't some kind of a design flaw or a hurdle for the learner. It's
              a testament to the fierce will of a people determined to preserve
              their history, and to maintain their connection to an ancient
              civilization that they once looked up to with such admiration.
            </p>
            <p>
              Unfortunately, people like us who weren't born into a country that
              uses kanji don't get to grow up with that connection to ancient
              Chinese civilization, and that makes it even harder for us to
              learn thousands upon thousands of these characters. But on the
              other hand, all the work we put into our studies goes into forging
              our very own, brand-new connection with ancient China&mdash;one
              that's maybe all the more personal, because it was not inherited,
              but earned. That doesn't make the work itself any easier, of
              course. But at least in some sense, doesn't it make the work all
              the more rewarding?
            </p>
            <div className=" flex flex-row flex-wrap items-center justify-around gap-4">
              <p className="mb-4 text-5xl [min-width:5em]">
                <Ruby rt="bạk">白</Ruby>
                <Ruby rt="njīt">日</Ruby>
                <Ruby rt="ʾî">依</Ruby>
                <Ruby rt="sạ̈n">山</Ruby>
                <Ruby rt="dzīnˬ">盡</Ruby>
                <br />
                <Ruby rt="ghwang">黃</Ruby>
                <Ruby rt="gha">河</Ruby>
                <Ruby rt="njip">入</Ruby>
                <Ruby rt="khaiˬ">海</Ruby>
                <Ruby rt="liū">流</Ruby>
                <br />
                <Ruby rt="ŷok">欲</Ruby>
                <Ruby rt="giūng">窮</Ruby>
                <Ruby rt="tsʻen">千</Ruby>
                <Ruby rt="liˬ">里</Ruby>
                <Ruby rt="mūk">目</Ruby>
                <br />
                <Ruby rt="kạngˎ">更</Ruby>
                <Ruby rt="dźyangˬ">上</Ruby>
                <Ruby rt="ʾyīt">一</Ruby>
                <Ruby rt="dzŏng">層</Ruby>
                <Ruby rt="lou">樓</Ruby>
                <br />
              </p>
              <p className="[min-width:10em]">
                The white sunlight goes out atop the mountains,
                <br />
                The Yellow River flows into the sea.
                <br />
                To make full use of thousand-mile eyes,
                <br />
                Climb up another storey of the tower.
              </p>
            </div>
          </section>
          <p>
            More on the Middle Chinese notation used in Kanjisense in{" "}
            <MiddleChineseTranscriptionLink>
              A Rough Guide to Middle Chinese Pronunciation
            </MiddleChineseTranscriptionLink>
          </p>
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
        What do <em>I</em> care about Middle Chinese?
      </h5>
      <ul>
        {sections.map(({ level, id, navText, children }) => (
          <>
            <NavLi key={id} level={level} hash={id} text={navText}>
              {children.length > 0 ? (
                <ul>
                  {children.map(({ level, id, navText, children }) => (
                    <>
                      <NavLi key={id} level={level} hash={id} text={navText} />
                      {children.length > 0 ? (
                        <ul>
                          {children.map(({ level, id, navText, children }) => (
                            <>
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
                            </>
                          ))}
                        </ul>
                      ) : null}
                    </>
                  ))}
                </ul>
              ) : null}
            </NavLi>
          </>
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

function Ruby({ rt, children }: PropsWithChildren<{ rt: string }>) {
  return (
    <span className="inline-flex flex-col [line-height:1em] [width:1em]">
      <span className="text-center [font-size:0.30em] [line-height:2]">
        {rt}
      </span>
      <span className="brushFont text-center">{children} </span>
    </span>
  );
}
