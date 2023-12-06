import { PropsWithChildren } from "react";
import { createPortal } from "react-dom";

import {
  BrowseAtomicComponentsLink,
  BrowseCharactersLink,
  BrowseCompoundComponentsLink,
} from "~/components/AppLink";
import { PopperOptions } from "~/components/usePaddedPopper";
import { BadgeProps } from "~/features/dictionary/badgeFigure";
import { KanjiListCode, isKyoikuCode } from "~/lib/dic/KanjiListCode";

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
    listsAsCharacter,
    listsAsComponent,
  } = badgeProps;
  const lists = isStandaloneCharacter ? listsAsCharacter : listsAsComponent;
  return (
    <ul className={`${className} flex flex-row flex-wrap gap-1`}>
      <ListTags
        lists={lists}
        isStandaloneCharacter={isStandaloneCharacter}
        className={` rounded-sm border border-solid px-1 text-sm font-bold uppercase [padding-top:0.2rem]`}
      />
      {isPriorityComponent && !isStandaloneCharacter ? (
        <FigureTag
          className={` rounded-sm border border-solid border-black bg-slate-800 px-1 text-sm font-bold  uppercase text-white [padding-top:0.2rem]`}
          popoverContent={
            <>
              <p className="mb-3 mt-0">
                Figures shown inside ○ <strong>circles</strong> throughout
                Kanjisense are <strong>kanji components only</strong>.
              </p>
              <p className="mb-3 mt-0">
                You won&apos;t find this component used as a standalone
                character, at least not in everyday modern Japanese.
              </p>
              <PopoverBottom>
                <BrowseCharactersLink>
                  More on characters and components
                </BrowseCharactersLink>
              </PopoverBottom>
            </>
          }
        >
          ○ component only
        </FigureTag>
      ) : null}
      {isStandaloneCharacter && !isPriorityComponent ? (
        <FigureTag
          className={` rounded-sm border border-solid border-black bg-slate-800 px-1 text-sm font-bold  uppercase text-white [padding-top:0.2rem]`}
          popoverContent={
            <>
              <p className="mb-3 mt-0">
                Kanji shown inside □ <strong>squares</strong> throughout
                Kanjisense are <strong>standalone characters only</strong>.
              </p>
              <p className="mb-3 mt-0">
                You won&apos;t find this kanji used as a component in everyday
                modern Japanese.
              </p>
              <p className="mb-3 mt-0">
                This kanji <em>may</em> appear as a component of rare characters
                outside{" "}
                <BrowseCharactersLink>
                  the 3,500 most important kanji
                </BrowseCharactersLink>
                , but you probably won&apos;t come across them as a
                second-language learner.
              </p>
              <PopoverBottom>
                <BrowseCharactersLink>
                  More on characters and components
                </BrowseCharactersLink>
              </PopoverBottom>
            </>
          }
        >
          □ character only
        </FigureTag>
      ) : null}
      {isStandaloneCharacter && isPriorityComponent ? (
        <FigureTag
          className={` rounded-sm border border-solid border-black bg-slate-800 px-1 text-sm font-bold  uppercase text-white [padding-top:0.2rem]`}
          popoverContent={
            <>
              <p className="mb-3 mt-0">
                Figures shown inside a combined ○ <strong>circle</strong> and □{" "}
                <strong>square</strong> in Kanjisense double as{" "}
                <strong>standalone kanji</strong> and{" "}
                <strong>kanji components</strong>.
              </p>
              <p className="mb-3 mt-0">
                You will find these kanji on their own in modern Japanese texts,
                as well as inside other kanji.
              </p>
              <PopoverBottom>
                <BrowseCharactersLink>
                  More on characters and components
                </BrowseCharactersLink>
              </PopoverBottom>
            </>
          }
        >
          □ character + ○ component
        </FigureTag>
      ) : null}
      {variantGroupId && variantGroupId !== id ? (
        <FigureTag
          className={` rounded-sm border border-solid border-black bg-slate-800 px-1 text-sm font-bold uppercase text-white outline  outline-1 -outline-offset-2 [padding-top:0.2rem]`}
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
          className={` rounded-sm border border-solid border-black bg-slate-800 px-1 text-sm font-bold  uppercase text-white [padding-top:0.2rem]`}
          popoverContent={
            <>
              The{" "}
              <BrowseCompoundComponentsLink>
                {ATOMIC_COMPONENTS_COUNT} atomic components
              </BrowseCompoundComponentsLink>{" "}
              are the &quot;atoms&quot; that come together in various
              combinations to form the{" "}
              <BrowseCharactersLink>
                3,500 most important kanji
              </BrowseCharactersLink>{" "}
              in Japanese.
              <PopoverBottom>
                <BrowseAtomicComponentsLink>
                  More on the kanji components
                </BrowseAtomicComponentsLink>
              </PopoverBottom>
            </>
          }
        >
          ☆ atomic
        </FigureTag>
      ) : null}
      {isSoundMark ? (
        <FigureTag
          className={`rounded-sm border border-solid border-yellow-400 bg-yellow-100 bg-opacity-50 px-1 text-sm font-bold uppercase [padding-top:0.2rem]`}
          popoverContent={
            <>
              <p className="mb-3 mt-0">
                This component is a <strong>sound indicator</strong>. Kanji
                containing this component will often have an{" "}
                <strong>identical or similar</strong> pronunciation.
              </p>
              <p className="mb-3 mt-0">
                Note that this only works with <i>on&apos;yomi</i>.
              </p>
              <PopoverBottom>
                <BrowseCompoundComponentsLink>
                  More on sound components and on&apos;yomi
                </BrowseCompoundComponentsLink>
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
        className={`${className} cursor-default`}
        ref={setReferenceElement}
        onMouseMove={openPopper}
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
                className={`[border:2px inset #afafaf33] pointer-events-auto p-3 text-sm shadow shadow-gray-400 transition-opacity duration-300 [border-radius:0.3em]  [box-sizing:border-box] [overflow-y:auto] [background-color:rgba(255,255,247,0.95)]  [max-height:88v] [width:18rem] md:max-w-xl`}
                ref={setPopperElement}
                style={styles.popper}
                {...attributes.popper}
              >
                {popoverContent}
              </div>,
              document.getElementById("overlay") || document.body,
            )
          : null}
      </li>
    </>
  );
}
function ListTags({
  lists: listsArg,
  isStandaloneCharacter,
  className,
}: {
  lists: KanjiListCode[] | null;
  isStandaloneCharacter: boolean;
  className?: string;
}) {
  const lists = listsArg || [];
  const kyoiku = lists.find(
    (c) =>
      c === "1" ||
      c === "2" ||
      c === "3" ||
      c === "4" ||
      c === "5" ||
      c === "6",
  );
  const kyoikuTag = kyoiku && (
    <KanjiListTag
      key={kyoiku}
      code={kyoiku}
      className={className}
      popoverContent={
        <KyoikuTagPopoverContent
          isStandaloneCharacter={isStandaloneCharacter}
        />
      }
    />
  );
  if (isStandaloneCharacter) {
    return (kyoikuTag ? [kyoikuTag] : []).concat(
      lists.flatMap((listCode) =>
        isKyoikuCode(listCode) ? (
          []
        ) : (
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
        ),
      ),
    );
  }
  if (kyoikuTag) return kyoikuTag;
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
      <p className="mb-3 mt-0">
        This {!isStandaloneCharacter ? "component is used within" : "is one of"}{" "}
        the ~1000 <i>Kyōiku Kanji</i> or &quot;Education Kanji&quot; which are
        part of the Japanese national primary school curriculum.
      </p>
      <p className="mb-3 mt-0">
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
      <p className="mb-3 mt-0">
        This {!isStandaloneCharacter ? "component is used within" : "is one of"}{" "}
        the <i>Jinmeiyō Kanji</i> or &quot;Personal-Name Use Kanji&quot;. These
        are the 863 characters approved for use in personal names despite
        falling outside the list of Regular Use Kanji.
      </p>
      <p className="mb-3 mt-0">
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
      <p className="mb-3 mt-0">
        This{" "}
        {!isStandaloneCharacter ? "component is used within" : "is of one of"}{" "}
        the kanji of the <i>Hyōgai Kanji Jitaihyō</i>, which is a list of
        characters which, though not as common as the <i>Jōyo Kanji</i>, are
        still important enough to warrant a standard printed form according to
        the Japanese government.
      </p>
      <p className="mb-3 mt-0">
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
      <p className="mb-3 mt-0">
        This {!isStandaloneCharacter ? "component is used within" : "is one of"}{" "}
        the <i>Jinmeiyō Kanji</i> or &quot;Personal-Name Use Kanji&quot;. These
        are the 863 characters approved for use in personal names despite
        falling outside the list of Regular Use Kanji.
      </p>
      <p className="mb-3 mt-0">
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
      <p className="mb-3 mt-0">
        This {!isStandaloneCharacter ? "component is used within" : "is one of"}{" "}
        the <i>Jōyō Kanji</i> or &quot;General Use Kanji&quot;. These are the{" "}
        {JOYO_COUNT} characters which form part of the Japanese high school
        curriculum and are approved for use in official government documents.
      </p>
      <p className="mb-3 mt-0">
        {!isStandaloneCharacter ? "Components like these" : "The Jōyō Kanji"}{" "}
        are marked in the color{" "}
        <span className="font-bold text-joyo-600">green</span> throughout
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
          className={`${className} border-kyoiku-900 bg-kyoiku-700  text-white`}
          popoverContent={popoverContent}
        >
          primary grade {code}
        </FigureTag>
      );
    case "j":
      return (
        <FigureTag
          className={`${className} border-joyo-900 bg-joyo-700  text-white`}
          popoverContent={popoverContent}
        >
          Jōyō
        </FigureTag>
      );
    case "h":
      return (
        <FigureTag
          className={`${className} border-hyogai-900 bg-hyogai-700  text-white`}
          popoverContent={popoverContent}
        >
          extra-Jōyō
        </FigureTag>
      );
    case "m":
      return (
        <FigureTag
          className={`${className} border-jinmeiyo-900 bg-jinmeiyo-700  text-white`}
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
        <p className="mb-3 mt-0">
          This component is considered a <strong>variant form</strong> of{" "}
          {[...primaryVariantId].length === 1 ? (
            primaryVariantId
          ) : (
            <>another component or character</>
          )}{" "}
          in Kanjisense.
        </p>
        <p className="mb-3 mt-0">
          Some variants are historically descended from a single character.
          However, others have been grouped together as a mnemonic device,
          because they have similar shapes.
        </p>
        <p className="mb-3 mt-0">
          In most cases, you can think of components&apos; variant forms as
          abbreviations that make characters easier to write.
        </p>
        <PopoverBottom>
          <BrowseCompoundComponentsLink>
            More on the kanji components
          </BrowseCompoundComponentsLink>
        </PopoverBottom>
      </>
    ) : (
      <>
        <p className="mb-3 mt-0">
          This character is a <strong>variant form</strong> of a kanji whose
          standard form may have been simplified in the <i>Jōyō Kanji</i>.
        </p>
        <p className="mb-3 mt-0">
          Kanji simplification in Japan happened mostly in 1945, so you will
          likely only see this form used in old texts, &quot;old-timey&quot;
          signage, and people&apos;s names.
        </p>
        <p className="mb-3 mt-0">
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
