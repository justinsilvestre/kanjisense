/* eslint-disable react/no-unescaped-entities */
import { PrismaClient } from "@prisma/client";
import type { LoaderFunction } from "react-router";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "react-router";

import {
  BrowseAtomicComponentsLink,
  BrowseCharactersLink,
  DictLink,
  MiddleChineseLink,
} from "~/components/AppLink";
import DictionaryLayout from "~/components/DictionaryLayout";
import A from "~/components/ExternalLink";
import { SoundComponentGroup } from "~/components/SoundComponentGroup";
import { prisma } from "~/db.server";
import CollapsibleInfoSection from "~/features/browse/CollapsibleInfoSection";
import { BadgeProps, getBadgeProps } from "~/features/dictionary/badgeFigure";
import { FigureKey, parseFigureId } from "~/models/figure";

import { getPrioritySoundComponents } from "../../prisma/kanjisense/getPrioritySoundComponents";

type LoaderData = Awaited<ReturnType<typeof getAllListCharacterBadgeFigures>>;

const groupsThresholds = [10, 8, 7, 5, 4, 3, 2, 1];

function groupSoundComponents(
  groupsThresholds: number[],
  soundComponents: SoundComponentsForDisplay,
): {
  groupMemberUsesCount: number;
  figures: SoundComponentForDisplay[];
}[] {
  const groupsMap = new Map(
    groupsThresholds.map((t) => [
      t,
      {
        groupMemberUsesCount: t,
        figures: [] as SoundComponentForDisplay[],
      },
    ]),
  );

  for (const figure of Object.values(soundComponents)) {
    const usesCount = figure.usesCount;
    const groupThreshold = groupsThresholds.find((t) => t <= usesCount);
    if (groupThreshold) {
      const group = groupsMap.get(groupThreshold);
      if (group) {
        group.figures.push(figure);
      }
    }
  }

  return [...groupsMap.values()];
}

type SoundComponentsForDisplay = Awaited<
  ReturnType<typeof getAllListCharacterBadgeFigures>
>["soundComponents"];
export type SoundComponentForDisplay = SoundComponentsForDisplay[FigureKey];

async function getAllListCharacterBadgeFigures(prisma: PrismaClient) {
  const { figures: prioritySoundComponents, images } =
    await getPrioritySoundComponents(prisma);

  const map: Record<
    FigureKey,
    {
      badge: BadgeProps;
      readings: (typeof prioritySoundComponents)[number]["reading"];
      values: string[];
      uses: string[];
      usesCount: number;
    }
  > = {};

  for (const figure of prioritySoundComponents) {
    map[figure.key] = {
      badge: getBadgeProps({
        ...figure,
        image: images[figure.key] || undefined,
      }),
      readings: figure.reading,
      usesCount: figure.asComponent!.soundMarkUses.length,
      uses: figure.asComponent!.soundMarkUses.map(
        (u) => parseFigureId(u.id).key,
      ),
      values: [
        ...new Set(
          figure.asComponent!.soundMarkUses.flatMap(
            (u) => u.activeSoundMarkValue || [],
          ),
        ),
      ],
    };
  }
  return {
    soundComponents: map,
    totalSoundComponents: prioritySoundComponents.length,
  };
}

export const loader: LoaderFunction = async () => {
  const allBadgeFigures = await getAllListCharacterBadgeFigures(prisma);

  return allBadgeFigures;
};

