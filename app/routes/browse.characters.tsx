/* eslint-disable react/no-unescaped-entities */
import { PrismaClient } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import clsx from "clsx";
import { PropsWithChildren, useState } from "react";

import { BrowseAtomicComponentsLink, DictLink } from "~/components/AppLink";
import DictionaryLayout from "~/components/DictionaryLayout";
import A from "~/components/ExternalLink";
import { FigureBadge } from "~/components/FigureBadge";
import { prisma } from "~/db.server";
import {
  BadgeProps,
  badgeFigureSelect,
  getBadgeProps,
} from "~/features/dictionary/badgeFigure";
import {
  hyogaiKanji,
  jinmeiyoNotInHyogai,
  joyoNotInKyoiku,
  kyoikuKanji,
} from "~/lib/baseKanji";

interface LoaderData {
  characters: Record<string, BadgeProps>;
  totalCharacters: number;
}

async function getAllListCharacterBadgeFigures(prisma: PrismaClient) {
  const priorityCharacters = await prisma.kanjisenseFigure.findMany({
    select: { ...badgeFigureSelect },
    orderBy: { aozoraAppearances: "desc" },
    where: {
      listsAsCharacter: {
        isEmpty: false,
      },
    },
  });
  const characters: Record<string, BadgeProps> = Object.fromEntries(
    priorityCharacters.map((figure) => {
      return [figure.id, getBadgeProps(figure)];
    }),
  );
  return {
    characters: characters,
    totalCharacters: priorityCharacters.length,
  };
}

export const loader: LoaderFunction = async () => {
  const allBadgeFigures = await getAllListCharacterBadgeFigures(prisma);

  return json<LoaderData>(allBadgeFigures);
};

