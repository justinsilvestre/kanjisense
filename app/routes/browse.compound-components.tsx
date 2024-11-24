/* eslint-disable react/no-unescaped-entities */
import { PrismaClient } from "@prisma/client";
import clsx from "clsx";
import { PropsWithChildren, useState } from "react";
import { createPortal } from "react-dom";
import type { LoaderFunction } from "react-router";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "react-router";

import {
  BrowseAtomicComponentsLink,
  DictPreviewLink,
} from "~/components/AppLink";
import DictionaryLayout from "~/components/DictionaryLayout";
import { FigureBadge } from "~/components/FigureBadge";
import { FigurePopoverWindow } from "~/components/FigurePopover";
import { prisma } from "~/db.server";
import {
  BadgePropsFigure,
  badgeFigureSelect,
  getBadgeProps,
} from "~/features/dictionary/badgeFigure";
import {
  FigureKeywordDisplay,
  KeywordDisplayFigure,
} from "~/features/dictionary/FigureKeywordDisplay";
import { TOTAL_ATOMIC_COMPONENTS_COUNT } from "~/features/dictionary/TOTAL_ATOMIC_COMPONENTS_COUNT";
import { FIGURES_VERSION } from "~/models/figure";

import { useManyFiguresPopover } from "../features/browse/useManyFiguresPopover";

type LoaderData = Awaited<ReturnType<typeof getAllListCharacterBadgeFigures>>;

const isPriorityComponentWhere = {
  isPriority: true,
  listsAsComponent: { isEmpty: false },
  asComponent: {
    allUses: {
      some: {
        isPriority: true,
      },
    },
  },
};
async function getAllListCharacterBadgeFigures(prisma: PrismaClient) {
  const commonSelect = {
    ...badgeFigureSelect,
    keyword: true,
    mnemonicKeyword: true,
    image: true,
  };
  const priorityCompoundComponentCharacters =
    await prisma.kanjisenseFigure.findMany({
      select: commonSelect,
      orderBy: { aozoraAppearances: "desc" },
      where: {
        version: FIGURES_VERSION,
        ...isPriorityComponentWhere,
        componentsTree: { not: [] },
        OR: [
          { listsAsCharacter: { isEmpty: false } },
          {
            shinjitaiInBaseKanji: { not: null },
          },
        ],
      },
    });
  const priorityCompoundComponents = await prisma.kanjisenseFigure.findMany({
    select: commonSelect,
    orderBy: { aozoraAppearances: "desc" },
    where: {
      version: FIGURES_VERSION,
      ...isPriorityComponentWhere,
      componentsTree: { not: [] },
      id: {
        notIn: priorityCompoundComponentCharacters.map((c) => c.id),
      },
    },
  });
  const compoundComponentsMap: Record<
    string,
    BadgePropsFigure & KeywordDisplayFigure
  > = {};
  const compoundComponentCharactersMap: Record<
    string,
    BadgePropsFigure & KeywordDisplayFigure
  > = {};

  for (const figure of priorityCompoundComponents) {
    compoundComponentsMap[figure.id] = figure;
  }
  for (const figure of priorityCompoundComponentCharacters) {
    compoundComponentCharactersMap[figure.id] = figure;
  }
  return {
    compoundComponents: compoundComponentsMap,
    compoundComponentCharacters: compoundComponentCharactersMap,
    totalCompoundComponents: priorityCompoundComponents.length,
    totalCompoundComponentCharacters:
      priorityCompoundComponentCharacters.length,
  };
}

export const loader: LoaderFunction = async () => {
  const allBadgeFigures = await getAllListCharacterBadgeFigures(prisma);

  return allBadgeFigures;
};

export default function FigureDetailsPage() {
  const loaderData = useLoaderData<LoaderData>();
  return (
    <DictionaryLayout>
      <CompoundComponentsPageContent loaderData={loaderData} />
    </DictionaryLayout>
  );
}

