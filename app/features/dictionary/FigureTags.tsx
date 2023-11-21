import { PropsWithChildren } from "react";
import { createPortal } from "react-dom";

import {
  BrowseCharactersLink,
  BrowseComponentsLink,
} from "~/components/AppLink";
import { PopperOptions } from "~/components/usePaddedPopper";
import { BadgeProps } from "~/features/dictionary/badgeFigure";
import { KanjiListCode } from "~/lib/dic/KanjiListCode";

import { useHoverPopper } from "./useHoverPopper";

const JOYO_COUNT = 2316;

const ATOMIC_COMPONENTS_COUNT = "TBD";

export function FigureTags({
  badgeProps,
  isSoundMark,
  isAtomic,
  className,
}: {
  badgeProps: BadgeProps;
  isSoundMark: boolean;
  isAtomic: boolean;
  className?: string;
}) {
  const {
    isPriorityComponent,
    isStandaloneCharacter,
    id,
    variantGroupId,
    lists,
  } = badgeProps;
  return (
    <ul className={`${className} flex flex-row flex-wrap gap-1`}>
      <ListTags
        lists={lists}
        isStandaloneCharacter={isStandaloneCharacter}
        className={` font-bold rounded-sm uppercase px-1 [padding-top:0.2rem] text-sm border border-solid`}
      />
      {isPriorityComponent && !isStandaloneCharacter ? (
        <FigureTag
          className={` font-bold bg-slate-800 text-white rounded-sm uppercase px-1 [padding-top:0.2rem] text-sm  border border-black border-solid`}
          popoverContent={
            <>
              <p className="mt-0 mb-3">
                Figures shown inside ○ <strong>circles</strong> throughout
                Kanjisense are <strong>kanji components only</strong>.
              </p>
              <p className="mt-0 mb-3">
                You won&apos;t find this component used as a standalone
                character, at least not in everyday modern Japanese.
              </p>
              <PopoverBottom>
                <BrowseComponentsLink>
                  More on characters and components
                </BrowseComponentsLink>
              </PopoverBottom>
            </>
          }
        >
          ○ component only
        </FigureTag>
      ) : null}
      {isStandaloneCharacter && !isPriorityComponent ? (
        <FigureTag
          className={` font-bold bg-slate-800 text-white rounded-sm uppercase px-1 [padding-top:0.2rem] text-sm  border border-black border-solid`}
          popoverContent={
            <>
              <p className="mt-0 mb-3">
                Kanji shown inside □ <strong>squares</strong> throughout
                Kanjisense are <strong>standalone characters only</strong>.
              </p>
              <p className="mt-0 mb-3">
                You won&apos;t find this kanji used as a component in everyday
                modern Japanese.
              </p>
              <p className="mt-0 mb-3">
                This kanji <em>may</em> appear as a component of rare characters
                outside{" "}
                <BrowseCharactersLink>
                  the 3,500 most important kanji
                </BrowseCharactersLink>
                , but you probably won&apos;t come across them as a
                second-language learner.
              </p>
              <PopoverBottom>
                <BrowseComponentsLink>
                  More on characters and components
                </BrowseComponentsLink>
              </PopoverBottom>
            </>
          }
        >
          □ character only
        </FigureTag>
      ) : null}
      {isStandaloneCharacter && isPriorityComponent ? (
        <FigureTag
          className={` font-bold bg-slate-800 text-white rounded-sm uppercase px-1 [padding-top:0.2rem] text-sm  border border-black border-solid`}
          popoverContent={
            <>
              <p className="mt-0 mb-3">
                Figures shown inside a combined ○ <strong>circle</strong> and □{" "}
                <strong>square</strong> in Kanjisense double as{" "}
                <strong>standalone kanji</strong> and{" "}
                <strong>kanji components</strong>.
              </p>
              <p className="mt-0 mb-3">
                You will find these kanji on their own in modern Japanese texts,
                as well as inside other kanji.
              </p>
              <PopoverBottom>
                <BrowseComponentsLink>
                  More on characters and components
                </BrowseComponentsLink>
              </PopoverBottom>
            </>
          }
        >
          □ character + ○ component
        </FigureTag>
      ) : null}
      {variantGroupId && variantGroupId !== id ? (
        <FigureTag
          className={` font-bold outline outline-1 -outline-offset-2 bg-slate-800 text-white rounded-sm uppercase px-1 [padding-top:0.2rem] text-sm  border border-black border-solid`}
          popoverContent={
            <VariantPopoverContent
              isStandaloneCharacter={isStandaloneCharacter}
              primaryVariantId={variantGroupId}
            />
          }
        >
          variant
        </FigureTag>
      ) : null}
      {isAtomic ? (
        <FigureTag
          className={` font-bold bg-slate-800 text-white rounded-sm uppercase px-1 [padding-top:0.2rem] text-sm  border border-black border-solid`}
          popoverContent={
            <>
              The{" "}
              <BrowseComponentsLink>
                {ATOMIC_COMPONENTS_COUNT} atomic components
              </BrowseComponentsLink>{" "}
              are the &quot;atoms&quot; that come together in various
              combinations to form the{" "}
              <BrowseCharactersLink>
                3,500 most important kanji
              </BrowseCharactersLink>{" "}
              in Japanese.
              <PopoverBottom>
                <BrowseComponentsLink>
                  More on the kanji components
                </BrowseComponentsLink>
              </PopoverBottom>
            </>
          }
        >
          ☆ atomic
        </FigureTag>
      ) : null}
      {isSoundMark ? (
        <FigureTag
          className={` font-bold  border-yellow-400 bg-yellow-100 bg-opacity-50 rounded-sm uppercase px-1 [padding-top:0.2rem] text-sm border border-solid`}
          popoverContent={
            <>
              <p className="mt-0 mb-3">
                This component is a <strong>sound indicator</strong>. Kanji
                containing this component will often have an{" "}
                <strong>identical or similar</strong> pronunciation.
              </p>
              <p className="mt-0 mb-3">
                Note that this only works with <i>on*apos;yomi</i>.
              </p>
              <PopoverBottom>
                <BrowseComponentsLink>
                  More on sound components and on&apos;yomi
                </BrowseComponentsLink>
              </PopoverBottom>
            </>
          }
        >
          sound mark
        </FigureTag>
      ) : null}
    </ul>
  );
}

