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
import { getBadgeFiguresByPriorityGroupedWithVariants } from "~/features/browse/getBadgeFiguresByPriorityGroupedWithVariants";
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

import { FiguresGroupedByVariantsList } from "./FiguresGroupedByVariantsList";

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
  const compoundComponentCharactersMap: Record<
    string,
    BadgePropsFigure & KeywordDisplayFigure
  > = {};

  for (const figure of priorityCompoundComponentCharacters) {
    compoundComponentCharactersMap[figure.id] = figure;
  }

  const compoundComponentsWithStandaloneCharactersAsVariant =
    await getBadgeFiguresByPriorityGroupedWithVariants(prisma, {
      version: FIGURES_VERSION,
      ...isPriorityComponentWhere,
      componentsTree: { not: [] },
      id: {
        notIn: priorityCompoundComponentCharacters.map((c) => c.id),
      },
      variantGroup: {
        // TODO: confirm no group has "head" which is not standalone, while also having a standalone variant
        figures: {
          some: {
            listsAsCharacter: { isEmpty: false },
          },
        },
      },
    });

  const compoundComponentsWithNoStandaloneCharacterVariants =
    await getBadgeFiguresByPriorityGroupedWithVariants(prisma, {
      version: FIGURES_VERSION,
      ...isPriorityComponentWhere,
      componentsTree: { not: [] },
      key: {
        notIn: priorityCompoundComponentCharacters
          .map((c) => c.key)
          .concat(
            compoundComponentsWithStandaloneCharactersAsVariant.matchedFiguresAndVariants.map(
              (f) => f.key,
            ),
          ),
      },
      OR: [
        { variantGroup: null },
        {
          variantGroup: {
            // TODO: confirm no group has "head" which is not standalone, while also having a standalone variant
            figures: {
              none: {
                listsAsCharacter: { isEmpty: false },
              },
            },
          },
        },
      ],
    });

  return {
    compoundComponentCharacters: compoundComponentCharactersMap,
    totalCompoundComponentCharacters:
      priorityCompoundComponentCharacters.length,
    compoundComponentsWithNoStandaloneCharacterVariants,
    compoundComponentsWithStandaloneCharactersAsVariant,
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
    compoundComponentsWithNoStandaloneCharacterVariants:
      nonCharacterCompoundComponents,
    compoundComponentsWithStandaloneCharactersAsVariant:
      compoundComponentCharacterVariants,
    compoundComponentCharacters,
    totalCompoundComponentCharacters,
  } = loaderData;

  const totalCompoundComponents =
    compoundComponentCharacterVariants.matchedFiguresCount +
    nonCharacterCompoundComponents.matchedFiguresCount +
    totalCompoundComponentCharacters;

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
          The {totalCompoundComponents.toLocaleString()} "compound" kanji
          components
        </h1>

        <section>
          <p className="text-md mx-auto my-3 max-w-lg  leading-6">
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
          <p className="text-md mx-auto my-3 max-w-lg  leading-6">
            The problem is that, as with the characters themselves, there are a
            multitude of these compound components. Therefore, they don't lend
            themselves well to rote memorization. But the good news is that{" "}
            <strong>
              most of the compound kanji components double as standalone
              characters
            </strong>
            . So there is not really any need to learn them separately from the
            characters themselves. They are listed here for your reference.
          </p>
          <h2 className="my-4 text-center">
            {" "}
            {totalCompoundComponentCharacters} compound components{" "}
            <strong>doubling as standalone characters</strong>
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
          <p className="text-md mx-auto my-3 max-w-lg  leading-6">
            About a quarter of the remaining compound components may be
            considered <strong>variants</strong> of standalone characters.
            Sometimes they are identical in form, minus a few strokes&mdash;in
            other words, an abbreviated form. Other times, the variant form is a
            more complex historical form of the currently used character.
            Sometimes, the historical relationship between variant forms is more
            complicated. But in any case, it's usually easy to see the relation
            between the two once it's pointed out.
          </p>
          <p className="text-md mx-auto my-3 max-w-lg  leading-6">
            Again, I don't recommend trying to memorize these variants by rote.
            But as you learn more and more characters, you might find it helpful
            to return to this list and take note of the patterns in these
            variations, to reinforce the connections between characters in your
            memory.
          </p>
        </section>
        <h2 className="my-4 text-center">
          {compoundComponentCharacterVariants.matchedFiguresCount} compound
          components which are{" "}
          <strong>variants of standalone characters</strong>
        </h2>
        <CollapsiblePreviewList>
          <FiguresGroupedByVariantsList
            figuresAndVariants={
              compoundComponentCharacterVariants.matchedFiguresAndVariants
            }
            popover={popover}
          />
        </CollapsiblePreviewList>

        <p className="text-md mx-auto my-3 max-w-lg  leading-6">
          As for the remaining compound components in the{" "}
          {(3530).toLocaleString()} most important kanji, which{" "}
          <strong>do not</strong> appear as standalone characters in everyday
          modern Japanese, in any form, they are listed below.
        </p>
        <p className="text-md mx-auto my-3 max-w-lg  leading-6">
          In many cases, these components originally derive from standalone
          characters. When the graphical form of the component is especially
          evocative and easy to relate to the original character's meaning, I
          have used in in Kanjisense as the mnemonic keyword for that character.
          But in so many cases, the modern forms are so hard to visually relate
          their archaic meanings, that the effort to do so outweighs the
          benefit. So, for the most part, the mnemonic keywords here relate to
          the modern form of the character, and to the context in which you are
          likely to encounter it as a beginner in Japanese.
        </p>
        <h2 className="my-4 text-center">
          {nonCharacterCompoundComponents.matchedFiguresCount} compound
          components <strong>without standalone characters as variants</strong>
        </h2>
        <CollapsiblePreviewList>
          <FiguresGroupedByVariantsList
            figuresAndVariants={
              nonCharacterCompoundComponents.matchedFiguresAndVariants
            }
            popover={popover}
          />
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