function CompoundComponentsPageContent({
  loaderData,
}: {
  loaderData: LoaderData;
}) {
  const {
    compoundComponents,
    compoundComponentCharacters,
    totalCompoundComponents,
    totalCompoundComponentCharacters,
  } = loaderData;

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
      <main className="flex flex-col gap-2">
        <h1 className="my-2 text-center font-sans text-2xl font-bold">
          The{" "}
          {(
            totalCompoundComponents + totalCompoundComponentCharacters
          ).toLocaleString()}{" "}
          "compound" kanji components
        </h1>

        <section>
          <p className="mx-auto my-3 max-w-lg text-justify text-sm leading-7">
            All the {(3530).toLocaleString()} most important kanji can be broken
            down into just{" "}
            <BrowseAtomicComponentsLink>
              {TOTAL_ATOMIC_COMPONENTS_COUNT} "atomic" components
            </BrowseAtomicComponentsLink>
            . But sometimes, these atomic components appear again and again in
            the same combinations. These combinations are also considered kanji
            components in the Kanjisense system, and given names. As with the
            atomic components, learning to recognize these "compound" components
            will help you to learn new kanji much more easily.
          </p>
          <p className="mx-auto my-3 max-w-lg text-justify text-sm leading-7">
            The problem is that, as with the characters themselves, there are
            more than a thousand of these compound components. Therefore, they
            don't lend themselves well to rote memorization. But the good news
            is that{" "}
            <strong>
              most of the compound kanji components double as standalone
              characters
            </strong>
            . So there is not really any need to learn them separately from the
            characters themselves. They are listed here for your reference.
          </p>
          <h2 className="my-4 text-center">
            {" "}
            {totalCompoundComponentCharacters} compound components doubling as
            standalone characters
          </h2>
          <CollapsiblePreviewList>
            <section>
              {Object.entries(compoundComponentCharacters).map(
                ([id, figure]) => {
                  const badgeProps = getBadgeProps(figure);
                  return (
                    <div key={id} className="inline-block p-1 text-center">
                      <DictPreviewLink
                        figureKey={badgeProps.key}
                        popoverAttributes={popover.getAnchorAttributes(
                          badgeProps,
                        )}
                      >
                        <FigureBadge badgeProps={badgeProps} />
                      </DictPreviewLink>

                      <div>
                        <FigureKeywordDisplay figure={figure} />
                      </div>
                    </div>
                  );
                },
              )}
            </section>
          </CollapsiblePreviewList>
          <p className="mx-auto my-3 max-w-lg text-justify text-sm leading-7">
            As for the remaining compound components in the{" "}
            {(3530).toLocaleString()} most important kanji, which{" "}
            <strong>do not</strong> appear as standalone characters in modern
            Japanese, there are just {totalCompoundComponents} of them listed in
            Kanjisense. Many of these components were indeed once used as
            characters long ago, but have since fallen out of use. Others are
            simply graphic elements that appear in multiple characters at once
            for historical reasons.
          </p>
          <p className="mx-auto my-3 max-w-lg text-justify text-sm leading-7">
            In any case, I still don't recommend trying to memorize these
            compounds by rote. Rather, it would probably be easiest to focus on
            these components{" "}
            <strong>as you come across them "in the wild"</strong>. If you 1)
            learn one character containing one of these components, and 2) have
            that component pointed out to you as such, that should be enough to
            help you recognize the component in other characters.
          </p>
        </section>
        <h2 className="my-4 text-center">
          {totalCompoundComponents} compound components <em>not</em> doubling as
          standalone characters
        </h2>
        <CollapsiblePreviewList>
          <section>
            {Object.entries(compoundComponents).map(([id, figure]) => {
              const badgeProps = getBadgeProps(figure);
              return (
                <div key={id} className="inline-block p-1 text-center">
                  <DictPreviewLink
                    figureKey={id}
                    popoverAttributes={popover.getAnchorAttributes(badgeProps)}
                  >
                    <FigureBadge badgeProps={badgeProps} />
                  </DictPreviewLink>
                  <div>
                    <FigureKeywordDisplay figure={figure} />
                  </div>
                </div>
              );
            })}
          </section>
        </CollapsiblePreviewList>
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

function CollapsiblePreviewList({ children }: PropsWithChildren) {
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
        {children}
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