const popperOptions: PopperOptions = {
  placement: "bottom-start",
  modifiers: [
    {
      name: "preventOverflow",
      options: {
        mainAxis: true,
        altAxis: true,
        tether: false,
        padding: 5,
      },
    },
    {
      name: "offset",
      options: {
        offset: ({ reference }) => {
          return [0, reference.height];
        },
      },
    },
  ],
};

function FigureTag({
  children,
  className,
  popoverContent,
}: {
  children: React.ReactNode;
  className?: string;
  popoverContent: React.ReactNode;
}) {
  const {
    setReferenceElement,
    setPopperElement,
    attributes,
    styles,
    isOpen,
    open: openPopper,
    close: closePopper,
  } = useHoverPopper(popperOptions);

  return (
    <>
      <li
        className={`${className}`}
        ref={setReferenceElement}
        onMouseEnter={openPopper}
        onMouseLeave={closePopper}
        onFocus={openPopper}
        onBlur={closePopper}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
      >
        {children}
        {isOpen
          ? createPortal(
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
              <div
                className={`-m-2 [border:2px inset #afafaf33] p-3 shadow-gray-400 shadow transition-opacity duration-300 [width:18rem] [max-height:88v]  [background-color:rgba(247,247,247,0.95)] [border-radius:0.3em] [box-sizing:border-box]  [overflow-y:auto] md:max-w-xl text-sm`}
                ref={setPopperElement}
                style={styles.popper}
                {...attributes.popper}
              >
                {popoverContent}
              </div>,
              document.body,
            )
          : null}
      </li>
    </>
  );
}
function ListTags({
  lists,
  isStandaloneCharacter,
  className,
}: {
  lists: KanjiListCode[];
  isStandaloneCharacter: boolean;
  className?: string;
}) {
  if (isStandaloneCharacter)
    return lists.map((listCode) => (
      <KanjiListTag
        key={listCode}
        code={listCode}
        className={className}
        popoverContent={
          <KanjiListTagPopoverContent
            listCode={listCode}
            isStandaloneCharacter={isStandaloneCharacter}
          />
        }
      />
    ));

  const kyoiku = lists.find(
    (c) =>
      c === "1" ||
      c === "2" ||
      c === "3" ||
      c === "4" ||
      c === "5" ||
      c === "6",
  );
  if (kyoiku)
    return (
      <KanjiListTag
        code={kyoiku}
        className={className}
        popoverContent={
          <KyoikuTagPopoverContent
            isStandaloneCharacter={isStandaloneCharacter}
          />
        }
      />
    );
  if (lists.includes("j"))
    return (
      <KanjiListTag
        code="j"
        className={className}
        popoverContent={
          <JoyoTag isStandaloneCharacter={isStandaloneCharacter} />
        }
      />
    );
  if (lists.includes("h") && lists.includes("m"))
    return (
      <KanjiListTag
        code="h"
        className={className}
        popoverContent={HyogaiJinmeiyoTagPopoverContent({
          isStandaloneCharacter,
        })}
      />
    );
  else if (lists.includes("h"))
    return (
      <KanjiListTag
        code="h"
        className={className}
        popoverContent={
          <HyogaiTagPopoverContent
            isStandaloneCharacter={isStandaloneCharacter}
          />
        }
      />
    );

  if (lists.includes("m"))
    return (
      <KanjiListTag
        code="m"
        className={className}
        popoverContent={
          <JinmeiyoTagPopoverContent
            isStandaloneCharacter={isStandaloneCharacter}
          />
        }
      />
    );
  return null;
}
function KyoikuTagPopoverContent({
  isStandaloneCharacter,
}: {
  isStandaloneCharacter: boolean;
}) {
  return (
    <>
      <p className="mt-0 mb-3">
        This {!isStandaloneCharacter ? "component is used within" : "is one of"}{" "}
        the ~1000 <i>Kyōiku Kanji</i> or &quot;Education Kanji&quot; which are
        part of the Japanese national primary school curriculum.
      </p>
      <p className="mt-0 mb-3">
        {!isStandaloneCharacter ? "Components" : "Characters"} like these are
        marked in the color{" "}
        <span className="font-bold text-blue-600">blue</span> throughout
        Kanjisense.
      </p>
      <PopoverBottom>
        <BrowseCharactersLink>
          More on the kanji lists mentioned throughout Kanjisense
        </BrowseCharactersLink>
      </PopoverBottom>
    </>
  );
}

