/* eslint-disable react/no-unescaped-entities */
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import clsx from "clsx";
import { createPortal } from "react-dom";

import {
  AboutLink,
  BrowseCharactersLink,
  BrowseCompoundComponentsLink,
  DictLink,
  DictPreviewLink,
} from "~/components/AppLink";
import DictionaryLayout from "~/components/DictionaryLayout";
import A from "~/components/ExternalLink";
import { FigureBadge } from "~/components/FigureBadge";
import { FigurePopoverWindow } from "~/components/FigurePopover";
import { prisma } from "~/db.server";
import CollapsibleInfoSection from "~/features/browse/CollapsibleInfoSection";
import { useManyFiguresPopover } from "~/features/browse/useManyFiguresPopover";
import { parseAnnotatedKeywordText } from "~/features/dictionary/getHeadingsMeanings";
import { TOTAL_ATOMIC_COMPONENTS_COUNT } from "~/features/dictionary/TOTAL_ATOMIC_COMPONENTS_COUNT";

import { getAtomicFigureBadgeFigures } from "../features/browse/getAtomicFigureBadgeFigures";

export const meta: MetaFunction = () => [
  {
    title: `The ${TOTAL_ATOMIC_COMPONENTS_COUNT} atomic kanji components | Kanjisense`,
  },
];

type LoaderData = Awaited<ReturnType<typeof getAtomicFigureBadgeFigures>>;

export const loader: LoaderFunction = async () => {
  const allBadgeFigures = await getAtomicFigureBadgeFigures(prisma);

  return json<LoaderData>(allBadgeFigures);
};

export default function FigureDetailsPage() {
  const loaderData = useLoaderData<LoaderData>();
  return (
    <DictionaryLayout>
      <AtomicComponentsPageContent loaderData={loaderData} />
    </DictionaryLayout>
  );
}