export default function FigureDetailsPage() {
  const loaderData = useLoaderData<LoaderData>();
  const { characters } = loaderData;
  return (
    <DictionaryLayout>
      <main className="flex flex-col gap-2">
        <section className="mb-4">
          <h1 className="mb-4 text-center text-2xl font-semibold">
            The ~3500 "most important" kanji
          </h1>
          <p className="mb-2">
            There are tens of thousands of kanji in existence, but you don't
            need to know all of them in order to be considered fully literate.
            Below are the 3530 most important characters according to a few
            lists compiled by the Japanese government.
          </p>

          <h2 className="mb-4 mt-6 text-xl font-bold">
            ~3500 kanji made from{" "}
            <BrowseAtomicComponentsLink className="underline hover:text-orange-600">
              ~300 components
            </BrowseAtomicComponentsLink>
          </h2>
          <p className="mb-2">
            What sets Kanjisense apart from other kanji-learning resources is
            the systematic way that it treats the graphical{" "}
            <strong>components</strong> that make up each kanji. Though literacy
            in Japanese requires knowledge of thousands of characters, it's
            possible to break them down into just around 300 distinct
            components. The idea is that, by learning to recognize these
            components, it becomes much easier to learn new kanji. Here you can
            see{" "}
            <BrowseAtomicComponentsLink className="underline hover:text-orange-600">
              a list of all the components
            </BrowseAtomicComponentsLink>{" "}
            which appear in the 3530 kanji below.
          </p>
          <h2 className="mb-4 mt-6 text-xl font-bold">
            Do I need to learn <em>all</em> of these kanji?
          </h2>
          <p className="mb-2">
            The exact number of kanji you need to know really depends on{" "}
            <A
              href="https://kanjibunka.com/kanji-faq/history/q0006/"
              className="underline hover:text-orange-600"
            >
              how much you tend to read
            </A>
            . If you're the kind of person who likes to read novels, you will
            apparently get by with about 3,500 characters; otherwise, you will
            probably get by with closer to 3,000 or fewer.
          </p>
          <p className="mb-2">
            The kanji below happen to match 3,500 almost exactly. Combined,
            these four kanji lists offer the closest thing we have to an
            official collection of all the kanji you are likely to encounter in
            modern Japanese media aimed at the general public.
          </p>
          <p className="mb-2 text-center italic">However...</p>
          <h2 className="mb-4 mt-6 text-xl font-bold">A disclaimer</h2>
          <p className="mb-2">
            Lists like these should not be taken too seriously. I call them "the
            most important kanji" throughout Kanjisense only because it's too
            cumbersome to always say "the closest approximation we learners have
            to an official collection of all the kanji you are likely to
            encounter in modern Japanese media aimed at the general public." In
            the end, <strong>what's "most important" is subjective</strong>.
          </p>
          <p className="mb-2">
            These lists were compiled at various times for various reasons, and
            none of those reasons was "to help the second-language learner of
            Japanese". That is to say, these lists may not be the best way to
            figure out which characters you personally should focus on learning
            next. That said, I reckon these lists serve as a good benchmark for
            your <strong>long-term goals</strong> as a student of Japanese.
          </p>
        </section>
        <section className="mb-4">
          <div className=" m-auto max-w-md">
            <h2 className="mb-4 text-2xl">
              <div className="font-bold">The Education Kanji</div>
              教育漢字
            </h2>
            <p className="mb-2">
              The <i>Kyōiku Kanji</i> are those characters officially approved
              for use in the Japanese primary school curriculum.
            </p>
            <p className="mb-2">
              This list was taken from the{" "}
              <A href="https://www.mext.go.jp/a_menu/shotou/new-cs/youryou/syo/koku/001.htm">
                Japanese Ministry of Education
              </A>
            </p>
          </div>
          <KyoikuCollapsibleSection>
            {kyoikuKanji.map((gradeCharactersJoined, gradeIndex) => {
              return (
                <section key={gradeIndex}>
                  <h3 className="m-2 text-center">Grade {gradeIndex + 1}</h3>
                  <KyoikuCollapsiblePreviewList
                    grade={gradeIndex + 1}
                    characters={[...gradeCharactersJoined]
                      .sort(
                        (a, b) =>
                          characters[b].aozoraAppearances -
                          characters[a].aozoraAppearances,
                      )
                      .map((gradeCharacter) => {
                        return characters[gradeCharacter];
                      })}
                  />
                </section>
              );
            })}
          </KyoikuCollapsibleSection>
        </section>
        <section className="mb-4">
          <div className=" m-auto max-w-md">
            <h2 className="mb-4 text-2xl">
              <div className="font-bold">The Regular Use Kanji</div>
              常用漢字
            </h2>
            <p className="mb-2">
              The so-called <i>Jōyō Kanji</i> comprise those approved by the
              Japanese government for use in government documents and secondary
              school course materials. These are the only kanji you are likely
              to encounter in a newspaper without <i>furigana</i> phonetic
              marks. The <i>jōyō kanji</i> include all the kanji from the
              Education Kanji lists above, plus the additional{" "}
              {(1130).toLocaleString()} below, to form a total of{" "}
              {(2137).toLocaleString()} characters.
            </p>
            <p className="mb-2">
              The list has been modified over the years, with some additions as
              well as removals. This list reflects{" "}
              <A href="http://kokugo.bunka.go.jp/kokugo_nihongo/joho/kijun/naikaku/pdf/joyokanjihyo_20101130.pdf">
                the latest revision, from 2010
              </A>
              .
            </p>
          </div>
          <CollapsiblePreviewList
            characters={joyoNotInKyoiku
              .sort(
                (a, b) =>
                  characters[b].aozoraAppearances -
                  characters[a].aozoraAppearances,
              )
              .map((kanji) => {
                return characters[kanji];
              })}
          />
        </section>
        <section className="mb-4">
          <div className=" m-auto max-w-md">
            <h2 className="mb-4 text-2xl">
              <div className="font-bold">
                The Kanji from the Extra-Regular-Use Kanji List
              </div>
              表外漢字字体表の漢字
            </h2>
            <p className="mb-2">
              In 2000, the Japanese government published{" "}
              <A href="https://web.archive.org/web/20120715000143/http://www.mext.go.jp/b_menu/shingi/12/kokugo/toushin/001218c.htm">
                a list of just over a thousand kanji
              </A>{" "}
              falling <em>outside</em> the Regular Use Kanji list which they
              deemed to be common enough to warrant a standard form in print.
            </p>
            <p className="mb-2">
              The list of {hyogaiKanji.length} kanji given here includes all of
              those kanji, except those which have since been moved to the
              Regular Use kanji list (and are thus already listed above).
            </p>
          </div>
          <CollapsiblePreviewList
            characters={[...hyogaiKanji]
              .sort(
                (a, b) =>
                  characters[b].aozoraAppearances -
                  characters[a].aozoraAppearances,
              )
              .map((kanji) => {
                return characters[kanji];
              })}
          />
        </section>
        <section className="mb-4">
          <div className=" m-auto max-w-md">
            <h2 className="mb-4 text-2xl">
              <div className="font-bold">The Personal-Name Use Kanji</div>
              人名用漢字
            </h2>
            <p className="mb-2">
              The <i>Jinmeiyō Kanji</i> are those approved for use in personal
              names despite falling outside the list of Regular Use Kanji. There
              are {863} in total, as of 2017; the list below includes just those{" "}
              {504} which are not also included in the Extra-Regular-Use Kanji
              List detailed above.
            </p>
            <p className="mb-2">
              Many of the characters below are traditional forms (旧字体{" "}
              <i>kyūjitai</i>) of characters in the Regular-Use Kanji list. That
              is, they are the original forms that were used before the
              characters were simplified to their present-day 新字体{" "}
              <i>shinjitai</i> forms. Traditional variants of <i>jōyō</i> kanji
              are distinguished below via a white border.
            </p>
          </div>
          <CollapsiblePreviewList
            characters={jinmeiyoNotInHyogai
              .sort(
                (a, b) =>
                  characters[b].aozoraAppearances -
                  characters[a].aozoraAppearances,
              )
              .map((kanji) => {
                return characters[kanji];
              })}
          />
        </section>
      </main>
    </DictionaryLayout>
  );
}