function JinmeiyoTagPopoverContent({
  isStandaloneCharacter,
}: {
  isStandaloneCharacter: boolean;
}) {
  return (
    <>
      <p className="mt-0 mb-3">
        This {!isStandaloneCharacter ? "component is used within" : "is one of"}{" "}
        the <i>Jinmeiyō Kanji</i> or &quot;Personal-Name Use Kanji&quot;. These
        are the 863 characters approved for use in personal names despite
        falling outside the list of Regular Use Kanji.
      </p>
      <p className="mt-0 mb-3">
        The <i>Jinmeiyō Kanji</i> and their components are marked in the color{" "}
        <span className="font-bold text-red-600">red</span> throughout
        Kanjisense.
      </p>
      <PopoverBottom>
        <BrowseCharactersLink>
          More on the kanji lists mentioned throughout Kanjisense
        </BrowseCharactersLink>
      </PopoverBottom>
    </>
  );
}

function HyogaiTagPopoverContent({
  isStandaloneCharacter,
}: {
  isStandaloneCharacter: boolean;
}) {
  return (
    <>
      <p className="mt-0 mb-3">
        This{" "}
        {!isStandaloneCharacter ? "component is used within" : "is of one of"}{" "}
        the kanji of the <i>Hyōgai Kanji Jitaihyō</i>, which is a list of
        characters which, though not as common as the <i>Jōyo Kanji</i>, are
        still important enough to warrant a standard printed form according to
        the Japanese government.
      </p>
      <p className="mt-0 mb-3">
        Kanji from this list and their components are marked in the color{" "}
        <span className="font-bold text-purple-600">purple</span> throughout
        Kanjisense.
      </p>
      <PopoverBottom>
        <BrowseCharactersLink>
          More on the kanji lists mentioned throughout Kanjisense
        </BrowseCharactersLink>
      </PopoverBottom>
    </>
  );
}

function HyogaiJinmeiyoTagPopoverContent({
  isStandaloneCharacter,
}: {
  isStandaloneCharacter: boolean;
}) {
  return (
    <>
      <p className="mt-0 mb-3">
        This {!isStandaloneCharacter ? "component is used within" : "is one of"}{" "}
        the <i>Jinmeiyō Kanji</i> or &quot;Personal-Name Use Kanji&quot;. These
        are the 863 characters approved for use in personal names despite
        falling outside the list of Regular Use Kanji.
      </p>
      <p className="mt-0 mb-3">
        This {!isStandaloneCharacter ? "component" : "kanji"} is marked in{" "}
        <span className="font-bold text-purple-600">purple</span> because it it
        also a member of the Extra-<i>Jōyō</i> Kanji List. (Otherwise,{" "}
        <i>Jinmeiyō Kanji</i> and their components are marked in the color{" "}
        <span className="font-bold text-red-600">red</span> throughout
        Kanjisense.)
      </p>
      <PopoverBottom>
        <BrowseCharactersLink>
          More on the kanji lists mentioned throughout Kanjisense
        </BrowseCharactersLink>
      </PopoverBottom>
    </>
  );
}