function AtomicComponentsPageContent({
  loaderData,
}: {
  loaderData: LoaderData;
}) {
  const { atomicComponentsAndVariants, totalAtomicComponents } = loaderData;
  const popover = useManyFiguresPopover();
  const content = (
    <>
      {popover.popper.isOpen
        ? createPortal(
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
            <FigurePopoverWindow {...popover} />,
            document.getElementById("overlay") || document.body,
          )
        : null}
      <main className="flex flex-col items-center gap-2">
        <section className="mb-4 max-w-xl  leading-7">
          <h1 className="my-2 text-center font-sans text-2xl font-bold">
            The {totalAtomicComponents} "atomic" kanji components
          </h1>
          <CollapsibleInfoSection heading={"What is a kanji component?"}>
            <p className="my-3 text-justify text-sm leading-7">
              Most kanji can be broken up into two or more separate shapes, or{" "}
              <strong>components</strong>, which appear on their own as
              characters in their own right. For example, the characters 日{" "}
              <i>sun</i> and 月 <i>moon</i> come together as components in the
              character 明 <i>bright</i>. Some components don't correspond to
              any standalone character in modern Japanese usage, but they appear
              again and again inside multiple characters, like the component 宀
              which represents a house, and is used in kanji like 家{" "}
              <i>household</i>, 室 <i>room</i>, and 宿 <i>lodging</i>.
            </p>
            <p className="my-3 text-justify text-sm leading-7">
              This means that, even though there are tens of thousands of kanji
              in existence, they can all be considered combinations of{" "}
              <strong>just a few hundred repeating components</strong>.
            </p>
          </CollapsibleInfoSection>
          <CollapsibleInfoSection
            heading={"How many kanji components do I need to know?"}
          >
            <p className="my-3 text-justify text-sm leading-7">
              With the help of{" "}
              <A
                className=" underline hover:text-orange-700"
                href="http://kanji-database.sourceforge.net/"
              >
                data from the Kanji Database project
              </A>
              , I've established a list of just {totalAtomicComponents}{" "}
              components which come together in various combinations to form all
              the{" "}
              <BrowseCharactersLink>
                3,530 most important kanji
              </BrowseCharactersLink>{" "}
              in everyday modern Japanese.
            </p>
            <p className="my-3 text-justify text-sm leading-7">
              For each component, I've selected an English{" "}
              <strong>keyword</strong> based on either its historical meaning,
              its shape, or the context in which it's used in modern Japanese.
              Hopefully, these keywords will help you imbue the component shapes
              with meaning so you can learn to recognize them.
            </p>
            <p className="my-3 text-justify text-sm leading-7">
              In some cases, a set of components will share a single
              keyword--you can think of these as <strong>variant forms</strong>{" "}
              of a single component. If you count a set of variants as a single
              component, there are{" "}
              <strong>
                just {atomicComponentsAndVariants.length} components
              </strong>{" "}
              you have to learn in order to cover all the 3,530 most important
              kanji.
            </p>
          </CollapsibleInfoSection>
          <CollapsibleInfoSection
            heading={"Why do some components have variants?"}
          >
            <p className="my-3 text-justify text-sm leading-7">
              For the most part, these variant forms only differ slightly in
              shape, and there is a logic to which variant is used when. For
              example, the component 羊 <i>sheep</i> has the common variant form
              𦍌. If you go to{" "}
              <DictLink figureKey="𦍌">the entry for 𦍌</DictLink>, you'll
              notice that it's always used <em>on top</em> of other components
              inside a character; it's almost like the tail end of 羊 is
              politely contracting to make room for the other components. It's
              nice to think of the components this way, as helpful alternative
              forms that make the characters easier to write.
            </p>
            <p className="my-3 text-justify text-sm leading-7">
              Just a few variant forms exhibit more dramatic variations in
              shape, like 水 <i>water</i> and its variant 氵. In such cases,
              these variants are grouped together because they descend from a
              single historical form. Most of these extremely simplified variant
              forms like 氵 appear so often in common kanji that you won't have
              to put much effort into memorizing them. If you're supplementing
              your kanji study with real-world Japanese (which you should be
              doing!), you'll have most of them mastered in no time.
            </p>
          </CollapsibleInfoSection>
          <CollapsibleInfoSection heading="Atomic components vs. compound components">
            <p className="my-3 text-justify text-sm leading-7">
              This list includes only those components which can't be broken up
              easily into distinct, meaningful sub-components. Since they're
              indivisible, kind of like atoms, I've dubbed them the "atomic"
              components. I've also made available{" "}
              <BrowseCompoundComponentsLink>
                an exhaustive list of all the compound components
              </BrowseCompoundComponentsLink>
              , which number over 900.
            </p>
          </CollapsibleInfoSection>
          <CollapsibleInfoSection
            heading={
              <>
                Disclaimer: <strong>personal judgments ahead!</strong>
              </>
            }
            defaultOpen
          >
            <p className="my-3 text-justify text-sm leading-7">
              My ultimate goal here was to come up with a system that makes the
              kanji and their components easy to remember. With that goal in
              mind, I've tried to compile a list of{" "}
              <strong>
                all those components which can't be broken up easily into
                distinct, meaningful sub-components
              </strong>
              . But "broken up easily" and "meaningful" are ultimately
              subjective criteria.
            </p>
            <p className="my-3 text-justify text-sm leading-7">
              I think this is fine. There are no perfectly objective criteria
              for judging whether something is "easy to remember", since
              everyone's brain works differently. In the end, I've done the same
              as everyone else who has ever tried to devise a kanji-learning
              method, and{" "}
              <strong>I've used a good measure of personal judgment</strong> in
              making this list.
            </p>
            <p className="my-3 text-justify text-sm leading-7">
              So, some of these "atomic" components are ultimately "atomic" only
              because I've decided they're not worth analyzing any further. You
              could very well break several of them down into smaller
              components, but I've held off from doing so where it doesn't seem
              to make the shapes any easier to remember. Still, if you think
              I've overlooked something, feel free to{" "}
              <AboutLink>message me</AboutLink> and I'll take your feedback into
              consideration!
            </p>
          </CollapsibleInfoSection>

          <hr />
        </section>
        <h1>The {totalAtomicComponents} atomic components</h1>
        <h2>
          (not counting variants: {atomicComponentsAndVariants.length} total)
        </h2>
        <section className="flex flex-row flex-wrap gap-2 gap-y-8">
          {atomicComponentsAndVariants.map(
            ({ figures, keyword, mnemonicKeyword }, i) => {
              const keywordDisplay = (
                <div className="text-center">
                  {mnemonicKeyword ? (
                    <>"{parseAnnotatedKeywordText(mnemonicKeyword)?.text}"</>
                  ) : (
                    <>{keyword}</>
                  )}
                </div>
              );
              return figures.length > 1 ? (
                <div
                  key={String(i)}
                  className="inline-flex flex-col gap-2 border border-solid border-gray-400 bg-gray-100 p-1"
                >
                  <div className="flex flex-row gap-2">
                    {figures.map(({ figure, isAtomic }) => (
                      // <FigureBadgeLink
                      //   key={figure.id}
                      //   id={figure.id}
                      //   badgeProps={figure}
                      //   className={clsx("", {
                      //     "opacity-30": !isAtomic,
                      //   })}
                      // />
                      <DictPreviewLink
                        key={figure.id}
                        figureKey={figure.key}
                        popoverAttributes={popover.getAnchorAttributes(figure)}
                        className={clsx({
                          "opacity-30": !isAtomic,
                        })}
                      >
                        <FigureBadge badgeProps={figure} />
                      </DictPreviewLink>
                    ))}
                  </div>
                  {keywordDisplay}
                </div>
              ) : (
                <div
                  key={String(i)}
                  className="inline-flex flex-col flex-wrap gap-2 p-1"
                >
                  <DictPreviewLink
                    figureKey={figures[0].figure.id}
                    popoverAttributes={popover.getAnchorAttributes(
                      figures[0].figure,
                    )}
                    className={"text-center"}
                  >
                    <FigureBadge badgeProps={figures[0].figure} />
                  </DictPreviewLink>
                  {/* <FigureBadgeLink
                      key={figures[0].figure.id}
                      id={figures[0].figure.id}
                      badgeProps={figures[0].figure}
                      className="text-center"
                    /> */}
                  {keywordDisplay}
                </div>
              );
            },
          )}
        </section>
      </main>
    </>
  );
  return content;
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