function KyoikuCollapsibleSection({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section
      className={clsx(
        "relative my-2 flex flex-row flex-wrap justify-center overflow-hidden",
        {
          "max-h-[8rem]": !isOpen,
        },
      )}
    >
      {children}
      <button
        className={clsx(
          "bottom-0 left-0 block h-[5rem] w-full p-8 pr-16 text-right leading-[4.5] [background:linear-gradient(#ffffff00,_#ffffff,_#ffffff)] hover:text-orange-600 hover:underline",
          { absolute: !isOpen },
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "Hide all" : `Expand`}
      </button>
    </section>
  );
}

function CollapsiblePreviewList({ characters }: { characters: BadgeProps[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="py-2">
      <div
        className={clsx(
          "relative flex flex-row flex-wrap justify-center overflow-hidden",
          {
            "max-h-[8rem]": !isOpen,
          },
        )}
      >
        {characters.slice(0, isOpen ? undefined : 100).map((c) => {
          return <FigureBadgeLink key={c.id} id={c.id} badgeProps={c} />;
        })}
        <button
          className={clsx(
            "bottom-0 left-0 block h-[5em] w-full px-8 pb-0 pr-16 pt-4 text-right leading-[6] [background:linear-gradient(#ffffff00,_#ffffff,_#ffffff)] hover:text-orange-600 hover:underline",
            { absolute: !isOpen },
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "Hide" : `Expand`}
        </button>
      </div>
    </div>
  );
}

function KyoikuCollapsiblePreviewList({
  characters,
}: {
  grade: number;
  characters: BadgeProps[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-2">
      <div
        className={clsx(
          "relative flex flex-row flex-wrap justify-center overflow-hidden",
          {
            "max-h-[8rem]": !isOpen,
          },
        )}
      >
        {characters.slice(0, isOpen ? undefined : 50).map((c) => {
          return <FigureBadgeLink key={c.id} id={c.id} badgeProps={c} />;
        })}
        <button
          className={clsx(
            "bottom-0 left-0 block h-[5em] w-full px-8 pb-0 pr-16 pt-4 text-right leading-[6] [background:linear-gradient(#ffffff00,_#ffffff,_#ffffff)] hover:text-orange-600 hover:underline",
            { absolute: !isOpen },
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "Hide" : `Expand`}
        </button>
      </div>
    </div>
  );
}

function FigureBadgeLink({
  id: figureId,
  badgeProps,
}: {
  id: string;
  badgeProps: BadgeProps;
}) {
  return (
    <DictLink figureId={figureId}>
      <FigureBadge id={figureId} badgeProps={badgeProps} />
    </DictLink>
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