function JoyoTag({
  isStandaloneCharacter,
}: {
  isStandaloneCharacter: boolean;
}) {
  return (
    <>
      <p className="mt-0 mb-3">
        This {!isStandaloneCharacter ? "component is used within" : "is one of"}{" "}
        the <i>Jōyō Kanji</i> or &quot;General Use Kanji&quot;. These are the{" "}
        {JOYO_COUNT} characters which form part of the Japanese high school
        curriculum and are approved for use in official government documents.
      </p>
      <p className="mt-0 mb-3">
        {!isStandaloneCharacter ? "Components like these" : "The Jōyō Kanji"}{" "}
        are marked in the color{" "}
        <span className="font-bold text-green-600">green</span> throughout
        Kanjisense.
      </p>
      <PopoverBottom>
        <BrowseCharactersLink>
          More on the kanji lists mentioned throughout Kanjisense
        </BrowseCharactersLink>
      </PopoverBottom>
    </>
  );
}

function KanjiListTag({
  code,
  className,
  popoverContent,
}: {
  code: KanjiListCode;
  className?: string;
  popoverContent: React.ReactNode;
}) {
  switch (code) {
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
      return (
        <FigureTag
          className={`${className} text-white bg-kyoiku-700  border-kyoiku-900`}
          popoverContent={popoverContent}
        >
          primary grade {code}
        </FigureTag>
      );
    case "j":
      return (
        <FigureTag
          className={`${className} text-white bg-joyo-700  border-joyo-900`}
          popoverContent={popoverContent}
        >
          Jōyō
        </FigureTag>
      );
    case "h":
      return (
        <FigureTag
          className={`${className} text-white bg-hyogai-700  border-hyogai-900`}
          popoverContent={popoverContent}
        >
          extra-Jōyō
        </FigureTag>
      );
    case "m":
      return (
        <FigureTag
          className={`${className} text-white bg-jinmeiyo-700  border-jinmeiyo-900`}
          popoverContent={popoverContent}
        >
          Jinmeiyō
        </FigureTag>
      );
  }
}

function PopoverBottom({ children }: PropsWithChildren<object>) {
  return <div className={" text-right"}>{children}</div>;
}

const VariantPopoverContent = ({
  primaryVariantId,
  isStandaloneCharacter,
}: {
  primaryVariantId: string;
  isStandaloneCharacter: boolean;
}) => (
  <>
    {!isStandaloneCharacter ? (
      <>
        <p className="mt-0 mb-3">
          This component is considered a <strong>variant form</strong> of{" "}
          {[...primaryVariantId].length === 1 ? (
            primaryVariantId
          ) : (
            <>another component or character</>
          )}
          .
        </p>
        <p className="mt-0 mb-3">
          Some variants are historically descended from a single character.
          However, others have been grouped together as a mnemonic device,
          because they have similar shapes.
        </p>
        <p className="mt-0 mb-3">
          In most cases, you can think of components&apos; variant forms as
          abbreviations that make characters easier to write.
        </p>
        <PopoverBottom>
          <BrowseComponentsLink>
            More on the kanji components
          </BrowseComponentsLink>
        </PopoverBottom>
      </>
    ) : (
      <>
        <p className="mt-0 mb-3">
          This character is a <strong>variant form</strong> of a kanji whose
          standard form may have been simplified in the <i>Jōyō Kanji</i>.
        </p>
        <p className="mt-0 mb-3">
          Kanji simplification in Japan happened mostly in 1945, so you will
          likely only see this form used in old texts, &quot;old-timey&quot;
          signage, and people&apos;s names.
        </p>
        <p className="mt-0 mb-3">
          Variant characters are encircled with a white stripe throughout
          Kanjisense.
        </p>
        <PopoverBottom>
          <BrowseCharactersLink>
            More on the kanji lists mentioned throughout Kanjisense
          </BrowseCharactersLink>
        </PopoverBottom>
      </>
    )}
  </>
);

function KanjiListTagPopoverContent({
  listCode,
  isStandaloneCharacter,
}: {
  listCode: KanjiListCode;
  isStandaloneCharacter: boolean;
}) {
  switch (listCode) {
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
      return (
        <KyoikuTagPopoverContent
          isStandaloneCharacter={isStandaloneCharacter}
        />
      );
    case "j":
      return <JoyoTag isStandaloneCharacter={isStandaloneCharacter} />;
    case "h":
      return (
        <HyogaiTagPopoverContent
          isStandaloneCharacter={isStandaloneCharacter}
        />
      );
    case "m":
      return (
        <JinmeiyoTagPopoverContent
          isStandaloneCharacter={isStandaloneCharacter}
        />
      );
  }
}