export default function FigureDetailsPage() {
  const loaderData = useLoaderData<LoaderData>();
  const { soundComponents, totalSoundComponents } = loaderData;

  // let groupThreshold: number | null = null;
  const groups = groupSoundComponents(groupsThresholds, soundComponents);

  return (
    <DictionaryLayout>
      <main className="flex flex-col items-center gap-2">
        <h1 className=" text-2xl font-bold">
          Kanji and their sound components
        </h1>
        <section className="max-w-xl gap-4  leading-7">
          <p className="my-2 text-justify text-sm leading-7">
            While the kanji constitute a logographic script, they're not just
            little pictures of the things they represent. In fact, the vast
            majority of kanji were created on the basis of sound. Out of the
            3,500 most important kanji, 74% either include or serve as a sound
            component.
          </p>
          <CollapsibleInfoSection heading="What is a sound component?">
            <p className="my-2 text-justify text-sm leading-7">
              To understand the role of sound in the formation of the kanji, we
              have to look back to ancient China, where the script originated.
            </p>
            <p className="my-2 text-justify text-sm leading-7">
              When the speakers of Old Chinese had to write down a word for
              which no character had been invented yet, they turned to one
              strategy time and time again:
            </p>
            <ol className="my-2  ml-16 list-decimal">
              <li>Find a character that has a vaguely related meaning.</li>
              <li>Find a character for a word that sounds alike.</li>
              <li>Squish the two characters together!</li>
            </ol>
            <h4 className="my-2 text-center text-lg">
              Case study: the character 星 <i>star</i>
            </h4>
            <p className="my-2 text-justify text-sm leading-7">
              For instance, take the Old Chinese word for "star", which sounded{" "}
              <A href="https://en.wiktionary.org/wiki/%E6%98%9F#Pronunciation">
                something like <i>sleng</i>
              </A>
              . Following that process, some ancient Chinese folks created the
              character for <i>star</i> more or less like so:
            </p>
            <ol>
              <li>
                <b>Find a character that has a vaguely related meaning.</b>
                <br />
                Stars appear in the sky, like the <strong>sun</strong>. So we'll
                take the character{" "}
                <strong>
                  日 <i>sun</i>
                </strong>
                .
              </li>
              <li>
                <b>Find a character for a word that sounds alike.</b>
                <br />
                <i>Sleng</i> sounds just like the Old Chinese word for{" "}
                <i>live</i>, so we'll take the character{" "}
                <strong>
                  生 <i>live</i>
                </strong>
                .
              </li>
              <li>
                <b>Squish the two characters together!</b>
                <br />日 <i>sun</i> + 生 <i>sleng</i> = 星 <i>star!</i>
              </li>
            </ol>
            <p className="my-2 text-justify text-sm leading-7">
              When a kanji component has been used for its sound value, like 生
              here, it's known as an 音符 <i>onpu</i> in Japanese, meaning
              something like "sound indicator". Since they are a subset of the{" "}
              <BrowseAtomicComponentsLink>
                kanji components
              </BrowseAtomicComponentsLink>
              , I refer to them here as <strong>sound components</strong>.
            </p>
          </CollapsibleInfoSection>
          <CollapsibleInfoSection heading="What does this have to do with modern Japanese?">
            <p className="my-2 text-justify text-sm leading-7">
              Something like{" "}
              <A href="https://en.wikipedia.org/wiki/Sino-Japanese_vocabulary">
                half of all Japanese words have Chinese roots
              </A>
              . In addition to being written in kanji, these words are
              pronounced using Japanese approximations of ancient Chinese
              sounds. These Sino-Japanese pronunciations of the kanji are called
              音読み <i>on'yomi</i>, meaning <i>sound readings</i>.
            </p>
            <p className="my-2 text-justify text-sm leading-7">
              An awareness of the kanji's sound components will go a long way
              towards helping you pronounce words read using <i>on'yomi</i>.
              Once in a while, you might even be able to guess the pronunciation
              of words containg kanji or readings that you've never encountered
              before.
            </p>
          </CollapsibleInfoSection>
          <CollapsibleInfoSection heading="An example: the sound component 生">
            <p className="my-2 text-justify text-sm leading-7">
              For example, if you know any of the following words:
            </p>
            <ul className=" ml-8 list-disc">
              <li>
                先生 <i>sensei (teacher)</i>
              </li>
              <li>
                学生 <i>gakusei (student)</i>
              </li>
              <li>
                生活 <i>seikatsu (life)</i>
              </li>
            </ul>
            <p className="my-2 text-justify text-sm leading-7">
              ...then you know that the kanji 生 <i>live</i> has the{" "}
              <i>on'yomi</i> セイ <i>sei</i>.
            </p>
            <p className="my-2 text-justify text-sm leading-7">
              With the knowledge that 生 can serve as a sound component, you
              have an immediate advantage when learning words like the
              following:
            </p>
            <ul className=" ml-8 list-disc">
              <li>
                火星{" "}
                <i>
                  ka<b>sei</b> (Mars)
                </i>
              </li>
              <li>
                姓名{" "}
                <i>
                  <b>sei</b>mei (first and last name)
                </i>
              </li>
              <li>
                性格{" "}
                <i>
                  <b>sei</b>kaku (personality)
                </i>
              </li>
            </ul>
            <p className="my-2 text-justify text-sm leading-7">
              As you can see, even though the characters' readings don't have
              much to do with the original Chinese pronunciations anymore, the
              sound components still provide us with some useful information as
              students of Japanese. Kanji that{" "}
              <MiddleChineseLink>
                sounded similar in premodern China
              </MiddleChineseLink>{" "}
              still tend sound similar in modern Sino-Japanese words.
            </p>
          </CollapsibleInfoSection>
          <CollapsibleInfoSection heading="Sound components and meaning components">
            <p className="my-2 text-justify text-sm leading-7">
              To be clear,{" "}
              <strong>it's not always as easy as in the examples above</strong>!
              Some sound components only vaguely hint at a character's sound,
              via <DictLink figureKey="矢">rhyme</DictLink> or looser
              connections, obscured by the passage of time. Moreover, the fact
              that a component <em>can</em> serve as a sound mark doesn't mean
              that it always <em>does</em>. For example, 産 <i>give birth</i> is
              pronounced not as セイ <i>sei</i>, but サン <i>san</i>.
            </p>

            <p className="my-2 text-justify text-sm leading-7">
              But{" "}
              <strong>
                even the absence of a sound component can tell you something
                about a kanji
              </strong>
              . To illustrate, let's take that same example 産, where the
              component 生 fails us as a sound indicator.
            </p>
            <p className="my-2 text-justify text-sm leading-7">
              When we learn that 産 <i>give birth</i> is read as サン <i>san</i>
              , we know right away that 生 <i>live</i> is <em>not</em> a sound
              component. And since it's not being used for its sound, we can
              deduce that it's most likely being used for its <em>meaning</em>{" "}
              instead. Indeed, the meanings of 生 <i>live</i> and 産{" "}
              <i>give birth</i> are closely related: birth is the start of life.
              Components used in this way are called{" "}
              <strong>meaning components</strong> (in Japanese 意符 <i>ifu</i>).
              They provide you with a focal point for remembering the meaning of
              the character.
            </p>
            <p className="my-2 text-justify text-sm leading-7">
              Sound components and meaning components go hand in hand; awareness
              of one enhances your awareness of the other. Together, they reveal
              the logic behind the structure of the kanji. Kanjisense helps you
              stay attuned to the presence of sound components by clearly
              indicating them prominently in multiple places. In this way, you
              can not only remember the kanji's pronunciation better, but you
              can also gain insight into its structure and meaning.
            </p>
          </CollapsibleInfoSection>
          <CollapsibleInfoSection heading="What about the kun'yomi?">
            <p className="my-2 text-justify text-sm leading-7">
              There are also native Japanese readings, the 訓読み{" "}
              <i>kun'yomi</i>, meaning <i>expository readings</i>, and these are
              just as important as <i>on'yomi</i>. Some kanji are used primarily
              for their <i>kun'yomi</i>, with their <i>on'yomi</i> seldom
              appearing in modern Japanese. A few kanji, being native Japanese
              inventions (国字 <i>kokuji</i>), don't even have an <i>on'yomi</i>
              .
            </p>
            <p className="my-2 text-justify text-sm leading-7">
              But the name <strong>音</strong>読み{" "}
              <i>
                <strong>on</strong>'yomi
              </i>{" "}
              (
              <i>
                <strong>sound</strong> reading
              </i>
              ) hints that the Chinese-derived pronunciations somehow embody the
              kanji's <i>essential sound</i>. Accordingly, in Kanjisense, the{" "}
              <i>kun'yomi</i> take a backseat to the <i>on'yomi</i> and English
              keywords. The <i>kun'yomi</i> are treated in character entries,
              but the Kanjisense UI prioritizes the <i>on'yomi</i> throughout.
            </p>
            <p className="my-2 text-justify text-sm leading-7">
              Now, a kanji doesn't <i>really</i> have one essential sound. But
              learners will benefit from treating the <i>on'yomi</i> this way
              during kanji study. Paying special attention to the on'yomi has
              some practical advantages. The first has already been mentioned
              above: an understanding of <i>on'yomi</i> and sound indicators
              helps you identify meaning indicators. This is key to
              understanding the logic behind a character's structure. Another
              benefit applies when you're quizzing yourself on a kanji's
              meaning.
            </p>
          </CollapsibleInfoSection>
          <CollapsibleInfoSection heading="Using sound components to differentiate kanji with similar meanings">
            <p className="my-2 text-justify text-sm leading-7">
              If you've gotten beyond the very beginning stages of your studies,
              you've likely come across the problem of kanji with similar
              meanings. Say you're studying with flashcards, and you come to a
              flashcard with the English keyword <i>use</i> on the front. You{" "}
              <em>definitely</em> know the kanji <i>使</i> use, but you slip up
              and give the answer 用 <i>utilize</i> instead--now what? If you're
              using paper flashcards, do you put the card back in the pile? If
              you're using something like{" "}
              <A href="https://apps.ankiweb.net/">Anki</A>, do you mark this
              card as a failure, and lose your progress,{" "}
              <em>even if you're sure you know that kanji</em>?
            </p>
            <p className="my-2 text-justify text-sm leading-7">
              This is a minor problem in the grand scheme of things, and if it
              hasn't bothered you in your studies, you don't have to worry about
              it, at least for now. But in case this is something{" "}
              <A href="https://www.reddit.com/r/LearnJapanese/comments/av4c3g/my_review_of_remembering_the_kanji_by_james_heisig/">
                that has bothered you in the past
              </A>
              , you can remedy the situation by{" "}
              <strong>
                including the on'yomi when you're testing your recall of kanji
                meanings
              </strong>
              .
            </p>
            <p className="my-2 text-justify text-sm leading-7">
              The chance for confusion is much smaller when you quiz yourself
              with cards looking like:
            </p>
            <ul className=" ml-8 list-disc">
              <li>
                シ
                <br />
                <i>utilize</i>
              </li>
              <li>
                ヨウ
                <br />
                <i>use</i>
              </li>
            </ul>
            <p className="my-2 text-justify text-sm leading-7">
              Just for the sake of thoroughness, here's another example of two
              kanji with similar meanings, who{" "}
              <strong>also share a component</strong>: 欄 and 柱. Normally, the
              similarity in shape <em>and</em> meaning could easily throw you
              off.
            </p>
            <ul className=" ml-8 list-disc">
              <li>
                チュウ
                <br />
                <i>pillar</i>
              </li>
              <li>
                ラン
                <br />
                <i>column</i>
              </li>
            </ul>
            <p className="my-2 text-justify text-sm leading-7">
              If you know your sound components <DictLink figureKey="闌" /> and{" "}
              <DictLink figureKey="主" />, it's nearly impossible to mix up the
              two.
            </p>
            <p className="my-2 text-justify text-sm leading-7">
              If you're worried that this makes things too easy, remember that
              when you get to the point where you're actually writing out or
              typing a Japanese word in real life, you <em>will</em> likely have
              both the pronunciation and meaning in your mind before you think
              of the kanji. In this way, a kanji-recall quiz starting from the
              kanji's meaning <em>and</em> reading might actually be a better
              test of your skills than a kanji-recall quiz from meaning alone.
            </p>
            <p className="my-2 text-justify text-sm leading-7">
              Now, Kanjisense is still in its early stages, so many of the{" "}
              <i>on'yomi</i> prominently displayed throughout may be rare or
              even obsolete in modern Japanese. However, even nonsense syllables
              have their place in education--ask any musician who has studied{" "}
              <A href="https://en.wikipedia.org/wiki/Solf%C3%A8ge">solfege</A>.
              You could do worse than to keep a few extra <i>on'yomi</i> in your
              head.
            </p>
            {/* solfege
          if you know which bit is the sound mark, the traditional *radical* is easier to determine.
          also, you can guess that the non-sound-mark is closely related to the meaning. */}
            {/* <blockquote>Near-complete overlap between keywords. For instance envy and envious, printing and printing block, sea and open sea and ocean, reside and residence, dining tray and tray, spirits and spirit, wife and legitimate wife, use and utilize, voice and voiced, drown and drowning, row and rowboat and rowing, evade and elude, someone and somebody, and so on an so forth. Most of the time you can keep these straight, but it can be really frustrating when you write the wrong character during review because of this.</blockquote> */}
          </CollapsibleInfoSection>
        </section>
        <section className="">
          <h1 className="text-center text-lg">
            All {totalSoundComponents} sound components in Kanjisense
          </h1>
          <div className="flex flex-col items-center gap-4">
            <p className="max-w-lg text-center text-sm">
              The sound marks for the{" "}
              <BrowseCharactersLink>
                {(3530).toLocaleString()} most important kanji
              </BrowseCharactersLink>{" "}
              are given below with their on'yomi and{" "}
              <MiddleChineseLink>
                Middle Chinese pronunciations
              </MiddleChineseLink>
              . Kanji in a sound mark group will have the same on'yomi{" "}
              <strong>or a similar on'yomi</strong> with respect to the sound
              mark or, at times, with respect to each other.
            </p>
          </div>
          {groups.map(({ groupMemberUsesCount, figures }, i) =>
            !figures.length ? null : (
              <SoundComponentGroup
                key={String(i)}
                groupMemberUsesCount={groupMemberUsesCount}
                figures={figures}
              />
            ),
          )}
        </section>
      </main>
    </DictionaryLayout>
  );
}

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
